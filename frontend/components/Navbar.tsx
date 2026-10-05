'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Anchor, ShieldAlert, Cpu, Compass, Globe, Sparkles, Radio } from 'lucide-react';
import { useAppStore } from '../lib/store';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' }
];

export default function Navbar() {
  const pathname = usePathname();
  const { selectedLanguage, setLanguage, scenarioMode, setScenarioMode, activeAlerts } = useAppStore();

  const navLinks = [
    { href: '/app', label: 'Marine Map', icon: Compass },
    { href: '/alerts', label: 'Alerts & Simulator', icon: ShieldAlert, badge: activeAlerts.length },
    { href: '/about', label: 'Architecture & Data', icon: Cpu }
  ];

  return (
    <header className="fixed top-3 left-3 right-3 z-40 flex items-center justify-between pointer-events-none">
      {/* Brand & Nav Pill */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl glass-panel bg-ocean-950/90 border border-ocean-700/80 shadow-2xl hover:border-ocean-400 transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ocean-500 to-emerald-400 flex items-center justify-center text-ocean-950 font-bold shadow-md shadow-ocean-500/30 group-hover:scale-105 transition-transform">
            <Anchor className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-white text-sm">
              <span>SagarMitra</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-ocean-500/20 text-ocean-300 font-semibold border border-ocean-400/30">
                ISRO / NRSC
              </span>
            </div>
          </div>
        </Link>

        {/* Navigation Pill */}
        <nav className="hidden md:flex items-center gap-1 glass-panel bg-ocean-950/90 p-1 rounded-2xl border border-ocean-800/80 shadow-2xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-ocean-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-ocean-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[9px] font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Scenario Mode Toggle */}
        <button
          onClick={() => setScenarioMode(!scenarioMode)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold border shadow-2xl transition-all ${
            scenarioMode
              ? 'bg-saffron-500/20 border-saffron-500 text-saffron-400 glass-panel'
              : 'glass-panel bg-ocean-950/90 border-ocean-800 text-slate-300 hover:text-white hover:border-ocean-600'
          }`}
          title="Toggle Storm / Cyclone Simulation Scenario"
        >
          <Sparkles className="w-3.5 h-3.5 text-saffron-400" />
          <span className="hidden sm:inline">Scenario Mode</span>
          <span className={`w-2 h-2 rounded-full ${scenarioMode ? 'bg-saffron-500' : 'bg-slate-600'}`} />
        </button>

        {/* Language Selector */}
        <div className="glass-panel bg-ocean-950/90 border border-ocean-800 rounded-2xl px-2.5 py-1.5 flex items-center gap-1.5 shadow-2xl text-xs">
          <Globe className="w-3.5 h-3.5 text-ocean-400" />
          <select
            value={selectedLanguage}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs pr-1 font-medium"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-ocean-950 text-white">
                {l.native} ({l.label})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
