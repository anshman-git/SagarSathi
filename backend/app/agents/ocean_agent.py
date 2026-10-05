from typing import Dict, Any
from ..models import AgentState, SourceBadge
from ..tools.open_meteo_marine import fetch_marine_data
from ..tools.sst_chl_grids import fetch_sst_chl_grid
from ..tools.incois_pfz import fetch_official_pfz
from ..tools.incois_osf import fetch_ocean_state_forecast
from ..analytics.pfz import score_pfz_candidates
from ..analytics.anomaly import analyze_productivity_anomaly

class OceanAnalyticsAgent:
    """
    Fetches ocean state (waves, swell, SST, Chl-a), computes derived PFZ candidates,
    and runs anomaly analytics.
    """
    async def run(self, state: AgentState) -> Dict[str, Any]:
        lat = state.entities.location.lat if state.entities.location else 13.1250
        lon = state.entities.location.lon if state.entities.location else 80.2980

        marine = await fetch_marine_data(lat, lon)
        sst_chl = await fetch_sst_chl_grid(lat, lon)
        official_pfz = await fetch_official_pfz(lat, lon)
        osf = await fetch_ocean_state_forecast(lat, lon)

        # Compute derived PFZ if intent requests PFZ
        pfz_res = {}
        if state.intent in ["find_pfz", "high_chl_favourable_sst"]:
            wave_h = marine.get("current_wave_height", 1.2)
            pfz_res = score_pfz_candidates(sst_chl, lat, lon, wave_height=wave_h)

        # Productivity decline anomaly
        anomaly_res = {}
        if state.intent == "productivity_decline_why":
            loc_name = state.entities.location.name if state.entities.location else "Gulf of Mannar"
            anomaly_res = analyze_productivity_anomaly(loc_name)

        return {
            "tool_results": {
                **state.tool_results,
                "marine": marine,
                "sst_chl": sst_chl,
                "official_pfz": official_pfz,
                "osf": osf,
                "pfz_candidates": pfz_res,
                "anomaly_analysis": anomaly_res
            }
        }
