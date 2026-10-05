import json
import math
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
GEO_DIR = BASE_DIR / "app" / "data" / "geo"
DEMO_DIR = BASE_DIR / "app" / "data" / "demo"
TRACKS_DIR = DEMO_DIR / "vessel_tracks"
CACHE_DIR = BASE_DIR / "app" / "data" / "cache"

for d in [GEO_DIR, DEMO_DIR, TRACKS_DIR, CACHE_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# 1. Ports and Fish Landing Centres (40+ across 9 states/UTs with multilingual names)
PORTS = [
    # Tamil Nadu
    {"id": "chennai_kasimedu", "name": "Kasimedu Fishing Harbour", "district": "Chennai", "state": "Tamil Nadu", "lat": 13.1250, "lon": 80.2980, "names": {"ta": "காசிமேடு மீன்பிடித் துறைமுகம்", "hi": "कासिमेडु मत्स्य बंदरगाह"}},
    {"id": "mandapam", "name": "Mandapam Landing Centre", "district": "Ramanathapuram", "state": "Tamil Nadu", "lat": 9.2780, "lon": 79.1250, "names": {"ta": "மண்டபம் இறங்குதளம்", "hi": "मंडपम लैंडिंग केंद्र"}},
    {"id": "rameswaram", "name": "Rameswaram Fishing Jetty", "district": "Ramanathapuram", "state": "Tamil Nadu", "lat": 9.2876, "lon": 79.3129, "names": {"ta": "ராமேஸ்வரம் மீன்பிடி தளம்", "hi": "रामेश्वरम मत्स्य जेटी"}},
    {"id": "nagapattinam", "name": "Nagapattinam Port", "district": "Nagapattinam", "state": "Tamil Nadu", "lat": 10.7667, "lon": 79.8500, "names": {"ta": "நாகப்பட்டினம் துறைமுகம்", "hi": "नागपट्टिनम बंदरगाह"}},
    {"id": "tuticorin_harbour", "name": "Thoothukudi (Tuticorin) Harbour", "district": "Thoothukudi", "state": "Tamil Nadu", "lat": 8.7642, "lon": 78.1348, "names": {"ta": "தூத்துக்குடி மீன்பிடித் துறைமுகம்", "hi": "थूथुकुडी बंदरगाह"}},
    {"id": "kanyakumari_chinnamuttam", "name": "Chinnamuttam Fishing Harbour", "district": "Kanyakumari", "state": "Tamil Nadu", "lat": 8.0961, "lon": 77.5611, "names": {"ta": "சின்னமுட்டம் மீன்பிடித் துறைமுகம்", "hi": "चिन्नमुट्टम बंदरगाह"}},
    {"id": "cuddalore", "name": "Cuddalore Old Town Harbour", "district": "Cuddalore", "state": "Tamil Nadu", "lat": 11.7480, "lon": 79.7714, "names": {"ta": "கடலூர் மீன்பிடித் துறைமுகம்", "hi": "कडलूर बंदरगाह"}},
    
    # Gujarat
    {"id": "veraval", "name": "Veraval Fishing Harbour", "district": "Gir Somnath", "state": "Gujarat", "lat": 20.9000, "lon": 70.3667, "names": {"gu": "વેરાવળ મત્સ્ય બંદર", "hi": "वेरावल मत्स्य बंदरगाह"}},
    {"id": "porbandar", "name": "Porbandar Harbour", "district": "Porbandar", "state": "Gujarat", "lat": 21.6417, "lon": 69.6083, "names": {"gu": "પોરબંદર બંદર", "hi": "पोरबंदर बंदरगाह"}},
    {"id": "okha", "name": "Okha Port", "district": "Devbhumi Dwarka", "state": "Gujarat", "lat": 22.4667, "lon": 69.0667, "names": {"gu": "ઓખા બંદર", "hi": "ओखा बंदरगाह"}},
    {"id": "mangrol", "name": "Mangrol Landing Centre", "district": "Junagadh", "state": "Gujarat", "lat": 21.1167, "lon": 70.1167, "names": {"gu": "માંગરોળ લેન્ડિંગ સેન્ટર", "hi": "मांगरोल लैंडिंग केंद्र"}},
    {"id": "jafrabad", "name": "Jafrabad Fishing Jetty", "district": "Amreli", "state": "Gujarat", "lat": 20.8667, "lon": 71.3667, "names": {"gu": "જાફરાબાદ મત્સ્ય જેટી", "hi": "जाफराबाद जेटी"}},
    {"id": "jakhau", "name": "Jakhau Port", "district": "Kutch", "state": "Gujarat", "lat": 23.2333, "lon": 68.7000, "names": {"gu": "જખૌ બંદર", "hi": "जखौ बंदरगाह"}},
    
    # Kerala
    {"id": "kochi_thoppumpady", "name": "Kochi (Thoppumpady) Harbour", "district": "Ernakulam", "state": "Kerala", "lat": 9.9312, "lon": 76.2673, "names": {"ml": "തോപ്പുംപടി ഫിഷിംഗ് ഹാർബർ, കൊച്ചി", "hi": "कोच्चि मत्स्य बंदरगाह"}},
    {"id": "vizhinjam", "name": "Vizhinjam Harbour", "district": "Thiruvananthapuram", "state": "Kerala", "lat": 8.3753, "lon": 76.9930, "names": {"ml": "വിഴിഞ്ഞം ഹാർബർ", "hi": "विझिंजम बंदरगाह"}},
    {"id": "munambam", "name": "Munambam Fishing Harbour", "district": "Ernakulam", "state": "Kerala", "lat": 10.1833, "lon": 76.1667, "names": {"ml": "മുനമ്പം ഫിഷിംഗ് ഹാർബർ", "hi": "मुनंबम बंदरगाह"}},
    {"id": "sakthikulangara", "name": "Sakthikulangara Harbour", "district": "Kollam", "state": "Kerala", "lat": 8.9333, "lon": 76.5333, "names": {"ml": "ശക്തികുളങ്ങര ഹാർബർ", "hi": "शक्तिकुलंगरा बंदरगाह"}},
    {"id": "beypore", "name": "Beypore Port", "district": "Kozhikode", "state": "Kerala", "lat": 11.1667, "lon": 75.8000, "names": {"ml": "ബേപ്പൂർ തുറമുഖം", "hi": "बेपोर बंदरगाह"}},
    {"id": "thottappally", "name": "Thottappally Spillway Centre", "district": "Alappuzha", "state": "Kerala", "lat": 9.3167, "lon": 76.3833, "names": {"ml": "തോട്ടപ്പള്ളി ഫിഷിംഗ് സെന്റർ", "hi": "थोट्टापल्ली केंद्र"}},
    
    # Andhra Pradesh
    {"id": "visakhapatnam_fh", "name": "Visakhapatnam Fishing Harbour", "district": "Visakhapatnam", "state": "Andhra Pradesh", "lat": 17.6868, "lon": 83.2185, "names": {"te": "విశాఖపట్నం ఫిషింగ్ హార్బర్", "hi": "विशाखापट्टनम मत्स्य बंदरगाह"}},
    {"id": "kakinada_fh", "name": "Kakinada Fishing Harbour", "district": "Kakinada", "state": "Andhra Pradesh", "lat": 16.9891, "lon": 82.2475, "names": {"te": "కాకినాడ ఫిషింగ్ హార్బర్", "hi": "काकीनाडा बंदरगाह"}},
    {"id": "machilipatnam", "name": "Machilipatnam (Gilakaladindi)", "district": "Krishna", "state": "Andhra Pradesh", "lat": 16.1667, "lon": 81.1667, "names": {"te": "మచిలీపట్నం రేవు", "hi": "मछिलिपटनम"}},
    {"id": "nizampatnam", "name": "Nizampatnam Harbour", "district": "Bapatla", "state": "Andhra Pradesh", "lat": 15.9000, "lon": 80.6667, "names": {"te": "నిజాంపట్నం హార్బర్", "hi": "निजामपट्टनम"}},
    {"id": "krishnapatnam", "name": "Krishnapatnam Port", "district": "Nellore", "state": "Andhra Pradesh", "lat": 14.2500, "lon": 80.1167, "names": {"te": "కృష్ణపట్నం పోర్ట్", "hi": "कृष्णपट्टनम"}},
    
    # Karnataka
    {"id": "mangalore_old_port", "name": "Mangalore (Dhakke) Old Port", "district": "Dakshina Kannada", "state": "Karnataka", "lat": 12.8533, "lon": 74.8344, "names": {"kn": "ಮಂಗಳೂರು ಧಕ್ಕೆ ಮೀನುಗಾರಿಕಾ ಬಂದರು", "hi": "मंगलुरु पुराना बंदरगाह"}},
    {"id": "malpe_harbour", "name": "Malpe Fishing Harbour", "district": "Udupi", "state": "Karnataka", "lat": 13.3500, "lon": 74.7000, "names": {"kn": "ಮಲ್ಪೆ ಮೀನುಗಾರಿಕಾ ಬಂದರು", "hi": "माल्पे बंदरगाह"}},
    {"id": "karwar_baithkol", "name": "Karwar (Baithkol) Harbour", "district": "Uttara Kannada", "state": "Karnataka", "lat": 14.8000, "lon": 74.1167, "names": {"kn": "ಕಾರವಾರ ಬೈತ್ಕೋಲ್ ಬಂದರು", "hi": "कारवार बंदरगाह"}},
    {"id": "honnavar", "name": "Honnavar Jetty", "district": "Uttara Kannada", "state": "Karnataka", "lat": 14.2833, "lon": 74.4500, "names": {"kn": "ಹೊನ್ನಾವರ ಜೆಟ್ಟಿ", "hi": "होन्नावर जेटी"}},
    {"id": "gangolli", "name": "Gangolli Port", "district": "Udupi", "state": "Karnataka", "lat": 13.6333, "lon": 74.6833, "names": {"kn": "ಗಂಗೊಳ್ಳಿ ಬಂದರು", "hi": "गंगोली"}},
    
    # Maharashtra
    {"id": "sassoon_dock", "name": "Sassoon Dock, Mumbai", "district": "Mumbai", "state": "Maharashtra", "lat": 18.9133, "lon": 72.8250, "names": {"mr": "ससून डॉक, मुंबई", "hi": "ससून डॉक, मुंबई"}},
    {"id": "bhaucha_dhakka", "name": "Bhaucha Dhakka (Ferry Wharf)", "district": "Mumbai", "state": "Maharashtra", "lat": 18.9500, "lon": 72.8500, "names": {"mr": "भाऊचा धक्का", "hi": "भाउचा धक्का"}},
    {"id": "ratnagiri_mirkarwada", "name": "Mirkarwada Harbour, Ratnagiri", "district": "Ratnagiri", "state": "Maharashtra", "lat": 16.9833, "lon": 73.2833, "names": {"mr": "मिरकरवाडा बंदर, रत्नागिरी", "hi": "रत्नागिरी मिरकरवाड़ा"}},
    {"id": "malvan_jetty", "name": "Malvan Fishing Jetty", "district": "Sindhudurg", "state": "Maharashtra", "lat": 16.0667, "lon": 73.4667, "names": {"mr": "मालवण जेट्टी", "hi": "मालवण जेटी"}},
    {"id": "satpati", "name": "Satpati Fishermen Jetty", "district": "Palghar", "state": "Maharashtra", "lat": 19.7333, "lon": 72.7000, "names": {"mr": "सातपाटी जेट्टी", "hi": "सातपाटी"}},
    
    # Odisha
    {"id": "paradip_fh", "name": "Paradip Fishing Harbour", "district": "Jagatsinghpur", "state": "Odisha", "lat": 20.3167, "lon": 86.6833, "names": {"or": "ପାରାଦୀପ ମତ୍ସ୍ୟ ବନ୍ଦର", "hi": "पारादीप मत्स्य बंदरगाह"}},
    {"id": "dhamra", "name": "Dhamra Port / Landing Centre", "district": "Bhadrak", "state": "Odisha", "lat": 20.8000, "lon": 86.9500, "names": {"or": "ଧାମରା ବନ୍ଦର", "hi": "धामरा बंदरगाह"}},
    {"id": "puri_pentakota", "name": "Pentakota Landing Centre, Puri", "district": "Puri", "state": "Odisha", "lat": 19.8000, "lon": 85.8333, "names": {"or": "ପେଣ୍ଠକଟା, ପୁରୀ", "hi": "पूरी पेंटकोटा"}},
    {"id": "bahabalpur", "name": "Bahabalpur Landing Centre", "district": "Balasore", "state": "Odisha", "lat": 21.5167, "lon": 87.0667, "names": {"or": "ବାହାବଳପୁର", "hi": "बहाबलपुर"}},
    {"id": "gopalpur", "name": "Gopalpur Port", "district": "Ganjam", "state": "Odisha", "lat": 19.2667, "lon": 84.9000, "names": {"or": "ଗୋପାଳପୁର ବନ୍ଦର", "hi": "गोपालपुर"}},
    
    # West Bengal
    {"id": "digha_shankarpur", "name": "Shankarpur Fishing Harbour, Digha", "district": "Purba Medinipur", "state": "West Bengal", "lat": 21.6333, "lon": 87.5667, "names": {"bn": "শঙ্করপুর মৎস্য বন্দর, দিঘা", "hi": "दीघा शंकरपुर बंदरगाह"}},
    {"id": "kakdwip", "name": "Kakdwip Fishing Harbour", "district": "South 24 Parganas", "state": "West Bengal", "lat": 21.8667, "lon": 88.1833, "names": {"bn": "কাকদ্বীপ মৎস্য বন্দর", "hi": "काकद्वीप"}},
    {"id": "namkhana", "name": "Namkhana Jetty", "district": "South 24 Parganas", "state": "West Bengal", "lat": 21.7667, "lon": 88.2333, "names": {"bn": "নামখানা জেটি", "hi": "नामखाना"}},
    {"id": "frazerganj", "name": "Frazerganj Fishing Centre", "district": "South 24 Parganas", "state": "West Bengal", "lat": 21.5833, "lon": 88.2500, "names": {"bn": "ফ্রেজারগঞ্জ", "hi": "फ्रेजरगंज"}},
    
    # Goa & UTs
    {"id": "panaji_malim", "name": "Malim Fishing Jetty, Goa", "district": "North Goa", "state": "Goa", "lat": 15.5050, "lon": 73.8350, "names": {"mr": "मालिम जेट्टी, गोवा", "hi": "मालिम जेटी, गोवा"}},
    {"id": "puducherry_fh", "name": "Puducherry Fishing Harbour", "district": "Puducherry", "state": "Puducherry", "lat": 11.9167, "lon": 79.8333, "names": {"ta": "புதுச்சேரி மீன்பிடித் துறைமுகம்", "hi": "पुदुचेरी बंदरगाह"}},
]

ports_geojson = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "id": p["id"],
                "name": p["name"],
                "district": p["district"],
                "state": p["state"],
                "names": p["names"],
                "disclaimer": "Indicative port coordinates for landing reference."
            },
            "geometry": {
                "type": "Point",
                "coordinates": [p["lon"], p["lat"]]
            }
        }
        for p in PORTS
    ]
}

with open(GEO_DIR / "ports_landing_centres.geojson", "w", encoding="utf-8") as f:
    json.dump(ports_geojson, f, ensure_ascii=False, indent=2)

# 2. Indicative IMBL & EEZ Boundaries
# Palk Strait / Gulf of Mannar (India-Sri Lanka), Sir Creek / Gujarat (India-Pakistan), Bay of Bengal (India-Bangladesh)
IMBL_FEATURES = [
    {
        "type": "Feature",
        "properties": {
            "name": "India - Sri Lanka IMBL (Palk Strait & Gulf of Mannar)",
            "tier": "CRITICAL",
            "type": "IMBL",
            "disclaimer": "Indicative boundary for decision support — not for legal navigation. Follow official charts/authorities."
        },
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [79.8400, 10.0800],
                [79.5200, 9.8000],
                [79.3780, 9.5300],
                [79.3100, 9.3630],
                [79.3500, 9.1000],
                [79.2500, 8.8000],
                [78.9000, 8.3500]
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "India - Pakistan Maritime Boundary (Sir Creek / Gujarat)",
            "tier": "CRITICAL",
            "type": "IMBL",
            "disclaimer": "Indicative boundary for decision support — not for legal navigation. Follow official charts/authorities."
        },
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [68.1200, 23.6000],
                [67.8000, 23.3000],
                [67.4000, 23.0000],
                [66.5000, 22.3000],
                [65.5000, 21.0000]
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "India - Bangladesh Maritime Boundary Line",
            "tier": "CRITICAL",
            "type": "IMBL",
            "disclaimer": "Indicative boundary for decision support — not for legal navigation."
        },
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [89.1500, 21.6500],
                [89.2500, 21.2000],
                [89.4000, 20.6000],
                [89.8000, 19.5000],
                [90.4000, 18.0000]
            ]
        }
    }
]

imbl_geojson = {
    "type": "FeatureCollection",
    "features": IMBL_FEATURES
}

with open(GEO_DIR / "imbl_eez_indicative.geojson", "w", encoding="utf-8") as f:
    json.dump(imbl_geojson, f, ensure_ascii=False, indent=2)

# 3. Marine Protected Areas (MPAs)
MPA_FEATURES = [
    {
        "type": "Feature",
        "properties": {
            "name": "Gulf of Mannar Marine National Park",
            "state": "Tamil Nadu",
            "restriction": "Strict No-Fishing Core Zone in 21 Islands",
            "tier": "CRITICAL",
            "disclaimer": "Indicative MPA boundaries."
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [78.8000, 9.2500],
                [79.2500, 9.2500],
                [79.2500, 8.9000],
                [78.4000, 8.6000],
                [78.2000, 8.7500],
                [78.8000, 9.2500]
            ]]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Marine National Park, Gulf of Kutch",
            "state": "Gujarat",
            "restriction": "Protected Coral Reef & Mangrove Sanctuary",
            "tier": "CRITICAL",
            "disclaimer": "Indicative MPA boundaries."
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [69.0000, 22.4500],
                [70.2000, 22.8000],
                [70.5000, 22.6500],
                [69.2000, 22.3000],
                [69.0000, 22.4500]
            ]]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Gahirmatha Marine Sanctuary (Olive Ridley Nesting)",
            "state": "Odisha",
            "restriction": "Seasonal Strict Trawling & Mechanised Ban (Nov - May)",
            "tier": "CRITICAL",
            "disclaimer": "Indicative MPA boundaries."
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [86.8000, 20.8000],
                [87.2000, 20.8500],
                [87.3500, 20.5000],
                [86.9000, 20.4000],
                [86.8000, 20.8000]
            ]]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Malvan Marine Sanctuary",
            "state": "Maharashtra",
            "restriction": "Core Marine Biodiversity Zone",
            "tier": "ALERT",
            "disclaimer": "Indicative MPA boundaries."
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [73.4000, 16.0800],
                [73.5200, 16.0800],
                [73.5200, 15.9800],
                [73.4000, 15.9800],
                [73.4000, 16.0800]
            ]]
        }
    }
]

mpa_geojson = {
    "type": "FeatureCollection",
    "features": MPA_FEATURES
}

with open(GEO_DIR / "marine_protected_areas.geojson", "w", encoding="utf-8") as f:
    json.dump(mpa_geojson, f, ensure_ascii=False, indent=2)

# 4. Seasonal Fishing Bans
BANS = {
    "east_coast": {
        "coasts": ["Tamil Nadu", "Andhra Pradesh", "Odisha", "West Bengal", "Puducherry"],
        "start_month_day": "04-15",
        "end_month_day": "06-14",
        "description": "Uniform 61-day ban on East Coast during peak breeding season (April 15 to June 14). Verify with State Fisheries Dept."
    },
    "west_coast": {
        "coasts": ["Kerala", "Karnataka", "Goa", "Maharashtra", "Gujarat"],
        "start_month_day": "06-01",
        "end_month_day": "07-31",
        "description": "Uniform 61-day monsoon ban on West Coast (June 1 to July 31). Traditional non-motorised craft exempt in specific zones."
    }
}

with open(GEO_DIR / "fishing_ban_zones.json", "w", encoding="utf-8") as f:
    json.dump(BANS, f, ensure_ascii=False, indent=2)

# 5. Bundled Demo PFZ sample (Official INCOIS PFZ advisory sample labelled DEMO)
PFZ_SAMPLE = {
    "type": "FeatureCollection",
    "properties": {
        "source": "Official INCOIS PFZ Advisory (Bundled Sample)",
        "badge": "DEMO",
        "valid_date": "2026-10-01",
        "disclaimer": "Bundled sample advisory for demonstration. Official operational PFZ is published daily by INCOIS."
    },
    "features": [
        {
            "type": "Feature",
            "properties": {
                "id": "pfz_chennai_1",
                "sector": "Chennai - Kasimedu",
                "bearing_deg": 115,
                "distance_km": 38.5,
                "depth_m": 45,
                "sst_c": 28.4,
                "chl_mg_m3": 0.85,
                "target_species": "Pelagics (Mackerel, Sardine, Tuna)",
                "source": "DEMO",
                "type": "Official INCOIS PFZ"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [80.6000, 13.0000],
                    [80.6800, 13.0200],
                    [80.7000, 12.9200],
                    [80.6100, 12.9000],
                    [80.6000, 13.0000]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "id": "pfz_nagapattinam_1",
                "sector": "Nagapattinam",
                "bearing_deg": 98,
                "distance_km": 42.0,
                "depth_m": 52,
                "sst_c": 28.1,
                "chl_mg_m3": 1.12,
                "target_species": "Carangids, Seer fish",
                "source": "DEMO",
                "type": "Official INCOIS PFZ"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [80.2000, 10.7500],
                    [80.3000, 10.7700],
                    [80.3200, 10.6600],
                    [80.2100, 10.6400],
                    [80.2000, 10.7500]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "id": "pfz_veraval_1",
                "sector": "Veraval Offshore",
                "bearing_deg": 210,
                "distance_km": 32.0,
                "depth_m": 60,
                "sst_c": 27.5,
                "chl_mg_m3": 1.45,
                "target_species": "Ribbon fish, Croakers, Squid",
                "source": "DEMO",
                "type": "Official INCOIS PFZ"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [70.1800, 20.6500],
                    [70.2800, 20.6800],
                    [70.3000, 20.5700],
                    [70.1900, 20.5400],
                    [70.1800, 20.6500]
                ]]
            }
        }
    ]
}

with open(DEMO_DIR / "pfz_sample.geojson", "w", encoding="utf-8") as f:
    json.dump(PFZ_SAMPLE, f, ensure_ascii=False, indent=2)

# 6. Cyclone Scenario (Severe Cyclonic Storm "Sagarika" in Bay of Bengal)
CYCLONE_SCENARIO = {
    "name": "Severe Cyclonic Storm 'Sagarika'",
    "basin": "North Indian Ocean (Bay of Bengal)",
    "current_stage": "Cyclone Warning (Orange Message)",
    "imd_stage_level": 3,
    "source_badge": "DEMO",
    "issued_time_ist": "2026-10-01 06:00 IST",
    "central_pressure_hpa": 984,
    "max_sustained_winds_kmh": 105,
    "gusts_kmh": 125,
    "fishermen_warning": "High risk: Total suspension of fishing operations along North Tamil Nadu, Puducherry and South Andhra Pradesh coasts. Fishermen out at sea advised to return to coast immediately.",
    "affected_coasts": ["North Tamil Nadu", "Puducherry", "South Andhra Pradesh"],
    "current_pos": {"lat": 12.10, "lon": 82.20},
    "track": [
        {"time": "Day -2", "lat": 10.50, "lon": 85.00, "stage": "Depression", "wind_kmh": 50},
        {"time": "Day -1", "lat": 11.20, "lon": 83.80, "stage": "Deep Depression", "wind_kmh": 65},
        {"time": "Current (00h)", "lat": 12.10, "lon": 82.20, "stage": "Severe Cyclonic Storm", "wind_kmh": 105},
        {"time": "+12h", "lat": 12.70, "lon": 81.30, "stage": "Severe Cyclonic Storm", "wind_kmh": 115},
        {"time": "+24h (Landfall)", "lat": 13.20, "lon": 80.40, "stage": "Landfall near Chennai/Pulicat", "wind_kmh": 110},
        {"time": "+36h", "lat": 13.80, "lon": 79.50, "stage": "Depression (Inland)", "wind_kmh": 55}
    ],
    "cone_polygon": [
        [85.00, 10.50],
        [83.80, 11.20],
        [82.20, 12.10],
        [80.80, 12.60],
        [79.80, 13.40],
        [79.20, 14.20],
        [80.20, 14.50],
        [81.80, 13.80],
        [83.20, 12.80],
        [84.50, 11.90],
        [85.00, 10.50]
    ],
    "wind_radii": {
        "gale_radius_km": 90,
        "storm_radius_km": 180,
        "rough_sea_radius_km": 300
    }
}

with open(DEMO_DIR / "cyclone_scenario.json", "w", encoding="utf-8") as f:
    json.dump(CYCLONE_SCENARIO, f, ensure_ascii=False, indent=2)

# 7. Vessel Simulation Tracks
# Track 1: Palk Bay heading toward IMBL
palk_bay_track = {
    "id": "palk_bay_imbl",
    "name": "Mandapam Trawler Heading toward Sri Lanka IMBL",
    "description": "Vessel leaves Mandapam port and moves eastward across Palk Bay, triggering Advisory (10nm), Alert (5nm), and Critical (2nm) IMBL geofence warnings.",
    "start_port": "Mandapam Landing Centre",
    "waypoints": [
        {"step": 0, "lat": 9.2780, "lon": 79.1250, "speed_knots": 8, "heading": 85, "note": "Departing Mandapam Harbour"},
        {"step": 1, "lat": 9.2830, "lon": 79.1950, "speed_knots": 9, "heading": 85, "note": "Cruising east in Indian territorial waters"},
        {"step": 2, "lat": 9.2900, "lon": 79.2600, "speed_knots": 9, "heading": 85, "note": "Passing north of Rameswaram Island"},
        {"step": 3, "lat": 9.3000, "lon": 79.3200, "speed_knots": 9, "heading": 85, "note": "Approaching IMBL 10 nm buffer — Advisory Tier"},
        {"step": 4, "lat": 9.3100, "lon": 79.3700, "speed_knots": 9, "heading": 85, "note": "Inside 5 nm Alert zone — Warning to turn back"},
        {"step": 5, "lat": 9.3200, "lon": 79.4100, "speed_knots": 9, "heading": 85, "note": "CRITICAL: 1.2 nm from Sri Lanka IMBL — Turn-back heading 265° recommended"}
    ]
}

# Track 2: Cyclone Escape Track
cyclone_escape_track = {
    "id": "cyclone_escape",
    "name": "Offshore Vessel Escaping Approaching Cyclone",
    "description": "Vessel 75 km offshore Chennai detects worsening waves (>3.2m) and gale winds, navigating safely back to Kasimedu harbour.",
    "start_port": "Chennai Kasimedu",
    "waypoints": [
        {"step": 0, "lat": 13.1500, "lon": 80.9500, "speed_knots": 10, "heading": 270, "note": "Offshore fishing ground — Wind 55 km/h, Wave 3.4m (No-Go)"},
        {"step": 1, "lat": 13.1450, "lon": 80.7500, "speed_knots": 11, "heading": 270, "note": "Executing emergency return protocol"},
        {"step": 2, "lat": 13.1400, "lon": 80.5500, "speed_knots": 11, "heading": 270, "note": "Entering coastal shelf — Wave 2.2m"},
        {"step": 3, "lat": 13.1300, "lon": 80.3800, "speed_knots": 8, "heading": 270, "note": "Approaching outer anchorage Chennai"},
        {"step": 4, "lat": 13.1250, "lon": 80.2980, "speed_knots": 4, "heading": 270, "note": "Safely berthed at Kasimedu Fishing Harbour"}
    ]
}

# Track 3: MPA Approach
mpa_approach_track = {
    "id": "mpa_approach",
    "name": "Vessel Approaching Gulf of Mannar Protected Coral Reef",
    "description": "Vessel approaching strict No-Fishing zone of Gulf of Mannar Marine National Park.",
    "start_port": "Thoothukudi Harbour",
    "waypoints": [
        {"step": 0, "lat": 8.7642, "lon": 78.1348, "speed_knots": 9, "heading": 65, "note": "Departing Thoothukudi"},
        {"step": 1, "lat": 8.8200, "lon": 78.2500, "speed_knots": 9, "heading": 65, "note": "Approaching outer MPA buffer zone (Advisory)"},
        {"step": 2, "lat": 8.8700, "lon": 78.3500, "speed_knots": 9, "heading": 65, "note": "Alert: Entering 2 nm buffer of Coral Sanctuary"},
        {"step": 3, "lat": 8.9100, "lon": 78.4300, "speed_knots": 9, "heading": 65, "note": "CRITICAL: Near Marine NP Boundary — Fishing Prohibited"}
    ]
}

for track in [palk_bay_track, cyclone_escape_track, mpa_approach_track]:
    with open(TRACKS_DIR / f"{track['id']}.json", "w", encoding="utf-8") as f:
        json.dump(track, f, ensure_ascii=False, indent=2)

# 8. Productivity Decline Anomaly Data (Gulf of Mannar / Palk Bay 60-day & 5-year climatology)
anomaly_data = {
    "region": "Gulf of Mannar & Palk Bay",
    "lat": 9.15,
    "lon": 79.10,
    "source_badge": "DEMO",
    "summary": "Satellite indicators show a sustained warm SST anomaly (+1.2°C above 5-year mean) and a 34% drop in Chlorophyll-a over the past 3 weeks, accompanied by weakened coastal upwelling.",
    "hypotheses": [
        {
            "rank": 1,
            "title": "Marine Heatwave & Thermal Stratification",
            "confidence": 0.85,
            "evidence": "SST has exceeded the 90th percentile climatological threshold (+1.2°C anomaly) for 16 consecutive days, suppressing nutrient upwelling.",
            "impact": "High: Pelagic fish schools (sardines/mackerel) migrate deeper or disperse away from warm surface waters."
        },
        {
            "rank": 2,
            "title": "Weakened Coastal Wind-Driven Upwelling",
            "confidence": 0.75,
            "evidence": "Alongshore southwest monsoon winds averaged only 14 km/h vs climatological 28 km/h, reducing Ekman pumping of nutrients.",
            "impact": "Moderate to High: Primary chlorophyll production fell from 1.4 mg/m³ to 0.65 mg/m³."
        },
        {
            "rank": 3,
            "title": "Post-Monsoon Turbidity & River Discharge Gaps",
            "confidence": 0.60,
            "evidence": "Low regional runoff reduced coastal nutrient influx compared to previous 3-year averages.",
            "impact": "Low to Moderate: Localized nearshore impact."
        }
    ],
    "caveat": "Satellite indicators show strong oceanographic correlation; actual fish catch confirmation requires State Fisheries landing centre catch records.",
    "time_series": [
        {"day": f"Day -{60-i}", "date": f"2026-08-{i+1:02d}" if i < 31 else f"2026-09-{i-30:02d}", "sst_actual": round(28.2 + 0.02*i + (0.5 if i > 40 else 0), 2), "sst_baseline": 28.1, "chl_actual": round(max(0.4, 1.4 - 0.015*i), 2), "chl_baseline": 1.25}
        for i in range(60)
    ]
}

with open(DEMO_DIR / "productivity_anomaly_mannar.json", "w", encoding="utf-8") as f:
    json.dump(anomaly_data, f, ensure_ascii=False, indent=2)

# 9. Synthetic SST & Chlorophyll Grids for Arabian Sea and Bay of Bengal
# Grid dimensions: 40x40 points covering key coastal domains
def make_grid(lat_min, lat_max, lon_min, lon_max, base_sst, sst_grad_dir, base_chl):
    lats = [round(lat_min + i*(lat_max-lat_min)/30, 3) for i in range(30)]
    lons = [round(lon_min + j*(lon_max-lon_min)/30, 3) for j in range(30)]
    cells = []
    for lat in lats:
        for lon in lons:
            # Add thermal gradient and eddy front
            dist_to_front = math.sin((lat - lat_min)*0.8) + math.cos((lon - lon_min)*0.8)
            sst = round(base_sst + 1.8 * math.sin(lat*0.5 + lon*0.3) + (0.8 if dist_to_front > 0.5 else -0.5), 2)
            chl = round(max(0.15, base_chl * (1.2 + 0.9 * math.sin(lon*0.6) - 0.4 * math.cos(lat*0.7))), 3)
            # Cloud mask simulation (10% cloud gap in northern patch)
            is_cloud = (lat > lat_max - 1.0 and lon > lon_max - 1.0)
            cells.append({
                "lat": lat,
                "lon": lon,
                "sst_c": None if is_cloud else sst,
                "chl_mg_m3": None if is_cloud else chl,
                "cloud": is_cloud
            })
    return {"bbox": [lon_min, lat_min, lon_max, lat_max], "grid": cells}

bay_of_bengal_grid = make_grid(10.0, 15.0, 79.5, 83.5, 28.0, "E", 0.95)
arabian_sea_grid = make_grid(19.0, 23.0, 68.5, 72.5, 27.2, "W", 1.20)

with open(DEMO_DIR / "sst_chl_grids.json", "w", encoding="utf-8") as f:
    json.dump({
        "bay_of_bengal": bay_of_bengal_grid,
        "arabian_sea": arabian_sea_grid,
        "source": "NOAA CoastWatch VIIRS / Copernicus Blend (Synthetic Bundled DEMO)",
        "badge": "DEMO"
    }, f, ensure_ascii=False, indent=2)

print("Demo data generation complete! All files written to data/geo and data/demo.")
