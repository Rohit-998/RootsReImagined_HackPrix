'use client';

import { useState, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldAlert, Flag, CheckCircle2, ArrowLeft, Loader2, MapPin, User, FileText, Mic, MessageSquare, AudioLines, StopCircle, Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES, REPORT_PROMPTS } from '@/utils/languages';

function createRecognition(langCode) {
  if (typeof window === 'undefined') return null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.continuous = true;
  r.interimResults = true;
  r.lang = langCode;
  return r;
}

function ReportPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const batchId = params.get('batch_id') || '';
  const verdict = params.get('verdict') || '';
  const trustScore = params.get('trust_score') || '';

  const [form, setForm] = useState({ reporter_name: '', pharmacy_name: '', location: '', additional_notes: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState('');
  const [error, setError] = useState('');

  const [activeMode, setActiveMode] = useState('form');
  const [voiceState, setVoiceState] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [selectedLang, setSelectedLang] = useState('hi-IN');

  const cancelledRef = useRef(false);
  const collectedRef = useRef({ pharmacy_name: '', additional_notes: '' });
  const activeAudioRef = useRef(null);
  const activeRecogRef = useRef(null);
  const genRef = useRef(0);

  const playVoice = useCallback(async (text) => {
    const gen = ++genRef.current;
    if (cancelledRef.current) return;
    setVoiceState('speaking');

    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.src = '';
      activeAudioRef.current = null;
    }

    try {
      const res = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: selectedLang })
      });
      if (gen !== genRef.current || cancelledRef.current) return;
      const data = await res.json();
      if (gen !== genRef.current || cancelledRef.current) return;

      if (!data.audioBase64) { await delay(1500); return; }

      await new Promise((resolve) => {
        const audio = new Audio("data:audio/wav;base64," + data.audioBase64);
        activeAudioRef.current = audio;
        const done = () => { activeAudioRef.current = null; resolve(); };
        audio.onended = done;
        audio.onerror = done;
        audio.play().catch(() => { setTimeout(done, 500); });
      });
    } catch {
      await delay(1500);
    }
  }, [selectedLang]);

  const listenForInput = useCallback(async () => {
    if (cancelledRef.current) return '';

    const recognition = createRecognition(selectedLang);
    if (!recognition) return '';
    activeRecogRef.current = recognition;

    setVoiceState('listening');
    setTranscript('');

    return new Promise((resolve) => {
      let fullText = '';
      let resolved = false;
      let silenceTimer = null;

      const finish = (val) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(silenceTimer);
        clearTimeout(maxTimer);
        activeRecogRef.current = null;
        try { recognition.stop(); } catch {}
        resolve(val);
      };

      const maxTimer = setTimeout(() => finish(fullText), 12000);

      const resetSilenceTimer = () => {
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          try { recognition.stop(); } catch {}
        }, 3000);
      };

      recognition.onresult = (event) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        fullText = text;
        setTranscript(text);
        resetSilenceTimer();
      };

      recognition.onerror = () => {};
      recognition.onend = () => { setTimeout(() => finish(fullText), 200); };

      silenceTimer = setTimeout(() => {
        try { recognition.stop(); } catch {}
      }, 5000);

      try { recognition.start(); }
      catch { finish(''); }
    });
  }, [selectedLang]);

  const stopAssistant = useCallback(() => {
    cancelledRef.current = true;
    genRef.current++;
    if (activeAudioRef.current) { activeAudioRef.current.pause(); activeAudioRef.current.src = ''; activeAudioRef.current = null; }
    if (activeRecogRef.current) { try { activeRecogRef.current.abort(); } catch {} activeRecogRef.current = null; }
    setVoiceState('idle');
    setTranscript('');
  }, []);

  const submitVoiceReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/report/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_id: batchId || 'VOICE_REPORT',
          verdict: verdict || 'suspicious',
          trust_score: Number(trustScore) || 0,
          pharmacy_name: collectedRef.current.pharmacy_name || 'Voice Reported Pharmacy',
          location: 'Voice Report',
          reporter_name: 'Voice Reporter',
          additional_notes: collectedRef.current.additional_notes || 'Reported via voice',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReportId(data.reportId);
      setSubmitted(true);
    } catch (err) { setError(err.message || 'Failed to submit'); }
    finally { setLoading(false); }
  }, [batchId, verdict, trustScore]);

  const startVoiceAssistant = useCallback(async () => {
    cancelledRef.current = false;
    collectedRef.current = { pharmacy_name: '', additional_notes: '' };
    setChatLog([]);
    setError('');

    const prompts = REPORT_PROMPTS[selectedLang] || REPORT_PROMPTS['default'];

    try { new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA").play().catch(() => {}); } catch {}

    setChatLog(l => [...l, { role: 'ai', text: prompts.welcome }]);
    await playVoice(prompts.welcome);
    if (cancelledRef.current) return;

    let pharmacy = await listenForInput();
    if (cancelledRef.current) return;

    if (!pharmacy.trim()) {
      setChatLog(l => [...l, { role: 'ai', text: prompts.retry }]);
      await playVoice(prompts.retry);
      if (cancelledRef.current) return;
      pharmacy = await listenForInput();
      if (cancelledRef.current) return;
    }
    if (!pharmacy.trim()) pharmacy = 'Unknown Pharmacy';

    collectedRef.current.pharmacy_name = pharmacy;
    setChatLog(l => [...l, { role: 'user', text: pharmacy }]);
    setForm(f => ({ ...f, pharmacy_name: pharmacy }));

    setChatLog(l => [...l, { role: 'ai', text: prompts.issue }]);
    await playVoice(prompts.issue);
    if (cancelledRef.current) return;

    let issue = await listenForInput();
    if (cancelledRef.current) return;

    if (!issue.trim()) {
      setChatLog(l => [...l, { role: 'ai', text: prompts.retry }]);
      await playVoice(prompts.retry);
      if (cancelledRef.current) return;
      issue = await listenForInput();
      if (cancelledRef.current) return;
    }
    if (!issue.trim()) issue = 'Issue reported via voice';

    collectedRef.current.additional_notes = issue;
    setChatLog(l => [...l, { role: 'user', text: issue }]);
    setForm(f => ({ ...f, additional_notes: issue }));

    setChatLog(l => [...l, { role: 'ai', text: prompts.success }]);
    await playVoice(prompts.success);
    if (cancelledRef.current) return;

    setVoiceState('processing');
    await submitVoiceReport();
  }, [playVoice, listenForInput, submitVoiceReport, selectedLang]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.pharmacy_name.trim()) { setError('Please enter the pharmacy name'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/report/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_id: batchId || 'MANUAL_REPORT',
          verdict, trust_score: Number(trustScore),
          pharmacy_name: form.pharmacy_name,
          location: form.location,
          reporter_name: form.reporter_name,
          additional_notes: form.additional_notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReportId(data.reportId); setSubmitted(true);
    } catch (err) { setError(err.message || 'Failed to submit report'); }
    finally { setLoading(false); }
  };

  const labelStyle = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' };
  const inputStyle = { width: '100%', padding: '10px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };

  if (submitted) {
    return (
      <div style={{ maxWidth: '520px', margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(5, 150, 105, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '2px solid var(--color-verified)' }}>
          <CheckCircle2 size={40} style={{ color: 'var(--color-verified)' }} />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Report Submitted</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.6 }}>Thank you for reporting. The pharmacy trust score has been flagged for review.</p>
        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px', margin: '1.5rem 0', display: 'inline-block' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>Report Reference ID</p>
          <p style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', margin: 0 }}>{String(reportId).slice(-10).toUpperCase()}</p>
        </div>
        <button onClick={() => router.push('/')} style={{ padding: '10px 28px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-primary)', background: 'var(--accent-primary)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Back to Home</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '560px', margin: '2rem auto', padding: '0 1rem' }}>
      <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'var(--font-sans)' }}><ArrowLeft size={16} /> Back</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.5rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'rgba(220, 38, 38, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Flag size={24} style={{ color: 'var(--color-danger)' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Report Counterfeit Medicine</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '0.9rem' }}>Help protect others. Your report is anonymous.</p>
        </div>
      </div>

      {batchId && (
        <div style={{ background: 'rgba(220, 38, 38, 0.06)', border: '1px solid rgba(220, 38, 38, 0.2)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, margin: 0 }}>REPORTING MEDICINE</p>
            <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'monospace', margin: '2px 0 0' }}>{batchId}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, margin: 0 }}>TRUST SCORE</p>
            <p style={{ color: 'var(--color-danger)', fontWeight: 700, fontSize: '1.1rem', margin: '2px 0 0' }}>{trustScore}/100</p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', background: 'var(--bg-primary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <button onClick={() => { setActiveMode('form'); stopAssistant(); }} style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)', border: 'none', background: activeMode === 'form' ? 'var(--bg-surface)' : 'transparent', color: activeMode === 'form' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.85rem', boxShadow: activeMode === 'form' ? 'var(--shadow-sm)' : 'none', fontFamily: 'var(--font-sans)' }}><FileText size={16} /> Manual Form</button>
        <button onClick={() => setActiveMode('voice')} style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)', border: 'none', background: activeMode === 'voice' ? 'var(--bg-surface)' : 'transparent', color: activeMode === 'voice' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.85rem', boxShadow: activeMode === 'voice' ? 'var(--shadow-sm)' : 'none', fontFamily: 'var(--font-sans)' }}><Mic size={16} /> Voice Assistant</button>
      </div>

      {activeMode === 'voice' && voiceState === 'idle' && (
        <div style={{ marginBottom: '1.5rem', background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Globe size={18} style={{ color: 'var(--text-muted)' }} />
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Language</label>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {activeMode === 'form' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}><User size={14} /> Your Name <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <input placeholder="e.g. Rahul Sharma" value={form.reporter_name} onChange={set('reporter_name')} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}><ShieldAlert size={14} /> Pharmacy Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <input placeholder="e.g. Sharma Medical Store" value={form.pharmacy_name} onChange={set('pharmacy_name')} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}><MapPin size={14} /> Location / Address</label>
            <input placeholder="e.g. Dharavi, Mumbai" value={form.location} onChange={set('location')} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}><FileText size={14} /> Additional Notes</label>
            <textarea placeholder="Describe what you noticed..." value={form.additional_notes} onChange={set('additional_notes')} rows={4} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          {error && <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', margin: 0 }}>{error}</p>}
          <button onClick={handleSubmit} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-danger)', cursor: loading ? 'not-allowed' : 'pointer', background: 'var(--color-danger)', color: 'white', fontWeight: 600, fontSize: '0.9rem', opacity: loading ? 0.6 : 1, fontFamily: 'var(--font-sans)' }}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Flag size={16} /> Submit Report</>}
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', borderRadius: '50%', background: voiceState === 'listening' ? 'rgba(220, 38, 38, 0.1)' : voiceState === 'speaking' ? 'rgba(30, 58, 95, 0.1)' : 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
            {voiceState === 'listening' ? <Mic size={32} color="var(--color-danger)" /> : <AudioLines size={32} color={voiceState === 'speaking' ? 'var(--accent-primary)' : 'var(--text-muted)'} />}
          </div>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            {voiceState === 'idle' ? 'Voice Report' : voiceState === 'speaking' ? 'AI is speaking...' : voiceState === 'listening' ? 'Listening...' : 'Processing...'}
          </h2>

          <div style={{ minHeight: '100px', maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'left' }}>
            {chatLog.length === 0 && voiceState === 'idle' && <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem', textAlign: 'center' }}>Press start and the AI will guide you through the reporting process.</p>}
            {chatLog.map((msg, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: msg.role === 'ai' ? 'var(--accent-primary)' : 'var(--color-verified)' }}>{msg.role === 'ai' ? 'AI' : 'You'}:</span>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{msg.text}</p>
              </div>
            ))}
            {voiceState === 'listening' && (
              <div style={{ marginBottom: '8px', background: 'rgba(5, 150, 105, 0.05)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-verified)' }}>You:</span>
                <p style={{ margin: '2px 0 0', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{transcript || '...'}</p>
              </div>
            )}
          </div>

          {error && <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

          {voiceState === 'idle' ? (
            <button onClick={startVoiceAssistant} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-primary)', cursor: 'pointer', background: 'var(--accent-primary)', color: 'white', fontWeight: 600, fontSize: '0.9rem', width: '100%', fontFamily: 'var(--font-sans)' }}>
              <MessageSquare size={16} /> Start Voice Assistant
            </button>
          ) : (
            <button onClick={stopAssistant} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 24px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'transparent', color: 'var(--color-danger)', fontWeight: 600, fontSize: '0.9rem', width: '100%', border: '1px solid var(--color-danger)', fontFamily: 'var(--font-sans)' }}>
              <StopCircle size={16} /> Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

export default function ReportPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '4rem' }}><Loader2 size={28} className="animate-spin" style={{ margin: '0 auto' }} color="var(--accent-primary)" /></div>}>
      <ReportPageContent />
    </Suspense>
  );
}
