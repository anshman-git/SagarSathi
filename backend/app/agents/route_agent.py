from typing import Dict, Any
from ..models import AgentState
from ..analytics.routing import calculate_safe_route

class RouteAgent:
    """
    Computes direct and safest passage corridors avoiding shoals/hazards.
    """
    async def run(self, state: AgentState) -> Dict[str, Any]:
        lat = state.entities.location.lat if state.entities.location else 13.1250
        lon = state.entities.location.lon if state.entities.location else 80.2980

        # Destination: top PFZ candidate or offshore point
        target_lat = lat + 0.35
        target_lon = lon + 0.40
        pfz_res = state.tool_results.get("pfz_candidates", {})
        candidates = pfz_res.get("candidates", [])
        if candidates:
            target_lat = candidates[0]["centroid"]["lat"]
            target_lon = candidates[0]["centroid"]["lon"]

        marine = state.tool_results.get("marine", {})
        forecast = state.tool_results.get("forecast", {})
        wave_h = marine.get("current_wave_height", 1.2)
        wind_spd = forecast.get("current_wind_speed_kmh", 16.0)

        route_res = calculate_safe_route(
            from_lat=lat,
            from_lon=lon,
            to_lat=target_lat,
            to_lon=target_lon,
            vessel_profile=state.entities.vessel_profile,
            wave_exposure=wave_h,
            wind_exposure=wind_spd
        )

        return {"route": route_res}
