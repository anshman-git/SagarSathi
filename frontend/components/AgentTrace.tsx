'use client';

import React, { useState } from 'react';
import { TraceStep } from '../lib/types';
import { Cpu, CheckCircle2, ChevronDown, ChevronRight, Zap } from 'lucide-react';

interface Props {
  trace: TraceStep[];
  isStreaming?: boolean;
}

export default function AgentTrace({ trace, isStreaming }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!trace || trace.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-xs">
        {isStreaming ? (
          <div className="flex flex-col items-center gap-2">
            <Zap className="w-5 h-5 text-ocean-400 animate-bounce" />
            <span>Agentic DAG planning & executing...</span>
          </div>
        ) : (
          'Ask a question to see the multi-agent execution pipeline.'
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-300 font-semibold px-1">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-ocean-400" />
          <span>Multi-Agent Task Trace</span>
        </div>
        {isStreaming && (
          <span className="flex items-center gap-1 text-[11px] text-ocean-400 animate-pulse font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-ocean-400" />
            Executing DAG
          </span>
        )}
      </div>

      <div className="relative border-l-2 border-ocean-800/80 ml-3 pl-4 space-y-4">
        {trace.map((step, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div key={idx} className="relative group">
              {/* Dot */}
              <div className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full bg-ocean-950 border-2 border-ocean-400 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>

              <div className="glass-card p-3 rounded-xl border border-ocean-800/70 hover:border-ocean-600 transition-all">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="font-bold text-xs text-white flex items-center gap-1.5">
                    <span className="text-ocean-300">{step.agent}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-ocean-950 text-slate-400 font-mono">
                      {step.duration_ms}ms
                    </span>
                    <button
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="text-slate-400 hover:text-white"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-200 font-medium mb-1">
                  {step.action}
                </div>

                {step.outcome && (
                  <div className="text-[11px] text-emerald-300/90 font-mono bg-ocean-950/60 p-1.5 rounded border border-ocean-900 mt-1">
                    ↳ {step.outcome}
                  </div>
                )}

                {isExpanded && step.inputs_summary && (
                  <div className="mt-2 text-[10px] text-slate-400 bg-ocean-950 p-2 rounded font-mono border border-ocean-800/50">
                    <div>Inputs: {step.inputs_summary}</div>
                    <div className="text-[9px] text-slate-500 mt-1">
                      Badge: {step.source_badge} | Timestamp: {step.ts}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
