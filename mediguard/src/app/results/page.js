'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShieldCheck, ShieldAlert, ShieldX, Calendar, Hash,
  Building2, Package, Volume2, VolumeX,
  ArrowLeft, Loader2, Flag
} from 'lucide-react';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import styles from './page.module.css';
import { SUPPORTED_LANGUAGES, buildVerdictAudioText } from '@/utils/languages';

const LAYER_META = {
  batchCheck:    { name: 'Batch Validation',      max: 30 },
  hashCheck:     { name: 'Cryptographic Hash',    max: 25 },
  scanFrequency: { name: 'Clone Detection',       max: 20 },
  geoCheck:      { name: 'Geographic Validation', max: 10 },
  temporalCheck: { name: 'Temporal Validation',   max: 10 },
  supplyChain:   { name: 'Supply Chain Integrity',max: 5  },
};

const VERDICT_CONFIG = {
  verified:    { color: '#0284C7', bg: 'rgba(2,132,199,0.1)',   border: '#0284C7', Icon: ShieldCheck, title: 'AUTHENTICITY VERIFIED',   sub: 'Passed all security layers. Safe to consume.' },
  suspicious:  { color: '#D97706', bg: 'rgba(217,119,6,0.1)',   border: '#D97706', Icon: ShieldAlert, title: 'SUSPICIOUS — DO NOT USE', sub: 'Some verification layers failed. Do not consume.' },
  counterfeit: { color: '#DC2626', bg: 'rgba(220,38,38,0.1)',   border: '#DC2626', Icon: ShieldX,     title: 'COUNTERFEIT DETECTED',    sub: 'Multiple failures. This medicine is likely fake.' },
};

const grades = ['A+', 'A', 'B', 'C', 'D', 'F'];
const gradeFromScore = s => s >= 90 ? 'A+' : s >= 80 ? 'A' : s >= 65 ? 'B' : s >= 50 ? 'C' : s >= 40 ? 'D' : 'F';

export default function ResultsPage() {
  const params  = useSearchParams();
  const router  = useRouter();
  const audioEl = useRef(null);    // holds the Audio object

  const [result, setResult]         = useState(null);
  const [lang, setLang]             = useState('hi-IN');
  const [audioState, setAudioState] = useState('idle');
  const [audioSrc, setAudioSrc]     = useState(null);

  // ── Parse URL data ──────────────────────────────────────────────────────
  useEffect(() => {
    const raw = params.get('data');
    if (!raw) return;
    try { setResult(JSON.parse(decodeURIComponent(raw))); } catch {}
    // Auto-detect language from browser locale
    const bl = navigator.language || 'hi-IN';
    const auto = ['ta','te','mr','bn','gu','kn','ml','pa','or'].find(l => bl.startsWith(l));
    if (auto) setLang(`${auto}-IN`);
  }, [params]);

  // ── Fetch Sarvam TTS whenever result or lang changes ────────────────────
  useEffect(() => {
    if (!result?.verdict) return;
    fetchAndPrepareAudio(result.verdict, lang);
  }, [result, lang]);

  const fetchAndPrepareAudio = async (verdict, langCode) => {
    setAudioState('loading');
    // Destroy previous audio
    if (audioEl.current) { audioEl.current.pause(); audioEl.current = null; }
    setAudioSrc(null);

    // Build rich message with the specific failure reason
    const text = buildVerdictAudioText(
      verdict,
      langCode,
      result?.results || {},
      result?.medicineInfo?.name || null
    );

    try {
      const res = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: langCode }),
      });
      const { audioBase64 } = await res.json();
      if (!audioBase64) throw new Error('No audio');

      const src = `data:audio/wav;base64,${audioBase64}`;
      setAudioSrc(src);

      // Create Audio element and wait for it to be FULLY ready before playing
      const audio = new Audio(src);
      audioEl.current = audio;

      audio.addEventListener('ended',  () => setAudioState('ready'));
      audio.addEventListener('pause',  () => setAudioState('ready'));
      audio.addEventListener('error',  () => setAudioState('error'));

      // KEY FIX: Wait for canplaythrough — audio fully buffered
      audio.addEventListener('canplaythrough', () => {
        setAudioState('ready');
        // Auto-play once ready (only on first load, not on lang change replays)
        audio.play().then(() => setAudioState('playing')).catch(() => setAudioState('ready'));
      }, { once: true });

      audio.load();
    } catch (err) {
      console.error('Sarvam TTS error:', err);
      setAudioState('error');
    }
  };

  const toggleAudio = () => {
    const audio = audioEl.current;
    if (!audio) return;
    if (audioState === 'playing') {
      audio.pause();
    } else {
      audio.currentTime = 0;
      audio.play().then(() => setAudioState('playing')).catch(console.error);
    }
  };

  // ── Language change ─────────────────────────────────────────────────────
  const handleLangChange = (e) => {
    setLang(e.target.value);
    // Effect above will auto-fire and refetch
  };

  // ── No data fallback ────────────────────────────────────────────────────
  if (!result) return (
    <div className={`container ${styles.resultsContainer}`} style={{ textAlign:'center', paddingTop:'4rem' }}>
      <ShieldAlert size={48} style={{ color:'#D97706', margin:'0 auto 1rem' }} />
      <h2>No verification data found.</h2>
      <p style={{ color:'var(--text-secondary)', marginTop:'0.5rem' }}>Scan a medicine QR code first.</p>
      <button onClick={() => router.push('/scan')}
        style={{ marginTop:'1.5rem', padding:'12px 28px', background:'#0284C7', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:600 }}>
        Go to Scanner
      </button>
    </div>
  );

  const { medicineInfo, results, totalScore, verdict } = result;
  const vc    = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.suspicious;
  const VIcon = vc.Icon;
  const grade = gradeFromScore(totalScore);

  return (
    <div className={`container ${styles.resultsContainer}`}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => router.push('/scan')}
          style={{ display:'flex', alignItems:'center', gap:'6px', color:'var(--text-secondary)', background:'none', border:'none', cursor:'pointer', marginBottom:'1rem', fontSize:'0.9rem' }}>
          <ArrowLeft size={16} /> Back to Scanner
        </button>

        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
          <div>
            <h1 className={styles.title}>Verification Results</h1>
            <p className={styles.subtitle}>Analysis complete. Cryptographic trust score generated.</p>
          </div>

          {/* Language + Audio Controls */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
            {/* Language Selector */}
            <select
              value={lang}
              onChange={handleLangChange}
              style={{ background:'var(--bg-surface)', border:'1px solid var(--border-color)', color:'var(--text-primary)', borderRadius:'8px', padding:'8px 12px', fontSize:'0.85rem', cursor:'pointer', outline:'none' }}
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>

            {/* Play / Loading Button */}
            <button
              onClick={toggleAudio}
              disabled={audioState === 'loading' || audioState === 'idle' || audioState === 'error'}
              title={audioState === 'error' ? 'Audio unavailable' : audioState === 'loading' ? 'Loading...' : audioState === 'playing' ? 'Pause' : 'Play verdict'}
              style={{
                display:'flex', alignItems:'center', gap:'8px',
                padding:'9px 18px', borderRadius:'8px', border:'none',
                cursor: (audioState === 'loading' || audioState === 'idle') ? 'not-allowed' : 'pointer',
                background: audioState === 'playing' ? vc.color : 'var(--bg-surface)',
                color: audioState === 'playing' ? 'white' : vc.color,
                border: `1px solid ${vc.color}`,
                fontWeight:600, fontSize:'0.85rem', transition:'all 0.3s',
                boxShadow: audioState === 'playing' ? `0 0 16px ${vc.color}66` : 'none',
                minWidth: '140px', justifyContent:'center',
              }}
            >
              {audioState === 'loading' && <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} /> Loading audio...</>}
              {audioState === 'ready'   && <><Volume2 size={16} /> 🔊 Play Verdict</>}
              {audioState === 'playing' && <><Volume2 size={16} /> Playing...</>}
              {audioState === 'error'   && <><VolumeX size={16} /> Audio Error</>}
              {audioState === 'idle'    && <><VolumeX size={16} /> Loading...</>}
            </button>
          </div>
        </div>
      </div>

      {/* Score + Info */}
      <div className={styles.scoreSection}>
        <Card className={styles.scoreCard}>
          <div className={styles.scoreBox}>
            <p className={styles.scoreLabel}>AUTHENTICITY SCORE</p>
            <h2 className={styles.scoreValue} style={{ color: vc.color }}>
              {totalScore} <span className={styles.scoreMax}>/ 100</span>
            </h2>
          </div>
          <div className={styles.gradeBox}>
            <div className={styles.gradeScale}>
              {grades.map(g => (
                <span key={g} className={`${styles.grade} ${g === grade ? styles.gradeActive : ''}`}
                  style={g === grade ? { backgroundColor: vc.color, color:'white' } : {}}>
                  {g}
                </span>
              ))}
            </div>
            <p className={styles.gradeDesc}>{verdict === 'verified' ? 'Highest Trust Tier' : verdict === 'suspicious' ? 'Low Trust' : 'Failed Verification'}</p>
          </div>
        </Card>

        <Card className={styles.infoCard}>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <Package size={16} className={styles.infoIcon} />
              <div>
                <p className={styles.infoLabel}>Medicine Name</p>
                <p className={styles.infoValue}>{medicineInfo?.name || 'Unknown'}</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <Building2 size={16} className={styles.infoIcon} />
              <div>
                <p className={styles.infoLabel}>Manufacturer</p>
                <p className={styles.infoValue}>{medicineInfo?.manufacturer || 'Not Found'}</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <Hash size={16} className={styles.infoIcon} />
              <div>
                <p className={styles.infoLabel}>Batch ID</p>
                <p className={styles.infoValue}>{medicineInfo?.batch_id || '—'}</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <Calendar size={16} className={styles.infoIcon} />
              <div>
                <p className={styles.infoLabel}>Expiry Date</p>
                <p className={styles.infoValue}>{medicineInfo?.exp_date ? new Date(medicineInfo.exp_date).toLocaleDateString() : '—'}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Layer Results */}
      <h3 className={styles.sectionTitle}>Security Layer Analysis</h3>
      <div className={styles.layerGrid}>
        {Object.entries(LAYER_META).map(([key, meta]) => {
          const layer  = results?.[key];
          const passed = layer?.passed;
          return (
            <Card key={key} className={styles.layerCard}>
              <div className={styles.layerHeader}>
                <h4 className={styles.layerName}>{meta.name}</h4>
                <StatusBadge status={passed ? 'verified' : 'counterfeit'} label={passed ? 'PASSED' : 'FAILED'} />
              </div>
              <p className={styles.layerDesc} style={{ color:'var(--text-secondary)' }}>
                {layer?.message || '—'}
                {key === 'scanFrequency' && layer?.scanCount != null && (
                  <span style={{ display:'block', marginTop:'4px', fontWeight:700, color: passed ? '#0284C7' : '#DC2626' }}>
                    Scan Count: {layer.scanCount}
                  </span>
                )}
              </p>
              <div className={styles.layerScore} style={{ color: passed ? '#10b981' : '#DC2626' }}>
                {layer?.score ?? 0} / {meta.max} pts
              </div>
            </Card>
          );
        })}
      </div>

      {/* Verdict Banner */}
      <div className={styles.verdictBanner} style={{ background:vc.bg, border:`2px solid ${vc.border}`, color:vc.color }}>
        <VIcon size={48} />
        <div style={{ flex:1 }}>
          <h2 className={styles.verdictTitle}>{vc.title}</h2>
          <p className={styles.verdictSubtitle} style={{ color:vc.color, opacity:0.85 }}>{vc.sub}</p>
        </div>
        {verdict !== 'verified' && (
          <button
            onClick={() => router.push(`/report?batch_id=${encodeURIComponent(medicineInfo?.batch_id || '')}&verdict=${verdict}&trust_score=${totalScore}`)}
            style={{
              display:'flex', alignItems:'center', gap:'8px',
              padding:'12px 20px', borderRadius:'10px', border:`2px solid ${vc.color}`,
              background:'rgba(0,0,0,0.2)', color: vc.color,
              cursor:'pointer', fontWeight:700, fontSize:'0.9rem', whiteSpace:'nowrap',
            }}
          >
            <Flag size={18} /> Report This
          </button>
        )}
      </div>
    </div>
  );
}
