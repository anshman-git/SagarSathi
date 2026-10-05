from typing import Dict, Any
from ..models import AgentState
from ..analytics.safety import evaluate_safety

class RiskAssessmentAgent:
    """
    Fuses weather, marine, swell, lightning, and cyclone parameters against vessel profiles
    to produce explainable Go/Caution/No-Go verdicts with supporting factor tables.
    """
    async def run(self, state: AgentState) -> Dict[str, Any]:
        marine = state.tool_results.get("marine", {})
        forecast = state.tool_results.get("forecast", {})
        cyclone = state.tool_results.get("cyclone", {})
        vessel = state.entities.vessel_profile

        verdict, factor_table, reasons = evaluate_safety(
            marine_data=marine,
            forecast_data=forecast,
            cyclone_data=cyclone,
            vessel_profile=vessel,
            time_window=state.entities.time_window
        )

        return {
            "verdict": verdict,
            "factor_table": factor_table,
            "reasoning_steps": reasons
        }
