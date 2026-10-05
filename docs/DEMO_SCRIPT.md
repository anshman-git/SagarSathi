# SagarMitra — 3-Minute Live SIH Demo Script

This script walks judges through the 5 core differentiators of SagarMitra in 180 seconds.

---

### [00:00 - 00:30] Introduction & Problem Setup
- **Action:** Open [http://localhost:3000](http://localhost:3000). Show the landing page and the Data Honesty chip (`LIVE + VERIFIED`).
- **Pitch:** *"Respected judges, Indian fishermen face scattered data portals that don't speak their language or answer practical questions like 'is it safe to sail tomorrow?'. SagarMitra is an agentic AI marine intelligence platform that unifies ISRO/INCOIS and IMD data into multilingual, explainable decisions."*

---

### [00:30 - 01:15] Demo 1: Multilingual PFZ & Live Agent Trace
- **Action:** Click "Launch Mission Dashboard", type or speak: `"Where is the nearest PFZ today?"`.
- **Key Visuals to Highlight:**
  1. Watch the **Agent Trace** live SSE stream: `ConversationAgent` detects language $\to$ `PlannerAgent` compiles DAG $\to$ `Weather`, `Ocean`, `Geospatial` agents run in parallel.
  2. Point out the **Derived PFZ Candidate** layer on the map with thermal front gradient ($0.42^\circ\text{C}/10\text{km}$) alongside the **Official INCOIS PFZ**.
  3. Show the **Evidence Cards** with dataset provenance and timestamps.

---

### [01:15 - 01:50] Demo 2: Regional Language & Multi-Factor Safety Matrix
- **Action:** Switch language to Tamil or Hindi, ask: `"कल सुबह समुद्र में जाना सुरक्षित है?"`.
- **Key Visuals to Highlight:**
  1. The reply is phrased fluently in Hindi with a structured Go/Caution verdict and departure window.
  2. Open the **Safety Matrix Factor Table**: show that significant wave height, sustained wind, swell surge (Kallakadal), and CAPE lightning proxies are evaluated against the selected vessel profile (`small_motorised`).

---

### [01:50 - 02:30] Demo 3: Vessel Simulator & IMBL Proactive Alerting
- **Action:** Navigate to `/alerts`. Select track *"Mandapam Trawler $\to$ Sri Lanka IMBL Border"*, set speed to $\times 5$, and click **Start Live Simulation**.
- **Key Visuals to Highlight:**
  1. As the vessel approaches the boundary, the status transitions from **Advisory (10 nm)** $\to$ **Alert (5 nm)** $\to$ **Critical (2 nm)**.
  2. Point out the full-screen Critical Takeover with recommended **Turn-Back Course ($265^\circ$)**.
  3. Click **"Broadcast Advisory"** to demonstrate the one-tap WhatsApp/SMS card preview.

---

### [02:30 - 03:00] Demo 4: Scientific Anomaly Reasoning & Architecture Health
- **Action:** Ask: `"Why has productivity declined near Gulf of Mannar?"`.
- **Key Visuals to Highlight:**
  1. SagarMitra identifies a **Marine Heatwave ($+1.2^\circ\text{C}$)** and a **34% drop in Chlorophyll-a**, ranking hypotheses with scientific caveats.
  2. Open `/about` to display the **12-Agent Registry** and live API adapter latency matrix.
- **Closing:** *"SagarMitra runs with zero API keys in demo mode, integrates live satellite telemetry, and ensures fishermen make safe, profitable, and informed decisions."*
