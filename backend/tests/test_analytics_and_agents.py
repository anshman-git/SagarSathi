import pytest
from backend.app.models import AgentState, VesselProfile, SafetyVerdictLevel, SourceBadge
from backend.app.analytics.pfz import score_pfz_candidates, calculate_distance_and_bearing
from backend.app.analytics.safety import evaluate_safety
from backend.app.analytics.geofence import check_geofence
from backend.app.analytics.routing import calculate_safe_route
from backend.app.i18n.phrase_bank import get_phrase
from backend.app.agents.conversation_agent import detect_language, classify_intent_rule

def test_distance_and_bearing():
    dist, bearing = calculate_distance_and_bearing(13.0, 80.0, 13.5, 80.5)
    assert dist > 50
    assert 0 <= bearing <= 360

def test_safety_evaluation_go():
    marine_data = {"current_wave_height": 0.8, "current_swell_period": 7.0, "current_swell_height": 0.5, "source": SourceBadge.LIVE}
    forecast_data = {"current_wind_speed_kmh": 12.0, "current_wind_gusts_kmh": 18.0, "current_cape": 150.0, "lightning_risk": False, "source": SourceBadge.LIVE}
    cyclone_data = {"has_active_cyclone": False, "source": SourceBadge.LIVE}

    verdict, factor_table, reasons = evaluate_safety(
        marine_data=marine_data,
        forecast_data=forecast_data,
        cyclone_data=cyclone_data,
        vessel_profile=VesselProfile.SMALL_MOTORISED
    )
    assert verdict.level == SafetyVerdictLevel.GO
    assert len(factor_table) >= 4

def test_safety_evaluation_no_go():
    marine_data = {"current_wave_height": 3.2, "current_swell_period": 10.0, "current_swell_height": 2.0, "source": SourceBadge.LIVE}
    forecast_data = {"current_wind_speed_kmh": 52.0, "current_wind_gusts_kmh": 65.0, "current_cape": 2200.0, "lightning_risk": True, "source": SourceBadge.LIVE}
    cyclone_data = {"has_active_cyclone": False, "source": SourceBadge.LIVE}

    verdict, factor_table, reasons = evaluate_safety(
        marine_data=marine_data,
        forecast_data=forecast_data,
        cyclone_data=cyclone_data,
        vessel_profile=VesselProfile.SMALL_MOTORISED
    )
    assert verdict.level == SafetyVerdictLevel.NO_GO

def test_geofence_check():
    # Test near Mandapam / Palk Bay IMBL (around 9.32, 79.40)
    res = check_geofence(9.32, 79.40, heading=85)
    assert res["distance_nm"] < 15.0
    assert res["tier"] in ["ADVISORY", "ALERT", "CRITICAL"]

def test_routing_calculation():
    res = calculate_safe_route(13.125, 80.298, 13.45, 80.65, VesselProfile.SMALL_MOTORISED)
    assert res.safest_distance_km > 0
    assert len(res.legs) == 2

def test_language_detection_and_phrases():
    assert detect_language("Where is the nearest fishing zone?") == "en"
    assert detect_language("कल सुबह समुद्र में जाना सुरक्षित है?") == "hi"
    assert detect_language("மண்டபம் அருகே கடல் நிலை எப்படி?") == "ta"
    assert detect_language("చేపల వేట ప్రాంతం ఎక్కడ ఉంది?") == "te"

    hi_phrase = get_phrase("hi", "verdict_go")
    assert "सुरक्षित" in hi_phrase
