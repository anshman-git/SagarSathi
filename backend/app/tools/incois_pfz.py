import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any
from ..config import settings
from ..models import SourceBadge

logger = logging.getLogger(__name__)

async def fetch_official_pfz(lat: float, lon: float, force_demo: bool = False) -> Dict[str, Any]:
    """
    Best-effort adapter for INCOIS Official Potential Fishing Zone (PFZ) advisory.
    Returns official PFZ polygons with DEMO badge when using bundled data.
    """
    now_utc = datetime.now(timezone.utc)
    sample_file = settings.DEMO_DIR / "pfz_sample.geojson"
    
    if sample_file.exists():
        try:
            with open(sample_file, "r", encoding="utf-8") as f:
                geojson = json.load(f)
                return {
                    "source": SourceBadge.DEMO,
                    "provider": "INCOIS Potential Fishing Zone (PFZ) Advisory Service",
                    "fetched_at": now_utc.isoformat(),
                    "geojson": geojson,
                    "disclaimer": "Official PFZ product ingested and presented for comparison with derived candidate zones."
                }
        except Exception as e:
            logger.error(f"Failed to load sample PFZ: {e}")
            
    return {
        "source": SourceBadge.DEMO,
        "provider": "INCOIS PFZ (Sample Fallback)",
        "fetched_at": now_utc.isoformat(),
        "geojson": {"type": "FeatureCollection", "features": []},
        "disclaimer": "No active official PFZ available for this coordinate."
    }
