import { create } from 'zustand';
import {
  ChatMessage, MapLayerSpec, ChartSpec, AlertItem,
  VesselProfile, TraceStep, RouteResult, Verdict, Confidence, FactorItem, EvidenceCard
} from './types';

interface AppState {
  // Chat & Stream State
  messages: ChatMessage[];
  currentTrace: TraceStep[];
  isStreaming: boolean;
  selectedLanguage: string;
  vesselProfile: VesselProfile;
  selectedLocation: { name: string; lat: number; lon: number };
  scenarioMode: boolean;

  // Active Map & Visuals
  activeLayers: Record<string, boolean>;
  timeSliderHour: number;
  focusedRoute: RouteResult | null;
  activeAlerts: AlertItem[];
  latestVerdict: Verdict | null;
  latestConfidence: Confidence | null;
  latestFactors: FactorItem[];
  latestEvidence: EvidenceCard[];
  latestCharts: ChartSpec[];

  // Actions
  addMessage: (msg: ChatMessage) => void;
  updateLastMessage: (patch: Partial<ChatMessage>) => void;
  addTraceStep: (step: TraceStep) => void;
  clearTrace: () => void;
  setIsStreaming: (val: boolean) => void;
  setLanguage: (lang: string) => void;
  setVesselProfile: (profile: VesselProfile) => void;
  setSelectedLocation: (loc: { name: string; lat: number; lon: number }) => void;
  setScenarioMode: (val: boolean) => void;
  toggleLayer: (layerId: string) => void;
  setTimeSliderHour: (hour: number) => void;
  setFocusedRoute: (route: RouteResult | null) => void;
  addAlert: (alert: AlertItem) => void;
  dismissAlert: (id: string) => void;
  setLatestInsights: (data: {
    verdict?: Verdict;
    confidence?: Confidence;
    factors?: FactorItem[];
    evidence?: EvidenceCard[];
    charts?: ChartSpec[];
  }) => void;
}

export const useAppStore = create<AppState>((set) => ({
  messages: [
    {
      id: 'welcome-msg',
      sender: 'agent',
      text: 'Namaste! I am SagarMitra, your agentic ocean safety and fishing intelligence assistant. Ask me anything in your language: where to fish today, if the sea is safe tomorrow morning, or view cyclone alerts and safe routes.',
      lang: 'en',
      timestamp: new Date().toISOString(),
      follow_up_suggestions: [
        'Where is the nearest PFZ today?',
        'कल सुबह समुद्र में जाना सुरक्षित है?',
        'மண்டபம் அருகே கடல் நிலை எப்படி?',
        'Why has productivity declined near Gulf of Mannar?'
      ]
    }
  ],
  currentTrace: [],
  isStreaming: false,
  selectedLanguage: 'en',
  vesselProfile: 'small_motorised',
  selectedLocation: { name: 'Kasimedu Fishing Harbour, Chennai', lat: 13.1250, lon: 80.2980 },
  scenarioMode: false,

  activeLayers: {
    ports_layer: true,
    imbl_layer: true,
    mpa_layer: true,
    pfz_official_layer: true,
    pfz_derived_layer: true,
    route_safest_layer: true,
    waves_overlay: true,
    wind_overlay: false,
  },
  timeSliderHour: 0,
  focusedRoute: null,
  activeAlerts: [],
  latestVerdict: null,
  latestConfidence: null,
  latestFactors: [],
  latestEvidence: [],
  latestCharts: [],

  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  updateLastMessage: (patch) =>
    set((s) => {
      const msgs = [...s.messages];
      if (msgs.length > 0) {
        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], ...patch };
      }
      return { messages: msgs };
    }),
  addTraceStep: (step) => set((s) => ({ currentTrace: [...s.currentTrace, step] })),
  clearTrace: () => set({ currentTrace: [] }),
  setIsStreaming: (val) => set({ isStreaming: val }),
  setLanguage: (lang) => set({ selectedLanguage: lang }),
  setVesselProfile: (profile) => set({ vesselProfile: profile }),
  setSelectedLocation: (loc) => set({ selectedLocation: loc }),
  setScenarioMode: (val) => set({ scenarioMode: val }),
  toggleLayer: (layerId) =>
    set((s) => ({
      activeLayers: { ...s.activeLayers, [layerId]: !s.activeLayers[layerId] }
    })),
  setTimeSliderHour: (hour) => set({ timeSliderHour: hour }),
  setFocusedRoute: (route) => set({ focusedRoute: route }),
  addAlert: (alert) => set((s) => ({ activeAlerts: [alert, ...s.activeAlerts] })),
  dismissAlert: (id) =>
    set((s) => ({ activeAlerts: s.activeAlerts.filter((a) => a.id !== id) })),
  setLatestInsights: (data) =>
    set((s) => ({
      latestVerdict: data.verdict ?? s.latestVerdict,
      latestConfidence: data.confidence ?? s.latestConfidence,
      latestFactors: data.factors ?? s.latestFactors,
      latestEvidence: data.evidence ?? s.latestEvidence,
      latestCharts: data.charts ?? s.latestCharts
    }))
}));
