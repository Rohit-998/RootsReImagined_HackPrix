// Mapping of Sarvam AI supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'hi-IN', name: 'Hindi (हिंदी)', states: ['Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Bihar', 'Rajasthan', 'Haryana'] },
  { code: 'bn-IN', name: 'Bengali (বাংলা)', states: ['West Bengal', 'Tripura'] },
  { code: 'ta-IN', name: 'Tamil (தமிழ்)', states: ['Tamil Nadu'] },
  { code: 'te-IN', name: 'Telugu (తెలుగు)', states: ['Andhra Pradesh', 'Telangana'] },
  { code: 'mr-IN', name: 'Marathi (मराठी)', states: ['Maharashtra'] },
  { code: 'gu-IN', name: 'Gujarati (ગુજરાતી)', states: ['Gujarat'] },
  { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)', states: ['Karnataka'] },
  { code: 'ml-IN', name: 'Malayalam (മലയാളം)', states: ['Kerala'] },
  { code: 'pa-IN', name: 'Punjabi (ਪੰਜਾਬੀ)', states: ['Punjab'] },
  { code: 'or-IN', name: 'Odia (ଓଡ଼ିଆ)', states: ['Odisha'] }
];

export function getLanguageForState(stateName) {
  if (!stateName) return 'hi-IN'; // Default to Hindi
  
  const match = SUPPORTED_LANGUAGES.find(lang => 
    lang.states.some(state => state.toLowerCase() === stateName.toLowerCase())
  );
  
  return match ? match.code : 'hi-IN';
}

// Map english verdicts to localized text
export const VERDICT_TRANSLATIONS = {
  'hi-IN': {
    safe: "यह दवा बिल्कुल सुरक्षित है। आप इसका सेवन कर सकते हैं।",
    suspicious: "यह दवा संदिग्ध है। कृपया इसे न लें।",
    counterfeit: "चेतावनी! यह दवा नकली है। इसे इस्तेमाल न करें।"
  },
  'ta-IN': {
    safe: "இந்த மருந்து முற்றிலும் பாதுகாப்பானது. நீங்கள் இதை உட்கொள்ளலாம்.",
    suspicious: "இந்த மருந்து சந்தேகத்திற்குரியது. தயவுசெய்து இதை எடுக்க வேண்டாம்.",
    counterfeit: "எச்சரிக்கை! இது போலி மருந்து. பயன்படுத்த வேண்டாம்."
  },
  'mr-IN': {
    safe: "हे औषध पूर्णपणे सुरक्षित आहे. तुम्ही याचे सेवन करू शकता.",
    suspicious: "हे औषध संशयास्पद आहे. कृपया हे घेऊ नका.",
    counterfeit: "चेतावणी! हे औषध बनावट आहे. वापरू नका."
  },
  'bn-IN': {
    safe: "এই ওষুধটি সম্পূর্ণ নিরাপদ। আপনি এটি সেবন করতে পারেন।",
    suspicious: "এই ওষুধটি সন্দেহজনক। দয়া করে এটি নেবেন না।",
    counterfeit: "সতর্কবাণী! এটি নকল ওষুধ। ব্যবহার করবেন না।"
  },
  'gu-IN': {
    safe: "આ દવા સંપૂર્ણપણે સલામત છે. તમે તેનું સેવન કરી શકો છો.",
    suspicious: "આ દવા શંકાસ્પદ છે. કૃપા કરીને તેને લેશો નહીં.",
    counterfeit: "ચેતવણી! આ નકલી દવા છે. તેનો ઉપયોગ કરશો નહીં."
  },
  'te-IN': {
    safe: "ఈ మందు పూర్తిగా సురక్షితం. మీరు దీన్ని వాడవచ్చు.",
    suspicious: "ఈ మందు అనుమానాస్పదంగా ఉంది. దయచేసి దీన్ని వాడకండి.",
    counterfeit: "హెచ్చరిక! ఇది నకిలీ మందు. ఉపయోగించవద్దు."
  },
  // Default to english/hindi mix for others as fallback
  'default': {
    safe: "Verified. This medicine is safe.",
    suspicious: "Suspicious. Do not consume.",
    counterfeit: "Warning! Counterfeit medicine."
  }
};

export function getVerdictMessage(verdict, langCode) {
  // verdict will be 'verified', 'suspicious', or 'counterfeit'
  const key = verdict === 'verified' ? 'safe' : verdict;
  const langDict = VERDICT_TRANSLATIONS[langCode] || VERDICT_TRANSLATIONS['default'];
  return langDict[key] || VERDICT_TRANSLATIONS['default'][key];
}
