from typing import Dict, Any, List
from ..models import AgentState, SourceBadge
from ..tools.registry import ADAPTER_REGISTRY

class DataDiscoveryAgent:
    """
    Selects the optimal datasets and tools from the adapter registry based on
    variables needed (waves, SST, Chl-a, wind, cyclone, geofencing).
    """
    async def run(self, state: AgentState) -> Dict[str, Any]:
        needed_adapters = []
        intent = state.intent

        if intent in ["find_pfz", "high_chl_favourable_sst"]:
            needed_adapters = ["sst_chl_grids", "incois_pfz", "open_meteo_marine", "open_meteo_forecast", "geo_layers"]
        elif intent == "hazard_alerts":
            needed_adapters = ["imd_cyclone", "open_meteo_forecast", "open_meteo_marine", "incois_osf"]
        elif intent == "productivity_decline_why":
            needed_adapters = ["sst_chl_grids", "geo_layers"]
        else:
            needed_adapters = ["open_meteo_marine", "open_meteo_forecast", "incois_osf", "geo_layers"]

        selected = [a for a in ADAPTER_REGISTRY if a["name"] in needed_adapters]
        
        return {
            "analysis": {
                **state.analysis,
                "selected_adapters": selected
            }
        }
