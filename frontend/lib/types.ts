export type SourceBadge = 'LIVE' | 'CACHED' | 'DEMO';
export type VesselProfile = 'non_motorised' | 'small_motorised' | 'mechanised';
export type SafetyVerdictLevel = 'GO' | 'CAUTION' | 'NO_GO';
export type AlertSeverity = 'INFO' | 'ADVISORY' | 'ALERT' | 'CRITICAL';
export type GeofenceTier = 'SAFE' | 'ADVISORY' | 'ALERT' | 'CRITICAL';

export interface FactorItem {
  factor: string;
  value: string;
  threshold: string;
  status: SafetyVerdictLevel;
  source: SourceBadge;
  note?: string;
}

export interface EvidenceCard {
  dataset_name: string;
  provider: string;
  variable: string;
  timestamp_utc: string;
  timestamp_ist: string;
  spatial_res: string;
  badge: SourceBadge;
  details?: string;
}

export interface Confidence {
  level: string;
  score: number;
  caveats: string[];
}

export interface TraceStep {
  ts: string;
  agent: string;
  action: string;
  tool?: string;
  inputs_summary?: string;
  outcome?: string;
  duration_ms: number;
  source_badge: SourceBadge;
}

export interface MapLayerSpec {
  id: string;
  name: string;
  type: string;
  data?: any;
  url?: string;
  visible: boolean;
  opacity: number;
  badge: SourceBadge;
  legend?: any;
}

export interface ChartSpec {
  id: string;
  title: string;
  chart_type: string;
  data: any[];
  x_key: string;
  series: { key: string; name: string; color: string; type?: string }[];
  unit?: string;
  badge: SourceBadge;
}

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  lang: string;
  timestamp: string;
  location?: { lat: number; lon: number };
  turn_back_heading?: number;
  distance_km?: number;
  acknowledged?: boolean;
  source: SourceBadge;
}

export interface RouteLeg {
  from_coord: [number, number];
  to_coord: [number, number];
  distance_km: number;
  eta_ist: string;
  wave_exposure_m: number;
  wind_exposure_kmh: number;
  risk_level: SafetyVerdictLevel;
}

export interface RouteResult {
  direct_route: any;
  safest_route: any;
  direct_distance_km: number;
  safest_distance_km: number;
  direct_duration_hours: number;
  safest_duration_hours: number;
  direct_max_wave_m: number;
  safest_max_wave_m: number;
  legs: RouteLeg[];
  recommendation: string;
}

export interface Verdict {
  level: SafetyVerdictLevel;
  headline: string;
  safe_window_start?: string;
  safe_window_end?: string;
  latest_safe_return?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  lang?: string;
  timestamp: string;
  verdict?: Verdict;
  reasoning_steps?: string[];
  factor_table?: FactorItem[];
  evidence?: EvidenceCard[];
  confidence?: Confidence;
  map_layers?: MapLayerSpec[];
  charts?: ChartSpec[];
  alerts?: AlertItem[];
  route?: RouteResult;
  follow_up_suggestions?: string[];
  trace?: TraceStep[];
  disclaimer?: string;
}
