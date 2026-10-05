import re
from typing import Dict, Any, Tuple
from ..models import AgentState, EntityExtraction, LocationEntity, VesselProfile
from ..tools.geocoder import geocode_location

# Language detection heuristics based on Unicode character scripts
def detect_language(text: str) -> str:
    # Check Unicode blocks
    for ch in text:
        code = ord(ch)
        if 0x0900 <= code <= 0x097F:  # Devanagari (Hindi/Marathi)
            # Differentiate Marathi if common words appear
            if any(w in text for w in ["आहे", "नाही", "कसे", "सांगा", "मासेमारी"]):
                return "mr"
            return "hi"
        if 0x0B80 <= code <= 0x0BFF:  # Tamil
            return "ta"
        if 0x0C00 <= code <= 0x0C7F:  # Telugu
            return "te"
        if 0x0D00 <= code <= 0x0D7F:  # Malayalam
            return "ml"
        if 0x0C80 <= code <= 0x0CFF:  # Kannada
            return "kn"
        if 0x0B00 <= code <= 0x0B7F:  # Odia
            return "or"
        if 0x0980 <= code <= 0x09FF:  # Bengali
            return "bn"
        if 0x0A80 <= code <= 0x0AFF:  # Gujarati
            return "gu"
    return "en"

def classify_intent_rule(text: str) -> str:
    t = text.lower()
    if any(k in t for k in ["pfz", "fishing zone", "fish zone", "where are the fish", "catch fish", "மீன்பிடி", "मत्स्य क्षेत्र", "मछली", "చేపల", "മത്സ്യ"]):
        return "find_pfz"
    if any(k in t for k in ["cyclone", "storm", "lightning", "danger", "gale", "तूफान", "சூறாவளி", "తుఫాను", "ചുഴലിക്കാറ്റ്"]):
        return "hazard_alerts"
    if any(k in t for k in ["safe", "safety", "can i go", "go out", "सुरक्षित", "பாதுகாப்ப", "సురక్షిత", "സുരക്ഷിത"]):
        return "safety_check"
    if any(k in t for k in ["route", "safest route", "navigation", "way to", "मार्ग", "பாதை", "దారి", "വഴി"]):
        return "safe_route"
    if any(k in t for k in ["decline", "why fish declined", "low catch", "productivity", "मन्नार", "குறைந்த", "తగ్గ"]):
        return "productivity_decline_why"
    if any(k in t for k in ["avoid", "forbidden", "border", "imbl", "mpa", "எல்லை", "सीमा"]):
        return "avoid_zones"
    if any(k in t for k in ["wave", "wind", "swell", "sea condition", "வானிலை", "मौसम"]):
        return "sea_conditions"
    if any(k in t for k in ["why", "explain", "reason", "விளக்க"]):
        return "explain_last_answer"
    return "safety_check"

class ConversationAgent:
    """
    Handles language detection, natural-language intent classification,
    entity extraction (location, vessel profile, time window), and slot filling.
    """
    async def run(self, state: AgentState) -> Dict[str, Any]:
        detected_lang = detect_language(state.user_text)
        intent = classify_intent_rule(state.user_text)
        
        # Extract vessel profile if mentioned
        t = state.user_text.lower()
        vessel = state.entities.vessel_profile
        if "non-motorised" in t or "non motorised" in t or "catamaran" in t or "canoe" in t or "நாட்டுப் படகு" in t:
            vessel = VesselProfile.NON_MOTORISED
        elif "mechanised" in t or "trawler" in t or "विशाल नौका" in t or "விசைப்படகு" in t:
            vessel = VesselProfile.MECHANISED
        elif "small" in t or "motorised" in t:
            vessel = VesselProfile.SMALL_MOTORISED

        # Extract time window
        time_window = "today"
        if any(w in t for w in ["tomorrow", "कल", "நாளை", "రేపు", "നാളെ"]):
            time_window = "tomorrow"
        elif any(w in t for w in ["thursday", "गुरुवार", "வியாழன்", "గురువారం"]):
            time_window = "thursday"

        # Extract location via geocoder
        loc_match = await geocode_location(state.user_text)
        location_entity = state.entities.location
        if loc_match:
            location_entity = LocationEntity(
                name=loc_match["name"],
                lat=loc_match["lat"],
                lon=loc_match["lon"],
                region=loc_match.get("district", loc_match.get("state", "Indian Coast"))
            )
        elif not location_entity:
            location_entity = LocationEntity(name="Kasimedu Fishing Harbour, Chennai", lat=13.1250, lon=80.2980)

        return {
            "lang": detected_lang if not state.lang or state.lang == "en" else detected_lang,
            "intent": intent,
            "entities": EntityExtraction(
                location=location_entity,
                time_window=time_window,
                vessel_profile=vessel
            )
        }
