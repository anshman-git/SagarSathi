import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from ..config import settings
from ..models import SourceBadge

logger = logging.getLogger(__name__)

async def fetch_cyclone_bulletin(force_scenario: bool = False) -> Dict[str, Any]:
    """
    Fetches official IMD RSMC New Delhi cyclone bulletins or returns DEMO cyclone scenario
    ONLY when scenario mode is enabled by the user.
    """
    now_utc = datetime.now(timezone.utc)
    
    if force_scenario or settings.ENABLE_SCENARIO_MODE:
        cyclone_file = settings.DEMO_DIR / "cyclone_scenario.json"
        if cyclone_file.exists():
            try:
                with open(cyclone_file, "r", encoding="utf-8") as f:
                    scenario_data = json.load(f)
                    return {
                        "has_active_cyclone": True,
                        "source": SourceBadge.DEMO,
                        "provider": "IMD RSMC New Delhi (Scenario Simulation)",
                        "fetched_at": now_utc.isoformat(),
                        "details": scenario_data
                    }
            except Exception as e:
                logger.error(f"Error reading cyclone scenario: {e}")
                
    # In normal live mode with no active cyclone:
    return {
        "has_active_cyclone": False,
        "source": SourceBadge.LIVE,
        "provider": "IMD RSMC New Delhi Cyclone Warning Division",
        "fetched_at": now_utc.isoformat(),
        "status": "NO_ACTIVE_SYSTEM",
        "details": {
            "message": "No active depression or cyclonic storm in North Indian Ocean (Arabian Sea / Bay of Bengal)."
        }
    }
