import asyncio
import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from fastapi import FastAPI, Request, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse

from .config import settings
from .models import (
    ChatRequest, GeofenceCheckRequest, GeofenceCheckResponse,
    RouteRequest, RouteResult, SimulatorStartRequest, FeedbackRequest,
    SourceBadge
)
from .orchestrator import MultiAgentOrchestrator
from .tools.geo_layers import get_layer_geojson, get_fishing_bans
from .tools.registry import ADAPTER_REGISTRY
from .tools.imd_cyclone import fetch_cyclone_bulletin
from .analytics.geofence import check_geofence
from .analytics.routing import calculate_safe_route

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sagarmitra")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Conversational Agentic AI Marine Intelligence Platform"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = MultiAgentOrchestrator()

# In-memory simulator state
SIMULATOR_STATE = {
    "is_running": False,
    "track_id": "palk_bay_imbl",
    "speed_multiplier": 1.0,
    "current_waypoint_idx": 0,
    "current_lat": 9.2780,
    "current_lon": 79.1250,
    "heading": 85.0,
    "speed_knots": 8.0,
    "tier": "SAFE",
    "last_alert": None
}

@app.get("/")
async def root():
    return {
        "app": "SagarMitra",
        "tagline": "Agentic AI Marine Intelligence Platform",
        "status": "online",
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/api/health")
async def health():
    """
    Health check endpoint reporting adapter registry status, mode, and dataset latency.
    """
    return {
        "status": "healthy",
        "mode": "DEMO MODE (Zero-Key Active)" if not settings.GEMINI_API_KEY else "LIVE (Gemini Enabled)",
        "gemini_connected": bool(settings.GEMINI_API_KEY),
        "adapters": ADAPTER_REGISTRY,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/agents")
async def list_agents():
    """
    Lists all specialized agents and their operational specifications for the architecture page.
    """
    return {
        "agents": [
            {"name": "ConversationAgent", "role": "Language Identification, Natural Language Intent & Entity Slot Filling", "status": "active"},
            {"name": "PlannerAgent", "role": "Dynamic DAG Task Decomposition & Parallel Scheduling", "status": "active"},
            {"name": "DataDiscoveryAgent", "role": "Autonomous Tool Selection & Freshness Registry Evaluation", "status": "active"},
            {"name": "WeatherIntelligenceAgent", "role": "Atmospheric, Wind, CAPE Convective Lightning & Storm Analysis", "status": "active"},
            {"name": "OceanAnalyticsAgent", "role": "SST Front Gradient Math, Chlorophyll-a Scoring & Sea State Analysis", "status": "active"},
            {"name": "GeospatialReasoningAgent", "role": "Metric Coordinate Distance, IMBL / MPA Buffer Analysis & Geofencing", "status": "active"},
            {"name": "RiskAssessmentAgent", "role": "Multi-Factor Safety Matrix Fused Against Scaled Vessel Profiles", "status": "active"},
            {"name": "RouteAgent", "role": "A* Dynamic Ocean Cost Grid Passage Planning & Safe Corridor Generation", "status": "active"},
            {"name": "VisualizationAgent", "role": "MapLibre GL Geospatial Layer Synthesis & Recharts Forecast Specifications", "status": "active"},
            {"name": "CriticAgent", "role": "Physical Sanity Validation, Cloud-Gap Caveats & Confidence Downgrading", "status": "active"},
            {"name": "AlertAgent", "role": "Proactive Multi-Tiered Alert Generation in 10 Regional Languages", "status": "active"},
            {"name": "ReportingAgent", "role": "Explainable Grounded Fact Synthesis & Multilingual Regional Phrasing", "status": "active"},
        ]
    }

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Main conversational endpoint: returns an SSE stream of agent traces,
    map layers, charts, alerts, and the final structured grounded response.
    """
    return EventSourceResponse(orchestrator.execute_stream(request))

@app.get("/api/layers/{name}")
async def get_layer(name: str):
    """
    Returns GeoJSON data for ports, imbl, mpa, official pfz, or fishing bans.
    """
    if name == "fishing_bans":
        return get_fishing_bans()
    
    if name == "cyclone":
        c = await fetch_cyclone_bulletin(force_scenario=True)
        return c.get("details", {})
        
    geojson = get_layer_geojson(name)
    return JSONResponse(content=geojson)

@app.post("/api/geofence/check", response_model=GeofenceCheckResponse)
async def check_geofence_endpoint(req: GeofenceCheckRequest):
    res = check_geofence(req.lat, req.lon, req.heading)
    return GeofenceCheckResponse(
        tier=res["tier"],
        nearest_boundary_name=res["nearest_boundary_name"],
        distance_nm=res["distance_nm"],
        distance_km=res["distance_km"],
        turn_back_heading=res["turn_back_heading"],
        is_inside_restricted=res["is_inside_restricted"],
        details=res["details"],
        timestamp=datetime.now(timezone.utc).isoformat()
    )

@app.post("/api/route", response_model=RouteResult)
async def compute_route_endpoint(req: RouteRequest):
    # Lookup port coords or baseline
    ports_geojson = get_layer_geojson("ports")
    from_lat, from_lon = 13.1250, 80.2980
    for feat in ports_geojson.get("features", []):
        if req.from_port.lower() in feat.get("properties", {}).get("name", "").lower():
            coords = feat.get("geometry", {}).get("coordinates", [80.2980, 13.1250])
            from_lon, from_lat = coords[0], coords[1]
            break

    res = calculate_safe_route(
        from_lat=from_lat,
        from_lon=from_lon,
        to_lat=req.to_lat,
        to_lon=req.to_lon,
        vessel_profile=req.vessel_profile
    )
    return res

@app.post("/api/simulator/start")
async def start_simulator(req: SimulatorStartRequest):
    SIMULATOR_STATE["is_running"] = True
    SIMULATOR_STATE["track_id"] = req.track_id
    SIMULATOR_STATE["speed_multiplier"] = req.speed_multiplier
    SIMULATOR_STATE["current_waypoint_idx"] = 0
    return {"status": "started", "state": SIMULATOR_STATE}

@app.post("/api/simulator/stop")
async def stop_simulator():
    SIMULATOR_STATE["is_running"] = False
    return {"status": "stopped", "state": SIMULATOR_STATE}

@app.get("/api/simulator/state")
async def get_simulator_state():
    track_file = settings.DEMO_DIR / "vessel_tracks" / f"{SIMULATOR_STATE['track_id']}.json"
    if track_file.exists():
        with open(track_file, "r", encoding="utf-8") as f:
            track_data = json.load(f)
            waypoints = track_data.get("waypoints", [])
            if waypoints and SIMULATOR_STATE["is_running"]:
                # Advance waypoint
                idx = (SIMULATOR_STATE["current_waypoint_idx"] + 1) % len(waypoints)
                SIMULATOR_STATE["current_waypoint_idx"] = idx
                wp = waypoints[idx]
                SIMULATOR_STATE["current_lat"] = wp["lat"]
                SIMULATOR_STATE["current_lon"] = wp["lon"]
                SIMULATOR_STATE["heading"] = wp["heading"]
                SIMULATOR_STATE["speed_knots"] = wp["speed_knots"]

                # Run geofence check
                geo = check_geofence(wp["lat"], wp["lon"], wp["heading"])
                SIMULATOR_STATE["tier"] = geo["tier"].value
                SIMULATOR_STATE["last_alert"] = geo["details"]

    return SIMULATOR_STATE

@app.post("/api/feedback")
async def submit_feedback(fb: FeedbackRequest):
    return {"status": "success", "message": "Feedback recorded. Thank you for helping improve SagarMitra!"}
