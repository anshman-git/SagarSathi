'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { VesselProfile, ChatMessage, TraceStep, MapLayerSpec, ChartSpec, AlertItem } from '../lib/types';
import {
  Send, Mic, MicOff, Volume2, Ship, MapPin,
  Sparkles, RotateCcw, AlertTriangle, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function ChatPanel() {
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
    setLatestInsights,
    addAlert
  } = useAppStore();

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Web Speech API STT
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech Recognition is not supported by your current browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };

    recognition.start();
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*_#]/g, ''));
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isStreaming) return;

    setInput('');
    clearTrace();
    setIsStreaming(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString()
    };
    addMessage(userMsg);

    const agentMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'agent',
      text: '',
      timestamp: new Date().toISOString(),
      trace: []
    };
    addMessage(agentMsg);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: 'session_' + Date.now(),
          text: query,
          lang_hint: selectedLanguage,
          location: { lat: selectedLocation.lat, lon: selectedLocation.lon },
          location_name: selectedLocation.name,
          vessel_profile: vesselProfile,
          scenario_mode: scenarioMode
        })
      });

      if (!response.body) {
        setIsStreaming(false);
        return;
      }

      const reader = response.body.getReader();
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
            if (trimmed.startsWith('event:')) {
              eventType = trimmed.replace(/^event:\s*/, '');
            } else if (trimmed.startsWith('data:')) {
              let payload = trimmed.replace(/^data:\s*/, '');
              if (payload.startsWith('event:')) {
                eventType = payload.replace(/^event:\s*/, '');
              } else {
                if (payload.startsWith('data:')) {
                  payload = payload.replace(/^data:\s*/, '');
                }
                dataStr = payload;
              }
            }
          }

          if (!dataStr) continue;

          try {
            const dataObj = JSON.parse(dataStr);
            if (eventType === 'trace') {
              addTraceStep(dataObj as TraceStep);
            } else if (eventType === 'alert') {
              addAlert(dataObj as AlertItem);
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
            console.error('SSE parse error:', e);
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      updateLastMessage({
        text: 'Sorry, I encountered an issue reaching the marine intelligence service. Showing cached safety baseline.'
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl flex flex-col h-full overflow-hidden border border-ocean-800">
      {/* Top Controls: Vessel Profile & Port */}
      <div className="p-3 border-b border-ocean-800/80 bg-ocean-950/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Vessel Profile */}
        <div className="flex items-center gap-1.5">
          <Ship className="w-3.5 h-3.5 text-ocean-400" />
          <span className="text-slate-400 font-medium">Vessel:</span>
          <select
            value={vesselProfile}
            onChange={(e) => setVesselProfile(e.target.value as VesselProfile)}
            className="bg-ocean-900 border border-ocean-700 text-slate-200 rounded-lg px-2 py-0.5 font-semibold text-xs focus:outline-none"
          >
            <option value="small_motorised">Small Motorised (Okt/FRP)</option>
            <option value="non_motorised">Non-Motorised / Catamaran</option>
            <option value="mechanised">Mechanised Trawler</option>
          </select>
        </div>

        {/* Location Display */}
        <div className="flex items-center gap-1 text-[11px] text-ocean-300 bg-ocean-900/60 px-2 py-0.5 rounded-lg border border-ocean-800">
          <MapPin className="w-3 h-3 text-saffron-400" />
          <span className="truncate max-w-[140px]">{selectedLocation.name}</span>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-ocean-600 text-white shadow-md'
                  : 'glass-card border border-ocean-700/80 text-slate-100 shadow-sm'
              }`}
            >
              {msg.sender === 'agent' && (
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-ocean-800/50">
                  <span className="font-bold text-ocean-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-saffron-400" /> SagarMitra Agent
                  </span>
                  {msg.text && (
                    <button
                      onClick={() => handleSpeak(msg.text)}
                      className="text-slate-400 hover:text-white p-0.5"
                      title="Speak advisory"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Message Body */}
              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

              {/* Quick Follow-up chips */}
              {msg.follow_up_suggestions && msg.follow_up_suggestions.length > 0 && (
                <div className="mt-3 pt-2 border-t border-ocean-800/60 space-y-1.5">
                  <div className="text-[10px] text-ocean-300 font-semibold">Suggested Questions:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.follow_up_suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => sendMessage(sug)}
                        className="text-[11px] bg-ocean-950/80 hover:bg-ocean-800 text-slate-200 border border-ocean-700/60 px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
                      >
                        <span>{sug}</span>
                        <ChevronRight className="w-3 h-3 text-ocean-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-ocean-400 p-2 glass-card rounded-xl border border-ocean-800 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-ocean-400 animate-ping" />
            <span>Cooperating AI agents planning and analyzing ocean data...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-ocean-800/80 bg-ocean-950/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-2.5 rounded-xl border transition-all ${
              isListening
                ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                : 'bg-ocean-900 border-ocean-700 text-slate-400 hover:text-white hover:border-ocean-500'
            }`}
            title="Voice input (STT)"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about PFZ, sea safety, cyclone, or route in any Indian language..."
            className="flex-1 bg-ocean-900/90 border border-ocean-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-ocean-400"
          />

          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-400 hover:to-ocean-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
