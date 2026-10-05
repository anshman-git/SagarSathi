from typing import Dict, Any, List

ADAPTER_REGISTRY: List[Dict[str, Any]] = [
    {
        "name": "open_meteo_marine",
        "provides": ["wave_height", "swell_period", "swell_height", "sea_state", "currents"],
        "regions": ["All Indian Oceans & Seas"],
        "cost": "FREE",
        "latency_ms": 350,
        "ttl_sec": 3600,
        "fallback": "CACHED -> DEMO"
    },
    {
        "name": "open_meteo_forecast",
        "provides": ["wind_speed", "wind_gusts", "precipitation", "cape_lightning", "weather_code"],
        "regions": ["Global / Indian Coast"],
        "cost": "FREE",
        "latency_ms": 300,
        "ttl_sec": 3600,
        "fallback": "CACHED -> DEMO"
    },
    {
        "name": "sst_chl_grids",
        "provides": ["sea_surface_temperature_grid", "chlorophyll_a_grid", "thermal_gradients"],
        "regions": ["Arabian Sea", "Bay of Bengal", "Indian Ocean"],
        "cost": "FREE",
        "latency_ms": 800,
        "ttl_sec": 86400,
        "fallback": "SYNTHETIC BUNDLED DEMO"
    },
    {
        "name": "incois_pfz",
        "provides": ["official_incois_pfz_polygons", "landing_centre_advisories"],
        "regions": ["Indian Coast"],
        "cost": "FREE",
        "latency_ms": 500,
        "ttl_sec": 86400,
        "fallback": "BUNDLED DEMO SAMPLE"
    },
    {
        "name": "incois_osf",
        "provides": ["ocean_state_forecast", "high_wave_alerts", "kallakadal_swell_surge"],
        "regions": ["Indian Coastal States"],
        "cost": "FREE",
        "latency_ms": 400,
        "ttl_sec": 14400,
        "fallback": "DERIVED HAZARDS"
    },
    {
        "name": "imd_cyclone",
        "provides": ["cyclone_stage", "track_points", "wind_radii", "fishermen_warnings"],
        "regions": ["North Indian Ocean"],
        "cost": "FREE",
        "latency_ms": 450,
        "ttl_sec": 7200,
        "fallback": "SCENARIO SIMULATOR"
    },
    {
        "name": "geo_layers",
        "provides": ["ports", "imbl_lines", "marine_protected_areas", "seasonal_fishing_bans"],
        "regions": ["India EEZ"],
        "cost": "ZERO_OFFLINE",
        "latency_ms": 10,
        "ttl_sec": 999999,
        "fallback": "LOCAL STATIC GEOJSON"
    },
    {
        "name": "geocoder",
        "provides": ["port_gazetteer", "landing_centre_coords", "aliases"],
        "regions": ["India Coast"],
        "cost": "ZERO_OFFLINE",
        "latency_ms": 15,
        "ttl_sec": 999999,
        "fallback": "OPEN_METEO_GEOCODING"
    }
]

def get_adapter_info(name: str) -> Dict[str, Any]:
    for item in ADAPTER_REGISTRY:
        if item["name"] == name:
            return item
    return {"name": name, "status": "UNKNOWN"}
