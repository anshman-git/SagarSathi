'use client';

import React, { useState } from 'react';
import { Verdict } from '../lib/types';
import { Share2, Copy, Check, X, Smartphone } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  location: { name: string; lat: number; lon: number };
  verdict: Verdict | null;
  advisoryText: string;
}

export default function WhatsAppAdvisoryModal({
  isOpen,
  onClose,
  location,
  verdict,
  advisoryText
}: Props) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sharePayload = `🌊 *SagarMitra Marine Safety Advisory*
📍 *Location:* ${location.name}
⚓ *Verdict:* ${verdict ? verdict.level : 'SAFE'} — ${verdict ? verdict.headline : 'Normal conditions'}
⏱️ *Safe Window:* ${verdict?.safe_window_start || '05:00 IST'} to ${verdict?.safe_window_end || '16:00 IST'} (Return by ${verdict?.latest_safe_return || '17:30 IST'})

📝 *Summary:*
${advisoryText.slice(0, 280)}...

⚠️ _Decision support only. Follow official IMD/INCOIS advisories._
📱 Shared via SagarMitra (SIH 2026)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sharePayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(sharePayload)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full rounded-2xl p-5 border border-ocean-600 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3 font-bold text-white text-base">
          <Share2 className="w-5 h-5 text-emerald-400" />
          <span>Share Marine Advisory</span>
        </div>

        <p className="text-xs text-slate-300 mb-3">
          Share localized marine weather and PFZ advisory with fishermen groups via WhatsApp or SMS.
        </p>

        <div className="bg-ocean-950 p-3 rounded-xl border border-ocean-800 text-xs font-mono text-slate-200 whitespace-pre-wrap max-h-56 overflow-y-auto mb-4 custom-scrollbar">
          {sharePayload}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all"
          >
            <Smartphone className="w-4 h-4" />
            <span>Open in WhatsApp</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-ocean-800 hover:bg-ocean-700 text-slate-200 font-semibold text-xs border border-ocean-600 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
