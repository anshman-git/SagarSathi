from datetime import datetime, timezone
from typing import Dict, Any, List
from ..models import AgentState, EvidenceCard, SourceBadge
from ..i18n.phrase_bank import get_phrase

class ReportingAgent:
    """
    Compiles final explainable response, evidence cards with source badges,
    reasoning steps, and follow-up chips in the user's regional language.
    """
    async def run(self, state: AgentState) -> Dict[str, Any]:
        lang = state.lang
        intent = state.intent
        now_utc = datetime.now(timezone.utc)
        now_str = now_utc.strftime("%Y-%m-%d %H:%M UTC")
        # Approx IST
        now_ist = now_utc.strftime("%Y-%m-%d") + " IST"

        evidence_cards: List[EvidenceCard] = []

        # 1. Marine & Weather Evidence
        marine = state.tool_results.get("marine", {})
        forecast = state.tool_results.get("forecast", {})
        if marine:
            evidence_cards.append(EvidenceCard(
                dataset_name="Open-Meteo Marine Forecast",
                provider="Copernicus / ECMWF Marine Blend",
                variable="Wave Height, Swell Period, SST",
                timestamp_utc=now_str,
                timestamp_ist=now_ist,
                spatial_res="0.1° (~10 km)",
                badge=marine.get("source", SourceBadge.LIVE),
                details=f"Current wave: {marine.get('current_wave_height', 1.2)}m, Swell: {marine.get('current_swell_period', 8)}s"
            ))

        if forecast:
            evidence_cards.append(EvidenceCard(
                dataset_name="Open-Meteo Atmospheric Forecast",
                provider="ECMWF / DWD ICON",
                variable="Wind Speed, Wind Gusts, CAPE Lightning Proxy",
                timestamp_utc=now_str,
                timestamp_ist=now_ist,
                spatial_res="0.1° (~10 km)",
                badge=forecast.get("source", SourceBadge.LIVE),
                details=f"Wind: {forecast.get('current_wind_speed_kmh', 16)} km/h (Gusts: {forecast.get('current_wind_gusts_kmh', 22)} km/h)"
            ))

        # 2. SST & Chlorophyll Evidence
        sst_chl = state.tool_results.get("sst_chl", {})
        if sst_chl:
            evidence_cards.append(EvidenceCard(
                dataset_name="Satellite Ocean Color & SST",
                provider=sst_chl.get("provider", "NOAA CoastWatch / VIIRS"),
                variable="SST (°C) & Chlorophyll-a (mg/m³)",
                timestamp_utc=now_str,
                timestamp_ist=now_ist,
                spatial_res=sst_chl.get("spatial_res", "0.05° (~5 km)"),
                badge=sst_chl.get("source", SourceBadge.DEMO),
                details=f"Cloud gap mask: {sst_chl.get('cloud_gap_percent', 0)}%"
            ))

        # 3. Official INCOIS PFZ Evidence
        official_pfz = state.tool_results.get("official_pfz", {})
        if official_pfz:
            evidence_cards.append(EvidenceCard(
                dataset_name="INCOIS Operational PFZ Advisory",
                provider=official_pfz.get("provider", "INCOIS MoES"),
                variable="Potential Fishing Zone Polygons & Sectors",
                timestamp_utc=now_str,
                timestamp_ist=now_ist,
                spatial_res="Landing Centre Vector Advisory",
                badge=official_pfz.get("source", SourceBadge.DEMO),
                details=official_pfz.get("disclaimer", "Ingested official baseline")
            ))

        # Build response text from structured facts
        loc_name = state.entities.location.name if state.entities.location else "Coast"
        answer_parts = []
        follow_ups = []

        if intent in ["find_pfz", "high_chl_favourable_sst"]:
            pfz_data = state.tool_results.get("pfz_candidates", {})
            cands = pfz_data.get("candidates", [])
            if cands:
                top = cands[0]
                pfz_text = get_phrase(
                    lang, "pfz_found",
                    port=loc_name,
                    count=len(cands),
                    dist=top["distance_km"],
                    bearing=top["bearing_deg"]
                )
                factors_text = get_phrase(
                    lang, "pfz_factors",
                    grad=top["grad_sst"],
                    chl=top["mean_chl_mg_m3"],
                    sst=top["mean_sst_c"]
                )
                answer_parts.append(f"🎣 {pfz_text}\n\n📊 **{factors_text}**")
            else:
                answer_parts.append(f"🎣 {loc_name}: Potential Fishing Zones loaded on the map.")

            if state.verdict:
                v_msg = get_phrase(
                    lang, "safe_window_msg",
                    start=state.verdict.safe_window_start or "05:00 IST",
                    end=state.verdict.safe_window_end or "15:00 IST",
                    return_time=state.verdict.latest_safe_return or "17:00 IST"
                )
                answer_parts.append(f"⏱️ {v_msg}")

            follow_ups = [
                "What is the safest route avoiding shallow waters?",
                "What about Thursday for a non-motorised boat?",
                "Show SST and Chlorophyll map layers"
            ]

        elif intent == "productivity_decline_why":
            anom = state.tool_results.get("anomaly_analysis", {})
            anom_text = get_phrase(lang, "anomaly_mannar", sst_anom=1.2, chl_drop=34)
            answer_parts.append(f"📉 {anom_text}\n\n**Ranked Hypotheses:**")
            for h in anom.get("hypotheses", []):
                answer_parts.append(f"• **#{h['rank']} {h['title']}** (Confidence: {int(h['confidence']*100)}%): {h['evidence']}")
            answer_parts.append(f"\n⚠️ *{anom.get('caveat', '')}*")
            follow_ups = [
                "Where is the nearest active PFZ today?",
                "Are there any closed fishing bans active?",
                "Check 24-hour wave conditions"
            ]

        elif intent == "hazard_alerts":
            cyclone = state.tool_results.get("cyclone", {})
            if cyclone.get("has_active_cyclone"):
                c_details = cyclone.get("details", {})
                danger_text = get_phrase(
                    lang, "danger_storm_cyclone",
                    wind=c_details.get("max_sustained_winds_kmh", 105),
                    wave=3.8
                )
                answer_parts.append(f"🚨 **{c_details.get('name', 'Cyclone')} ({c_details.get('current_stage', 'Warning')})**\n\n{danger_text}")
                answer_parts.append(f"📢 {c_details.get('fishermen_warning', '')}")
            else:
                answer_parts.append("✅ No active cyclonic storm or severe gale warnings in your coastal sector today.")

            follow_ups = [
                "Nearest safe landing harbour",
                "Is it safe for tomorrow morning?",
                "View cyclone track on map"
            ]

        else:  # Safety check / general
            if state.verdict:
                v_level = state.verdict.level.value
                v_title = get_phrase(lang, f"verdict_{v_level.lower()}")
                answer_parts.append(f"⚓ **{v_title}** — {state.verdict.headline}")
                if state.verdict.safe_window_start:
                    v_msg = get_phrase(
                        lang, "safe_window_msg",
                        start=state.verdict.safe_window_start,
                        end=state.verdict.safe_window_end,
                        return_time=state.verdict.latest_safe_return
                    )
                    answer_parts.append(f"🕒 {v_msg}")
            
            # Simple summary
            wave = marine.get("current_wave_height", 1.2)
            wind = forecast.get("current_wind_speed_kmh", 16.0)
            status_word = "moderate" if wave > 1.5 else "calm"
            simple_text = get_phrase(lang, "explain_simply", status=status_word, wave=wave, wind=wind, recommendation="Stay vigilant.")
            answer_parts.append(f"\n💡 {simple_text}")

            follow_ups = [
                "Where is the nearest fishing zone today?",
                "What if I have a non-motorised boat?",
                "Are there any boundary alerts near here?"
            ]

        final_text = "\n\n".join(answer_parts)

        return {
            "evidence": evidence_cards,
            "answer_text": final_text,
            "follow_up_suggestions": follow_ups
        }
