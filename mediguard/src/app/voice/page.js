'use client';
import { useState, useEffect } from 'react';
import { Mic, MicOff, MapPin, CheckCircle, AlertTriangle, Loader2, Volume2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageForState } from '../../utils/languages';

export default function VoicePage() {
  const [location, setLocation] = useState({ city: '', state: '', loading: true, error: null });
  const [selectedLang, setSelectedLang] = useState('hi-IN');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('idle'); // idle, recording, processing, verified
  const [audioResultUrl, setAudioResultUrl] = useState(null);

  // 1. Auto-detect location & set language
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ loading: false, error: 'Geolocation not supported' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Reverse geocoding (using a free API for demo purposes - Nominatim)
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          const state = data.address.state || '';
          const city = data.address.city || data.address.town || '';
          
          setLocation({ city, state, loading: false });
          
          // Auto-select language based on state
          if (state) {
            setSelectedLang(getLanguageForState(state));
          }
        } catch (err) {
          setLocation({ loading: false, error: 'Failed to fetch location details' });
        }
      },
      (err) => {
        setLocation({ loading: false, error: 'Location access denied' });
      }
    );
  }, []);

  // 2. Mock Recording Function (Since browser MediaRecorder requires HTTPS/localhost setup)
  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setStatus('processing');
      simulateSarvamProcess();
    } else {
      setIsRecording(true);
      setStatus('recording');
    }
  };

  const simulateSarvamProcess = () => {
    // 1. Transcribe (simulated delay)
    setTimeout(() => {
      setTranscript("Paracetamol 500mg (BATCH-SUN-2024-001)");
      
      // 2. Verify + TTS (simulated delay)
      setTimeout(async () => {
        setStatus('verified');
        
        // Actually call our TTS API to generate the audio
        try {
          const res = await fetch('/api/voice/synthesize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              text: 'यह दवा बिल्कुल सुरक्षित है। आप इसका सेवन कर सकते हैं।', // Hardcoded Hindi for demo if language is hi-IN
              language: selectedLang 
            })
          });
          const data = await res.json();
          if (data.audioBase64) {
            const audioSrc = `data:audio/wav;base64,${data.audioBase64}`;
            setAudioResultUrl(audioSrc);
            
            // Auto play
            const audio = new Audio(audioSrc);
            audio.play();
          }
        } catch (e) {
          console.error("TTS failed", e);
        }
      }, 2000);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center gap-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Voice Verification</h1>
        <p className="text-slate-400">Powered by Sarvam AI. Speak the medicine name to verify.</p>
      </div>

      {/* Location & Language Bar */}
      <div className="w-full glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-300">
          <MapPin className="h-5 w-5 text-blue-400" />
          {location.loading ? (
            <span className="animate-pulse">Detecting location...</span>
          ) : location.error ? (
            <span className="text-yellow-400">{location.error}</span>
          ) : (
            <span>{location.city}, {location.state}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-400">Language:</label>
          <select 
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500"
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Interaction Area */}
      <div className="w-full glass-panel p-10 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
        
        {/* Recording Animation */}
        {isRecording && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 bg-blue-500/20 rounded-full animate-ping"></div>
            <div className="absolute w-48 h-48 bg-blue-500/20 rounded-full animate-pulse"></div>
          </div>
        )}

        <button 
          onClick={handleRecord}
          disabled={status === 'processing'}
          className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.5)]' 
              : status === 'processing'
                ? 'bg-slate-700'
                : 'bg-blue-600 hover:bg-blue-500 hover:scale-105 shadow-[0_0_30px_rgba(37,99,235,0.3)]'
          }`}
        >
          {status === 'processing' ? (
            <Loader2 className="h-12 w-12 text-white animate-spin" />
          ) : isRecording ? (
            <MicOff className="h-12 w-12 text-white" />
          ) : (
            <Mic className="h-12 w-12 text-white" />
          )}
        </button>

        <div className="mt-8 text-center z-10">
          <p className="text-xl font-medium text-white h-8">
            {status === 'idle' && "Tap to start speaking"}
            {status === 'recording' && "Listening... Tap to stop"}
            {status === 'processing' && "Sarvam AI is analyzing..."}
            {status === 'verified' && "Verification Complete"}
          </p>
        </div>

        {/* Results */}
        {transcript && (
          <div className="mt-8 w-full max-w-md bg-slate-900/80 p-4 rounded-xl border border-slate-800 z-10">
            <p className="text-sm text-slate-400 mb-1">Transcribed Text:</p>
            <p className="text-lg text-white font-mono mb-4">"{transcript}"</p>
            
            {status === 'verified' && (
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle className="h-5 w-5" />
                  Medicine Verified
                </div>
                {audioResultUrl && (
                  <button 
                    onClick={() => {
                      const audio = new Audio(audioResultUrl);
                      audio.play();
                    }}
                    className="p-2 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors"
                    title="Play Audio"
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
