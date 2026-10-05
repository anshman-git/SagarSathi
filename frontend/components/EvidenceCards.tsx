'use client';

import React from 'react';
import { EvidenceCard, SourceBadge } from '../lib/types';
import { Database, Clock, Layers, ShieldCheck } from 'lucide-react';

interface Props {
  evidence: EvidenceCard[];
}

export default function EvidenceCards({ evidence }: Props) {
  if (!evidence || evidence.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-xs">
        Ask a question in the chat to view satellite datasets and evidence cards.
      </div>
    );
  }

  const getBadgeStyle = (badge: SourceBadge) => {
    switch (badge) {
      case 'LIVE':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'CACHED':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'DEMO':
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-300 font-semibold px-1">
        <span>Grounded Evidence & Provenance</span>
        <span className="text-[11px] text-ocean-400">{evidence.length} Datasets</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {evidence.map((card, idx) => (
          <div
            key={idx}
            className="glass-card p-3 rounded-xl border border-ocean-800/80 hover:border-ocean-600/50 transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-ocean-400 shrink-0" />
                <span className="font-bold text-xs text-white">{card.dataset_name}</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(
                  card.badge
                )}`}
              >
                {card.badge}
              </span>
            </div>

            <div className="text-[11px] text-slate-300 font-medium mb-2">
              Provider: <span className="text-ocean-300">{card.provider}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 mb-2 bg-ocean-950/40 p-2 rounded-lg border border-ocean-900">
              <div className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-500" />
                <span>Var: {card.variable}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{card.timestamp_ist || card.timestamp_utc}</span>
              </div>
            </div>

            {card.details && (
              <div className="text-[11px] text-slate-300 bg-ocean-900/30 p-2 rounded border border-ocean-800/40">
                {card.details}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
