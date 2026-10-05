import httpx
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any
from ..config import settings
from ..models import SourceBadge

logger = logging.getLogger(__name__)

async def fetch_forecast_data(lat: float, lon: float, force_demo: bool = False) -> Dict[str, Any]:
    """
    Fetches weather forecast (wind speed, gusts, precipitation, CAPE, weather codes) from Open-Meteo.
    Uses CAPE and weather code (95-99) as a reliable proxy for thunderstorm/lightning potential.
    """
    cache_key = f"forecast_{round(lat, 2)}_{round(lon, 2)}.json"
    cache_path = settings.CACHE_DIR / cache_key
    now_utc = datetime.now(timezone.utc)
    
    if not force_demo:
        try:
            url = "https://api.open-meteo.com/v1/forecast"
            params = {
                "latitude": lat,
                "longitude": lon,
                "hourly": [
                    "wind_speed_10m",
                    "wind_gusts_10m",
                    "wind_direction_10m",
                    "precipitation",
                    "cape",
                    "visibility",
                    "weather_code"
                ],
                "timezone": "auto",
                "forecast_days": 3
            }
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.get(url, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    hourly = data.get("hourly", {})
                    wind_speed = (hourly.get("wind_speed_10m", [15.0]) or [15.0])[0]
                    gusts = (hourly.get("wind_gusts_10m", [20.0]) or [20.0])[0]
                    cape = (hourly.get("cape", [150.0]) or [150.0])[0]
                    wcode = (hourly.get("weather_code", [0]) or [0])[0]
                    
                    # Thunderstorm / lightning risk proxy
                    has_lightning = (wcode in [95, 96, 99]) or (cape > 1000)
                    
                    result = {
                        "source": SourceBadge.LIVE,
                        "fetched_at": now_utc.isoformat(),
                        "latitude": lat,
                        "longitude": lon,
                        "hourly": hourly,
                        "current_wind_speed_kmh": wind_speed,
                        "current_wind_gusts_kmh": gusts,
                        "current_cape": cape,
                        "current_weather_code": wcode,
                        "lightning_risk": has_lightning
                    }
                    try:
                        with open(cache_path, "w", encoding="utf-8") as f:
                            json.dump(result, f)
                    except Exception as e:
                        logger.warning(f"Failed to cache forecast: {e}")
                    return result
        except Exception as ex:
            logger.info(f"Open-Meteo Forecast live fetch failed ({ex}); using cache/demo fallback.")

    if cache_path.exists():
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                cached = json.load(f)
                cached["source"] = SourceBadge.CACHED
                return cached
        except Exception:
            pass

    times = [f"{now_utc.strftime('%Y-%m-%d')}T{i:02d}:00" for i in range(72)]
    return {
        "source": SourceBadge.DEMO,
        "fetched_at": now_utc.isoformat(),
        "latitude": lat,
        "longitude": lon,
        "hourly": {
            "time": times,
            "wind_speed_10m": [round(14.0 + 4.0 * math_sin(i), 1) for i in range(72)],
            "wind_gusts_10m": [round(20.0 + 5.0 * math_sin(i), 1) for i in range(72)],
            "precipitation": [0.0 if i % 12 != 0 else 1.5 for i in range(72)],
            "cape": [250.0 if i < 40 else 600.0 for i in range(72)],
            "visibility": [10000.0 for _ in range(72)],
            "weather_code": [1 if i % 10 != 0 else 95 for i in range(72)]
        },
        "current_wind_speed_kmh": 16.5,
        "current_wind_gusts_kmh": 22.0,
        "current_cape": 320.0,
        "current_weather_code": 1,
        "lightning_risk": False
    }

def math_sin(i: int) -> float:
    import math
    return math.sin(i * 0.25)
