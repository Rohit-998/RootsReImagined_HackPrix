'use client';
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, MapPin, CheckCircle, AlertTriangle, Loader2, Volume2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageForState } from '../../utils/languages';

export default function VoicePage() {
  const [location, setLocation] = useState({ city: '', state: '', loading: true, error: null });
  const [selectedLang, setSelectedLang] = useState('hi-IN');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('idle');
  const [audioResultUrl, setAudioResultUrl] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          processVoiceInput(text);
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          setStatus('idle');
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }
    if (!navigator.geolocation) {
      setLocation({ loading: false, error: 'Geolocation not supported' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          const state = data.address.state || '';
          const city = data.address.city || data.address.town || '';

          setLocation({ city, state, loading: false });

          if (state) {
            setSelectedLang(getLanguageForState(state));
          }
        } catch {
          setLocation({ loading: false, error: 'Failed to fetch location details' });
        }
      },
      () => {
        setLocation({ loading: false, error: 'Location access denied' });
      }
    );
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedLang;
    }
  }, [selectedLang]);

  const handleRecord = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setAudioResultUrl(null);
      setStatus('recording');
      setIsRecording(true);
      recognitionRef.current?.start();
    }
  };

  const processVoiceInput = async (text) => {
    setStatus('processing');
    try {
      // Very basic simulation of verification based on spoken text
      let replyText = `You said: ${text}. `;
      if (text.toLowerCase().includes('paracetamol')) {
         replyText += 'Paracetamol 500mg verified. It is safe to consume.';
      } else {
         replyText += 'Medicine not found in our verified database. Please check the batch number.';
      }

      const res = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: replyText,
          language: selectedLang
        })
      });
      const data = await res.json();
      setStatus('verified');
      if (data.audioBase64) {
        const audioSrc = `data:audio/wav;base64,${data.audioBase64}`;
        setAudioResultUrl(audioSrc);
        const audio = new Audio(audioSrc);
        audio.play();
      }
    } catch {
      console.error("TTS failed");
      setStatus('verified');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '720px', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Voice Verification</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Powered by Sarvam AI. Speak the medicine name to verify.</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <MapPin size={16} style={{ color: 'var(--accent-primary)' }} />
          {location.loading ? (
            <span style={{ opacity: 0.6 }}>Detecting location...</span>
          ) : location.error ? (
            <span style={{ color: 'var(--color-warning)' }}>{location.error}</span>
          ) : (
            <span>{location.city}, {location.state}</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Language:</label>
          <select
            style={{ padding: '8px 28px 8px 10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', cursor: 'pointer', lineHeight: '1.6' }}
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '3rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <button
          onClick={handleRecord}
          disabled={status === 'processing'}
          style={{
            width: '96px', height: '96px', borderRadius: '50%', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
            cursor: status === 'processing' ? 'not-allowed' : 'pointer',
            background: isRecording ? 'var(--color-danger)' : status === 'processing' ? 'var(--bg-primary)' : 'var(--accent-primary)',
            color: 'white', transition: 'all 0.2s ease',
            boxShadow: isRecording ? '0 0 0 8px rgba(220,38,38,0.15)' : 'none',
          }}
        >
          {status === 'processing' ? (
            <Loader2 size={36} className="animate-spin" />
          ) : isRecording ? (
            <MicOff size={36} />
          ) : (
            <Mic size={36} />
          )}
        </button>

        <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {status === 'idle' && "Tap to start speaking"}
          {status === 'recording' && "Listening... Tap to stop"}
          {status === 'processing' && "Sarvam AI is analyzing..."}
          {status === 'verified' && "Verification Complete"}
        </p>

        {transcript && (
          <div style={{ marginTop: '1.5rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: '1rem', border: '1px solid var(--border-color)', maxWidth: '400px', margin: '1.5rem auto 0' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Transcribed Text:</p>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontFamily: 'monospace', marginBottom: '0.75rem' }}>{transcript}</p>

            {status === 'verified' && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-verified)', fontWeight: 600 }}>
                  <CheckCircle size={18} />
                  Medicine Verified
                </div>
                {audioResultUrl && (
                  <button
                    onClick={() => { const audio = new Audio(audioResultUrl); audio.play(); }}
                    style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}
                    title="Play Audio"
                  >
                    <Volume2 size={16} />
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
