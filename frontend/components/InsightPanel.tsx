'use client';

import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import EvidenceCards from './EvidenceCards';
import FactorTable from './FactorTable';
import AgentTrace from './AgentTrace';
import ChartsView from './ChartsView';
import WhatsAppAdvisoryModal from './WhatsAppAdvisoryModal';
import {
  FileText, Database, Cpu, BarChart3,
  ShieldCheck, AlertCircle, Sparkles, Share2, Volume2
} from 'lucide-react';

export default function InsightPanel() {
  const [activeTab, setActiveTab] = useState<'answer' | 'evidence' | 'trace' | 'charts'>('answer');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const {
    latestVerdict,
    latestConfidence,
    latestFactors,
    latestEvidence,
    latestCharts,
    currentTrace,
    isStreaming,
    selectedLocation,
    messages
  } = useAppStore();

  const lastAgentMessage = messages.filter((m) => m.sender === 'agent').slice(-1)[0];

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*_#]/g, ''));
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getVerdictCard = () => {
    if (!latestVerdict) return null;
    const isGo = latestVerdict.level === 'GO';
    const isCaution = latestVerdict.level === 'CAUTION';
    const isNoGo = latestVerdict.level === 'NO_GO';

    return (
      <div
        className={`p-4 rounded-2xl border mb-4 relative overflow-hidden transition-all ${
          isGo
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : isCaution
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            : 'bg-red-950/40 border-red-500/40 text-red-300'
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider uppercase border ${
                isGo
                  ? 'bg-emerald-500 text-ocean-950 border-emerald-400'
                  : isCaution
                  ? 'bg-amber-500 text-ocean-950 border-amber-400'
                  : 'bg-red-500 text-white border-red-400'
              }`}
            >
              {latestVerdict.level}
            </span>
            <span className="font-bold text-sm text-white">{latestVerdict.headline}</span>
          </div>
          {lastAgentMessage && (
            <button
              onClick={() => handleSpeak(lastAgentMessage.text)}
              className="p-1.5 rounded-lg bg-ocean-900/80 hover:bg-ocean-800 text-ocean-300 border border-ocean-700"
              title="Voice advisory read aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {latestVerdict.safe_window_start && (
          <div className="text-xs bg-ocean-950/70 p-2.5 rounded-xl border border-ocean-800/60 text-slate-200 mt-2">
            <div className="font-semibold text-ocean-300 mb-0.5">Recommended Time Window:</div>
            <div>
              Departure: <strong className="text-white">{latestVerdict.safe_window_start}</strong> to{' '}
              <strong className="text-white">{latestVerdict.safe_window_end}</strong> | Return by{' '}
              <strong className="text-saffron-400">{latestVerdict.latest_safe_return}</strong>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-panel rounded-2xl flex flex-col h-full overflow-hidden border border-ocean-800">
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-ocean-800/80 bg-ocean-950/60 p-1.5 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('answer')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-medium transition-all ${
            activeTab === 'answer'
              ? 'bg-ocean-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-ocean-900/50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Verdict & Why</span>
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-medium transition-all ${
            activeTab === 'evidence'
              ? 'bg-ocean-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-ocean-900/50'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Evidence ({latestEvidence.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('trace')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-medium transition-all ${
            activeTab === 'trace'
              ? 'bg-ocean-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-ocean-900/50'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Agent Trace</span>
          {isStreaming && <span className="w-1.5 h-1.5 rounded-full bg-ocean-400 animate-ping" />}
        </button>

        <button
          onClick={() => setActiveTab('charts')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-medium transition-all ${
            activeTab === 'charts'
              ? 'bg-ocean-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-ocean-900/50'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Charts</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'answer' && (
          <div className="space-y-4">
            {getVerdictCard()}

            {/* Confidence Badge */}
            {latestConfidence && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-ocean-900/50 border border-ocean-800 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-slate-200">
                    Decision Confidence: <span className="text-emerald-400">{latestConfidence.level} ({Math.round(latestConfidence.score * 100)}%)</span>
                  </span>
                </div>
                {latestConfidence.caveats.length > 0 && (
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {latestConfidence.caveats.length} caveats
                  </span>
                )}
              </div>
            )}

            {/* Factor Table */}
            <FactorTable factors={latestFactors} />

            {/* Share Button */}
            <div className="pt-2">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-ocean-600 hover:from-emerald-500 hover:to-ocean-500 text-white font-semibold text-xs transition-all shadow-md"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Grounded Advisory (WhatsApp / SMS)</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'evidence' && <EvidenceCards evidence={latestEvidence} />}

        {activeTab === 'trace' && <AgentTrace trace={currentTrace} isStreaming={isStreaming} />}

        {activeTab === 'charts' && <ChartsView charts={latestCharts} />}
      </div>

      {/* Footer Disclaimer */}
      <div className="p-2.5 bg-ocean-950/80 border-t border-ocean-800 text-[10px] text-slate-400 text-center">
        Indicative decision support. Follow official IMD/INCOIS/State Fisheries advisories.
      </div>

      {/* Share Modal */}
      <WhatsAppAdvisoryModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        location={selectedLocation}
        verdict={latestVerdict}
        advisoryText={lastAgentMessage ? lastAgentMessage.text : ''}
      />
    </div>
  );
}
