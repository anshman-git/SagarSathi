'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, Database, Activity, Award } from 'lucide-react';

const STATIC_AGENTS = [
  { name: 'ConversationAgent', role: 'Parses user intent, detects language (10 Indian languages), routes to planner.', status: 'ACTIVE' },
  { name: 'PlannerAgent', role: 'Decomposes query into a DAG of sub-tasks; selects tools and specialist agents.', status: 'ACTIVE' },
  { name: 'DataDiscoveryAgent', role: 'Discovers and prioritises relevant satellite, marine, and meteorological datasets.', status: 'ACTIVE' },
  { name: 'WeatherAgent', role: 'Fetches Open-Meteo Marine & Forecast APIs; wind, waves, swell, precipitation.', status: 'ACTIVE' },
  { name: 'OceanAgent', role: 'Retrieves SST, Chl-a grids, PFZ polygons from INCOIS and ERDDAP DEMO layers.', status: 'ACTIVE' },
  { name: 'GeospatialAgent', role: 'IMBL / MPA geofencing, Haversine proximity, GIS layer loading.', status: 'ACTIVE' },
  { name: 'RiskAgent', role: 'Produces Go/Caution/No-Go safety verdict and factor table with threshold checks.', status: 'ACTIVE' },
  { name: 'RouteAgent', role: 'Optimal routing avoiding hazard polygons using Dijkstra on a marine graph.', status: 'ACTIVE' },
  { name: 'AlertAgent', role: 'Proactive cyclone, lightning, and boundary tier alerts; broadcasts via WhatsApp hook.', status: 'ACTIVE' },
  { name: 'VisualizationAgent', role: 'Builds Recharts-compatible datasets for SST, Chl-a, wave height time-series.', status: 'ACTIVE' },
  { name: 'CriticAgent', role: 'Validates agent outputs for data honesty; flags LIVE/CACHED/DEMO badges.', status: 'ACTIVE' },
  { name: 'ReportingAgent', role: 'Synthesises multi-agent results into final multilingual narrative response.', status: 'ACTIVE' },
];

const STATIC_ADAPTERS = [
  { name: 'Open-Meteo Marine', provides: ['wave_height', 'swell', 'wind', 'surge'], latency_ms: '~300', ttl_sec: 3600, fallback: 'DEMO grid' },
  { name: 'Open-Meteo Forecast', provides: ['temp', 'precip', 'vis', 'lightning_pot'], latency_ms: '~350', ttl_sec: 3600, fallback: 'DEMO grid' },
  { name: 'INCOIS PFZ (Demo)', provides: ['pfz_zones', 'Chl-a', 'SST'], latency_ms: '~0', ttl_sec: 86400, fallback: 'Bundled GeoJSON' },
  { name: 'INCOIS OSF (Demo)', provides: ['ocean_state', 'current'], latency_ms: '~0', ttl_sec: 86400, fallback: 'Bundled GeoJSON' },
  { name: 'IMD Cyclone (Demo)', provides: ['cyclone_track', 'wind_radius'], latency_ms: '~0', ttl_sec: 3600, fallback: 'Bundled GeoJSON' },
  { name: 'GeoLayers', provides: ['IMBL', 'MPA', 'ports', 'EEZ'], latency_ms: '~0', ttl_sec: 'static', fallback: 'Bundled GeoJSON' },
  { name: 'Geocoder', provides: ['lat/lon', 'place_name', 'region'], latency_ms: '~0', ttl_sec: 'static', fallback: 'Gazetteer CSV' },
];

export default function AboutPage() {
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setHealthData(d))
      .catch((e) => console.error(e));
  }, []);

  const adapters = healthData?.adapters?.length ? healthData.adapters : STATIC_ADAPTERS;

  return (
    <div className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white flex items-center justify-center gap-2">
          <Cpu className="w-7 h-7 text-ocean-400" />
          <span>Multi-Agent Architecture &amp; System Health</span>
        </h1>
        <p className="text-xs text-slate-400">
          Transparent inspection of the cooperative AI agent network, satellite adapter latency, and data provenance.
        </p>
      </div>

      {/* System Status Card */}
      <div className="glass-panel p-4 rounded-2xl border border-ocean-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Orchestrator Mode</div>
            <div className="text-sm font-bold text-white">
              {healthData?.mode || 'DEMO — Rule-Based Planner Active'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div>
            <div className="text-slate-400">Gemini LLM</div>
            <div className="font-semibold text-ocean-300">
              {healthData?.gemini_connected ? 'Connected (Google GenAI)' : 'Offline — Rule-Based Fallback Active'}
            </div>
          </div>
          <div>
            <div className="text-slate-400">Data Integrity</div>
            <div className="font-semibold text-emerald-400">Strict Grounding Enforced</div>
          </div>
          <div>
            <div className="text-slate-400">Zero-Key Mode</div>
            <div className="font-semibold text-saffron-400">Supported ✓</div>
          </div>
        </div>
      </div>

      {/* Multi-Agent DAG Network */}
      <div className="glass-panel p-5 rounded-2xl border border-ocean-800 space-y-4">
        <div className="font-bold text-sm text-white flex items-center gap-2 pb-2 border-b border-ocean-800">
          <Cpu className="w-4 h-4 text-ocean-400" />
          <span>Cooperating Multi-Agent Registry ({STATIC_AGENTS.length} Agents)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STATIC_AGENTS.map((agent, idx) => (
            <div
              key={idx}
              className="glass-card p-3 rounded-xl border border-ocean-800/80 hover:border-ocean-600 transition-all text-xs"
            >
              <div className="flex items-center justify-between font-bold text-ocean-300 mb-1">
                <span>{agent.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {agent.status}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">{agent.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Adapter Registry & Health Table */}
      <div className="glass-panel p-5 rounded-2xl border border-ocean-800 space-y-4">
        <div className="font-bold text-sm text-white flex items-center gap-2 pb-2 border-b border-ocean-800">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Dataset Adapters &amp; Freshness Matrix</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-ocean-800 text-slate-400 font-semibold">
                <th className="p-2.5">Adapter Name</th>
                <th className="p-2.5">Variables Provided</th>
                <th className="p-2.5">Latency</th>
                <th className="p-2.5">TTL</th>
                <th className="p-2.5 text-right">Fallback Path</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ocean-800/50">
              {adapters.map((ad: any, idx: number) => (
                <tr key={idx} className="hover:bg-ocean-900/30 transition-colors">
                  <td className="p-2.5 font-bold text-white">{ad.name}</td>
                  <td className="p-2.5 text-slate-300">
                    <div className="flex flex-wrap gap-1">
                      {(ad.provides || []).map((p: string, pIdx: number) => (
                        <span
                          key={pIdx}
                          className="px-1.5 py-0.5 rounded bg-ocean-950 text-[10px] text-ocean-300 border border-ocean-900"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-2.5 font-mono text-emerald-400">{ad.latency_ms} ms</td>
                  <td className="p-2.5 font-mono text-slate-400">{ad.ttl_sec}s</td>
                  <td className="p-2.5 text-right font-mono text-[10px] text-amber-400">
                    {ad.fallback}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credits & SIH Note */}
      <div className="glass-card p-4 rounded-2xl border border-ocean-800 text-center text-xs text-slate-400 space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-slate-200 font-semibold">
          <Award className="w-4 h-4 text-saffron-400" />
          <span>Smart India Hackathon (SIH 2026) Prototype</span>
        </div>
        <p>Built for ISRO / NRSC Problem Statement: Agentic AI for Marine Information.</p>
        <p className="text-[10px] text-slate-500">
          Data citations: INCOIS, IMD RSMC New Delhi, NOAA CoastWatch ERDDAP, Copernicus Marine, Open-Meteo.
        </p>
      </div>
    </div>
  );
}
