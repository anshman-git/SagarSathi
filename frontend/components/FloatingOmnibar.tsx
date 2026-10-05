'use client';

import React, { useState, useRef } from 'react';
import { useAppStore } from '../lib/store';
import {
  Send, Mic, MicOff, Volume2, Ship, MapPin,
  Sparkles, ChevronDown, ChevronUp, Share2, Compass,
  CheckCircle2, AlertTriangle, XCircle, ShieldCheck,
  Cpu, Database, Layers, BarChart3, X, ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import WhatsAppAdvisoryModal from './WhatsAppAdvisoryModal';

export default function FloatingOmnibar() {
  const {
    messages,
    addMessage,
    updateLastMessage,
    addTraceStep,
    clearTrace,
    isStreaming,
    setIsStreaming,
    selectedLanguage,
    vesselProfile,
    setVesselProfile,
    selectedLocation,
    setSelectedLocation,
    scenarioMode,
    latestVerdict,
    latestConfidence,
    latestFactors,
    latestEvidence,
    latestCharts,
    currentTrace,
    setLatestInsights,
    addAlert
  } = useAppStore();

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'verdict' | 'factors' | 'evidence' | 'trace' | 'charts'>('verdict');
  const [isShareOpen, setIsShareOpen] = useState(false);

  const lastAgentMsg = messages.filter((m) => m.sender === 'agent').slice(-1)[0];

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech Recognition is not supported on this browser.');
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (evt: any) => {
      const transcript = evt.results[0][0].transcript;
      setInput(transcript);
      sendQuery(transcript);
    };
    recognition.start();
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[*_#]/g, ''));
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  };

  const sendQuery = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || isStreaming) return;

    setInput('');
    clearTrace();
    setIsStreaming(true);
    setIsExpanded(true);

    addMessage({
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date().toISOString()
    });

    addMessage({
      id: (Date.now() + 1).toString(),
      sender: 'agent',
      text: '',
      timestamp: new Date().toISOString()
    });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: 'session_' + Date.now(),
          text: q,
          lang_hint: selectedLanguage,
          location: { lat: selectedLocation.lat, lon: selectedLocation.lon },
          location_name: selectedLocation.name,
          vessel_profile: vesselProfile,
          scenario_mode: scenarioMode
        })
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const evtStr of events) {
          if (!evtStr.trim()) continue;
          const lines = evtStr.split('\n');
          let eventType = '';
          let dataStr = '';

          for (const l of lines) {
            const trimmed = l.trim();
            if (trimmed.startsWith('event:')) eventType = trimmed.replace(/^event:\s*/, '');
            else if (trimmed.startsWith('data:')) dataStr = trimmed.replace(/^data:\s*/, '');
          }

          if (!dataStr) continue;

          try {
            const dataObj = JSON.parse(dataStr);
            if (eventType === 'trace') {
              addTraceStep(dataObj);
            } else if (eventType === 'alert') {
              addAlert(dataObj);
            } else if (eventType === 'final') {
              updateLastMessage({
                text: dataObj.answer_text,
                verdict: dataObj.verdict,
                factor_table: dataObj.factor_table,
                evidence: dataObj.evidence,
                confidence: dataObj.confidence,
                map_layers: dataObj.map_layers,
                charts: dataObj.charts,
                alerts: dataObj.alerts,
                route: dataObj.route,
                follow_up_suggestions: dataObj.follow_up_suggestions,
                trace: dataObj.trace
              });

              setLatestInsights({
                verdict: dataObj.verdict,
                confidence: dataObj.confidence,
                factors: dataObj.factor_table,
                evidence: dataObj.evidence,
                charts: dataObj.charts
              });
            }
          } catch (e) {
            console.error('SSE JSON parse error:', e);
          }
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsStreaming(false);
    }
  };

  const getVerdictBadge = () => {
    if (!latestVerdict) return null;
    const isGo = latestVerdict.level === 'GO';
    const isCaution = latestVerdict.level === 'CAUTION';

    return (
      <div
        className={`p-3.5 rounded-2xl border mb-3 flex items-start justify-between gap-3 shadow-lg ${
          isGo
            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
            : isCaution
            ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
            : 'bg-red-950/60 border-red-500/50 text-red-300'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase border shadow ${
                isGo
                  ? 'bg-emerald-500 text-ocean-950 border-emerald-400'
                  : isCaution
                  ? 'bg-amber-500 text-ocean-950 border-amber-400'
                  : 'bg-red-500 text-white border-red-400'
              }`}
            >
              {latestVerdict.level}
            </span>
            <span className="font-bold text-xs text-white leading-tight">
              {latestVerdict.headline}
            </span>
          </div>

          {latestVerdict.safe_window_start && (
            <div className="text-[11px] text-slate-200 mt-1">
              Safe window: <strong className="text-white">{latestVerdict.safe_window_start}</strong> to{' '}
              <strong className="text-white">{latestVerdict.safe_window_end}</strong> | Return by{' '}
              <strong className="text-saffron-400">{latestVerdict.latest_safe_return}</strong>
            </div>
          )}
        </div>

        {lastAgentMsg && (
          <button
            onClick={() => handleSpeak(lastAgentMsg.text)}
            className="p-1.5 rounded-xl bg-ocean-900/80 hover:bg-ocean-800 text-ocean-300 border border-ocean-700 shrink-0"
            title="Listen to advisory"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="fixed top-16 left-3 w-[calc(100vw-24px)] sm:w-[440px] z-30 flex flex-col max-h-[calc(100vh-80px)] pointer-events-none transition-all">
      {/* Search Omnibar Card */}
      <div className="glass-panel rounded-2xl p-2.5 shadow-2xl border border-ocean-700/80 pointer-events-auto backdrop-blur-xl bg-ocean-950/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendQuery();
          }}
          className="flex items-center gap-2 bg-ocean-900/90 border border-ocean-700/80 rounded-xl px-3 py-1.5 focus-within:border-ocean-400 transition-all"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about PFZ, sea safety, storm, or routes..."
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
          />

          <button
            type="button"
            onClick={handleVoice}
            className={`p-1.5 rounded-lg transition-all ${
              isListening
                ? 'bg-red-500/20 text-red-400 animate-pulse'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Voice Search"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="p-1.5 rounded-lg bg-ocean-500 hover:bg-ocean-400 text-white disabled:opacity-30 transition-all shadow"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Vessel & Port Pickers */}
        <div className="flex items-center justify-between gap-2 mt-2 px-1 text-[11px] text-slate-300">
          <div className="flex items-center gap-1">
            <Ship className="w-3 h-3 text-ocean-400" />
            <select
              value={vesselProfile}
              onChange={(e) => setVesselProfile(e.target.value as any)}
              className="bg-ocean-900 border border-ocean-800 rounded px-1.5 py-0.5 text-[10px] text-slate-200 focus:outline-none"
            >
              <option value="small_motorised">Small Motorised (Okt/FRP)</option>
              <option value="non_motorised">Non-Motorised / Catamaran</option>
              <option value="mechanised">Mechanised Trawler</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-ocean-300 truncate max-w-[170px]">
            <MapPin className="w-3 h-3 text-saffron-400 shrink-0" />
            <span className="truncate">{selectedLocation.name}</span>
          </div>
        </div>

        {/* Quick Action Chips (Google Maps style) */}
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 custom-scrollbar">
          {[
            { label: '🐟 Nearest PFZ', query: 'Where is the nearest PFZ today?' },
            { label: '⚓ Sea Safety', query: 'कल सुबह समुद्र में जाना सुरक्षित है?' },
            { label: '🌪️ Storm / Cyclone', query: 'மண்டபம் அருகே கடல் நிலை மற்றும் புயல் எச்சரிக்கை எப்படி?' },
            { label: '🧭 Safest Route', query: 'Safest route from Nagapattinam avoiding shallow waters' },
            { label: '📉 Why Decline?', query: 'Why has fish productivity declined near Gulf of Mannar?' }
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => sendQuery(chip.query)}
              className="whitespace-nowrap px-2.5 py-1 rounded-xl bg-ocean-900/80 hover:bg-ocean-800 text-[10px] font-semibold text-slate-200 border border-ocean-700/60 transition-all hover:scale-105"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expandable Agentic Drawer Card (Google Maps Place Sheet) */}
      {messages.length > 0 && isExpanded && (
        <div className="mt-2 glass-panel rounded-2xl p-4 shadow-2xl border border-ocean-700/80 pointer-events-auto backdrop-blur-xl bg-ocean-950/95 overflow-hidden flex flex-col max-h-[calc(100vh-230px)]">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-ocean-800/80">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-saffron-400" />
              <span className="font-bold text-xs text-white">Marine Intelligence Advisory</span>
              {isStreaming && <span className="w-2 h-2 rounded-full bg-ocean-400 animate-ping" />}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsShareOpen(true)}
                className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 px-2"
                title="Share to WhatsApp"
              >
                <Share2 className="w-3 h-3" />
                <span>Share</span>
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Body Scroll */}
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
            {getVerdictBadge()}

            {/* Answer Message Text */}
            {lastAgentMsg && (
              <div className="text-xs text-slate-100 leading-relaxed whitespace-pre-wrap bg-ocean-900/50 p-3 rounded-xl border border-ocean-800/70">
                {lastAgentMsg.text || 'Planning and analyzing satellite observations...'}
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center bg-ocean-900/60 p-1 rounded-xl border border-ocean-800 gap-1 text-[11px]">
              <button
                onClick={() => setActiveTab('verdict')}
                className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                  activeTab === 'verdict' ? 'bg-ocean-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Factors
              </button>
              <button
                onClick={() => setActiveTab('evidence')}
                className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                  activeTab === 'evidence' ? 'bg-ocean-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Evidence
              </button>
              <button
                onClick={() => setActiveTab('trace')}
                className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                  activeTab === 'trace' ? 'bg-ocean-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Agent Trace
              </button>
              <button
                onClick={() => setActiveTab('charts')}
                className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                  activeTab === 'charts' ? 'bg-ocean-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Forecast
              </button>
            </div>

            {/* Tab: Factors */}
            {activeTab === 'verdict' && (
              <div className="space-y-2">
                {latestFactors.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-ocean-900/40 border border-ocean-800/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{item.factor}</div>
                      <div className="text-[10px] text-slate-400">{item.threshold}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-ocean-300 font-bold">{item.value}</div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          item.status === 'GO'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : item.status === 'CAUTION'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Evidence */}
            {activeTab === 'evidence' && (
              <div className="space-y-2">
                {latestEvidence.map((card, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-ocean-900/40 border border-ocean-800/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{card.dataset_name}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {card.badge}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-300">
                      Provider: <span className="text-ocean-300">{card.provider}</span> ({card.variable})
                    </div>
                    {card.details && (
                      <div className="text-[10px] text-slate-400 bg-ocean-950/60 p-1.5 rounded border border-ocean-900">
                        {card.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Agent Trace */}
            {activeTab === 'trace' && (
              <div className="space-y-2 relative border-l-2 border-ocean-800 ml-2 pl-3">
                {currentTrace.map((step, idx) => (
                  <div key={idx} className="relative text-xs space-y-0.5">
                    <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-emerald-400" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ocean-300">{step.agent}</span>
                      <span className="text-[9px] font-mono text-slate-400">{step.duration_ms}ms</span>
                    </div>
                    <div className="text-[11px] text-slate-200">{step.action}</div>
                    {step.outcome && (
                      <div className="text-[10px] font-mono text-emerald-300/80 bg-ocean-950 p-1 rounded">
                        ↳ {step.outcome}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Charts */}
            {activeTab === 'charts' && latestCharts.length > 0 && (
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={latestCharts[0].data}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#06162d',
                        borderColor: '#1e3a8a',
                        borderRadius: '8px',
                        fontSize: '10px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="wave_height"
                      name="Wave (m)"
                      fill="#38bdf8"
                      stroke="#38bdf8"
                      fillOpacity={0.2}
                    />
                    <Line
                      type="monotone"
                      dataKey="wind_speed"
                      name="Wind (km/h)"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Minimized Expand Button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="mt-2 self-start px-3 py-1.5 rounded-xl glass-panel bg-ocean-950/90 border border-ocean-700 text-xs font-bold text-white shadow-xl flex items-center gap-1.5 pointer-events-auto hover:border-ocean-400"
        >
          <span>View Marine Advisory</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      )}

      {/* WhatsApp Modal */}
      <WhatsAppAdvisoryModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        location={selectedLocation}
        verdict={latestVerdict}
        advisoryText={lastAgentMsg ? lastAgentMsg.text : ''}
      />
    </div>
  );
}
