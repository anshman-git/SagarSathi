from typing import Dict, Any, List
from ..models import AgentState

class PlannerAgent:
    """
    Decomposes the user intent into a task execution DAG.
    Specifies which specialist agents to trigger and dependencies between them.
    """
    async def run(self, state: AgentState) -> Dict[str, Any]:
        intent = state.intent
        plan: List[Dict[str, Any]] = []

        if intent == "find_pfz":
            plan = [
                {"id": "t1", "agent": "DataDiscoveryAgent", "tool": "registry_lookup", "depends_on": []},
                {"id": "t2", "agent": "OceanAnalyticsAgent", "tool": "fetch_sst_chl_and_score", "depends_on": ["t1"]},
                {"id": "t3", "agent": "WeatherIntelligenceAgent", "tool": "fetch_marine_forecast", "depends_on": ["t1"]},
                {"id": "t4", "agent": "GeospatialReasoningAgent", "tool": "check_boundaries_and_distances", "depends_on": ["t2"]},
                {"id": "t5", "agent": "RiskAssessmentAgent", "tool": "evaluate_safety_matrix", "depends_on": ["t2", "t3"]},
                {"id": "t6", "agent": "RouteAgent", "tool": "calculate_safe_route", "depends_on": ["t4", "t5"]},
                {"id": "t7", "agent": "VisualizationAgent", "tool": "build_map_and_charts", "depends_on": ["t2", "t3", "t6"]},
                {"id": "t8", "agent": "CriticAgent", "tool": "verify_data_and_units", "depends_on": ["t5", "t7"]},
                {"id": "t9", "agent": "ReportingAgent", "tool": "compose_evidence_and_answer", "depends_on": ["t8"]}
            ]
        elif intent == "productivity_decline_why":
            plan = [
                {"id": "t1", "agent": "DataDiscoveryAgent", "tool": "registry_lookup", "depends_on": []},
                {"id": "t2", "agent": "OceanAnalyticsAgent", "tool": "analyze_anomaly_time_series", "depends_on": ["t1"]},
                {"id": "t3", "agent": "CriticAgent", "tool": "verify_scientific_bounds", "depends_on": ["t2"]},
                {"id": "t4", "agent": "ReportingAgent", "tool": "compose_anomaly_report", "depends_on": ["t3"]}
            ]
        elif intent == "hazard_alerts":
            plan = [
                {"id": "t1", "agent": "DataDiscoveryAgent", "tool": "registry_lookup", "depends_on": []},
                {"id": "t2", "agent": "WeatherIntelligenceAgent", "tool": "check_cyclone_and_gales", "depends_on": ["t1"]},
                {"id": "t3", "agent": "RiskAssessmentAgent", "tool": "evaluate_cyclone_threat", "depends_on": ["t2"]},
                {"id": "t4", "agent": "AlertAgent", "tool": "generate_emergency_alerts", "depends_on": ["t3"]},
                {"id": "t5", "agent": "ReportingAgent", "tool": "compose_hazard_advisory", "depends_on": ["t4"]}
            ]
        else:  # Default safety check / sea conditions
            plan = [
                {"id": "t1", "agent": "DataDiscoveryAgent", "tool": "registry_lookup", "depends_on": []},
                {"id": "t2", "agent": "WeatherIntelligenceAgent", "tool": "fetch_marine_forecast", "depends_on": ["t1"]},
                {"id": "t3", "agent": "OceanAnalyticsAgent", "tool": "fetch_sea_state", "depends_on": ["t1"]},
                {"id": "t4", "agent": "GeospatialReasoningAgent", "tool": "check_geofence_status", "depends_on": ["t1"]},
                {"id": "t5", "agent": "RiskAssessmentAgent", "tool": "evaluate_safety_matrix", "depends_on": ["t2", "t3", "t4"]},
                {"id": "t6", "agent": "VisualizationAgent", "tool": "build_map_and_charts", "depends_on": ["t2", "t3"]},
                {"id": "t7", "agent": "CriticAgent", "tool": "verify_data_integrity", "depends_on": ["t5"]},
                {"id": "t8", "agent": "ReportingAgent", "tool": "compose_safety_advisory", "depends_on": ["t7"]}
            ]

        return {"plan": plan}
