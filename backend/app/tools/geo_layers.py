import json
import logging
from typing import Dict, Any, List, Optional
from ..config import settings
from ..models import SourceBadge

logger = logging.getLogger(__name__)

def get_layer_geojson(layer_name: str) -> Dict[str, Any]:
    """
    Returns GeoJSON data for ports, imbl, mpa, and fishing bans.
    """
    geo_map = {
        "ports": settings.GEO_DIR / "ports_landing_centres.geojson",
        "imbl": settings.GEO_DIR / "imbl_eez_indicative.geojson",
        "mpa": settings.GEO_DIR / "marine_protected_areas.geojson",
        "pfz_official": settings.DEMO_DIR / "pfz_sample.geojson",
    }
    
    file_path = geo_map.get(layer_name)
    if file_path and file_path.exists():
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading layer {layer_name}: {e}")
            
    return {"type": "FeatureCollection", "features": []}

def get_fishing_bans() -> Dict[str, Any]:
    ban_file = settings.GEO_DIR / "fishing_ban_zones.json"
    if ban_file.exists():
        with open(ban_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}
