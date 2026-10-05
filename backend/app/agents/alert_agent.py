import uuid
from typing import Dict, Any, List
from ..models import AgentState, AlertItem, AlertSeverity, SourceBadge
from ..i18n.phrase_bank import get_phrase

class AlertAgent:
    """
    Generates structured safety and boundary alerts in the user's regional language.
    """
    async def run(self, state: AgentState) -> Dict[str, Any]:
        alerts: List[AlertItem] = []
        lang = state.lang
        geo = state.analysis.get("geofence", {})
        cyclone = state.tool_results.get("cyclone", {})

        # 1. Geofence Alert
        tier = geo.get("tier")
        if tier in ["ADVISORY", "ALERT", "CRITICAL"]:
            dist = geo.get("distance_nm", 5.0)
            boundary = geo.get("nearest_boundary_name", "IMBL")
            heading = geo.get("turn_back_heading", 270.0)

            if tier == "CRITICAL":
                msg = get_phrase(lang, "geofence_critical", boundary=boundary, dist=dist, heading=heading)
                sev = AlertSeverity.CRITICAL
                title = "🚨 CRITICAL BOUNDARY WARNING"
            elif tier == "ALERT":
                msg = get_phrase(lang, "geofence_alert", boundary=boundary, dist=dist)
                sev = AlertSeverity.ALERT
                title = "⚠️ BOUNDARY PROXIMITY ALERT"
            else:
                msg = get_phrase(lang, "geofence_advisory", boundary=boundary, dist=dist)
                sev = AlertSeverity.ADVISORY
                title = "ℹ️ MARITIME ADVISORY"

            alerts.append(AlertItem(
                id=str(uuid.uuid4())[:8],
                severity=sev,
                title=title,
                message=msg,
                lang=lang,
                turn_back_heading=heading,
                distance_km=geo.get("distance_km"),
                source=SourceBadge.DEMO
            ))

        # 2. Cyclone Alert
        if cyclone.get("has_active_cyclone"):
            c_details = cyclone.get("details", {})
            alerts.append(AlertItem(
                id=str(uuid.uuid4())[:8],
                severity=AlertSeverity.CRITICAL,
                title=f"🌪️ {c_details.get('name', 'Cyclone')} Warning",
                message=c_details.get("fishermen_warning", "Total suspension of fishing operations!"),
                lang=lang,
                source=cyclone.get("source", SourceBadge.DEMO)
            ))

        return {"alerts": alerts}
