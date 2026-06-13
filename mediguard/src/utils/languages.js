// Mapping of Sarvam AI supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'hi-IN', name: 'Hindi (हिंदी)',       states: ['Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Bihar', 'Rajasthan', 'Haryana'] },
  { code: 'bn-IN', name: 'Bengali (বাংলা)',      states: ['West Bengal', 'Tripura'] },
  { code: 'ta-IN', name: 'Tamil (தமிழ்)',         states: ['Tamil Nadu'] },
  { code: 'te-IN', name: 'Telugu (తెలుగు)',       states: ['Andhra Pradesh', 'Telangana'] },
  { code: 'mr-IN', name: 'Marathi (मराठी)',      states: ['Maharashtra'] },
  { code: 'gu-IN', name: 'Gujarati (ગુજરાતી)',   states: ['Gujarat'] },
  { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)',      states: ['Karnataka'] },
  { code: 'ml-IN', name: 'Malayalam (മലയാളം)',    states: ['Kerala'] },
  { code: 'pa-IN', name: 'Punjabi (ਪੰਜਾਬੀ)',     states: ['Punjab'] },
  { code: 'or-IN', name: 'Odia (ଓଡ଼ିଆ)',          states: ['Odisha'] }
];

export function getLanguageForState(stateName) {
  if (!stateName) return 'hi-IN';
  const match = SUPPORTED_LANGUAGES.find(lang =>
    lang.states.some(s => s.toLowerCase() === stateName.toLowerCase())
  );
  return match ? match.code : 'hi-IN';
}

// ── Reason templates per language ──────────────────────────────────────────
// {reason} will be replaced with the translated reason at runtime
const TEMPLATES = {
  'hi-IN': {
    safe:        (name) => `${name ? name + ' — ' : ''}यह दवा बिल्कुल सुरक्षित है। सभी 6 सत्यापन परतें पास हो गई हैं। आप इसे सुरक्षित रूप से खरीद सकते हैं।`,
    suspicious:  (name, reason) => `चेतावनी! ${name ? name + ' — ' : ''}यह दवा संदिग्ध है। कारण: ${reason} कृपया इसे न खरीदें।`,
    counterfeit: (name, reason) => `खतरा! ${name ? name + ' — ' : ''}यह दवा नकली है। कारण: ${reason} इसे तुरंत वापस करें और दुकानदार की सूचना दें।`,
  },
  'ta-IN': {
    safe:        (name) => `${name ? name + ' — ' : ''}இந்த மருந்து முற்றிலும் பாதுகாப்பானது. 6 சோதனை அடுக்குகளும் தேர்ச்சி பெற்றன. இதை வாங்கலாம்.`,
    suspicious:  (name, reason) => `எச்சரிக்கை! ${name ? name + ' — ' : ''}இந்த மருந்து சந்தேகத்திற்குரியது. காரணம்: ${reason} தயவுசெய்து இதை வாங்காதீர்கள்.`,
    counterfeit: (name, reason) => `ஆபத்து! ${name ? name + ' — ' : ''}இது போலி மருந்து. காரணம்: ${reason} உடனே திரும்பவும்.`,
  },
  'mr-IN': {
    safe:        (name) => `${name ? name + ' — ' : ''}हे औषध पूर्णपणे सुरक्षित आहे. 6 सत्यापन स्तर उत्तीर्ण झाले. तुम्ही ते विकत घेऊ शकता.`,
    suspicious:  (name, reason) => `इशारा! ${name ? name + ' — ' : ''}हे औषध संशयास्पद आहे. कारण: ${reason} कृपया हे विकत घेऊ नका.`,
    counterfeit: (name, reason) => `धोका! ${name ? name + ' — ' : ''}हे औषध बनावट आहे. कारण: ${reason} ताबडतोब परत करा.`,
  },
  'bn-IN': {
    safe:        (name) => `${name ? name + ' — ' : ''}এই ওষুধটি সম্পূর্ণ নিরাপদ। সব 6টি যাচাইকরণ স্তর পাস হয়েছে। আপনি এটি কিনতে পারেন।`,
    suspicious:  (name, reason) => `সতর্কতা! ${name ? name + ' — ' : ''}এই ওষুধটি সন্দেহজনক। কারণ: ${reason} এটি কিনবেন না।`,
    counterfeit: (name, reason) => `বিপদ! ${name ? name + ' — ' : ''}এটি নকল ওষুধ। কারণ: ${reason} এখনই ফেরত দিন।`,
  },
  'gu-IN': {
    safe:        (name) => `${name ? name + ' — ' : ''}આ દવા સંપૂર્ણ સુરક્ષિત છે. 6 ચકાસણી સ્તરો પાસ થઈ ગયા. તમે આ ખરીદી શકો છો.`,
    suspicious:  (name, reason) => `ચેતવણી! ${name ? name + ' — ' : ''}આ દવા શંકાસ્પદ છે. કારણ: ${reason} કૃપા કરીને તેને ખરીદો નહીં.`,
    counterfeit: (name, reason) => `ખતરો! ${name ? name + ' — ' : ''}આ નકલી દવા છે. કારણ: ${reason} તાત્કાલિક પાછી આપો.`,
  },
  'te-IN': {
    safe:        (name) => `${name ? name + ' — ' : ''}ఈ మందు పూర్తిగా సురక్షితం. 6 ధృవీకరణ పొరలు పాస్ అయ్యాయి. మీరు దీన్ని కొనవచ్చు.`,
    suspicious:  (name, reason) => `హెచ్చరిక! ${name ? name + ' — ' : ''}ఈ మందు అనుమానాస్పదంగా ఉంది. కారణం: ${reason} దయచేసి కొనకండి.`,
    counterfeit: (name, reason) => `ప్రమాదం! ${name ? name + ' — ' : ''}ఇది నకిలీ మందు. కారణం: ${reason} వెంటనే తిరిగి ఇవ్వండి.`,
  },
  'default': {
    safe:        (name) => `${name ? name + ': ' : ''}Verified. This medicine is genuine and safe to consume. All 6 security layers passed.`,
    suspicious:  (name, reason) => `Warning! ${name ? name + ': ' : ''}This medicine is suspicious. Reason: ${reason} Do not purchase it.`,
    counterfeit: (name, reason) => `Danger! ${name ? name + ': ' : ''}This medicine is counterfeit. Reason: ${reason} Return it immediately and report the pharmacy.`,
  },
};

// ── Reason mapping — human-readable reasons from API layer messages ─────────
// We extract the most important failed layer and convert its message to a short human reason
const REASON_TRANSLATIONS = {
  'hi-IN': {
    batchCheck:    'यह बैच नंबर निर्माता के डेटाबेस में नहीं मिला — यह दवा कभी बनाई ही नहीं गई।',
    hashCheck:     'QR कोड का डिजिटल हस्ताक्षर गलत है — इसे नकली QR से बदला गया है।',
    scanFrequency: 'यह QR कोड सैकड़ों बार स्कैन हो चुका है — यह फोटोकॉपी किया गया नकली QR है।',
    geoCheck:      'यह दवा किसी दूसरे देश के लिए भेजी गई थी — यह चोरी का या मोड़ा गया माल है।',
    temporalCheck: 'इस दवा की एक्सपायरी डेट निकल चुकी है — इसे नए लेबल से दोबारा बेचा जा रहा है।',
    supplyChain:   'सप्लाई चेन में कड़ियाँ गायब हैं — यह दवा अवैध रूप से बाज़ार में लाई गई है।',
  },
  'ta-IN': {
    batchCheck:    'இந்த தொகுதி எண் உற்பத்தியாளர் தரவுத்தளத்தில் இல்லை — இந்த மருந்து உற்பத்தி செய்யப்படவில்லை.',
    hashCheck:     'QR குறியீட்டின் டிஜிட்டல் கையெழுத்து தவறானது — போலி QR மாற்றப்பட்டது.',
    scanFrequency: 'இந்த QR குறியீடு நூற்றுக்கணக்கான முறை ஸ்கேன் செய்யப்பட்டுள்ளது — நகலெடுக்கப்பட்ட போலி QR.',
    geoCheck:      'இந்த மருந்து வேறு நாட்டிற்கு அனுப்பப்பட்டது — திருடப்பட்ட அல்லது திசைதிருப்பப்பட்ட பொருள்.',
    temporalCheck: 'இந்த மருந்தின் காலாவதி தேதி கடந்துவிட்டது — மறுபட்டை ஒட்டி விற்கப்படுகிறது.',
    supplyChain:   'விநியோகச் சங்கிலியில் இணைப்புகள் காணவில்லை — சட்டவிரோதமாக சந்தையில் கொண்டுவரப்பட்டது.',
  },
  'mr-IN': {
    batchCheck:    'हा बॅच नंबर निर्मात्याच्या डेटाबेसमध्ये आढळला नाही — हे औषध कधीच बनवले गेले नाही.',
    hashCheck:     'QR कोडचा डिजिटल स्वाक्षरी चुकीचा आहे — बनावट QR बदलला गेला आहे.',
    scanFrequency: 'हा QR कोड शेकडो वेळा स्कॅन झाला आहे — हा फोटोकॉपी केलेला बनावट QR आहे.',
    geoCheck:      'हे औषध दुसऱ्या देशासाठी पाठवले होते — चोरलेला किंवा वळवलेला माल आहे.',
    temporalCheck: 'या औषधाची एक्सपायरी डेट निघून गेली आहे — नव्या लेबलसह पुन्हा विकले जात आहे.',
    supplyChain:   'पुरवठा साखळीत दुवे गायब आहेत — हे औषध बेकायदेशीरपणे बाजारात आणले गेले आहे.',
  },
  'default': {
    batchCheck:    'This batch number does not exist in the manufacturer database — the medicine was never produced.',
    hashCheck:     'The QR digital signature is invalid — the QR code has been tampered with or forged.',
    scanFrequency: 'This QR code has been scanned hundreds of times — it is a photocopied counterfeit QR.',
    geoCheck:      'This medicine was shipped to a different country — it is stolen or diverted stock.',
    temporalCheck: 'The expiry date on this medicine has passed — it is being re-sold with a new label.',
    supplyChain:   'The supply chain has missing links — this medicine was introduced illegally into the market.',
  },
};

/**
 * Build the full spoken verdict message with the specific reason.
 * @param {string} verdict - 'verified' | 'suspicious' | 'counterfeit'
 * @param {string} langCode - e.g. 'hi-IN'
 * @param {object} results - the results object from the verify API
 * @param {string|null} medicineName - optional medicine name
 */
export function buildVerdictAudioText(verdict, langCode, results = {}, medicineName = null) {
  const templates  = TEMPLATES[langCode]  || TEMPLATES['default'];
  const reasonMap  = REASON_TRANSLATIONS[langCode] || REASON_TRANSLATIONS['default'];

  if (verdict === 'verified') {
    return templates.safe(medicineName);
  }

  // Find the primary reason: the most impactful failed layer
  const PRIORITY = ['batchCheck', 'hashCheck', 'scanFrequency', 'geoCheck', 'temporalCheck', 'supplyChain'];
  const failedKey = PRIORITY.find(k => results[k] && !results[k].passed);
  const reason    = failedKey ? reasonMap[failedKey] : (langCode === 'hi-IN' ? 'अज्ञात कारण' : 'Unknown reason');

  return verdict === 'counterfeit'
    ? templates.counterfeit(medicineName, reason)
    : templates.suspicious(medicineName, reason);
}

// Keep old simple function for backward compatibility (voice page uses it)
export function getVerdictMessage(verdict, langCode) {
  const key      = verdict === 'verified' ? 'safe' : verdict;
  const templates = TEMPLATES[langCode] || TEMPLATES['default'];
  return templates[key]('', '');
}
