import math
from typing import Dict, Any, List, Optional, Tuple
from shapely.geometry import Point, LineString, Polygon, shape
from ..config import settings
from ..models import GeofenceTier, AlertSeverity, AlertItem, SourceBadge
from ..tools.geo_layers import get_layer_geojson

def check_geofence(lat: float, lon: float, heading: Optional[float] = None) -> Dict[str, Any]:
    """
    Computes distance (nautical miles) to nearest IMBL boundary lines, EEZ, and MPAs.
    Applies 3 tiers:
    - Advisory <= 10 nm
    - Alert <= 5 nm
    - Critical <= 2 nm or crossed into foreign / restricted waters
    Also calculates recommended turn-back heading.
    """
    user_point = Point(lon, lat)
    imbl_data = get_layer_geojson("imbl")
    mpa_data = get_layer_geojson("mpa")
    
    min_dist_km = 9999.0
    nearest_name = "None"
    tier = GeofenceTier.SAFE
    is_inside_restricted = False
    
    # 1. Check IMBL lines
    for feat in imbl_data.get("features", []):
        geom = shape(feat.get("geometry", {}))
        # Approx metric distance in km (1 deg lat ~ 111 km, 1 deg lon ~ 111 * cos(lat) km)
        # Using projected distance approximation
        coords = feat.get("geometry", {}).get("coordinates", [])
        for c in coords:
            # Haversine distance
            d = haversine_km(lat, lon, c[1], c[0])
            if d < min_dist_km:
                min_dist_km = d
                nearest_name = feat.get("properties", {}).get("name", "IMBL Line")
                
    # 2. Check MPA Polygons
    for feat in mpa_data.get("features", []):
        try:
            poly = shape(feat.get("geometry", {}))
            if poly.contains(user_point):
                is_inside_restricted = True
                min_dist_km = 0.0
                nearest_name = feat.get("properties", {}).get("name", "Marine Protected Area")
                break
        except Exception:
            pass

    min_dist_nm = min_dist_km / 1.852

    # Determine Tier
    if is_inside_restricted or min_dist_nm <= settings.GEOFENCE_CRITICAL_NM:
        tier = GeofenceTier.CRITICAL
    elif min_dist_nm <= settings.GEOFENCE_ALERT_NM:
        tier = GeofenceTier.ALERT
    elif min_dist_nm <= settings.GEOFENCE_ADVISORY_NM:
        tier = GeofenceTier.ADVISORY
    else:
        tier = GeofenceTier.SAFE

    # Calculate turn-back heading (opposite of current heading or bearing away from boundary)
    turn_back = (heading + 180) % 360 if heading is not None else 270.0  # Default west toward Indian mainland

    details = f"Distance to {nearest_name}: {min_dist_nm:.1f} nm ({min_dist_km:.1f} km). "
    if tier == GeofenceTier.CRITICAL:
        details += f"CRITICAL: Immediate course alteration required! Turn to heading {turn_back:.0f}°."
    elif tier == GeofenceTier.ALERT:
        details += "ALERT: Approaching restricted/international waters."
    elif tier == GeofenceTier.ADVISORY:
        details += "ADVISORY: Border zone awareness active."
    else:
        details += "Vessel operating safely inside national fishing waters."

    return {
        "tier": tier,
        "nearest_boundary_name": nearest_name,
        "distance_nm": round(min_dist_nm, 2),
        "distance_km": round(min_dist_km, 2),
        "turn_back_heading": round(turn_back, 1),
        "is_inside_restricted": is_inside_restricted,
        "details": details
    }

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c
