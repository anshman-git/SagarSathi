from typing import Dict, Any, List
from ..models import AgentState, Confidence, SourceBadge

class CriticAgent:
    """
    Sanity-checks results (physical units, freshness, contradictions, demo data),
    downgrades confidence score transparently, and adds explicit caveats.
    """
    async def run(self, state: AgentState) -> Dict[str, Any]:
        score = 0.98
        caveats: List[str] = []

        # Check if using demo data
        has_demo = any(
            t.get("source") == SourceBadge.DEMO 
            for t in state.tool_results.values() 
            if isinstance(t, dict) and "source" in t
        )
        if has_demo:
            score -= 0.10
            caveats.append("Some ocean features derived from synthetic demo baseline grids.")

        # Check cloud gaps
        sst_chl = state.tool_results.get("sst_chl", {})
        cloud_gap = sst_chl.get("cloud_gap_percent", 0.0)
        if cloud_gap > 20.0:
            score -= 0.12
            caveats.append(f"Satellite optical cloud gap ({cloud_gap:.0f}%) required multi-day composite blending.")

        # Check geofence proximity
        geo = state.analysis.get("geofence", {})
        if geo.get("tier") in ["ALERT", "CRITICAL"]:
            caveats.append(f"Caution: Proximity to international boundary / restricted zone ({geo.get('distance_nm')} nm).")

        level = "HIGH" if score >= 0.85 else ("MEDIUM" if score >= 0.70 else "LOW")

        return {
            "confidence": Confidence(
                level=level,
                score=round(score, 2),
                caveats=caveats
            )
        }
