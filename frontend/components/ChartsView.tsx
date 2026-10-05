'use client';

import React from 'react';
import { ChartSpec } from '../lib/types';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { BarChart3 } from 'lucide-react';

interface Props {
  charts: ChartSpec[];
}

export default function ChartsView({ charts }: Props) {
  if (!charts || charts.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-xs">
        Ask a question or select a port to render ocean forecast and anomaly charts.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {charts.map((chart) => (
        <div
          key={chart.id}
          className="glass-card p-3.5 rounded-xl border border-ocean-800/80"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 font-bold text-xs text-white">
              <BarChart3 className="w-4 h-4 text-ocean-400" />
              <span>{chart.title}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ocean-950 text-ocean-300 border border-ocean-800">
              {chart.unit || 'Forecast Units'}
            </span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chart.data}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis
                  dataKey={chart.x_key}
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#06162d',
                    borderColor: '#1e3a8a',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f8fafc'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                {chart.series.map((s, idx) => {
                  if (s.type === 'area') {
                    return (
                      <Area
                        key={idx}
                        type="monotone"
                        dataKey={s.key}
                        name={s.name}
                        fill={s.color}
                        stroke={s.color}
                        fillOpacity={0.2}
                      />
                    );
                  }
                  return (
                    <Line
                      key={idx}
                      type="monotone"
                      dataKey={s.key}
                      name={s.name}
                      stroke={s.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  );
                })}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}
