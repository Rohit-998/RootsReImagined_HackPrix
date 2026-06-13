'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Mic, ArrowRight, Globe, Database, TrendingUp, AlertTriangle, Activity } from 'lucide-react';

function AnimatedCount({ target, duration = 1500 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{count.toLocaleString()}</>;
}

export default function Home() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '4rem' }}>

      {/* Hero */}
      <section style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '99px', background: 'rgba(37,99,235,0.1)', color: '#2563EB', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', border: '1px solid rgba(37,99,235,0.2)' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
          Live Counterfeit Detection Platform
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          Trust No One.<br />
          <span style={{ color: '#2563EB' }}>Verify Everything.</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          1 in 10 medicines in India is fake. MediGuard uses a 6-layer AI verification engine and Sarvam AI voice to protect lives.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/scan" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', background: '#2563EB', color: 'white', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none' }}>
            <ShieldCheck size={20} /> Scan QR Code
          </Link>
          <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', background: 'var(--bg-surface)', color: 'var(--text-primary)', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', border: '1px solid var(--border-color)', textDecoration: 'none' }}>
            <Activity size={20} /> Live Demo <ArrowRight size={16} style={{ opacity: 0.5 }} />
          </Link>
        </div>
      </section>

      {/* Live Stats */}
      <section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Medicines Verified', value: stats?.totalScans ?? 0, color: '#2563EB', icon: ShieldCheck, suffix: '' },
            { label: 'Counterfeits Caught Today', value: stats?.counterfeitsToday ?? 0, color: '#DC2626', icon: AlertTriangle, suffix: '' },
            { label: 'Total Counterfeits Detected', value: stats?.totalCounterfeits ?? 0, color: '#D97706', icon: TrendingUp, suffix: '' },
            { label: 'Pharmacies Flagged', value: stats?.pharmaciesFlagged ?? 0, color: '#7c3aed', icon: Activity, suffix: '' },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', borderTop: `3px solid ${color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{label}</p>
                <Icon size={18} style={{ color }} />
              </div>
              <p style={{ fontSize: '2.5rem', fontWeight: 900, color, margin: 0, lineHeight: 1 }}>
                {stats ? <AnimatedCount target={value} /> : '—'}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {[
          { icon: Database, color: '#2563EB', bg: 'rgba(37,99,235,0.08)', title: '6-Layer Engine', desc: 'Batch check, cryptographic hash, clone detection, geo-validation, temporal check and supply chain — all run simultaneously.' },
          { icon: Mic, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', title: 'Sarvam AI Voice', desc: 'Verification results spoken aloud in Hindi, Tamil, Bengali and 7 more Indian languages. No literacy required.' },
          { icon: Globe, color: '#059669', bg: 'rgba(5,150,105,0.08)', title: 'Consumer First', desc: 'No app to download. Scan with your browser, hear the result in your language. Works on any phone.' },
        ].map(({ icon: Icon, color, bg, title, desc }) => (
          <div key={title} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.75rem' }}>
            <div style={{ width: '48px', height: '48px', background: bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Icon size={24} style={{ color }} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontSize: '0.925rem' }}>{desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Ready to catch a counterfeit?
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.05rem' }}>
          Use one of our demo QR codes to see all 6 verification layers in action.
        </p>
        <Link href="/scan" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 36px', background: '#2563EB', color: 'white', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none' }}>
          Start Scanning → 
        </Link>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
