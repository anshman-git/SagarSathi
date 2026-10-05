# SagarMitra — Agentic AI Marine Intelligence Platform

## Project Overview
SagarMitra is a conversational, multi-agent decision support platform for Indian fishermen, coastal authorities, and researchers. It unifies Earth Observation data (SST, Chlorophyll-a), weather/ocean state forecasts (waves, wind, swell, cyclone/lightning), and geospatial boundaries (IMBL, MPAs, fishing bans) into explainable Go/Caution/No-Go safety verdicts, PFZ recommendations, and proactive alerts across 10 Indian languages.

## Tech Stack
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, MapLibre GL JS, Recharts, Framer Motion, Zustand, Lucide React.
- **Backend:** Python 3.11+, FastAPI, Pydantic v2, `httpx`, `numpy`, `scipy`, `shapely`, `pyproj`, `networkx`, SQLite / `aiosqlite`.
- **LLM / AI:** Google GenAI SDK (Gemini) with function-calling + fallback deterministic rule-based planner and multilingual phrase bank.
- **Speech:** Web Speech API (STT/TTS) + Bhashini API hooks.

## Key Conventions & Rules
- **Data Honesty:** Every metric carries a source badge (`LIVE`, `CACHED`, `DEMO`). Never fabricate values.
- **Agent Explainability:** All answers include a Verdict, Reasoning Steps, Evidence Cards, Factor Table (value vs threshold), and an SSE Agent Trace.
- **Zero-Key Mode:** Must run fully in Demo Mode without requiring API keys.
- **Modularity:** Each agent is a self-contained class in `backend/app/agents/` implementing `run(state) -> state_patch`.

## Run Commands
- **Backend:** `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
- **Frontend:** `cd frontend && npm run dev`
- **Tests:** `cd backend && pytest`
