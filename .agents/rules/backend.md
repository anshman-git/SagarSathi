# Backend Architecture & Agent Rules

1. **FastAPI & Async:** Use async endpoints and `httpx.AsyncClient` with resilient timeouts (≤ 8s) and single retry before falling back to cached or demo data.
2. **Agent Interface:** Every agent is a class implementing `async def run(self, state: AgentState) -> dict`. State is strictly typed using Pydantic v2.
3. **SSE Streaming:** Real-time event stream `/api/chat` supporting `trace`, `partial`, `map`, `chart`, `evidence`, `alert`, and `final` payloads.
4. **Offline First:** If `GEMINI_API_KEY` is not present, use the deterministic rule-based planner and multilingual phrase bank. The entire app must function without keys.
5. **Analytics Integrity:**
   - `pfz.py`: SST thermal gradient calculation $|∇SST|$ using Gaussian smoothing and central differences + percentile ranking fused with Log10(Chl-a).
   - `safety.py`: Multi-factor threshold matrix evaluated against vessel profiles (`non_motorised`, `small_motorised`, `mechanised`).
   - `geofence.py`: Distance and bearing to IMBL/EEZ/MPAs via Shapely projected CRS with 3 tiers (Advisory, Alert, Critical).
   - `routing.py`: Grid-based A* routing avoiding land and hazard cells.
6. **No Hallucinated Data:** The LLM receives structured facts and phrases the response. It is strictly forbidden from changing computed figures or fabricating safety verdicts.
