'use client';

import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, ShieldCheck, ShieldX, QrCode, CheckCircle2, XCircle, Volume2, Play } from 'lucide-react';
import styles from './page.module.css';

// Static barcode widths — no Math.random() to avoid SSR/hydration mismatch
const BARCODE_WIDTHS = [3,6,3,3,6,3,6,6,3,6,3,3,6,3,6,3,3,6,6,3];

// The cloned QR payload that will FAIL verification (50+ scans in DB)
const FAKE_QR_PAYLOAD = {
  batch_id: 'BATCH-CIP-2024-015',
  serial_number: 'SN-0002',
  hash: '' // intentionally wrong — Layer 2 will fail too
};

export default function DemoPage() {
  const [currentStep, setCurrentStep]   = useState(-1);
  const [demoSteps, setDemoSteps]       = useState([]);
  const [done, setDone]                 = useState(false);
  const [running, setRunning]           = useState(false);
  const [verdict, setVerdict]           = useState(null);
  const [score, setScore]               = useState(null);
  const [audioReady, setAudioReady]     = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  async function runDemo() {
    setCurrentStep(-1);
    setDone(false);
    setRunning(true);
    setDemoSteps([]);
    setVerdict(null);
    setScore(null);
    setAudioReady(false);

    try {
      // Hit real verify API with the fake/cloned medicine
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrData: FAKE_QR_PAYLOAD,
          userLocation: { region: 'Maharashtra', lat: 19.076, lng: 72.877 }
        }),
      });
      const data = await res.json();

      const layerMap = [
        { label: 'Batch Check',           key: 'batchCheck' },
        { label: 'Hash Verification',     key: 'hashCheck' },
        { label: 'Clone Detection',       key: 'scanFrequency' },
        { label: 'Geo Validation',        key: 'geoCheck' },
        { label: 'Temporal Validation',   key: 'temporalCheck' },
        { label: 'Supply Chain Check',    key: 'supplyChain' },
      ];

      const steps = layerMap.map(l => ({
        label: l.label,
        status: data.results?.[l.key]?.passed ? 'success' : 'fail',
        message: data.results?.[l.key]?.message || '',
      }));

      setDemoSteps(steps);
      setVerdict(data.verdict);
      setScore(data.totalScore);

      // Fetch Sarvam TTS for the verdict
      const verdictText = data.verdict === 'counterfeit'
        ? 'चेतावनी! यह दवा नकली है। इसे इस्तेमाल न करें।'
        : 'यह दवा संदिग्ध है। कृपया इसे न लें।';

      fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: verdictText, language: 'hi-IN' }),
      })
        .then(r => r.json())
        .then(({ audioBase64 }) => {
          if (!audioBase64) return;
          const src = `data:audio/wav;base64,${audioBase64}`;
          audioRef.current = new Audio(src);
          audioRef.current.onended = () => setAudioPlaying(false);
          setAudioReady(true);
        });

    } catch (err) {
      console.error('Demo API error:', err);
      setRunning(false);
    }
  }

  // Animate steps one by one after data arrives
  useEffect(() => {
    if (demoSteps.length === 0) return;
    let i = 0;
    const interval = setInterval(() => {
      setCurrentStep(i);
      i++;
      if (i >= demoSteps.length) {
        clearInterval(interval);
        setDone(true);
        setRunning(false);
        // Auto-play audio after steps finish
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play().catch(console.error);
            setAudioPlaying(true);
          }
        }, 600);
      }
    }, 800);
    return () => clearInterval(interval);
  }, [demoSteps]);

  const playAudio = () => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
      setAudioPlaying(true);
    }
  };

  return (
    <div className="container">
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Live Verification Demo</h1>
        <p className={styles.subtitle}>
          See how MediGuard catches counterfeit medicines in seconds — compared to traditional barcode systems.
        </p>
      </div>

      <div className={styles.splitLayout}>
        {/* LEFT: Current System */}
        <div className={`${styles.panel} ${styles.legacyPanel}`}>
          <div className={styles.panelHeader}>
            <QrCode size={20} />
            <span>Current System</span>
          </div>
          <div className={styles.legacyBody}>
            <div className={styles.barcodeBox}>
              <div className={styles.barcodeLines}>
                {BARCODE_WIDTHS.map((w, i) => (
                  <div key={i} className={styles.barcodeLine} style={{ width: `${w}px` }} />
                ))}
              </div>
              <p className={styles.barcodeLabel}>|||| BATCH-CIP-2024-015 ||||</p>
            </div>

            <div className={styles.legacyResult}>
              <CheckCircle2 size={18} className={styles.legacyCheck} />
              <span>Product Found ✅</span>
            </div>

            <div className={styles.legacyInfo}>
              <div className={styles.legacyRow}><span>Name:</span><span>Amoxicillin 250mg</span></div>
              <div className={styles.legacyRow}><span>Code:</span><span>BATCH-CIP-2024-015</span></div>
            </div>

            <div className={styles.legacyWarning}>
              <ShieldAlert size={16} />
              <span>No additional validation — <strong>CLONED QR undetected</strong></span>
            </div>
          </div>
        </div>

        {/* RIGHT: MediGuard */}
        <div className={`${styles.panel} ${styles.mediguardPanel}`}>
          <div className={styles.panelHeader}>
            <ShieldCheck size={20} />
            <span>MediGuard — 6 Layer Engine</span>
          </div>
          <div className={styles.mediguardBody}>
            <div className={styles.stepsList}>
              {demoSteps.length === 0 && (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                  Press "Run Verification" to start the demo
                </p>
              )}
              {demoSteps.map((step, idx) => {
                const revealed  = idx <= currentStep;
                const isSuccess = step.status === 'success';
                return (
                  <div
                    key={step.label}
                    className={`${styles.demoStep} ${revealed ? styles.stepRevealed : ''} ${revealed && isSuccess ? styles.stepSuccess : ''} ${revealed && !isSuccess ? styles.stepFail : ''}`}
                  >
                    {!revealed ? (
                      <div className={styles.stepPending} />
                    ) : isSuccess ? (
                      <CheckCircle2 size={20} className={styles.iconSuccess} />
                    ) : (
                      <XCircle size={20} className={styles.iconFail} />
                    )}
                    <span className={styles.stepLabel}>{step.label}</span>
                    {revealed && (
                      <span className={`${styles.stepResult} ${isSuccess ? styles.resultPass : styles.resultFail}`}>
                        {isSuccess ? 'PASS' : 'FAIL'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {done && verdict && (
              <div className={styles.verdictBox} style={{
                background: verdict === 'counterfeit' ? 'rgba(220,38,38,0.1)' : 'rgba(217,119,6,0.1)',
                border: `2px solid ${verdict === 'counterfeit' ? '#DC2626' : '#D97706'}`,
                color: verdict === 'counterfeit' ? '#DC2626' : '#D97706',
              }}>
                {verdict === 'counterfeit' ? <ShieldX size={36} /> : <ShieldAlert size={36} />}
                <div>
                  <p className={styles.verdictLabel}>
                    {verdict === 'counterfeit' ? '🚨 COUNTERFEIT DETECTED' : '⚠️ SUSPICIOUS MEDICINE'}
                  </p>
                  <p className={styles.verdictSub}>Trust Score: {score}/100 — Clone detection failed. QR scanned 50+ times.</p>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
              <button
                className={styles.runBtn}
                onClick={runDemo}
                disabled={running}
              >
                {running ? 'Verifying...' : done ? '🔄 Run Again' : <><Play size={16} /> Run Verification</>}
              </button>

              {audioReady && done && (
                <button
                  onClick={playAudio}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '10px 18px', borderRadius: '8px',
                    background: audioPlaying ? '#DC2626' : 'rgba(220,38,38,0.1)',
                    color: '#DC2626', border: '1px solid #DC2626',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                  }}
                >
                  <Volume2 size={16} />
                  {audioPlaying ? 'Playing...' : '🔊 Hear Warning'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
