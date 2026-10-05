from typing import Dict, Any
from ..models import AgentState
from ..analytics.geofence import check_geofence

class GeospatialReasoningAgent:
    """
    Evaluates spatial proximity to IMBL, MPAs, EEZ, and extracts nearest safe landing harbours.
    """
    async def run(self, state: AgentState) -> Dict[str, Any]:
        lat = state.entities.location.lat if state.entities.location else 13.1250
        lon = state.entities.location.lon if state.entities.location else 80.2980

        geofence_status = check_geofence(lat, lon)
        
        return {
            "geofence_hits": [geofence_status],
            "analysis": {
                **state.analysis,
                "geofence": geofence_status
            }
        }
