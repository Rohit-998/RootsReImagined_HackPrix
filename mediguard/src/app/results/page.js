'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShieldCheck, ShieldAlert, ShieldX, Calendar, Hash,
  Building2, Package, Volume2, VolumeX,
  ArrowLeft, Loader2, Flag, Pill, Info, AlertCircle
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

function ResultsPageContent() {
  const params  = useSearchParams();
  const router  = useRouter();
  const audioEl = useRef(null);    // holds the Audio object

  const [result, setResult]         = useState(null);
  const [lang, setLang]             = useState('hi-IN');
  const [audioState, setAudioState] = useState('idle');
  const [audioSrc, setAudioSrc]     = useState(null);

  // For Drug Info TTS
  const drugAudioEl = useRef(null);
  const [drugAudioState, setDrugAudioState] = useState('idle');

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

  const playDrugTTS = async () => {
    if (drugAudioState === 'playing') {
      drugAudioEl.current?.pause();
      setDrugAudioState('ready');
      return;
    }
    
    // If already loaded for current lang, just play
    if (drugAudioEl.current) {
      drugAudioEl.current.currentTime = 0;
      drugAudioEl.current.play().then(() => setDrugAudioState('playing')).catch(console.error);
      return;
    }

    setDrugAudioState('loading');
    const textToRead = `Disclaimer: This is a safe prescription. Please follow your doctor's prescription first. Category: ${result?.medicineInfo?.category || 'N/A'}. Dosage: ${result?.medicineInfo?.dosage || 'Consult your doctor'}. Instructions: ${result?.medicineInfo?.instructions || ''}. Side effects include ${result?.medicineInfo?.side_effects?.join(', ') || 'none specified'}.`;
    
    try {
      const res = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToRead, language: lang }),
      });
      const { audioBase64 } = await res.json();
      if (!audioBase64) throw new Error('No audio returned');

      const src = `data:audio/wav;base64,${audioBase64}`;
      const audio = new Audio(src);
      drugAudioEl.current = audio;

      audio.addEventListener('ended',  () => setDrugAudioState('ready'));
      audio.addEventListener('pause',  () => setDrugAudioState('ready'));
      audio.addEventListener('error',  () => setDrugAudioState('error'));
      audio.addEventListener('canplaythrough', () => {
        setDrugAudioState('ready');
        audio.play().then(() => setDrugAudioState('playing')).catch(() => setDrugAudioState('ready'));
      }, { once: true });
      audio.load();
    } catch (err) {
      console.error('Drug TTS Error:', err);
      setDrugAudioState('error');
    }
  };

  // Clear drug TTS if language changes so it fetches fresh on next play
  useEffect(() => {
    if (drugAudioEl.current) {
      drugAudioEl.current.pause();
      drugAudioEl.current = null;
      setDrugAudioState('idle');
    }
  }, [lang]);

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

      {/* Drug Information Card */}
      {medicineInfo && (medicineInfo.category || medicineInfo.instructions || medicineInfo.side_effects?.length > 0) && (
        <Card style={{ marginTop: '1.5rem', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Pill size={20} style={{ color: '#7c3aed' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Drug Information</h3>
            </div>
            
            {/* Play Button for Sarvam TTS */}
            <button 
              onClick={playDrugTTS}
              disabled={drugAudioState === 'loading'}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '20px',
                background: drugAudioState === 'playing' ? 'rgba(124, 58, 237, 0.1)' : 'var(--bg-panel)',
                color: drugAudioState === 'playing' ? '#7c3aed' : 'var(--text-secondary)',
                border: `1px solid ${drugAudioState === 'playing' ? '#7c3aed' : 'var(--border-color)'}`,
                cursor: drugAudioState === 'loading' ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s'
              }}
            >
              {drugAudioState === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 
               drugAudioState === 'playing' ? <VolumeX size={16} /> : <Volume2 size={16} />}
              {drugAudioState === 'playing' ? 'Stop' : 'Listen'}
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div>
              <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                <Info size={14} /> Usage & Dosage
              </p>
              
              <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', borderLeft: '3px solid #10b981', marginBottom: '12px', marginTop: '8px' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#047857', fontWeight: 600, lineHeight: 1.4 }}>
                  <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
                  This is a safe prescription. Please follow your doctor's prescription first.
                </p>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: '0 0 6px', lineHeight: 1.5 }}>
                <span style={{ fontWeight: 600 }}>Category:</span> {medicineInfo.category || 'N/A'} {medicineInfo.strength ? `(${medicineInfo.strength})` : ''}
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: '0 0 6px', lineHeight: 1.5 }}>
                <span style={{ fontWeight: 600 }}>Dosage:</span> {medicineInfo.dosage || 'Consult your doctor.'}
              </p>
              {medicineInfo.instructions && (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 600 }}>Instructions:</span> {medicineInfo.instructions}
                </p>
              )}
            </div>

            {(medicineInfo.side_effects?.length > 0 || medicineInfo.drug_interactions?.length > 0) && (
              <div>
                <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <AlertCircle size={14} /> Warnings & Side Effects
                </p>
                {medicineInfo.side_effects?.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>Common Side Effects:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {medicineInfo.side_effects.map(effect => (
                        <span key={effect} style={{ fontSize: '0.8rem', padding: '2px 8px', background: 'rgba(220,38,38,0.1)', color: '#DC2626', borderRadius: '4px' }}>
                          {effect}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {medicineInfo.drug_interactions?.length > 0 && (
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>Interacts With:</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {medicineInfo.drug_interactions.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

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

      {/* Share Actions */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => {
            const msg = verdict === 'verified'
              ? `✅ MediGuard: ${medicineInfo?.name || 'Medicine'} (Batch: ${medicineInfo?.batch_id}) is VERIFIED with a score of ${totalScore}/100. Safe to consume!`
              : `⚠️ MediGuard Alert: ${medicineInfo?.name || 'Medicine'} (Batch: ${medicineInfo?.batch_id}) is ${verdict?.toUpperCase()} — Trust Score: ${totalScore}/100. Do NOT consume! Report at: ${typeof window !== 'undefined' ? window.location.origin : ''}/report`;
            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
          }}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', border: 'none', background: '#25D366', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.553 4.104 1.519 5.832L0 24l6.335-1.652C8.07 23.447 9.985 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.82 0-3.543-.487-5.024-1.382l-.36-.214-3.742.977.998-3.648-.235-.374C2.702 15.898 2.2 14.005 2.2 12 2.2 6.486 6.486 2.2 12 2.2c5.514 0 9.8 4.286 9.8 9.8 0 5.514-4.286 9.8-9.8 9.8z" fillRule="evenodd"/></svg>
          Share on WhatsApp
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: 'MediGuard Result', text: `${medicineInfo?.name || 'Medicine'} — ${verdict?.toUpperCase()} (${totalScore}/100)`, url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied!');
            }
          }}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
        >
          📤 Share Result
        </button>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '4rem' }}><Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} color="#2563EB" /></div>}>
      <ResultsPageContent />
    </Suspense>
  );
}
