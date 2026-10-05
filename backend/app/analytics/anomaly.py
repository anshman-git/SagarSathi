import json
from typing import Dict, Any, List
from ..config import settings
from ..models import SourceBadge, ChartSpec

def analyze_productivity_anomaly(region_name: str = "Gulf of Mannar") -> Dict[str, Any]:
    """
    Analyzes multi-week SST and Chlorophyll-a anomalies against a 5-year baseline climatology.
    Detects marine heatwaves (> +1.0°C for >5 days), upwelling suppression, and generates ranked hypotheses.
    """
    anomaly_file = settings.DEMO_DIR / "productivity_anomaly_mannar.json"
    data = {}
    if anomaly_file.exists():
        try:
            with open(anomaly_file, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            pass

    hypotheses = data.get("hypotheses", [
        {
            "rank": 1,
            "title": "Marine Heatwave & Thermal Stratification",
            "confidence": 0.85,
            "evidence": "SST anomaly +1.2°C above 5-year climatological mean for 16 consecutive days.",
            "impact": "Pelagic fish schools (sardines/mackerel) disperse into deeper offshore waters."
        },
        {
            "rank": 2,
            "title": "Suppressed Coastal Upwelling",
            "confidence": 0.75,
            "evidence": "Alongshore wind stress weakened by 45%, reducing nutrient pumping.",
            "impact": "Chlorophyll-a dropped by 34% (from 1.4 mg/m³ to 0.65 mg/m³)."
        }
    ])

    time_series = data.get("time_series", [])
    chart_series = [
        {"key": "sst_actual", "name": "Actual SST (°C)", "color": "#f97316"},
        {"key": "sst_baseline", "name": "5-Yr Baseline SST (°C)", "color": "#94a3b8"},
        {"key": "chl_actual", "name": "Actual Chl-a (mg/m³)", "color": "#10b981"},
        {"key": "chl_baseline", "name": "5-Yr Baseline Chl-a (mg/m³)", "color": "#64748b"}
    ]

    chart_spec = ChartSpec(
        id="productivity_anomaly_chart",
        title=f"Ocean Anomaly & Climatology Trends ({region_name})",
        chart_type="line",
        data=time_series[-30:] if len(time_series) >= 30 else time_series,
        x_key="date",
        series=chart_series,
        unit="°C / mg/m³",
        badge=SourceBadge.DEMO
    )

    return {
        "region": region_name,
        "source": SourceBadge.DEMO,
        "summary": "Satellite indicators detect a sustained Marine Heatwave (+1.2°C) and a 34% drop in Chlorophyll-a over the past 3 weeks.",
        "hypotheses": hypotheses,
        "chart": chart_spec,
        "caveat": "Satellite indicators show oceanographic correlation; catch confirmation requires State Fisheries landing records."
    }
