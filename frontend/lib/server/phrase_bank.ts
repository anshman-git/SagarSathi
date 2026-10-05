/**
 * SagarMitra Multilingual Phrase Bank for 10 Indian coastal languages
 */

export const PHRASES: Record<string, Record<string, string>> = {
  en: {
    verdict_go: 'SAFE TO SAIL (GO)',
    verdict_caution: 'EXERCISE CAUTION',
    verdict_no_go: 'DO NOT VENTURE (NO-GO)',
    safe_window_msg: 'Safe departure window: {start} to {end}. Ensure return by {return_time}.',
    caution_wind_wave: 'Moderate wave height ({wave}m) and wind speed ({wind}km/h). Small craft should remain within 10 km of coast.',
    danger_storm_cyclone: 'Severe weather warning: Gale winds ({wind}km/h) and rough seas ({wave}m). IMD Fishermen advisory in effect.',
    pfz_found: 'Identified {count} high-potential fishing zones near {port}. Nearest zone is {dist} km at bearing {bearing}°. Thermal front gradient: {grad}°C/10km, Chlorophyll-a: {chl} mg/m³, SST: {sst}°C.',
    geofence_advisory: 'ADVISORY: You are {dist} nm from {boundary}. Keep awareness.',
    geofence_alert: 'ALERT: Within {dist} nm of {boundary}. Prepare to alter course.',
    geofence_critical: 'CRITICAL WARNING: 2 nm or less from {boundary}! Turn back immediately. Recommended heading: {heading}°. Distance: {dist} nm.',
    anomaly_mannar: 'Satellite telemetry indicates a marine heatwave (+{sst_anom}°C) and a {chl_drop}% chlorophyll drop in Gulf of Mannar, causing pelagic schools to disperse.',
    explain_simply: 'In simple terms: Sea is currently {status}. Waves are {wave}m, winds {wind}km/h. {recommendation}',
    disclaimer: 'Decision support only. Indicative boundaries — not for legal navigation. Follow official IMD/INCOIS advisories.'
  },
  hi: {
    verdict_go: 'समुद्र में जाना सुरक्षित है (GO)',
    verdict_caution: 'सावधानी बरतें (CAUTION)',
    verdict_no_go: 'समुद्र में बिल्कुल न जाएं (NO-GO)',
    safe_window_msg: 'सुरक्षित प्रस्थान समय: {start} से {end} तक। वापसी {return_time} तक सुनिश्चित करें।',
    caution_wind_wave: 'मध्यम लहरें ({wave}m) और हवा की गति ({wind}km/h)। छोटी नौकाएं तट से 10 किमी के भीतर रहें।',
    danger_storm_cyclone: 'गंभीर मौसम चेतावनी: तूफानी हवाएं ({wind}km/h) और अशांत समुद्र ({wave}m)। आईएमडी मछुआरा चेतावनी प्रभावी।',
    pfz_found: '{port} के पास {count} संभावित मत्स्य क्षेत्र (PFZ) मिले हैं। निकटतम क्षेत्र {dist} किमी, दिशा {bearing}° पर है। फ्रंट ग्रेडिएंट: {grad}°C/10km, क्लोरोफिल: {chl} mg/m³, सतही तापमान: {sst}°C।',
    geofence_advisory: 'सलाह: आप {boundary} से {dist} समुद्री मील दूर हैं।',
    geofence_alert: 'चेतावनी: {boundary} के {dist} समुद्री मील के भीतर हैं। मार्ग बदलने की तैयारी करें।',
    geofence_critical: 'गंभीर चेतावनी: {boundary} से मात्र {dist} समुद्री मील! तुरंत वापस मुड़ें। सुझाई गई दिशा: {heading}°।',
    anomaly_mannar: 'उपग्रह डेटा मन्नार की खाड़ी में समुद्री हीटवेव (+{sst_anom}°C) और क्लोरोफिल में {chl_drop}% की गिरावट दर्शाता है।',
    explain_simply: 'सरल शब्दों में: समुद्र की स्थिति {status} है। लहरें {wave}m और हवा {wind}km/h है। {recommendation}',
    disclaimer: 'केवल निर्णय सहायता हेतु। आधिकारिक आईएमडी/आईएनसीओआईएस दिशानिर्देशों का पालन करें।'
  },
  ta: {
    verdict_go: 'கடலுக்குச் செல்ல பாதுகாப்பானது (GO)',
    verdict_caution: 'எச்சரிக்கையுடன் செல்லவும் (CAUTION)',
    verdict_no_go: 'கடலுக்குச் செல்ல வேண்டாம் (NO-GO)',
    safe_window_msg: 'பாதுகாப்பான புறப்படும் நேரம்: {start} முதல் {end} வரை. {return_time} மணிக்குள் கரை திரும்பவும்.',
    caution_wind_wave: 'மிதமான அலை உயரம் ({wave}m) மற்றும் காற்றின் வேகம் ({wind}km/h). சிறிய படகுகள் கரைக்கு அருகில் இருக்கவும்.',
    danger_storm_cyclone: 'சூறாவளி எச்சரிக்கை: பலத்த காற்று ({wind}km/h) மற்றும் கொந்தளிப்பான கடல் ({wave}m).',
    pfz_found: '{port} அருகே {count} மீன்பிடி மண்டலங்கள் கண்டறியப்பட்டுள்ளன. அருகிலுள்ள மண்டலம் {dist} கி.மீ, திசை {bearing}°. வெப்பநிலை முகப்பு: {grad}°C/10km, குளோரோபில்: {chl} mg/m³, கடல் வெப்பநிலை: {sst}°C.',
    geofence_advisory: 'ஆலோசனை: நீங்கள் {boundary} எல்லையிலிருந்து {dist} கடல் மைல் தொலைவில் உள்ளீர்கள்.',
    geofence_alert: 'எச்சரிக்கை: {boundary} எல்லையிலிருந்து {dist} கடல் மைல் தூரத்திற்குள் உள்ளீர்கள்.',
    geofence_critical: 'அதிதீவிர எச்சரிக்கை: {boundary} எல்லையிலிருந்து {dist} கடல் மைல் மட்டும்! உடனே திரும்பவும். திசை: {heading}°.',
    anomaly_mannar: 'மன்னார் வளைகுடாவில் கடல் வெப்ப அலை (+{sst_anom}°C) மற்றும் {chl_drop}% பாசி குறைவு பதிவாகியுள்ளது.',
    explain_simply: 'எளிய விளக்கம்: கடல் நிலை {status}. அலைகள் {wave}m, காற்று {wind}km/h. {recommendation}',
    disclaimer: 'முடிவெடுக்கும் வழிகாட்டுதல் மட்டுமே. அதிகாரப்பூர்வ IMD/INCOIS அறிவிப்புகளைப் பின்பற்றவும்.'
  },
  te: {
    verdict_go: 'సముద్రంలోకి వెళ్లడం సురక్షితం (GO)',
    verdict_caution: 'జాగ్రత్తగా ఉండండి (CAUTION)',
    verdict_no_go: 'సముద్రంలోకి వెళ్లవద్దు (NO-GO)',
    safe_window_msg: 'సురక్షిత ప్రయాణ సమయం: {start} నుండి {end}. {return_time} నాటికి తిరిగి రండి.',
    caution_wind_wave: 'మితమైన అలల ఎత్తు ({wave}m) మరియు గాలి వేగం ({wind}km/h).',
    danger_storm_cyclone: 'తీవ్ర తుఫాను హెచ్చరిక: బలమైన గాలులు ({wind}km/h) మరియు ప్రమాదకర అలలు ({wave}m).',
    pfz_found: '{port} వద్ద {count} సంభావ్య చేపల వేట ప్రాంతాలు గుర్తించబడ్డాయి. సమీప జోన్ {dist} కి.మీ, దిశ {bearing}°. ఉష్ణోగ్రత ప్రవణత: {grad}°C/10km, క్లోరోఫిల్: {chl} mg/m³.',
    geofence_advisory: 'సలహా: మీరు {boundary} సరిహద్దు నుండి {dist} నాటికల్ మైళ్ళ దూరంలో ఉన్నారు.',
    geofence_alert: 'హెచ్చరిక: మీరు {boundary} సరిహద్దుకు {dist} నాటికల్ మైళ్ళ లోపల ఉన్నారు.',
    geofence_critical: 'తీవ్ర హెచ్చరిక: {boundary} సరిహద్దుకు అతి సమీపంలో ఉన్నారు! వెంటనే వెనక్కి తిరగండి. దిశ: {heading}°.',
    anomaly_mannar: 'ఉపగ్రహ సమాచారం ప్రకారం మన్నార్ ప్రాంతంలో ఉష్ణోగ్రత పెరుగుదల (+{sst_anom}°C) వల్ల చేపల సంఖ్య తగ్గింది.',
    explain_simply: 'సులభంగా చెప్పాలంటే: సముద్రం {status}. అలలు {wave}m, గాలులు {wind}km/h. {recommendation}',
    disclaimer: 'సహాయక సమాచారం మాత్రమే. అధికారిక IMD/INCOIS హెచ్చరికలను పాటించండి.'
  },
  ml: {
    verdict_go: 'കടലിൽ പോകുന്നത് സുരക്ഷിതമാണ് (GO)',
    verdict_caution: 'ജാഗ്രത പാലിക്കുക (CAUTION)',
    verdict_no_go: 'കടലിൽ പോകരുത് (NO-GO)',
    safe_window_msg: 'സുരക്ഷിത സമയപരിധി: {start} മുതൽ {end} വരെ. {return_time}-നകം തിരിച്ചെത്തുക.',
    caution_wind_wave: 'മിതമായ തിരമാലകൾ ({wave}m), കാറ്റിന്റെ വേഗത ({wind}km/h).',
    danger_storm_cyclone: 'തീവ്ര കാലാവസ്ഥാ മുന്നറിയിപ്പ്: ശക്തമായ കാറ്റും ({wind}km/h) പ്രക്ഷുബ്ധമായ കടലും ({wave}m).',
    pfz_found: '{port} സമീപം {count} മത്സ്യലഭ്യത മേഖലകൾ കണ്ടെത്തി. അടുത്തുള്ള മേഖല {dist} കി.മീ, ദിശ {bearing}°.',
    geofence_advisory: 'നിർദ്ദേശം: നിങ്ങൾ {boundary} അതിർത്തിയിൽ നിന്ന് {dist} നോട്ടിക്കൽ മൈൽ അകലെയാണ്.',
    geofence_alert: 'മുന്നറിയിപ്പ്: {boundary} അതിർത്തിയുടെ {dist} നോട്ടിക്കൽ മൈൽ പരിധിയിലാണ്.',
    geofence_critical: 'ഗുരുതര മുന്നറിയിപ്പ്: {boundary} അതിർത്തിക്ക് {dist} നോട്ടിക്കൽ മൈൽ മാത്രം! ഉടൻ തിരിയുക. ദിശ: {heading}°.',
    anomaly_mannar: 'കടൽ താപനില വർദ്ധനവ് (+{sst_anom}°C) കാരണമായി പ്ലവകങ്ങളുടെ അളവ് കുറഞ്ഞിരിക്കുന്നു.',
    explain_simply: 'ലളിതമായി പറഞ്ഞാൽ: കടൽ {status} ആണ്. തിരമാലകൾ {wave}m, കാറ്റ് {wind}km/h. {recommendation}',
    disclaimer: 'തീരുമാന സഹായത്തിനായി മാത്രം. ഔദ്യോഗിക IMD/INCOIS നിർദ്ദേശങ്ങൾ പാലിക്കുക.'
  },
  kn: {
    verdict_go: 'ಸಮುದ್ರಕ್ಕೆ ಹೋಗಲು ಸುರಕ್ಷಿತವಾಗಿದೆ (GO)',
    verdict_caution: 'ಎಚ್ಚರಿಕೆ ವಹಿಸಿ (CAUTION)',
    verdict_no_go: 'ಸಮುದ್ರಕ್ಕೆ ಇಳಿಯಬೇಡಿ (NO-GO)',
    safe_window_msg: 'ಸುರಕ್ಷಿತ ನಿರ್ಗಮನ ಸಮಯ: {start} ರಿಂದ {end}. {return_time} ಒಳಗೆ ಹಿಂತಿರುಗಿ.',
    caution_wind_wave: 'ಮಧ್ಯಮ ಅಲೆಗಳ ಎತ್ತರ ({wave}m) ಮತ್ತು ಗಾಳಿಯ ವೇಗ ({wind}km/h).',
    danger_storm_cyclone: 'ತೀವ್ರ ಚಂಡಮಾರುತ ಎಚ್ಚರಿಕೆ: ಬಿರುಗಾಳಿ ({wind}km/h) ಮತ್ತು ಅಪಾಯಕಾರಿ ಸಮುದ್ರ ({wave}m).',
    pfz_found: '{port} ಬಳಿ {count} ಸಂಭಾವ್ಯ ಮೀನುಗಾರಿಕಾ ವಲಯಗಳು ಕಂಡುಬಂದಿವೆ. ಸಮೀಪದ ವಲಯ {dist} ಕಿಮೀ, ದಿಕ್ಕು {bearing}°.',
    geofence_advisory: 'ಸಲಹೆ: ನೀವು {boundary} ಗಡಿಯಿಂದ {dist} ನಾಟಿಕಲ್ ಮೈಲಿ ದೂರದಲ್ಲಿದ್ದೀರಿ.',
    geofence_alert: 'ಎಚ್ಚರಿಕೆ: ನೀವು {boundary} ಗಡಿಯ {dist} ನಾಟಿಕಲ್ ಮೈಲಿ ಒಳಗಿದ್ದೀರಿ.',
    geofence_critical: 'ತೀವ್ರ ಎಚ್ಚರಿಕೆ: {boundary} ಗಡಿಯಿಂದ ಕೇವಲ {dist} ನಾಟಿಕಲ್ ಮೈಲಿ! ತಕ್ಷಣ ಹಿಂತಿರುಗಿ. ಶಿಫಾರಸು ದಿಕ್ಕು: {heading}°.',
    anomaly_mannar: 'ಸಾಗರ ಶಾಖದ ಅಲೆಯ ಕಾರಣದಿಂದಾಗಿ ಕ್ಲೋರೋಫಿಲ್ ಮಟ್ಟದಲ್ಲಿ {chl_drop}% ಇಳಿಕೆ ಕಂಡುಬಂದಿದೆ.',
    explain_simply: 'ಸರಳವಾಗಿ ಹೇಳುವುದಾದರೆ: ಸಮುದ್ರವು {status} ಆಗಿದೆ. ಅಲೆಗಳು {wave}m, ಗಾಳಿ {wind}km/h. {recommendation}',
    disclaimer: 'ನಿರ್ಧಾರ ಬೆಂಬಲಕ್ಕಾಗಿ ಮಾತ್ರ. ಅಧಿಕೃತ IMD/INCOIS ಸೂಚನೆಗಳನ್ನು ಪಾಲಿಸಿ.'
  },
  gu: {
    verdict_go: 'દરિયામાં જવું સલામત છે (GO)',
    verdict_caution: 'સાવચેતી રાખો (CAUTION)',
    verdict_no_go: 'દરિયામાં બિલકુલ ન જવું (NO-GO)',
    safe_window_msg: 'સલામત પ્રસ્થાન સમય: {start} થી {end}. {return_time} સુધીમાં પરત આવો.',
    caution_wind_wave: 'મધ્યમ મોજા ({wave}m) અને પવનની ગતિ ({wind}km/h).',
    danger_storm_cyclone: 'તીવ્ર વાવાઝોડાની ચેતવણી: ભારે પવન ({wind}km/h) અને તોફાની દરિયો ({wave}m).',
    pfz_found: '{port} નજીક {count} સંભવિત માછીમારી ઝોન મળ્યા છે. નજીકનો ઝોન {dist} કિમી, દિશા {bearing}° છે.',
    geofence_advisory: 'સલાહ: તમે {boundary} સરહદથી {dist} નોટિકલ માઈલ દૂર છો.',
    geofence_alert: 'ચેતવણી: તમે {boundary} સરહદથી {dist} નોટિકલ માઈલની અંદર છો.',
    geofence_critical: 'ગંભીર ચેતવણી: {boundary} સરહદથી માત્ર {dist} નોટિકલ માઈલ! તાત્કાલિક પાછા વળો. દિશા: {heading}°.',
    anomaly_mannar: 'દરિયાઈ હીટવેવ અને ક્લોરોફિલમાં ઘટાડાને કારણે માછલીઓની ઉપલબ્ધતા ઓછી થઈ છે.',
    explain_simply: 'સરળ શબ્દોમાં: દરિયાની સ્થિતિ {status} છે. મોજા {wave}m અને પવન {wind}km/h છે. {recommendation}',
    disclaimer: 'માત્ર માર્ગદર્શન માટે. અધિકૃત IMD/INCOIS સૂચનાઓનું પાલન કરો.'
  },
  mr: {
    verdict_go: 'समुद्रात जाणे सुरक्षित आहे (GO)',
    verdict_caution: 'काळजीपूर्वक जा (CAUTION)',
    verdict_no_go: 'समुद्रात जाऊ नका (NO-GO)',
    safe_window_msg: 'सुरक्षित प्रस्थान वेळ: {start} ते {end}. {return_time} पर्यंत परत या.',
    caution_wind_wave: 'मध्यम लाटा ({wave}m) आणि वाऱ्याचा वेग ({wind}km/h).',
    danger_storm_cyclone: 'तीव्र वादळाचा इशारा: वेगवान वारे ({wind}km/h) आणि खवळलेला समुद्र ({wave}m).',
    pfz_found: '{port} जवळ {count} संभाव्य मासेमारी क्षेत्रे सापडली आहेत. जवळचे क्षेत्र {dist} किमी, दिशा {bearing}°.',
    geofence_advisory: 'सल्ला: आपण {boundary} सीमेपासून {dist} सागरी मैल दूर आहात.',
    geofence_alert: 'इशारा: आपण {boundary} सीमेच्या {dist} सागरी मैल जवळ आहात.',
    geofence_critical: 'धोक्याचा इशारा: {boundary} सीमेपासून फक्त {dist} सागरी मैल! त्वरित मागे फिरा. दिशा: {heading}°.',
    anomaly_mannar: 'सागरी उष्णतेची लाट आणि क्लोरोफिलमधील घट यामुळे माशांचे प्रमाण कमी झाले आहे.',
    explain_simply: 'सोप्या भाषेत: समुद्राची स्थिती {status} आहे. लाटा {wave}m, वारे {wind}km/h. {recommendation}',
    disclaimer: 'केवळ मार्गदर्शनासाठी. अधिकृत IMD/INCOIS नियमांचे पालन करा.'
  },
  bn: {
    verdict_go: 'সমুদ্রে যাওয়া নিরাপদ (GO)',
    verdict_caution: 'সতর্কতা অবলম্বন করুন (CAUTION)',
    verdict_no_go: 'সমুদ্রে যাবেন না (NO-GO)',
    safe_window_msg: 'নিরাপদ যাত্রা সময়: {start} থেকে {end}। {return_time}-এর মধ্যে ফিরে আসুন।',
    caution_wind_wave: 'মাঝারি ঢেউয়ের উচ্চতা ({wave}m) এবং বাতাসের গতি ({wind}km/h)।',
    danger_storm_cyclone: 'তীব্র ঘূর্ণিঝড় সতর্কতা: প্রবল ঝড়ো হাওয়া ({wind}km/h) ও উত্তাল সমুদ্র ({wave}m)।',
    pfz_found: '{port}-এর কাছে {count}টি সম্ভাব্য মাছ ধরার অঞ্চল পাওয়া গেছে। নিকটতম অঞ্চল {dist} কিমি, দিক {bearing}°।',
    geofence_advisory: 'পরামর্শ: আপনি {boundary} সীমানা থেকে {dist} নটিক্যাল মাইল দূরে আছেন।',
    geofence_alert: 'সতর্কতা: আপনি {boundary} সীমানার {dist} নটিক্যাল মাইলের মধ্যে আছেন।',
    geofence_critical: 'জরুরি সতর্কতা: {boundary} সীমানা থেকে মাত্র {dist} নটিক্যাল মাইল! অবিলম্বে ফিরে আসুন। দিক: {heading}°।',
    anomaly_mannar: 'সামুদ্রিক তাপপ্রবাহের কারণে প্লাঙ্কটন ও মাছের ঘনত্ব কমেছে।',
    explain_simply: 'সহজ ভাষায়: সমুদ্রের পরিস্থিতি {status}। ঢেউ {wave}m, বাতাস {wind}km/h। {recommendation}',
    disclaimer: 'শুধুমাত্র সিদ্ধান্ত সহায়তার জন্য। অফিসিয়াল IMD/INCOIS সতর্কতা মেনে চলুন।'
  },
  or: {
    verdict_go: 'ସମୁଦ୍ରକୁ ଯିବା ସୁରକ୍ଷିତ (GO)',
    verdict_caution: 'ସତର୍କତା ଅବଲମ୍ବନ କରନ୍ତୁ (CAUTION)',
    verdict_no_go: 'ସମୁଦ୍ରକୁ ଯାଆନ୍ତୁ ନାହିଁ (NO-GO)',
    safe_window_msg: 'ସୁରକ୍ଷିତ ଯାତ୍ରା ସମୟ: {start} ରୁ {end}। {return_time} ସୁଦ୍ଧା ଫେରିଆସନ୍ତୁ।',
    caution_wind_wave: 'ମଧ୍ୟମ ଢେଉ ({wave}m) ଏବଂ ପବନର ବେଗ ({wind}km/h)।',
    danger_storm_cyclone: 'ତୀବ୍ର ବାତ୍ୟା ସତର୍କତା: ପ୍ରବଳ ଝଡ଼ ପବନ ({wind}km/h) ଏବଂ ଅଶାନ୍ତ ସମୁଦ୍ର ({wave}m)।',
    pfz_found: '{port} ନିକଟରେ {count}ଟି ସମ୍ଭାବ୍ୟ ମତ୍ସ୍ୟ ଧରା କ୍ଷେତ୍ର ଚିହ୍ନଟ ହୋଇଛି। ନିକଟତମ କ୍ଷେତ୍ର {dist} କିମି, ଦିଗ {bearing}°।',
    geofence_advisory: 'ପରାମର୍ଶ: ଆପଣ {boundary} ସୀମାରୁ {dist} ନଟିକାଲ ମାଇଲ ଦୂରରେ ଅଛନ୍ତି।',
    geofence_alert: 'ସତର୍କତା: ଆପଣ {boundary} ସୀମାର {dist} ନଟିକାଲ ମାଇଲ ଭିତରେ ଅଛନ୍ତି।',
    geofence_critical: 'ଜରୁରୀ ସତର୍କତା: {boundary} ସୀମାରୁ ମାତ୍ର {dist} ନଟିକାଲ ମାଇଲ! ତୁରନ୍ତ ଫେରନ୍ତୁ। ଦିଗ: {heading}°।',
    anomaly_mannar: 'ସାମୁଦ୍ରିକ ଉତ୍ତାପ ବୃଦ୍ଧି ଯୋଗୁଁ କ୍ଲୋରୋଫିଲ ପରିମାଣ ହ୍ରାସ ପାଇଛି।',
    explain_simply: 'ସରଳ ଭାଷାରେ: ସମୁଦ୍ରର ଅବସ୍ଥା {status}। ଢେଉ {wave}m, ପବନ {wind}km/h। {recommendation}',
    disclaimer: 'କେବଳ ନିଷ୍ପତ୍ତି ସହାୟତା ପାଇଁ। ସରକାରୀ IMD/INCOIS ନିର୍ଦ୍ଦେଶାବଳୀ ଅନୁସରଣ କରନ୍ତୁ।'
  }
};

export function getPhrase(lang: string, key: string, params: Record<string, string | number> = {}): string {
  const code = (lang || 'en').toLowerCase();
  const dict = PHRASES[code] || PHRASES.en;
  let template = dict[key] || PHRASES.en[key] || key;

  for (const [k, v] of Object.entries(params)) {
    template = template.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return template;
}
