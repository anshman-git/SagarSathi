from typing import Dict, Any, List
from ..models import AgentState, MapLayerSpec, ChartSpec, SourceBadge

class VisualizationAgent:
    """
    Transforms analysis, ocean grids, forecasts, and routes into MapLibre GL layers
    and Recharts time-series chart specifications.
    """
    async def run(self, state: AgentState) -> Dict[str, Any]:
        map_layers: List[MapLayerSpec] = []
        charts: List[ChartSpec] = []

        # 1. Base Static Geo Layers
        map_layers.append(MapLayerSpec(
            id="ports_layer",
            name="Landing Centres & Harbours",
            type="symbol",
            url="/api/layers/ports",
            visible=True,
            opacity=1.0,
            badge=SourceBadge.LIVE
        ))
        map_layers.append(MapLayerSpec(
            id="imbl_layer",
            name="IMBL & Maritime Boundaries (Indicative)",
            type="geojson",
            url="/api/layers/imbl",
            visible=True,
            opacity=0.9,
            badge=SourceBadge.DEMO
        ))
        map_layers.append(MapLayerSpec(
            id="mpa_layer",
            name="Marine Protected Areas (MPAs)",
            type="geojson",
            url="/api/layers/mpa",
            visible=True,
            opacity=0.6,
            badge=SourceBadge.DEMO
        ))

        # 2. Official PFZ Layer
        official_pfz = state.tool_results.get("official_pfz", {})
        if official_pfz.get("geojson"):
            map_layers.append(MapLayerSpec(
                id="pfz_official_layer",
                name="Official INCOIS PFZ (Advisory)",
                type="geojson",
                data=official_pfz.get("geojson"),
                visible=True,
                opacity=0.85,
                badge=SourceBadge.DEMO
            ))

        # 3. Derived PFZ Candidate Layer
        pfz_cand = state.tool_results.get("pfz_candidates", {})
        if pfz_cand.get("geojson"):
            map_layers.append(MapLayerSpec(
                id="pfz_derived_layer",
                name="SagarMitra Derived PFZ Candidates",
                type="geojson",
                data=pfz_cand.get("geojson"),
                visible=True,
                opacity=0.9,
                badge=SourceBadge.DEMO
            ))

        # 4. Route Layer
        if state.route:
            map_layers.append(MapLayerSpec(
                id="route_safest_layer",
                name="Recommended Safe Corridor",
                type="geojson",
                data={
                    "type": "FeatureCollection",
                    "features": [state.route.safest_route, state.route.direct_route]
                },
                visible=True,
                opacity=1.0,
                badge=SourceBadge.DEMO
            ))

        # 5. Charts (Hourly wave & wind forecast series)
        marine = state.tool_results.get("marine", {})
        forecast = state.tool_results.get("forecast", {})
        m_hourly = marine.get("hourly", {})
        f_hourly = forecast.get("hourly", {})

        times = m_hourly.get("time", [])[:24]
        waves = m_hourly.get("wave_height", [])[:24]
        winds = f_hourly.get("wind_speed_10m", [])[:24]
        swells = m_hourly.get("swell_wave_height", [])[:24]

        if times and waves:
            chart_data = []
            for i in range(min(len(times), len(waves))):
                t_str = times[i].split("T")[-1] if "T" in times[i] else str(i)
                chart_data.append({
                    "time": t_str,
                    "wave_height": waves[i],
                    "wind_speed": winds[i] if i < len(winds) else 15.0,
                    "swell_height": swells[i] if i < len(swells) else 0.8
                })

            charts.append(ChartSpec(
                id="marine_forecast_24h",
                title="24-Hour Wave, Wind & Swell Forecast",
                chart_type="composed",
                data=chart_data,
                x_key="time",
                series=[
                    {"key": "wave_height", "name": "Wave Height (m)", "color": "#38bdf8", "type": "area"},
                    {"key": "wind_speed", "name": "Wind Speed (km/h)", "color": "#f59e0b", "type": "line"},
                    {"key": "swell_height", "name": "Swell Height (m)", "color": "#a855f7", "type": "line"}
                ],
                unit="m / km/h",
                badge=marine.get("source", SourceBadge.LIVE)
            ))

        # Anomaly chart if present
        anom = state.tool_results.get("anomaly_analysis", {})
        if anom.get("chart"):
            charts.append(anom["chart"])

        return {
            "map_layers": map_layers,
            "charts": charts
        }
