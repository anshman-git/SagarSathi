from typing import Dict, Any, List, Tuple
from ..config import settings
from ..models import VesselProfile, SafetyVerdictLevel, FactorItem, SourceBadge, Verdict

def evaluate_safety(
    marine_data: Dict[str, Any],
    forecast_data: Dict[str, Any],
    cyclone_data: Dict[str, Any],
    vessel_profile: VesselProfile = VesselProfile.SMALL_MOTORISED,
    time_window: str = "today"
) -> Tuple[Verdict, List[FactorItem], List[str]]:
    """
    Evaluates multi-factor marine safety based on wave height, swell period,
    wind speed/gusts, lightning/CAPE proxy, and active cyclone stage.
    Applies vessel scaling:
    - non_motorised: scale thresholds by 0.7
    - small_motorised: base thresholds (wave 1.5/2.5m, wind 25/45km/h)
    - mechanised: scale thresholds by 1.4
    """
    # Scale factors
    scale = 1.0
    if vessel_profile == VesselProfile.NON_MOTORISED:
        scale = 0.70
    elif vessel_profile == VesselProfile.MECHANISED:
        scale = 1.40

    wave_caution = settings.WAVE_CAUTION_THRESHOLD_M * scale
    wave_nogo = settings.WAVE_NO_GO_THRESHOLD_M * scale
    wind_caution = settings.WIND_CAUTION_THRESHOLD_KMH * scale
    wind_nogo = settings.WIND_NO_GO_THRESHOLD_KMH * scale

    wave_h = marine_data.get("current_wave_height", 1.2)
    swell_p = marine_data.get("current_swell_period", 8.0)
    swell_h = marine_data.get("current_swell_height", 0.8)
    wind_speed = forecast_data.get("current_wind_speed_kmh", 16.0)
    wind_gusts = forecast_data.get("current_wind_gusts_kmh", 22.0)
    cape = forecast_data.get("current_cape", 250.0)
    lightning = forecast_data.get("lightning_risk", False)
    has_cyclone = cyclone_data.get("has_active_cyclone", False)

    factor_table: List[FactorItem] = []
    reasons: List[str] = []
    overall_status = SafetyVerdictLevel.GO

    # 1. Wave Height Factor
    if wave_h >= wave_nogo:
        w_status = SafetyVerdictLevel.NO_GO
        overall_status = SafetyVerdictLevel.NO_GO
        reasons.append(f"Significant wave height ({wave_h}m) exceeds safe limit of {wave_nogo:.1f}m for {vessel_profile.value}.")
    elif wave_h >= wave_caution:
        w_status = SafetyVerdictLevel.CAUTION
        if overall_status != SafetyVerdictLevel.NO_GO:
            overall_status = SafetyVerdictLevel.CAUTION
        reasons.append(f"Wave height ({wave_h}m) requires caution (threshold {wave_caution:.1f}m).")
    else:
        w_status = SafetyVerdictLevel.GO

    factor_table.append(FactorItem(
        factor="Significant Wave Height (Hs)",
        value=f"{wave_h} m",
        threshold=f"Go <{wave_caution:.1f}m | Caution {wave_caution:.1f}-{wave_nogo:.1f}m | No-Go >{wave_nogo:.1f}m",
        status=w_status,
        source=marine_data.get("source", SourceBadge.LIVE),
        note="Open-Meteo Marine / INCOIS OSF"
    ))

    # 2. Wind Speed & Gusts Factor
    if wind_speed >= wind_nogo or wind_gusts >= (wind_nogo * 1.25):
        wind_status = SafetyVerdictLevel.NO_GO
        overall_status = SafetyVerdictLevel.NO_GO
        reasons.append(f"Sustained wind ({wind_speed} km/h, gusts {wind_gusts} km/h) exceeds IMD warning limit ({wind_nogo:.0f} km/h).")
    elif wind_speed >= wind_caution:
        wind_status = SafetyVerdictLevel.CAUTION
        if overall_status != SafetyVerdictLevel.NO_GO:
            overall_status = SafetyVerdictLevel.CAUTION
        reasons.append(f"Moderate wind speed ({wind_speed} km/h) requires alertness.")
    else:
        wind_status = SafetyVerdictLevel.GO

    factor_table.append(FactorItem(
        factor="Sustained Wind Speed & Gusts",
        value=f"{wind_speed} km/h (Gusts: {wind_gusts} km/h)",
        threshold=f"Go <{wind_caution:.0f}km/h | Caution {wind_caution:.0f}-{wind_nogo:.0f}km/h | No-Go ≥{wind_nogo:.0f}km/h",
        status=wind_status,
        source=forecast_data.get("source", SourceBadge.LIVE),
        note="Open-Meteo / IMD Fisherman threshold ~25 knots"
    ))

    # 3. Swell Period / Surge Factor (Kallakadal Risk)
    if swell_p >= settings.SWELL_SURGE_PERIOD_S and swell_h >= settings.SWELL_SURGE_HEIGHT_M:
        swell_status = SafetyVerdictLevel.CAUTION
        if overall_status != SafetyVerdictLevel.NO_GO:
            overall_status = SafetyVerdictLevel.CAUTION
        reasons.append(f"Long-period swell ({swell_p}s at {swell_h}m) indicates Kallakadal / surge risk near coast.")
    else:
        swell_status = SafetyVerdictLevel.GO

    factor_table.append(FactorItem(
        factor="Swell Wave Period & Height",
        value=f"{swell_p} s | {swell_h} m",
        threshold="Caution if period >14s & height >1.0m",
        status=swell_status,
        source=marine_data.get("source", SourceBadge.LIVE),
        note="Swell surge indicator"
    ))

    # 4. Lightning / Convective Risk
    if lightning or cape > 1500:
        l_status = SafetyVerdictLevel.NO_GO if cape > 2000 else SafetyVerdictLevel.CAUTION
        if l_status == SafetyVerdictLevel.NO_GO:
            overall_status = SafetyVerdictLevel.NO_GO
            reasons.append("Severe convective thunderstorm activity and lightning danger detected.")
        elif overall_status != SafetyVerdictLevel.NO_GO:
            overall_status = SafetyVerdictLevel.CAUTION
            reasons.append("Moderate thunderstorm potential (CAPE proxy elevated).")
    else:
        l_status = SafetyVerdictLevel.GO

    factor_table.append(FactorItem(
        factor="Lightning / Convective Instability",
        value=f"CAPE: {cape:.0f} J/kg | WCode: {forecast_data.get('current_weather_code', 0)}",
        threshold="Caution if Thunderstorm / CAPE > 1000 J/kg",
        status=l_status,
        source=forecast_data.get("source", SourceBadge.LIVE),
        note="Convective proxy"
    ))

    # 5. Cyclone Stage Warning
    if has_cyclone:
        c_details = cyclone_data.get("details", {})
        c_status = SafetyVerdictLevel.NO_GO
        overall_status = SafetyVerdictLevel.NO_GO
        reasons.append(f"ACTIVE CYCLONE ADVISORY: {c_details.get('name', 'Cyclone')} ({c_details.get('current_stage', 'Warning')}). Suspension of fishing operations.")
        factor_table.append(FactorItem(
            factor="IMD Cyclone Warning Stage",
            value=c_details.get("current_stage", "Cyclone Alert"),
            threshold="Strict NO-GO on Alert / Warning",
            status=c_status,
            source=cyclone_data.get("source", SourceBadge.DEMO),
            note=c_details.get("fishermen_warning", "Total suspension of fishing operations")
        ))
    else:
        factor_table.append(FactorItem(
            factor="IMD Cyclone Warning Stage",
            value="No Active Cyclone",
            threshold="No Warning in effect",
            status=SafetyVerdictLevel.GO,
            source=cyclone_data.get("source", SourceBadge.LIVE),
            note="IMD RSMC New Delhi Bulletin"
        ))

    # Compose headline and departure window
    if overall_status == SafetyVerdictLevel.GO:
        headline = f"Safe conditions for {vessel_profile.value.replace('_', ' ')}."
        safe_start = "04:30 IST"
        safe_end = "16:00 IST"
        return_time = "17:30 IST"
        if not reasons:
            reasons.append("Wave heights and wind speeds are well within calm operational limits.")
    elif overall_status == SafetyVerdictLevel.CAUTION:
        headline = f"Caution advised for {vessel_profile.value.replace('_', ' ')}. Stay near coast."
        safe_start = "05:30 IST"
        safe_end = "12:30 IST"
        return_time = "14:00 IST"
    else:
        headline = f"STRICT NO-GO: Hazardous sea state for {vessel_profile.value.replace('_', ' ')}."
        safe_start = None
        safe_end = None
        return_time = "Immediate Return to Port"

    verdict = Verdict(
        level=overall_status,
        headline=headline,
        safe_window_start=safe_start,
        safe_window_end=safe_end,
        latest_safe_return=return_time
    )

    return verdict, factor_table, reasons
