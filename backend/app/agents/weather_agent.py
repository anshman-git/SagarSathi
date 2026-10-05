from typing import Dict, Any
from ..models import AgentState, SourceBadge
from ..tools.open_meteo_forecast import fetch_forecast_data
from ..tools.imd_cyclone import fetch_cyclone_bulletin

class WeatherIntelligenceAgent:
    """
    Fetches and processes atmospheric parameters: wind speed, gusts, precipitation,
    CAPE lightning proxies, and IMD cyclone bulletins.
    """
    async def run(self, state: AgentState) -> Dict[str, Any]:
        lat = state.entities.location.lat if state.entities.location else 13.1250
        lon = state.entities.location.lon if state.entities.location else 80.2980
        
        forecast = await fetch_forecast_data(lat, lon)
        cyclone = await fetch_cyclone_bulletin()

        return {
            "tool_results": {
                **state.tool_results,
                "forecast": forecast,
                "cyclone": cyclone
            }
        }
