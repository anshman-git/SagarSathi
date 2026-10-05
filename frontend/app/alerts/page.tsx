'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../lib/store';
import { AlertItem, AlertSeverity, GeofenceTier } from '../../lib/types';
import {
  ShieldAlert, Play, Square, FastForward, Navigation,
  MapPin, AlertTriangle, CheckCircle2, Share2, Compass, Radio
} from 'lucide-react';
import WhatsAppAdvisoryModal from '../../components/WhatsAppAdvisoryModal';

export default function AlertsPage() {
  const { activeAlerts, selectedLocation } = useAppStore();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [selectedTrack, setSelectedTrack] = useState<string>('palk_bay_imbl');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(5);
  const [isSimRunning, setIsSimRunning] = useState<boolean>(false);
  const [simState, setSimState] = useState<any>({
    current_lat: 9.2780,
    current_lon: 79.1250,
    heading: 85,
    speed_knots: 8.0,
    tier: 'SAFE',
    last_alert: 'Vessel operating safely inside Indian territorial waters.'
  });
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Poll simulator state when running
  useEffect(() => {
    let interval: any = null;
    if (isSimRunning) {
      interval = setInterval(async () => {
        try {
          const resp = await fetch('/api/simulator');
          const data = await resp.json();
          setSimState(data);
        } catch (e) {
          console.error('Simulator poll failed:', e);
        }
      }, 1200 / speedMultiplier);
    }
    return () => clearInterval(interval);
  }, [isSimRunning, speedMultiplier]);

  const handleStartSim = async () => {
    try {
      await fetch('/api/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', track_id: selectedTrack, speed_multiplier: speedMultiplier })
      });
      setIsSimRunning(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStopSim = async () => {
    try {
      await fetch('/api/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      });
      setIsSimRunning(false);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredAlerts = activeAlerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  const isCritical = simState.tier === 'CRITICAL';

  return (
    <div className="flex-1 p-4 max-w-6xl mx-auto w-full space-y-5">
      {/* Critical Banner Takeover */}
      {isCritical && (
        <div className="p-4 rounded-2xl bg-red-950/80 border-2 border-red-500 text-red-200 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-400 shrink-0" />
            <div>
              <div className="font-black text-sm uppercase tracking-wider text-red-300">
                🚨 CRITICAL GEOFENCE WARNING: IMBL PROXIMITY
              </div>
              <div className="text-xs text-slate-200">
                {simState.last_alert || 'Vessel is 1.2 nm from Sri Lanka IMBL boundary. Immediate return recommended.'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-red-900/60 px-3 py-1.5 rounded-xl border border-red-400 font-bold text-xs text-white">
            <Compass className="w-4 h-4 text-saffron-400" />
            <span>Turn-back Heading: 265°</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-ocean-400" />
            <span>Proactive Alert Center & Vessel Simulator</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time geofence monitoring, IMBL border alerts, storm warnings, and live vessel simulation.
          </p>
        </div>

        <button
          onClick={() => setIsShareOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md"
        >
          <Share2 className="w-4 h-4" />
          <span>Broadcast Advisory</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Vessel Simulator Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-ocean-800 space-y-4">
            <div className="font-bold text-sm text-white flex items-center gap-2 pb-2 border-b border-ocean-800">
              <Navigation className="w-4 h-4 text-ocean-400" />
              <span>Vessel Track Simulator</span>
            </div>

            {/* Track Selector */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Select Pre-configured Track:</label>
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                disabled={isSimRunning}
                className="w-full bg-ocean-900 border border-ocean-700 text-slate-200 rounded-xl p-2.5 text-xs focus:outline-none"
              >
                <option value="palk_bay_imbl">Mandapam Trawler → Sri Lanka IMBL Border (3 Tiers)</option>
                <option value="cyclone_escape">Offshore Vessel Escaping Cyclone → Kasimedu</option>
                <option value="mpa_approach">Thoothukudi → Gulf of Mannar Marine National Park</option>
              </select>
            </div>

            {/* Speed Multiplier */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Simulation Speed Multiplier:</label>
              <div className="flex gap-2">
                {[1, 5, 20].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeedMultiplier(s)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      speedMultiplier === s
                        ? 'bg-ocean-600 border-ocean-400 text-white'
                        : 'bg-ocean-900 border-ocean-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    ×{s} Speed
                  </button>
                ))}
              </div>
            </div>

            {/* Play / Stop buttons */}
            <div className="flex gap-2 pt-1">
              {!isSimRunning ? (
                <button
                  onClick={handleStartSim}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Live Simulation</span>
                </button>
              ) : (
                <button
                  onClick={handleStopSim}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-all"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop Simulation</span>
                </button>
              )}
            </div>

            {/* Real-time Vessel Telemetry */}
            <div className="bg-ocean-950/80 p-3 rounded-xl border border-ocean-800 space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span>Vessel Telemetry</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    simState.tier === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : simState.tier === 'ALERT'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {simState.tier}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                <div>Pos: {simState.current_lat.toFixed(4)}°N, {simState.current_lon.toFixed(4)}°E</div>
                <div>Heading: {simState.heading}°</div>
                <div>Speed: {simState.speed_knots} kts</div>
                <div>Status: {isSimRunning ? 'Underway' : 'Stationary'}</div>
              </div>

              <div className="text-[11px] text-ocean-300 bg-ocean-900/60 p-2 rounded-lg border border-ocean-800">
                {simState.last_alert}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Alerts Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-ocean-800 space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-ocean-800">
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-saffron-400" />
                <span>Active Safety & Boundary Feed</span>
              </div>

              {/* Severity Filter */}
              <div className="flex gap-1 text-[10px]">
                {['ALL', 'CRITICAL', 'ALERT', 'ADVISORY'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                      filterSeverity === sev
                        ? 'bg-ocean-600 text-white'
                        : 'bg-ocean-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Alert List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1 max-h-[460px]">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No active alerts for this severity level. Safe operating conditions.
                </div>
              ) : (
                filteredAlerts.map((alert) => {
                  const isCrit = alert.severity === 'CRITICAL';
                  const isWarn = alert.severity === 'ALERT';
                  return (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        isCrit
                          ? 'bg-red-950/40 border-red-500/40 text-red-200'
                          : isWarn
                          ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                          : 'bg-ocean-900/60 border-ocean-700 text-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-bold text-white text-xs">{alert.title}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {alert.timestamp.split('T')[1]?.slice(0, 5) || 'Now'}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed mb-2">{alert.message}</p>
                      {alert.turn_back_heading && (
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-ocean-950/80 px-2 py-0.5 rounded border border-ocean-800 text-ocean-300">
                          <Compass className="w-3 h-3 text-saffron-400" />
                          <span>Turn-back Course: {alert.turn_back_heading}°</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <WhatsAppAdvisoryModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        location={selectedLocation}
        verdict={null}
        advisoryText="High-risk cyclone and boundary alerts active in Tamil Nadu offshore sector. Fishermen advised to adhere to IMD advisory."
      />
    </div>
  );
}
