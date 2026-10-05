import httpx
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional
from ..config import settings
from ..models import SourceBadge

logger = logging.getLogger(__name__)

CACHE_TTL_SECONDS = 3600  # 1 hour

async def fetch_marine_data(lat: float, lon: float, force_demo: bool = False) -> Dict[str, Any]:
    """
    Fetches marine wave, swell, and sea state data from Open-Meteo Marine API.
    Falls back gracefully to cached or synthetic data with explicit source badge.
    """
    cache_key = f"marine_{round(lat, 2)}_{round(lon, 2)}.json"
    cache_path = settings.CACHE_DIR / cache_key
    now_utc = datetime.now(timezone.utc)
    
    if not force_demo:
        try:
            url = "https://marine-api.open-meteo.com/v1/marine"
            params = {
                "latitude": lat,
                "longitude": lon,
                "hourly": [
                    "wave_height",
                    "wave_direction",
                    "wave_period",
                    "wind_wave_height",
                    "swell_wave_height",
                    "swell_wave_period",
                    "ocean_current_velocity",
                    "ocean_current_direction",
                    "sea_surface_temperature"
                ],
                "timezone": "auto",
                "forecast_days": 3
            }
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.get(url, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    result = {
                        "source": SourceBadge.LIVE,
                        "fetched_at": now_utc.isoformat(),
                        "latitude": lat,
                        "longitude": lon,
                        "hourly": data.get("hourly", {}),
                        "current_wave_height": (data.get("hourly", {}).get("wave_height", [1.2]) or [1.2])[0],
                        "current_swell_period": (data.get("hourly", {}).get("swell_wave_period", [8.0]) or [8.0])[0],
                        "current_swell_height": (data.get("hourly", {}).get("swell_wave_height", [0.8]) or [0.8])[0],
                        "current_sst": (data.get("hourly", {}).get("sea_surface_temperature", [28.2]) or [28.2])[0]
                    }
                    # Save to cache
                    try:
                        with open(cache_path, "w", encoding="utf-8") as f:
                            json.dump(result, f)
                    except Exception as e:
                        logger.warning(f"Failed to write cache: {e}")
                    return result
        except Exception as ex:
            logger.info(f"Open-Meteo Marine live fetch failed ({ex}); attempting cache/demo.")

    # Check cache
    if cache_path.exists():
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                cached = json.load(f)
                cached["source"] = SourceBadge.CACHED
                return cached
        except Exception:
            pass

    # Bundled fallback demo data
    times = [f"{now_utc.strftime('%Y-%m-%d')}T{i:02d}:00" for i in range(72)]
    return {
        "source": SourceBadge.DEMO,
        "fetched_at": now_utc.isoformat(),
        "latitude": lat,
        "longitude": lon,
        "hourly": {
            "time": times,
            "wave_height": [round(1.1 + 0.3 * (i % 8) / 8, 2) for i in range(72)],
            "wave_period": [round(7.5 + 0.5 * (i % 6), 1) for i in range(72)],
            "swell_wave_height": [round(0.7 + 0.2 * (i % 5) / 5, 2) for i in range(72)],
            "swell_wave_period": [round(8.0 + (1.0 if i > 30 else 0), 1) for i in range(72)],
            "sea_surface_temperature": [28.3 for _ in range(72)]
        },
        "current_wave_height": 1.2,
        "current_swell_period": 8.5,
        "current_swell_height": 0.75,
        "current_sst": 28.3
    }
