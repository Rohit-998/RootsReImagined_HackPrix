'use client';
import { useState, useRef } from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, Loader2, Info, Volume2, VolumeX } from 'lucide-react';
import Card from '@/components/ui/Card';
import { SUPPORTED_LANGUAGES } from '@/utils/languages';

const DEMO_MEDICINES = [
  "Paracetamol 500mg",
  "Amoxicillin 250mg",
  "Metformin 500mg",
  "Insulin Novolin R",
  "Cough Syrup",
  "Warfarin",
  "Methotrexate",
  "Contrast dye",
  "Sedatives",
  "Beta-blockers"
];

function buildInteractionAudioText(result, drugA, drugB, langCode) {
  if (result.safety_status === 'safe') {
    const templates = {
      'hi-IN': `${drugA} और ${drugB} के बीच कोई खतरनाक इंटरैक्शन नहीं पाया गया। आप इन्हें एक साथ ले सकते हैं।`,
      'bn-IN': `${drugA} এবং ${drugB} এর মধ্যে কোন বিপজ্জনক মিথস্ক্রিয়া পাওয়া যায়নি। আপনি এগুলি একসাথে নিতে পারেন।`,
      'ta-IN': `${drugA} மற்றும் ${drugB} இடையே ஆபத்தான தொடர்பு எதுவும் கண்டறியப்படவில்லை। நீங்கள் இவற்றை ஒன்றாக எடுத்துக்கொள்ளலாம்.`,
      'te-IN': `${drugA} మరియు ${drugB} మధ్య ప్రమాదకరమైన పరస్పర చర్య కనుగొనబడలేదు. మీరు వీటిని కలిపి తీసుకోవచ్చు.`,
      'mr-IN': `${drugA} आणि ${drugB} यांच्यात कोणतीही धोकादायक परस्परक्रिया आढळली नाही. तुम्ही हे एकत्र घेऊ शकता.`,
      'gu-IN': `${drugA} અને ${drugB} વચ્ચે કોઈ ખતરનાક ક્રિયાપ્રતિક્રિયા મળી નથી. તમે આ બંને સાથે લઈ શકો છો.`,
      'kn-IN': `${drugA} ಮತ್ತು ${drugB} ನಡುವೆ ಯಾವುದೇ ಅಪಾಯಕಾರಿ ಪರಸ್ಪರ ಕ್ರಿಯೆ ಕಂಡುಬಂದಿಲ್ಲ. ನೀವು ಇವುಗಳನ್ನು ಒಟ್ಟಿಗೆ ತೆಗೆದುಕೊಳ್ಳಬಹುದು.`,
      'ml-IN': `${drugA} ഉം ${drugB} ഉം തമ്മിൽ അപകടകരമായ ഇടപെടൽ കണ്ടെത്തിയില്ല. നിങ്ങൾക്ക് ഇവ ഒരുമിച്ച് കഴിക്കാം.`,
      'pa-IN': `${drugA} ਅਤੇ ${drugB} ਵਿਚਕਾਰ ਕੋਈ ਖ਼ਤਰਨਾਕ ਇੰਟਰੈਕਸ਼ਨ ਨਹੀਂ ਮਿਲੀ। ਤੁਸੀਂ ਇਨ੍ਹਾਂ ਨੂੰ ਇਕੱਠੇ ਲੈ ਸਕਦੇ ਹੋ।`,
      'or-IN': `${drugA} ଏବଂ ${drugB} ମଧ୍ୟରେ କୌଣସି ବିପଜ୍ଜନକ ପାରସ୍ପରିକ କ୍ରିୟା ମିଳିଲା ନାହିଁ। ଆପଣ ଏଗୁଡ଼ିକୁ ଏକାଠି ନେଇପାରିବେ।`,
    };
    return templates[langCode] || `No dangerous interaction found between ${drugA} and ${drugB}. You can take them together safely.`;
  }

  // Has interactions
  const interaction = result.interactions[0];
  const severity = interaction?.severity || 'moderate';
  const desc = interaction?.description || '';
  const rec = interaction?.recommendation || '';

  const templates = {
    'hi-IN': `चेतावनी! ${drugA} और ${drugB} के बीच ${severity === 'severe' ? 'गंभीर' : 'मध्यम'} इंटरैक्शन पाया गया। ${desc} सलाह: ${rec}`,
    'bn-IN': `সতর্কতা! ${drugA} এবং ${drugB} এর মধ্যে ${severity === 'severe' ? 'গুরুতর' : 'মাঝারি'} মিথস্ক্রিয়া পাওয়া গেছে। ${desc} পরামর্শ: ${rec}`,
    'ta-IN': `எச்சரிக்கை! ${drugA} மற்றும் ${drugB} இடையே ${severity === 'severe' ? 'கடுமையான' : 'மிதமான'} தொடர்பு கண்டறியப்பட்டது. ${desc} பரிந்துரை: ${rec}`,
    'te-IN': `హెచ్చరిక! ${drugA} మరియు ${drugB} మధ్య ${severity === 'severe' ? 'తీవ్రమైన' : 'మధ్యస్థ'} పరస్పర చర్య కనుగొనబడింది. ${desc} సలహా: ${rec}`,
    'mr-IN': `चेतावणी! ${drugA} आणि ${drugB} यांच्यात ${severity === 'severe' ? 'गंभीर' : 'मध्यम'} परस्परक्रिया आढळली. ${desc} सल्ला: ${rec}`,
    'gu-IN': `ચેતવણી! ${drugA} અને ${drugB} વચ્ચે ${severity === 'severe' ? 'ગંભીર' : 'મધ્યમ'} ક્રિયાપ્રતિક્રિયા મળી. ${desc} સલાહ: ${rec}`,
    'kn-IN': `ಎಚ್ಚರಿಕೆ! ${drugA} ಮತ್ತು ${drugB} ನಡುವೆ ${severity === 'severe' ? 'ತೀವ್ರ' : 'ಮಧ್ಯಮ'} ಪರಸ್ಪರ ಕ್ರಿಯೆ ಕಂಡುಬಂದಿದೆ. ${desc} ಸಲಹೆ: ${rec}`,
    'ml-IN': `മുന്നറിയിപ്പ്! ${drugA} ഉം ${drugB} ഉം തമ്മിൽ ${severity === 'severe' ? 'ഗുരുതരമായ' : 'മിതമായ'} ഇടപെടൽ കണ്ടെത്തി. ${desc} ശുപാർശ: ${rec}`,
    'pa-IN': `ਚੇਤਾਵਨੀ! ${drugA} ਅਤੇ ${drugB} ਵਿਚਕਾਰ ${severity === 'severe' ? 'ਗੰਭੀਰ' : 'ਦਰਮਿਆਨੀ'} ਇੰਟਰੈਕਸ਼ਨ ਮਿਲੀ. ${desc} ਸਲਾਹ: ${rec}`,
    'or-IN': `ସତର୍କତା! ${drugA} ଏବଂ ${drugB} ମଧ୍ୟରେ ${severity === 'severe' ? 'ଗୁରୁତର' : 'ମଧ୍ୟମ'} ପାରସ୍ପରିକ କ୍ରିୟା ମିଳିଲା। ${desc} ପରାମର୍ଶ: ${rec}`,
  };
  return templates[langCode] || `Warning! A ${severity} interaction was found between ${drugA} and ${drugB}. ${desc} Recommendation: ${rec}`;
}

export default function InteractionsPage() {
  const [drugA, setDrugA] = useState('');
  const [drugB, setDrugB] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Voice state
  const [lang, setLang] = useState('hi-IN');
  const [audioState, setAudioState] = useState('idle'); // idle | loading | ready | playing | error
  const audioRef = useRef(null);

  const checkInteractions = async () => {
    if (!drugA || !drugB || drugA === drugB) return;
    setLoading(true);
    setAudioState('idle');
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    try {
      const res = await fetch('/api/interactions/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicines: [drugA, drugB] })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const speakResult = async () => {
    if (!result) return;

    // If already playing, toggle pause
    if (audioState === 'playing' && audioRef.current) {
      audioRef.current.pause();
      setAudioState('ready');
      return;
    }

    // If audio is already loaded, replay
    if (audioState === 'ready' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => setAudioState('playing')).catch(() => {});
      return;
    }

    setAudioState('loading');
    const text = buildInteractionAudioText(result, drugA, drugB, lang);

    try {
      const res = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: lang }),
      });
      const data = await res.json();
      if (!data.audioBase64) throw new Error('No audio');

      const src = `data:audio/wav;base64,${data.audioBase64}`;
      const audio = new Audio(src);
      audioRef.current = audio;

      audio.addEventListener('ended', () => setAudioState('ready'));
      audio.addEventListener('error', () => setAudioState('error'));

      audio.addEventListener('canplaythrough', () => {
        setAudioState('playing');
        audio.play().catch(() => setAudioState('ready'));
      }, { once: true });

      audio.load();
    } catch {
      setAudioState('error');
    }
  };

  // Reset audio when language changes
  const handleLangChange = (e) => {
    setLang(e.target.value);
    setAudioState('idle');
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
  };

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Drug Interaction Checker</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Cross-reference multiple medicines to identify potentially dangerous interactions before consumption.
        </p>
      </div>

      <Card style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Medicine 1</label>
              <select 
                value={drugA} 
                onChange={e => setDrugA(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '1rem' }}
              >
                <option value="">Select a medicine...</option>
                {DEMO_MEDICINES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Medicine 2</label>
              <select 
                value={drugB} 
                onChange={e => setDrugB(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '1rem' }}
              >
                <option value="">Select a medicine...</option>
                {DEMO_MEDICINES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          
          <button 
            onClick={checkInteractions}
            disabled={!drugA || !drugB || drugA === drugB || loading}
            style={{ marginTop: '1rem', padding: '0.875rem', borderRadius: 'var(--radius-sm)', background: 'var(--accent-primary)', color: 'white', fontWeight: 700, fontSize: '1rem', cursor: (!drugA || !drugB || drugA === drugB) ? 'not-allowed' : 'pointer', opacity: (!drugA || !drugB || drugA === drugB) ? 0.5 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', border: 'none' }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Check Safety'}
          </button>
        </div>
      </Card>

      {result && (
        <div style={{ animation: 'fade-in 0.3s ease-out' }}>
          {result.safety_status === 'safe' ? (
            <Card style={{ padding: '2rem', textAlign: 'center', borderColor: 'var(--color-verified)', background: 'rgba(5, 150, 105, 0.05)' }}>
              <CheckCircle size={48} style={{ color: 'var(--color-verified)', margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-verified)', marginBottom: '0.5rem' }}>No Known Interactions</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Based on our database, there are no known dangerous interactions between {drugA} and {drugB}.</p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Found {result.total_interactions} Interaction(s)</h2>
              </div>
              
              {result.interactions.map((interaction, idx) => {
                const isSevere = interaction.severity === 'severe' || interaction.severity === 'contraindicated';
                const color = isSevere ? 'var(--color-danger)' : 'var(--color-warning)';
                const bg = isSevere ? 'rgba(220, 38, 38, 0.08)' : 'rgba(217, 119, 6, 0.08)';
                
                return (
                  <Card key={idx} style={{ borderLeft: `4px solid ${color}`, padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ marginTop: '0.25rem' }}>
                        {isSevere ? <ShieldAlert size={24} style={{ color }} /> : <AlertTriangle size={24} style={{ color }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
                            {interaction.drug_a} + {interaction.drug_b}
                          </h3>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', padding: '0.25rem 0.5rem', borderRadius: '4px', background: bg, color }}>
                            {interaction.severity}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                          {interaction.description}
                        </p>
                        <div style={{ background: 'var(--bg-body)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                          <Info size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
                          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Recommendation:</span> {interaction.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Voice Result Section */}
          <Card style={{ marginTop: '1.5rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Volume2 size={20} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Listen in your language</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <select
                  value={lang}
                  onChange={handleLangChange}
                  style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.6' }}
                >
                  {SUPPORTED_LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>

                <button
                  onClick={speakResult}
                  disabled={audioState === 'loading'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-sm)',
                    fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                    border: `1.5px solid ${result.safety_status === 'safe' ? 'var(--color-verified)' : 'var(--color-danger)'}`,
                    background: audioState === 'playing'
                      ? (result.safety_status === 'safe' ? 'var(--color-verified)' : 'var(--color-danger)')
                      : 'transparent',
                    color: audioState === 'playing'
                      ? 'white'
                      : (result.safety_status === 'safe' ? 'var(--color-verified)' : 'var(--color-danger)'),
                    transition: 'all 0.2s ease',
                  }}
                >
                  {audioState === 'loading' && <><Loader2 size={16} className="animate-spin" /> Loading...</>}
                  {audioState === 'idle' && <><Volume2 size={16} /> Speak Result</>}
                  {audioState === 'ready' && <><Volume2 size={16} /> Play Again</>}
                  {audioState === 'playing' && <><Volume2 size={16} /> Playing...</>}
                  {audioState === 'error' && <><VolumeX size={16} /> Retry</>}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
