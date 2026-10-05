'use client';

import React from 'react';
import { FactorItem, SafetyVerdictLevel } from '../lib/types';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

interface Props {
  factors: FactorItem[];
}

export default function FactorTable({ factors }: Props) {
  if (!factors || factors.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-xs">
        No factor analysis generated yet.
      </div>
    );
  }

  const getStatusBadge = (status: SafetyVerdictLevel) => {
    switch (status) {
      case 'GO':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> GO
          </span>
        );
      case 'CAUTION':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" /> CAUTION
          </span>
        );
      case 'NO_GO':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            <XCircle className="w-3 h-3" /> NO-GO
          </span>
        );
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs text-slate-300 font-semibold px-1">
        <span>Safety Matrix & Threshold Evaluation</span>
        <span className="text-[11px] text-ocean-400">{factors.length} Factors</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-ocean-800/80 bg-ocean-950/60">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-ocean-800 bg-ocean-900/60 text-slate-300 font-semibold">
              <th className="p-2.5">Hazard Parameter</th>
              <th className="p-2.5">Observed Value</th>
              <th className="p-2.5 hidden sm:table-cell">Safety Limits</th>
              <th className="p-2.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ocean-800/50">
            {factors.map((item, idx) => (
              <tr key={idx} className="hover:bg-ocean-900/30 transition-colors">
                <td className="p-2.5 font-medium text-slate-200">
                  <div>{item.factor}</div>
                  {item.note && (
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.note}</div>
                  )}
                </td>
                <td className="p-2.5 font-mono text-ocean-300 font-semibold">
                  {item.value}
                </td>
                <td className="p-2.5 text-[11px] text-slate-400 hidden sm:table-cell">
                  {item.threshold}
                </td>
                <td className="p-2.5 text-right whitespace-nowrap">
                  <div className="inline-flex justify-end">{getStatusBadge(item.status)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
