import logging
from datetime import datetime, timezone
from typing import Dict, Any
from ..models import SourceBadge

logger = logging.getLogger(__name__)

async def fetch_ocean_state_forecast(lat: float, lon: float, force_demo: bool = False) -> Dict[str, Any]:
    """
    Best-effort adapter for INCOIS Ocean State Forecast (OSF), High Wave Alerts & Swell Surge (Kallakadal).
    """
    now_utc = datetime.now(timezone.utc)
    return {
        "source": SourceBadge.DEMO,
        "provider": "INCOIS Ocean State Forecast (OSF)",
        "fetched_at": now_utc.isoformat(),
        "high_wave_alert": False,
        "swell_surge_risk": "LOW",
        "advisory": "Normal coastal sea state. Swell period within operational safety limits (8-10 s)."
    }
