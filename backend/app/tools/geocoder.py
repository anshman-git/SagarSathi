import json
import logging
import httpx
from typing import Dict, Any, Optional, Tuple
from ..config import settings
from .geo_layers import get_layer_geojson

logger = logging.getLogger(__name__)

async def geocode_location(query: str) -> Optional[Dict[str, Any]]:
    """
    Geocodes a coastal location, landing centre, or district.
    First searches local multilingual gazetteer (≥40 landing centres), then falls back to Open-Meteo Geocoding.
    """
    q_norm = query.strip().lower()
    
    # 1. Local Gazetteer search
    ports_geojson = get_layer_geojson("ports")
    for feat in ports_geojson.get("features", []):
        props = feat.get("properties", {})
        coords = feat.get("geometry", {}).get("coordinates", [0, 0])
        name = props.get("name", "").lower()
        district = props.get("district", "").lower()
        state = props.get("state", "").lower()
        names_dict = props.get("names", {})
        
        # Check primary name, district, state
        if (q_norm in name or name in q_norm or 
            q_norm in district or 
            any(q_norm in str(val).lower() or str(val).lower() in q_norm for val in names_dict.values())):
            return {
                "name": props.get("name"),
                "lat": coords[1],
                "lon": coords[0],
                "district": props.get("district"),
                "state": props.get("state"),
                "source": "Local Multilingual Gazetteer"
            }
            
    # Common aliases
    aliases = {
        "chennai": {"name": "Kasimedu Fishing Harbour, Chennai", "lat": 13.1250, "lon": 80.2980, "district": "Chennai", "state": "Tamil Nadu"},
        "mandapam": {"name": "Mandapam Landing Centre", "lat": 9.2780, "lon": 79.1250, "district": "Ramanathapuram", "state": "Tamil Nadu"},
        "rameswaram": {"name": "Rameswaram Fishing Jetty", "lat": 9.2876, "lon": 79.3129, "district": "Ramanathapuram", "state": "Tamil Nadu"},
        "veraval": {"name": "Veraval Fishing Harbour", "lat": 20.9000, "lon": 70.3667, "district": "Gir Somnath", "state": "Gujarat"},
        "vizag": {"name": "Visakhapatnam Fishing Harbour", "lat": 17.6868, "lon": 83.2185, "district": "Visakhapatnam", "state": "Andhra Pradesh"},
        "visakhapatnam": {"name": "Visakhapatnam Fishing Harbour", "lat": 17.6868, "lon": 83.2185, "district": "Visakhapatnam", "state": "Andhra Pradesh"},
        "kochi": {"name": "Kochi (Thoppumpady) Harbour", "lat": 9.9312, "lon": 76.2673, "district": "Ernakulam", "state": "Kerala"},
        "cochin": {"name": "Kochi (Thoppumpady) Harbour", "lat": 9.9312, "lon": 76.2673, "district": "Ernakulam", "state": "Kerala"},
        "nagapattinam": {"name": "Nagapattinam Port", "lat": 10.7667, "lon": 79.8500, "district": "Nagapattinam", "state": "Tamil Nadu"},
        "digha": {"name": "Shankarpur Fishing Harbour, Digha", "lat": 21.6333, "lon": 87.5667, "district": "Purba Medinipur", "state": "West Bengal"},
        "paradip": {"name": "Paradip Fishing Harbour", "lat": 20.3167, "lon": 86.6833, "district": "Jagatsinghpur", "state": "Odisha"},
        "mumbai": {"name": "Sassoon Dock, Mumbai", "lat": 18.9133, "lon": 72.8250, "district": "Mumbai", "state": "Maharashtra"},
        "mangalore": {"name": "Mangalore Old Port", "lat": 12.8533, "lon": 74.8344, "district": "Dakshina Kannada", "state": "Karnataka"},
        "gulf of mannar": {"name": "Mandapam / Gulf of Mannar", "lat": 9.1500, "lon": 79.1000, "district": "Ramanathapuram", "state": "Tamil Nadu"},
        "palk bay": {"name": "Rameswaram / Palk Bay", "lat": 9.3500, "lon": 79.3000, "district": "Ramanathapuram", "state": "Tamil Nadu"}
    }
    for alias_key, val in aliases.items():
        if alias_key in q_norm:
            val["source"] = "Gazetteer Alias"
            return val

    # 2. Open-Meteo Geocoding fallback
    try:
        url = "https://geocoding-api.open-meteo.com/v1/search"
        params = {"name": query, "count": 1, "language": "en", "format": "json"}
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url, params=params)
            if resp.status_code == 200:
                data = resp.json()
                results = data.get("results", [])
                if results:
                    top = results[0]
                    return {
                        "name": top.get("name"),
                        "lat": top.get("latitude"),
                        "lon": top.get("longitude"),
                        "district": top.get("admin2", top.get("admin1", "")),
                        "state": top.get("admin1", "India"),
                        "source": "Open-Meteo Geocoding"
                    }
    except Exception as e:
        logger.warning(f"Open-Meteo Geocoding failed: {e}")

    # Default fallback: Chennai Kasimedu
    return {
        "name": "Kasimedu Fishing Harbour (Default)",
        "lat": 13.1250,
        "lon": 80.2980,
        "district": "Chennai",
        "state": "Tamil Nadu",
        "source": "Default Baseline Location"
    }
