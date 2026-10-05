from __future__ import annotations
from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class SourceBadge(str, Enum):
    LIVE = "LIVE"
    CACHED = "CACHED"
    DEMO = "DEMO"

class VesselProfile(str, Enum):
    NON_MOTORISED = "non_motorised"
    SMALL_MOTORISED = "small_motorised"
    MECHANISED = "mechanised"

class SafetyVerdictLevel(str, Enum):
    GO = "GO"
    CAUTION = "CAUTION"
    NO_GO = "NO_GO"

class AlertSeverity(str, Enum):
    INFO = "INFO"
    ADVISORY = "ADVISORY"
    ALERT = "ALERT"
    CRITICAL = "CRITICAL"

class GeofenceTier(str, Enum):
    SAFE = "SAFE"
    ADVISORY = "ADVISORY"
    ALERT = "ALERT"
    CRITICAL = "CRITICAL"

class FactorItem(BaseModel):
    factor: str
    value: str
    threshold: str
    status: SafetyVerdictLevel
    source: SourceBadge = SourceBadge.DEMO
    note: Optional[str] = None

class EvidenceCard(BaseModel):
    dataset_name: str
    provider: str
    variable: str
    timestamp_utc: str
    timestamp_ist: str
    spatial_res: str
    badge: SourceBadge
    details: Optional[str] = None

class Confidence(BaseModel):
    level: str  # "HIGH", "MEDIUM", "LOW"
    score: float
    caveats: List[str] = Field(default_factory=list)

class TraceStep(BaseModel):
    ts: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    agent: str
    action: str
    tool: Optional[str] = None
    inputs_summary: Optional[str] = None
    outcome: Optional[str] = None
    duration_ms: int = 0
    source_badge: SourceBadge = SourceBadge.DEMO

class MapLayerSpec(BaseModel):
    id: str
    name: str
    type: str  # "geojson", "raster", "heatmap", "symbol"
    data: Optional[Dict[str, Any]] = None
    url: Optional[str] = None
    visible: bool = True
    opacity: float = 0.8
    badge: SourceBadge = SourceBadge.DEMO
    legend: Optional[Dict[str, Any]] = None

class ChartSpec(BaseModel):
    id: str
    title: str
    chart_type: str  # "line", "bar", "area", "composed"
    data: List[Dict[str, Any]]
    x_key: str
    series: List[Dict[str, Any]]
    unit: Optional[str] = None
    badge: SourceBadge = SourceBadge.DEMO

class AlertItem(BaseModel):
    id: str
    severity: AlertSeverity
    title: str
    message: str
    lang: str = "en"
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    location: Optional[Dict[str, float]] = None  # {lat, lon}
    turn_back_heading: Optional[float] = None
    distance_km: Optional[float] = None
    acknowledged: bool = False
    source: SourceBadge = SourceBadge.DEMO

class RouteLeg(BaseModel):
    from_coord: List[float]  # [lon, lat]
    to_coord: List[float]    # [lon, lat]
    distance_km: float
    eta_ist: str
    wave_exposure_m: float
    wind_exposure_kmh: float
    risk_level: SafetyVerdictLevel

class RouteResult(BaseModel):
    direct_route: Dict[str, Any]  # GeoJSON LineString
    safest_route: Dict[str, Any]  # GeoJSON LineString
    direct_distance_km: float
    safest_distance_km: float
    direct_duration_hours: float
    safest_duration_hours: float
    direct_max_wave_m: float
    safest_max_wave_m: float
    legs: List[RouteLeg] = Field(default_factory=list)
    recommendation: str

class LocationEntity(BaseModel):
    name: str = "Unknown Location"
    lat: float = 13.0827  # Default Chennai/Kasimedu
    lon: float = 80.2707
    region: Optional[str] = "Tamil Nadu Coast"

class EntityExtraction(BaseModel):
    location: Optional[LocationEntity] = None
    time_window: str = "today"
    target_date: Optional[str] = None
    vessel_profile: VesselProfile = VesselProfile.SMALL_MOTORISED
    species: Optional[str] = None
    hazard: Optional[str] = None

class Verdict(BaseModel):
    level: SafetyVerdictLevel
    headline: str
    safe_window_start: Optional[str] = None
    safe_window_end: Optional[str] = None
    latest_safe_return: Optional[str] = None

class AgentState(BaseModel):
    session_id: str
    user_text: str
    lang: str = "en"
    intent: str = "safety_check"
    entities: EntityExtraction = Field(default_factory=EntityExtraction)
    plan: List[Dict[str, Any]] = Field(default_factory=list)
    tool_results: Dict[str, Any] = Field(default_factory=dict)
    analysis: Dict[str, Any] = Field(default_factory=dict)
    risks: List[Dict[str, Any]] = Field(default_factory=list)
    geofence_hits: List[Dict[str, Any]] = Field(default_factory=list)
    route: Optional[RouteResult] = None
    verdict: Optional[Verdict] = None
    confidence: Confidence = Field(default_factory=lambda: Confidence(level="HIGH", score=0.95))
    evidence: List[EvidenceCard] = Field(default_factory=list)
    factor_table: List[FactorItem] = Field(default_factory=list)
    reasoning_steps: List[str] = Field(default_factory=list)
    answer_text: str = ""
    map_layers: List[MapLayerSpec] = Field(default_factory=list)
    charts: List[ChartSpec] = Field(default_factory=list)
    alerts: List[AlertItem] = Field(default_factory=list)
    trace: List[TraceStep] = Field(default_factory=list)
    follow_up_suggestions: List[str] = Field(default_factory=list)
    disclaimer: str = "Decision support only. Indicative boundaries — not for legal navigation. Follow official IMD/INCOIS/State Fisheries advisories."

class ChatRequest(BaseModel):
    session_id: Optional[str] = "session_default"
    text: str
    lang_hint: Optional[str] = None
    location: Optional[Dict[str, float]] = None  # {lat, lon}
    location_name: Optional[str] = None
    vessel_profile: Optional[VesselProfile] = VesselProfile.SMALL_MOTORISED
    scenario_mode: Optional[bool] = False

class ChatResponse(BaseModel):
    session_id: str
    lang: str
    verdict: Optional[Verdict] = None
    answer_text: str
    reasoning_steps: List[str] = Field(default_factory=list)
    factor_table: List[FactorItem] = Field(default_factory=list)
    evidence: List[EvidenceCard] = Field(default_factory=list)
    confidence: Confidence
    map_layers: List[MapLayerSpec] = Field(default_factory=list)
    charts: List[ChartSpec] = Field(default_factory=list)
    alerts: List[AlertItem] = Field(default_factory=list)
    route: Optional[RouteResult] = None
    follow_up_suggestions: List[str] = Field(default_factory=list)
    trace: List[TraceStep] = Field(default_factory=list)
    disclaimer: str

class GeofenceCheckRequest(BaseModel):
    lat: float
    lon: float
    heading: Optional[float] = None
    speed_knots: Optional[float] = None

class GeofenceCheckResponse(BaseModel):
    tier: GeofenceTier
    nearest_boundary_name: str
    distance_nm: float
    distance_km: float
    turn_back_heading: float
    is_inside_restricted: bool
    details: str
    timestamp: str

class RouteRequest(BaseModel):
    from_port: str
    to_lat: float
    to_lon: float
    vessel_profile: VesselProfile = VesselProfile.SMALL_MOTORISED
    depart_time: Optional[str] = "now"

class SimulatorStartRequest(BaseModel):
    track_id: str  # "palk_bay_imbl", "cyclone_escape", "mpa_approach"
    speed_multiplier: float = 1.0

class FeedbackRequest(BaseModel):
    message_id: str
    helpful: bool
    comment: Optional[str] = None
