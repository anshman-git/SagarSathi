import asyncio
import time
import json
import logging
from typing import AsyncGenerator, Dict, Any, List
from datetime import datetime, timezone

from sse_starlette.sse import ServerSentEvent
from .models import (
    AgentState, TraceStep, SourceBadge, ChatRequest,
    ChatResponse, EntityExtraction, LocationEntity, VesselProfile
)
from .agents.conversation_agent import ConversationAgent
from .agents.planner_agent import PlannerAgent
from .agents.data_discovery_agent import DataDiscoveryAgent
from .agents.weather_agent import WeatherIntelligenceAgent
from .agents.ocean_agent import OceanAnalyticsAgent
from .agents.geospatial_agent import GeospatialReasoningAgent
from .agents.risk_agent import RiskAssessmentAgent
from .agents.route_agent import RouteAgent
from .agents.visualization_agent import VisualizationAgent
from .agents.critic_agent import CriticAgent
from .agents.alert_agent import AlertAgent
from .agents.reporting_agent import ReportingAgent
from .llm.gemini_client import GeminiAgentEngine

logger = logging.getLogger(__name__)

class MultiAgentOrchestrator:
    def __init__(self):
        self.conversation_agent = ConversationAgent()
        self.planner_agent = PlannerAgent()
        self.data_discovery_agent = DataDiscoveryAgent()
        self.weather_agent = WeatherIntelligenceAgent()
        self.ocean_agent = OceanAnalyticsAgent()
        self.geospatial_agent = GeospatialReasoningAgent()
        self.risk_agent = RiskAssessmentAgent()
        self.route_agent = RouteAgent()
        self.visualization_agent = VisualizationAgent()
        self.critic_agent = CriticAgent()
        self.alert_agent = AlertAgent()
        self.reporting_agent = ReportingAgent()
        self.gemini_engine = GeminiAgentEngine()

        self.agent_map = {
            "ConversationAgent": self.conversation_agent,
            "PlannerAgent": self.planner_agent,
            "DataDiscoveryAgent": self.data_discovery_agent,
            "WeatherIntelligenceAgent": self.weather_agent,
            "OceanAnalyticsAgent": self.ocean_agent,
            "GeospatialReasoningAgent": self.geospatial_agent,
            "RiskAssessmentAgent": self.risk_agent,
            "RouteAgent": self.route_agent,
            "VisualizationAgent": self.visualization_agent,
            "CriticAgent": self.critic_agent,
            "AlertAgent": self.alert_agent,
            "ReportingAgent": self.reporting_agent,
        }

    async def execute_stream(self, request: ChatRequest) -> AsyncGenerator[str, None]:
        """
        Executes the multi-agent workflow and yields SSE formatted event strings:
        event: trace | map | chart | alert | evidence | final
        """
        start_time = time.time()
        
        # Initial state setup
        initial_loc = LocationEntity(name="Kasimedu Harbour, Chennai", lat=13.1250, lon=80.2980)
        if request.location:
            initial_loc = LocationEntity(
                name=request.location_name or "Selected Map Pin",
                lat=request.location.get("lat", 13.1250),
                lon=request.location.get("lon", 80.2980)
            )

        state = AgentState(
            session_id=request.session_id or "default_session",
            user_text=request.text,
            lang=request.lang_hint or "en",
            entities=EntityExtraction(
                location=initial_loc,
                vessel_profile=request.vessel_profile or VesselProfile.SMALL_MOTORISED
            )
        )

        # 1. Step 1: Conversation Agent (Language & Intent)
        t0 = time.time()
        conv_res = await self.conversation_agent.run(state)
        state.lang = conv_res.get("lang", state.lang)
        state.intent = conv_res.get("intent", state.intent)
        state.entities = conv_res.get("entities", state.entities)
        
        step_trace = TraceStep(
            agent="ConversationAgent",
            action="Parsed user intent & detected language",
            inputs_summary=f"Query: '{state.user_text}'",
            outcome=f"Lang: {state.lang.upper()} | Intent: {state.intent} | Location: {state.entities.location.name}",
            duration_ms=int((time.time() - t0) * 1000),
            source_badge=SourceBadge.LIVE
        )
        state.trace.append(step_trace)
        yield ServerSentEvent(event="trace", data=step_trace.model_dump_json())

        # 2. Step 2: Planner Agent
        t0 = time.time()
        plan_res = await self.planner_agent.run(state)
        state.plan = plan_res.get("plan", [])
        
        step_trace = TraceStep(
            agent="PlannerAgent",
            action="Generated task DAG",
            inputs_summary=f"Intent: {state.intent}",
            outcome=f"Compiled execution DAG with {len(state.plan)} tasks",
            duration_ms=int((time.time() - t0) * 1000),
            source_badge=SourceBadge.LIVE
        )
        state.trace.append(step_trace)
        yield ServerSentEvent(event="trace", data=step_trace.model_dump_json())

        # 3. Parallel Execution: Data Discovery, Weather, Ocean, Geospatial
        # Execute Data Discovery
        t0 = time.time()
        disc_res = await self.data_discovery_agent.run(state)
        state.analysis.update(disc_res.get("analysis", {}))
        step_trace = TraceStep(
            agent="DataDiscoveryAgent",
            action="Selected adapters from registry",
            inputs_summary="Variables: Waves, Wind, SST, Chl-a, Boundaries",
            outcome="Selected Open-Meteo, ERDDAP grids, IMBL & INCOIS adapters",
            duration_ms=int((time.time() - t0) * 1000),
            source_badge=SourceBadge.LIVE
        )
        state.trace.append(step_trace)
        yield ServerSentEvent(event="trace", data=step_trace.model_dump_json())

        # Execute Parallel Analytics: Weather + Ocean + Geospatial
        t0 = time.time()
        weather_task = self.weather_agent.run(state)
        ocean_task = self.ocean_agent.run(state)
        geo_task = self.geospatial_agent.run(state)

        w_res, o_res, g_res = await asyncio.gather(weather_task, ocean_task, geo_task)
        state.tool_results.update(w_res.get("tool_results", {}))
        state.tool_results.update(o_res.get("tool_results", {}))
        state.geofence_hits = g_res.get("geofence_hits", [])
        state.analysis.update(g_res.get("analysis", {}))

        # Yield parallel step traces
        marine_source = state.tool_results.get("marine", {}).get("source", SourceBadge.LIVE)
        step_trace = TraceStep(
            agent="WeatherIntelligenceAgent",
            action="Atmospheric & storm forecasting",
            inputs_summary=f"Lat: {state.entities.location.lat:.2f}, Lon: {state.entities.location.lon:.2f}",
            outcome=f"Wind: {state.tool_results.get('forecast', {}).get('current_wind_speed_kmh', 16)} km/h | CAPE: {state.tool_results.get('forecast', {}).get('current_cape', 250):.0f} J/kg",
            duration_ms=int((time.time() - t0) * 1000),
            source_badge=state.tool_results.get("forecast", {}).get("source", SourceBadge.LIVE)
        )
        state.trace.append(step_trace)
        yield ServerSentEvent(event="trace", data=step_trace.model_dump_json())

        step_trace = TraceStep(
            agent="OceanAnalyticsAgent",
            action="Extracted sea state & computed PFZ fronts",
            inputs_summary=f"SST & Chlorophyll satellite layers",
            outcome=f"Wave Hs: {state.tool_results.get('marine', {}).get('current_wave_height', 1.2)}m | PFZ Candidates: {len(state.tool_results.get('pfz_candidates', {}).get('candidates', []))}",
            duration_ms=int((time.time() - t0) * 1000),
            source_badge=marine_source
        )
        state.trace.append(step_trace)
        yield ServerSentEvent(event="trace", data=step_trace.model_dump_json())

        geo_hit = state.geofence_hits[0] if state.geofence_hits else {}
        step_trace = TraceStep(
            agent="GeospatialReasoningAgent",
            action="Computed boundary proximity & EEZ buffers",
            inputs_summary=f"Coord: [{state.entities.location.lon:.2f}, {state.entities.location.lat:.2f}]",
            outcome=f"Nearest: {geo_hit.get('nearest_boundary_name', 'IMBL')} ({geo_hit.get('distance_nm', 10)} nm) | Tier: {geo_hit.get('tier', 'SAFE')}",
            duration_ms=int((time.time() - t0) * 1000),
            source_badge=SourceBadge.DEMO
        )
        state.trace.append(step_trace)
        yield ServerSentEvent(event="trace", data=step_trace.model_dump_json())

        # 4. Risk Assessment Agent
        t0 = time.time()
        risk_res = await self.risk_agent.run(state)
        state.verdict = risk_res.get("verdict")
        state.factor_table = risk_res.get("factor_table", [])
        state.reasoning_steps = risk_res.get("reasoning_steps", [])

        step_trace = TraceStep(
            agent="RiskAssessmentAgent",
            action="Fused multi-hazard matrix",
            inputs_summary=f"Vessel: {state.entities.vessel_profile.value}",
            outcome=f"Verdict: {state.verdict.level.value} — {state.verdict.headline}",
            duration_ms=int((time.time() - t0) * 1000),
            source_badge=SourceBadge.LIVE
        )
        state.trace.append(step_trace)
        yield ServerSentEvent(event="trace", data=step_trace.model_dump_json())

        # 5. Route Agent
        t0 = time.time()
        route_res = await self.route_agent.run(state)
        state.route = route_res.get("route")
        
        step_trace = TraceStep(
            agent="RouteAgent",
            action="Computed A* safe passage corridor",
            inputs_summary=f"Origin: {state.entities.location.name}",
            outcome=f"Safest Route: {state.route.safest_distance_km} km ({state.route.safest_duration_hours}h)",
            duration_ms=int((time.time() - t0) * 1000),
            source_badge=SourceBadge.DEMO
        )
        state.trace.append(step_trace)
        yield ServerSentEvent(event="trace", data=step_trace.model_dump_json())

        # 6. Visualization Agent
        t0 = time.time()
        vis_res = await self.visualization_agent.run(state)
        state.map_layers = vis_res.get("map_layers", [])
        state.charts = vis_res.get("charts", [])
        
        step_trace = TraceStep(
            agent="VisualizationAgent",
            action="Generated MapLibre GL layers & forecast charts",
            inputs_summary="Map layers & Recharts time series",
            outcome=f"Built {len(state.map_layers)} map layers and {len(state.charts)} chart views",
            duration_ms=int((time.time() - t0) * 1000),
            source_badge=SourceBadge.LIVE
        )
        state.trace.append(step_trace)
        yield ServerSentEvent(event="trace", data=step_trace.model_dump_json())

        # 7. Alert Agent
        alert_res = await self.alert_agent.run(state)
        state.alerts = alert_res.get("alerts", [])
        for alert_item in state.alerts:
            yield ServerSentEvent(event="alert", data=alert_item.model_dump_json())

        # 8. Critic Agent
        t0 = time.time()
        critic_res = await self.critic_agent.run(state)
        state.confidence = critic_res.get("confidence", state.confidence)

        step_trace = TraceStep(
            agent="CriticAgent",
            action="Verified data units and integrity",
            inputs_summary="Checked physical thresholds and freshness",
            outcome=f"Confidence: {state.confidence.level} ({state.confidence.score*100:.0f}%) | Caveats: {len(state.confidence.caveats)}",
            duration_ms=int((time.time() - t0) * 1000),
            source_badge=SourceBadge.LIVE
        )
        state.trace.append(step_trace)
        yield ServerSentEvent(event="trace", data=step_trace.model_dump_json())

        # 9. Reporting Agent & Gemini LLM Enhancement (Optional)
        t0 = time.time()
        rep_res = await self.reporting_agent.run(state)
        state.evidence = rep_res.get("evidence", [])
        state.answer_text = rep_res.get("answer_text", "")
        state.follow_up_suggestions = rep_res.get("follow_up_suggestions", [])

        # Try Gemini LLM for enhanced natural fluency if key is configured
        llm_enhanced = await self.gemini_engine.enhance_answer(state)
        if llm_enhanced:
            state.answer_text = llm_enhanced

        step_trace = TraceStep(
            agent="ReportingAgent",
            action="Composed explainable advisory & evidence cards",
            inputs_summary=f"Language: {state.lang.upper()}",
            outcome=f"Generated {len(state.evidence)} evidence cards and localized advisory text",
            duration_ms=int((time.time() - t0) * 1000),
            source_badge=SourceBadge.LIVE
        )
        state.trace.append(step_trace)
        yield ServerSentEvent(event="trace", data=step_trace.model_dump_json())

        # 10. Final Response Event
        final_response = ChatResponse(
            session_id=state.session_id,
            lang=state.lang,
            verdict=state.verdict,
            answer_text=state.answer_text,
            reasoning_steps=state.reasoning_steps,
            factor_table=state.factor_table,
            evidence=state.evidence,
            confidence=state.confidence,
            map_layers=state.map_layers,
            charts=state.charts,
            alerts=state.alerts,
            route=state.route,
            follow_up_suggestions=state.follow_up_suggestions,
            trace=state.trace,
            disclaimer=state.disclaimer
        )

        yield ServerSentEvent(event="final", data=final_response.model_dump_json())
