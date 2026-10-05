# Frontend Architecture & Quality Rules

1. **Design Theme:** "Mission-control meets fisherman-friendly". Deep ocean-navy (#0a192f) with vibrant teal and saffron accents. High-contrast, large touch targets, rounded surfaces, glassmorphism headers and cards.
2. **Framework & State:** Next.js App Router with TypeScript. Use Zustand for centralized UI state (active layer toggles, selected location, active scenario, vessel profile, chat stream, simulation state).
3. **Map Experience:** MapLibre GL JS with free raster/vector tiles (CARTO/OSM) that require zero API keys. Support layers: SST, Chl-a, PFZ Official (DEMO), PFZ Derived, Wind/Waves, IMBL/EEZ, MPAs, Ports, Routes, and Vessel tracks. Include 72h time slider and smooth camera transitions.
4. **Agent Trace:** Live timeline rendering agent steps streamed over SSE with latency counters, tool names, and source badges.
5. **Internationalization:** Native script support for English, Hindi, Tamil, Telugu, Malayalam, Kannada, Odia, Bengali, Gujarati, Marathi. Dynamic font rendering and Web Speech STT/TTS.
6. **Error States:** Graceful degraded UI with clear alerts and fallback notes.
