'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, QrCode, Search, Volume2, ArrowRight } from 'lucide-react';
import VerificationWorkflow from '@/components/VerificationWorkflow';

const STEPS = [
  {
    num: '01',
    icon: QrCode,
    title: 'Scan the QR Code',
    desc: 'Use your camera to scan the QR code on the medicine package, or enter the batch number manually.',
  },
  {
    num: '02',
    icon: Search,
    title: '6-Layer Verification',
    desc: 'Our engine checks batch records, cryptographic hashes, clone detection, geo-location, and supply chain.',
  },
  {
    num: '03',
    icon: Volume2,
    title: 'Get Your Result',
    desc: 'Receive a clear verdict with a trust score. Results available in 10 Indian languages via voice playback.',
  },
];

export default function Home() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  return (
    <div>
      <section style={{ background: 'linear-gradient(180deg, #F8FAFB 0%, #FFFFFF 100%)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ paddingTop: '3.5rem', paddingBottom: '3rem' }}>
          <div style={{ maxWidth: '720px' }}>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '0.75rem' }}>
              Verify your medicines. <br />Check authenticity in seconds.
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '560px', marginBottom: '1.75rem', lineHeight: 1.7 }}>
              MediGuard helps consumers verify pharmaceutical authenticity using batch verification, cryptographic checks, and supply chain tracking.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link
                href="/scan"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', background: 'var(--accent-primary)', color: 'white',
                  borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.95rem',
                  textDecoration: 'none', border: '1px solid var(--accent-primary)',
                  transition: 'all 0.2s ease',
                }}
              >
                <QrCode size={18} /> Scan a Medicine
              </Link>
              <Link
                href="/demo"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', background: 'var(--bg-surface)', color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.95rem',
                  textDecoration: 'none', border: '1px solid var(--border-color)',
                  transition: 'all 0.2s ease',
                }}
              >
                How It Works <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div style={{
            display: 'flex', gap: '2rem', marginTop: '2.5rem',
            flexWrap: 'wrap',
          }}>
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className={`animate-fade-in-up animate-delay-${i + 1}`}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '1rem',
                  flex: '1', minWidth: '200px',
                  opacity: '0', animationFillMode: 'forwards',
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-primary)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                }}>
                  {step.num}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <step.icon size={16} style={{ color: 'var(--accent-primary)' }} />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{step.title}</h3>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingTop: '2rem', paddingBottom: '2.5rem' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem',
          background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
        }}>
          {[
            { label: 'Medicines Verified', value: stats?.totalScans ?? 0 },
            { label: 'Counterfeits Caught Today', value: stats?.counterfeitsToday ?? 0 },
            { label: 'Total Counterfeits Detected', value: stats?.totalCounterfeits ?? 0 },
            { label: 'Pharmacies Monitored', value: stats?.pharmaciesFlagged ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-primary)', margin: 0, lineHeight: 1.2 }}>
                {stats ? value.toLocaleString() : '\u2014'}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <VerificationWorkflow />
      </section>
    </div>
  );
}
