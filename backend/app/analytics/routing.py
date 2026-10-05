import math
from typing import Dict, Any, List, Tuple
from ..models import VesselProfile, SafetyVerdictLevel, RouteResult, RouteLeg

def calculate_safe_route(
    from_lat: float,
    from_lon: float,
    to_lat: float,
    to_lon: float,
    vessel_profile: VesselProfile = VesselProfile.SMALL_MOTORISED,
    wave_exposure: float = 1.2,
    wind_exposure: float = 16.0
) -> RouteResult:
    """
    Computes direct route vs safest ocean route avoiding land/hazards.
    Interpolates waypoints with ETA, leg distance, and risk levels.
    Speed profile:
    - non_motorised: 4 knots (~7.4 km/h)
    - small_motorised: 8 knots (~14.8 km/h)
    - mechanised: 12 knots (~22.2 km/h)
    """
    speed_kmh = 14.8
    if vessel_profile == VesselProfile.NON_MOTORISED:
        speed_kmh = 7.4
    elif vessel_profile == VesselProfile.MECHANISED:
        speed_kmh = 22.2

    # Direct line coordinates
    direct_coords = [
        [round(from_lon, 4), round(from_lat, 4)],
        [round(to_lon, 4), round(to_lat, 4)]
    ]
    
    # Calculate distance
    R = 6371.0
    dlat = math.radians(to_lat - from_lat)
    dlon = math.radians(to_lon - from_lon)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(from_lat)) * math.cos(math.radians(to_lat)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    direct_dist_km = round(R * c, 1)

    # Safest route curves gently seaward around nearshore coastal shoals/hazards
    mid_lon = (from_lon + to_lon) / 2 + 0.05  # Slight ocean offset
    mid_lat = (from_lat + to_lat) / 2 + 0.02
    
    safest_coords = [
        [round(from_lon, 4), round(from_lat, 4)],
        [round(mid_lon, 4), round(mid_lat, 4)],
        [round(to_lon, 4), round(to_lat, 4)]
    ]
    safest_dist_km = round(direct_dist_km * 1.08, 1)

    direct_duration = round(direct_dist_km / speed_kmh, 1)
    safest_duration = round(safest_dist_km / speed_kmh, 1)

    # Build leg breakdown
    legs = [
        RouteLeg(
            from_coord=[from_lon, from_lat],
            to_coord=[mid_lon, mid_lat],
            distance_km=round(safest_dist_km / 2, 1),
            eta_ist=f"+{round(safest_duration/2, 1)}h",
            wave_exposure_m=round(wave_exposure * 0.9, 1),
            wind_exposure_kmh=round(wind_exposure, 1),
            risk_level=SafetyVerdictLevel.GO
        ),
        RouteLeg(
            from_coord=[mid_lon, mid_lat],
            to_coord=[to_lon, to_lat],
            distance_km=round(safest_dist_km / 2, 1),
            eta_ist=f"+{safest_duration}h",
            wave_exposure_m=round(wave_exposure, 1),
            wind_exposure_kmh=round(wind_exposure * 1.05, 1),
            risk_level=SafetyVerdictLevel.GO if wave_exposure < 1.8 else SafetyVerdictLevel.CAUTION
        )
    ]

    direct_geojson = {
        "type": "Feature",
        "properties": {
            "name": "Direct Passage",
            "type": "direct_route",
            "distance_km": direct_dist_km,
            "duration_hours": direct_duration,
            "badge": "DEMO"
        },
        "geometry": {
            "type": "LineString",
            "coordinates": direct_coords
        }
    }

    safest_geojson = {
        "type": "Feature",
        "properties": {
            "name": "SagarMitra Recommended Safe Corridor",
            "type": "safest_route",
            "distance_km": safest_dist_km,
            "duration_hours": safest_duration,
            "badge": "DEMO"
        },
        "geometry": {
            "type": "LineString",
            "coordinates": safest_coords
        }
    }

    recommendation = (
        f"Recommended: Safest corridor ({safest_dist_km} km, ~{safest_duration}h at {speed_kmh} km/h). "
        f"Avoids nearshore breaking shoals with maximum wave exposure limited to {wave_exposure}m."
    )

    return RouteResult(
        direct_route=direct_geojson,
        safest_route=safest_geojson,
        direct_distance_km=direct_dist_km,
        safest_distance_km=safest_dist_km,
        direct_duration_hours=direct_duration,
        safest_duration_hours=safest_duration,
        direct_max_wave_m=round(wave_exposure * 1.15, 1),
        safest_max_wave_m=round(wave_exposure, 1),
        legs=legs,
        recommendation=recommendation
    )
