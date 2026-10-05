'use client';

import React from 'react';
import Link from 'next/link';
import {
  Anchor, Compass, ShieldAlert, Cpu, Sparkles,
  ArrowRight, Globe, CheckCircle2, Waves, Zap, Database
} from 'lucide-react';
import { useAppStore } from '../lib/store';

export default function LandingPage() {
  const { setLanguage } = useAppStore();

  const QUICK_DEMOS = [
    {
      title: 'Fishing Zone Discovery',
      query: 'Where is the nearest PFZ today?',
      lang: 'en',
      icon: '🎣',
      desc: 'Discovers high chlorophyll & thermal SST fronts near Kasimedu/Chennai with safe navigation route.'
    },
    {
      title: 'सुरक्षा जांच (Safety in Hindi)',
      query: 'कल सुबह समुद्र में जाना सुरक्षित है?',
      lang: 'hi',
      icon: '⚓',
      desc: 'Evaluates wave height, wind, and storm matrix with hourly departure window in Hindi.'
    },
    {
      title: 'புயல் எச்சரிக்கை (Cyclone / Storm)',
      query: 'மண்டபம் அருகே கடல் நிலை மற்றும் புயல் எச்சரிக்கை எப்படி?',
      lang: 'ta',
      icon: '🌪️',
      desc: 'Severe weather advisory with emergency return route and boundary awareness in Tamil.'
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-6 max-w-6xl mx-auto w-full relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-ocean-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <div className="text-center max-w-3xl mt-8 space-y-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ocean-900/80 border border-ocean-700 text-ocean-300 text-xs font-semibold shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-saffron-400" />
          <span>Smart India Hackathon 2026 — ISRO / NRSC Problem Statement</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Ask the Ocean, in Your <br />
          <span className="bg-gradient-to-r from-ocean-400 via-emerald-400 to-saffron-400 bg-clip-text text-transparent">
            Own Regional Language.
          </span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          <strong>SagarMitra</strong> is an agentic AI marine intelligence platform that fuses Earth Observation satellites (SST, Chlorophyll-a), IMD cyclone warnings, ocean wave forecasts, and maritime boundaries into explainable, voice-ready decisions for Indian fishermen.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/app"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-ocean-500 via-ocean-600 to-emerald-500 hover:from-ocean-400 hover:to-emerald-400 text-white font-bold text-sm shadow-xl shadow-ocean-500/20 transition-all hover:scale-105"
          >
            <Compass className="w-4 h-4" />
            <span>Launch Mission Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/alerts"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-ocean-900/80 hover:bg-ocean-800 border border-ocean-700 text-slate-200 font-semibold text-sm transition-all"
          >
            <ShieldAlert className="w-4 h-4 text-saffron-400" />
            <span>Vessel Simulator & Alerts</span>
          </Link>
        </div>
      </div>

      {/* Quick Demo Cards */}
      <div className="w-full mt-12 mb-8">
        <div className="text-center mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ocean-400">
            One-Click Scenarios (Live Multi-Agent Pipeline)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {QUICK_DEMOS.map((demo, idx) => (
            <Link
              key={idx}
              href="/app"
              onClick={() => setLanguage(demo.lang)}
              className="glass-card p-4 rounded-2xl border border-ocean-800 hover:border-ocean-500 transition-all group hover:-translate-y-1"
            >
              <div className="text-2xl mb-2">{demo.icon}</div>
              <h3 className="font-bold text-white text-sm group-hover:text-ocean-300 transition-colors">
                {demo.title}
              </h3>
              <p className="text-slate-400 text-xs mt-1 mb-3">{demo.desc}</p>
              <div className="text-[11px] font-mono text-ocean-400 bg-ocean-950/60 p-2 rounded-lg border border-ocean-900 truncate">
                &ldquo;{demo.query}&rdquo;
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Feature Badges */}
      <div className="w-full py-4 border-t border-ocean-800/60 flex flex-wrap items-center justify-around gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Zero-Key Offline Demo Mode</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-ocean-400" />
          <span>10 Indian Coastal Languages</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-saffron-400" />
          <span>Live Multi-Agent Trace</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Database className="w-4 h-4 text-ocean-300" />
          <span>INCOIS PFZ & IMD Integration</span>
        </div>
      </div>
    </div>
  );
}
