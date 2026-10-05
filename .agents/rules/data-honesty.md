# Data Honesty & Provenance Rules

1. **Badge Hierarchy:**
   - `LIVE`: Directly fetched from external APIs (Open-Meteo, ERDDAP, live IMD) within the current request window.
   - `CACHED`: Recovered from local disk cache, with explicit timestamp and age notation.
   - `DEMO`: Bundled synthetic or scenario data (e.g. synthetic SST front, cyclone demo track).
2. **Global Indicator:** Header status chip indicating `LIVE`, `PARTIAL`, or `DEMO MODE`.
3. **Disclaimers:** Every advisory, map export, and factor table must display: *"Decision support only. Indicative boundaries — not for legal navigation. Follow official IMD/INCOIS/State Fisheries advisories."*
4. **Confidence Computation:** System starts at 1.0 confidence and transparently subtracts penalties for cached age, cloud gaps, demo datasets, or model ambiguity.
