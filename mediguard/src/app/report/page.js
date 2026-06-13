'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldAlert, Flag, CheckCircle2, ArrowLeft, Loader2, MapPin, User, FileText, Mic, MessageSquare, AudioLines, StopCircle } from 'lucide-react';

export default function ReportPage() {
  const params = useSearchParams();
  const router = useRouter();

  // Pre-fill from URL params if coming from results page
  const batchId    = params.get('batch_id')    || '';
  const verdict    = params.get('verdict')     || '';
  const trustScore = params.get('trust_score') || '';

  const [form, setForm] = useState({
    reporter_name:    '',
    pharmacy_name:    '',
    location:         '',
    additional_notes: '',
  });
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportId,  setReportId]  = useState('');
  const [error,     setError]     = useState('');
  
  // Interactive Voice Agent State
  const [activeMode, setActiveMode] = useState('form'); // 'form' | 'voice'
  const [voiceState, setVoiceState] = useState('idle'); // 'idle' | 'speaking' | 'listening' | 'processing'
  const [voiceStep, setVoiceStep] = useState(0); 
  const [transcript, setTranscript] = useState('');
  const [chatLog, setChatLog] = useState([]); // conversation history for display

  const recognitionRef = useRef(null);
  const cancelledRef = useRef(false);   // prevents zombie effects after cancel
  const collectedRef = useRef({ pharmacy_name: '', additional_notes: '' }); // avoids stale state

  // ── Initialize Web Speech API once ──
  useEffect(() => {
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'hi-IN';
    }
  }, []);

  // ── Play Sarvam AI voice ──
  const currentAudioRef = useRef(null); // track active audio to prevent overlaps

  const playVoice = useCallback((text) => {
    return new Promise(async (resolve) => {
      if (cancelledRef.current) return resolve();
      setVoiceState('speaking');

      // Kill any previous audio still playing
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.onended = null;
        currentAudioRef.current.onerror = null;
        currentAudioRef.current = null;
      }

      try {
        const res = await fetch('/api/voice/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, language: 'hi-IN' })
        });
        const data = await res.json();
        if (cancelledRef.current) return resolve();

        if (data.audioBase64) {
          const audio = new Audio("data:audio/wav;base64," + data.audioBase64);
          currentAudioRef.current = audio;

          let resolved = false;
          const done = () => {
            if (resolved) return;
            resolved = true;
            currentAudioRef.current = null;
            resolve();
          };

          audio.onended = done;
          audio.onerror = done;
          audio.play().catch(() => setTimeout(done, 500));
        } else {
          setTimeout(resolve, 1500);
        }
      } catch (err) {
        console.error("PlayVoice error:", err);
        setTimeout(resolve, 1500);
      }
    });
  }, []);

  // ── Listen for user voice input ──
  const listenForInput = useCallback(() => {
    return new Promise((resolve) => {
      if (cancelledRef.current) return resolve('');
      if (!recognitionRef.current) return resolve('Voice input not available');

      // CRITICAL: Stop any previous recognition session first
      try { recognitionRef.current.abort(); } catch {}
      try { recognitionRef.current.stop(); } catch {}

      // Small delay to let the browser fully release the previous session
      setTimeout(() => {
        if (cancelledRef.current) return resolve('');

        setVoiceState('listening');
        setTranscript('');
        let fullTranscript = '';
        let hasResolved = false;

        const finish = (value) => {
          if (hasResolved) return;
          hasResolved = true;
          clearTimeout(timeout);
          resolve(value);
        };

        // Auto-stop after 8 seconds
        const timeout = setTimeout(() => {
          try { recognitionRef.current?.stop(); } catch {}
          finish(fullTranscript);
        }, 8000);

        recognitionRef.current.onresult = (event) => {
          // Rebuild FULL transcript from ALL results (fixes missing first word)
          let accumulated = '';
          for (let i = 0; i < event.results.length; i++) {
            accumulated += event.results[i][0].transcript;
          }
          fullTranscript = accumulated;
          setTranscript(accumulated);
        };

        recognitionRef.current.onerror = (e) => {
          console.error("Speech Recognition Error:", e.error);
          // Don't wipe transcript if we already heard something
        };

        recognitionRef.current.onend = () => {
          if (cancelledRef.current) return finish('');
          setTimeout(() => finish(fullTranscript), 300);
        };

        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("Recognition start error:", e);
          finish('');
        }
      }, 200);
    });
  }, []);

  // ── Submit report (reads from refs, not stale state) ──
  const submitVoiceReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/report/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          batch_id:         batchId || 'VOICE_REPORT',
          verdict:          verdict || 'suspicious',
          trust_score:      Number(trustScore) || 0,
          pharmacy_name:    collectedRef.current.pharmacy_name || 'Voice Reported Pharmacy',
          location:         'Voice Report',
          reporter_name:    'Voice Reporter',
          additional_notes: collectedRef.current.additional_notes || 'Reported via voice assistant',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReportId(data.reportId);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  }, [batchId, verdict, trustScore]);

  // ── The main voice flow (runs as a single async sequence) ──
  const startVoiceAssistant = useCallback(async () => {
    cancelledRef.current = false;
    collectedRef.current = { pharmacy_name: '', additional_notes: '' };
    setChatLog([]);
    setVoiceStep(1);

    // Unlock audio on user gesture (required by browsers)
    try { new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA").play().catch(() => {}); } catch {}

    // ── STEP 1: Ask for pharmacy name ──
    setChatLog(log => [...log, { role: 'ai', text: 'मेडीगार्ड में आपका स्वागत है। कृपया फार्मेसी का नाम बताएं।' }]);
    await playVoice("मेडीगार्ड में आपका स्वागत है। कृपया फार्मेसी का नाम बताएं।");
    if (cancelledRef.current) return;

    let pharmacyName = await listenForInput();
    if (cancelledRef.current) return;

    // Retry if nothing was heard
    if (!pharmacyName || pharmacyName.trim() === '') {
      setChatLog(log => [...log, { role: 'ai', text: 'हम आपकी आवाज़ नहीं सुन पाए। कृपया दोबारा बताएं।' }]);
      setVoiceStep(1);
      await playVoice("हम आपकी आवाज़ नहीं सुन पाए। कृपया दोबारा बताएं।");
      if (cancelledRef.current) return;
      pharmacyName = await listenForInput();
      if (cancelledRef.current) return;
    }

    // If still nothing, use fallback
    if (!pharmacyName || pharmacyName.trim() === '') pharmacyName = 'Unknown Pharmacy';

    collectedRef.current.pharmacy_name = pharmacyName;
    setChatLog(log => [...log, { role: 'user', text: pharmacyName }]);
    setForm(f => ({ ...f, pharmacy_name: pharmacyName }));
    setVoiceStep(2);

    // ── STEP 2: Ask for the issue ──
    setChatLog(log => [...log, { role: 'ai', text: 'धन्यवाद। दवाई में क्या समस्या है?' }]);
    await playVoice("धन्यवाद। दवाई में क्या समस्या है?");
    if (cancelledRef.current) return;

    let issue = await listenForInput();
    if (cancelledRef.current) return;

    // Retry if nothing was heard
    if (!issue || issue.trim() === '') {
      setChatLog(log => [...log, { role: 'ai', text: 'हम आपकी आवाज़ नहीं सुन पाए। कृपया दोबारा बताएं।' }]);
      await playVoice("हम आपकी आवाज़ नहीं सुन पाए। कृपया दोबारा बताएं।");
      if (cancelledRef.current) return;
      issue = await listenForInput();
      if (cancelledRef.current) return;
    }

    if (!issue || issue.trim() === '') issue = 'Issue reported via voice';

    collectedRef.current.additional_notes = issue;
    setChatLog(log => [...log, { role: 'user', text: issue }]);
    setForm(f => ({ ...f, additional_notes: issue }));
    setVoiceStep(3);

    // ── STEP 3: Confirm and submit ──
    setChatLog(log => [...log, { role: 'ai', text: 'आपकी रिपोर्ट दर्ज कर ली गई है। धन्यवाद।' }]);
    await playVoice("आपकी रिपोर्ट दर्ज कर ली गई है। फार्मेसी का ट्रस्ट स्कोर कम कर दिया गया है। धन्यवाद।");
    if (cancelledRef.current) return;

    setVoiceState('processing');
    await submitVoiceReport();
  }, [playVoice, listenForInput, submitVoiceReport]);

  // ── Stop everything cleanly ──
  const stopAssistant = useCallback(() => {
    cancelledRef.current = true;
    try { recognitionRef.current?.abort?.(); } catch {}
    try { recognitionRef.current?.stop(); } catch {}
    setVoiceState('idle');
    setVoiceStep(0);
    setTranscript('');
    setChatLog([]);
  }, []);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.pharmacy_name.trim()) {
      setError('Please enter the pharmacy name');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res  = await fetch('/api/report/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          batch_id:         batchId || 'MANUAL_REPORT',
          verdict,
          trust_score:      Number(trustScore),
          pharmacy_name:    form.pharmacy_name,
          location:         form.location,
          reporter_name:    form.reporter_name,
          additional_notes: form.additional_notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReportId(data.reportId);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: '520px', margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: '50%', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '2px solid #10b981' }}>
          <CheckCircle2 size={44} style={{ color: '#10b981' }} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Report Submitted
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
          Thank you for reporting. The pharmacy's trust score has been flagged and authorities will be notified.
        </p>
        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', margin: '1.5rem 0', display: 'inline-block' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>Report Reference ID</p>
          <p style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
            {String(reportId).slice(-10).toUpperCase()}
          </p>
        </div>
        <div style={{ background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '2rem', textAlign: 'left' }}>
          <p style={{ color: '#2563EB', fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>
            🔒 In Production: This report will require DigiLocker / Aadhaar verification so every report is legally admissible as evidence.
          </p>
        </div>
        <button onClick={() => router.push('/')}
          style={{ padding: '12px 32px', borderRadius: '8px', border: 'none', background: '#2563EB', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '560px', margin: '2rem auto', padding: '0 1rem' }}>
      {/* Back */}
      <button onClick={() => router.back()}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(220,38,38,0.1)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(220,38,38,0.2)' }}>
          <Flag size={28} style={{ color: '#DC2626' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Report Counterfeit Medicine
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            Help protect others. Your report is anonymous.
          </p>
        </div>
      </div>

      {/* Medicine Badge (if coming from results) */}
      {batchId && (
        <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, margin: 0 }}>REPORTING MEDICINE</p>
            <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'monospace', margin: '2px 0 0' }}>{batchId}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, margin: 0 }}>TRUST SCORE</p>
            <p style={{ color: '#DC2626', fontWeight: 800, fontSize: '1.2rem', margin: '2px 0 0' }}>{trustScore}/100</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', background: 'var(--bg-surface)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <button 
          onClick={() => { setActiveMode('form'); stopAssistant(); }}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: activeMode === 'form' ? 'var(--bg-primary)' : 'transparent', color: activeMode === 'form' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: activeMode === 'form' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
        >
          <FileText size={16} /> Manual Form
        </button>
        <button 
          onClick={() => setActiveMode('voice')}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: activeMode === 'voice' ? '#2563EB' : 'transparent', color: activeMode === 'voice' ? 'white' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
        >
          <Mic size={16} /> Voice Assistant
        </button>
      </div>

      {/* Content Area */}
      {activeMode === 'form' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        <div>
          <label style={labelStyle}>
            <User size={14} /> Your Name <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional — stays anonymous)</span>
          </label>
          <input placeholder="e.g. Rahul Sharma" value={form.reporter_name} onChange={set('reporter_name')} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>
            <ShieldAlert size={14} /> Pharmacy Name <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <input placeholder="e.g. Sharma Medical Store" value={form.pharmacy_name} onChange={set('pharmacy_name')} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>
            <MapPin size={14} /> Location / Address
          </label>
          <input placeholder="e.g. Dharavi, Mumbai, Maharashtra" value={form.location} onChange={set('location')} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>
            <FileText size={14} /> Additional Notes
          </label>
          <textarea
            placeholder="Describe what you noticed (e.g. packaging looks different, pills are discoloured...)"
            value={form.additional_notes}
            onChange={set('additional_notes')}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        {/* DigiLocker note */}
        <div style={{ background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '10px', padding: '12px' }}>
          <p style={{ color: '#2563EB', fontSize: '0.82rem', margin: 0 }}>
            🔒 <strong>Coming Soon:</strong> DigiLocker / Aadhaar verification will make every report legally admissible as evidence against the pharmacy.
          </p>
        </div>

        {error && (
          <p style={{ color: '#DC2626', fontSize: '0.875rem', margin: 0 }}>{error}</p>
        )}

        <button onClick={handleSubmit} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: '#DC2626', color: 'white', fontWeight: 800, fontSize: '1rem' }}>
          {loading
            ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
            : <><Flag size={18} /> Submit Report to Authorities</>}
        </button>
      </div>
      ) : (
        /* Voice Assistant Mode */
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
          
          {/* Animated mic orb */}
          <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {voiceState === 'speaking' && (
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid #2563EB', animation: 'voiceSpin 2s linear infinite', borderTopColor: 'transparent', opacity: 0.5 }} />
            )}
            {voiceState === 'listening' && (
              <>
                <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', animation: 'voicePulse 1.5s infinite' }} />
                <div style={{ position: 'absolute', inset: -20, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', animation: 'voicePulse 1.5s infinite 0.5s' }} />
              </>
            )}
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: voiceState === 'listening' ? '#ef4444' : voiceState === 'speaking' ? '#2563EB' : 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', border: '2px solid var(--border-color)' }}>
              {voiceState === 'listening' ? <Mic size={40} color="white" /> : <AudioLines size={40} color={voiceState === 'speaking' ? 'white' : 'var(--text-muted)'} />}
            </div>
          </div>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            {voiceState === 'idle' ? 'Ready to Report' : 
             voiceState === 'speaking' ? 'AI is speaking...' : 
             voiceState === 'listening' ? 'Listening... 🎤' : 'Processing...'}
          </h2>

          {/* Chat log */}
          <div style={{ minHeight: '100px', maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
            {chatLog.length === 0 && voiceState === 'idle' && (
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem', textAlign: 'center' }}>Press start and the AI will guide you through the reporting process in Hindi.</p>
            )}
            {chatLog.map((msg, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: msg.role === 'ai' ? '#2563EB' : '#10b981' }}>
                  {msg.role === 'ai' ? '🤖 AI' : '🎤 You'}:
                </span>
                <p style={{ margin: '2px 0 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{msg.text}</p>
              </div>
            ))}
            {voiceState === 'listening' && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>🎤 You:</span>
                <p style={{ margin: '2px 0 0', fontSize: '0.9rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>{transcript || 'Speak now...'}</p>
              </div>
            )}
          </div>

          {error && (
            <p style={{ color: '#DC2626', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>
          )}

          {voiceState === 'idle' ? (
            <button onClick={startVoiceAssistant}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 32px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: '#2563EB', color: 'white', fontWeight: 800, fontSize: '1rem', width: '100%' }}>
              <MessageSquare size={18} /> Start Voice Assistant
            </button>
          ) : (
            <button onClick={stopAssistant}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 32px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'transparent', color: '#DC2626', fontWeight: 800, fontSize: '1rem', width: '100%', border: '2px solid #DC2626' }}>
              <StopCircle size={18} /> Cancel
            </button>
          )}

          <style>{`
            @keyframes voiceSpin { 100% { transform: rotate(360deg); } }
            @keyframes voicePulse { 0% { transform: scale(0.95); opacity: 0.8; } 100% { transform: scale(1.2); opacity: 0; } }
          `}</style>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: 'flex', alignItems: 'center', gap: '6px',
  fontSize: '0.875rem', fontWeight: 700,
  color: 'var(--text-primary)', marginBottom: '6px',
};

const inputStyle = {
  width: '100%', padding: '11px 14px',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px', color: 'var(--text-primary)',
  fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
};
