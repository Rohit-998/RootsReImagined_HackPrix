'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Mic, ArrowRight, Globe, Database, TrendingUp, AlertTriangle, Activity, Search, Pill, Siren } from 'lucide-react';

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
  const [drug1, setDrug1] = useState('');
  const [drug2, setDrug2] = useState('');
  const [interactionResult, setInteractionResult] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  // Drug interaction checker (client-side demo database)
  const INTERACTIONS = {
    'paracetamol+alcohol': { severity: 'HIGH', msg: '⚠️ Severe liver damage risk. Paracetamol combined with alcohol can cause acute liver failure.' },
    'aspirin+ibuprofen': { severity: 'MODERATE', msg: '⚠️ Both are NSAIDs. Taking together increases risk of stomach bleeding and ulcers.' },
    'metformin+alcohol': { severity: 'HIGH', msg: '⚠️ Can cause lactic acidosis — a rare but life-threatening condition.' },
    'warfarin+aspirin': { severity: 'HIGH', msg: '⚠️ Extremely dangerous. Both thin blood — combined use can cause uncontrolled bleeding.' },
    'lisinopril+potassium': { severity: 'MODERATE', msg: '⚠️ ACE inhibitors raise potassium. Extra potassium can cause dangerous heart rhythms.' },
    'simvastatin+grapefruit': { severity: 'MODERATE', msg: '⚠️ Grapefruit increases statin levels in blood, raising risk of muscle damage (rhabdomyolysis).' },
    'ciprofloxacin+antacid': { severity: 'MODERATE', msg: '⚠️ Antacids reduce Cipro absorption by up to 90%. Take 2 hours apart.' },
    'ssri+tramadol': { severity: 'HIGH', msg: '⚠️ Risk of Serotonin Syndrome — potentially fatal. Watch for agitation, rapid heartbeat, high temperature.' },
    'insulin+alcohol': { severity: 'HIGH', msg: '⚠️ Alcohol can cause severe hypoglycemia (dangerously low blood sugar) when taken with insulin.' },
    'amoxicillin+methotrexate': { severity: 'HIGH', msg: '⚠️ Amoxicillin reduces methotrexate excretion, increasing toxicity risk.' },
  };

  const checkInteraction = () => {
    if (!drug1.trim() || !drug2.trim()) return;
    setChecking(true);
    setTimeout(() => {
      const d1 = drug1.toLowerCase().trim();
      const d2 = drug2.toLowerCase().trim();
      const key1 = `${d1}+${d2}`;
      const key2 = `${d2}+${d1}`;
      const found = INTERACTIONS[key1] || INTERACTIONS[key2];
      setInteractionResult(found || { severity: 'SAFE', msg: `✅ No known interaction found between "${drug1}" and "${drug2}". However, always consult your doctor.` });
      setChecking(false);
    }, 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '4rem' }}>

      {/* 🚨 Batch Recall Alert Banner */}
      <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '12px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', animation: 'fadeIn 0.5s ease-in' }}>
        <div style={{ background: 'rgba(220,38,38,0.15)', borderRadius: '8px', padding: '8px', flexShrink: 0 }}>
          <Siren size={20} style={{ color: '#DC2626' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#DC2626' }}>BATCH RECALL ALERT</p>
          <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Batch <strong>AMX-2024-FAKE</strong> of Amoxicillin 500mg has been recalled by CDSCO. If you have this batch, <Link href="/scan" style={{ color: '#DC2626', fontWeight: 700 }}>scan it now →</Link>
          </p>
        </div>
      </div>

      {/* Hero */}
      <section style={{ textAlign: 'center', paddingTop: '2rem' }}>
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
            { label: 'Medicines Verified', value: stats?.totalScans ?? 0, color: '#2563EB', icon: ShieldCheck },
            { label: 'Counterfeits Caught Today', value: stats?.counterfeitsToday ?? 0, color: '#DC2626', icon: AlertTriangle },
            { label: 'Total Counterfeits Detected', value: stats?.totalCounterfeits ?? 0, color: '#D97706', icon: TrendingUp },
            { label: 'Pharmacies Flagged', value: stats?.pharmaciesFlagged ?? 0, color: '#7c3aed', icon: Activity },
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

      {/* 💊 Drug Interaction Checker */}
      <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <div style={{ width: '44px', height: '44px', background: 'rgba(124,58,237,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pill size={22} style={{ color: '#7c3aed' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Drug Interaction Checker</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Check if two medicines are safe to take together</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Medicine 1</label>
            <input
              type="text" placeholder="e.g. Paracetamol"
              value={drug1} onChange={e => setDrug1(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-muted)', padding: '0 4px 8px' }}>+</div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Medicine 2</label>
            <input
              type="text" placeholder="e.g. Alcohol"
              value={drug2} onChange={e => setDrug2(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <button
            onClick={checkInteraction}
            disabled={checking || !drug1.trim() || !drug2.trim()}
            style={{ padding: '11px 24px', borderRadius: '8px', border: 'none', background: '#7c3aed', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', opacity: (!drug1.trim() || !drug2.trim()) ? 0.5 : 1 }}
          >
            <Search size={16} /> {checking ? 'Checking...' : 'Check'}
          </button>
        </div>

        {interactionResult && (
          <div style={{
            marginTop: '1rem', padding: '14px 16px', borderRadius: '10px',
            background: interactionResult.severity === 'SAFE' ? 'rgba(16,185,129,0.08)' : interactionResult.severity === 'MODERATE' ? 'rgba(245,158,11,0.08)' : 'rgba(220,38,38,0.08)',
            border: `1px solid ${interactionResult.severity === 'SAFE' ? 'rgba(16,185,129,0.2)' : interactionResult.severity === 'MODERATE' ? 'rgba(245,158,11,0.2)' : 'rgba(220,38,38,0.2)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800,
                background: interactionResult.severity === 'SAFE' ? '#10b981' : interactionResult.severity === 'MODERATE' ? '#f59e0b' : '#DC2626',
                color: 'white',
              }}>{interactionResult.severity} RISK</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{interactionResult.msg}</p>
          </div>
        )}

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px', margin: '12px 0 0' }}>
          💡 Try: <span onClick={() => { setDrug1('Paracetamol'); setDrug2('Alcohol'); }} style={{ color: '#7c3aed', cursor: 'pointer', fontWeight: 600 }}>Paracetamol + Alcohol</span> · <span onClick={() => { setDrug1('Warfarin'); setDrug2('Aspirin'); }} style={{ color: '#7c3aed', cursor: 'pointer', fontWeight: 600 }}>Warfarin + Aspirin</span> · <span onClick={() => { setDrug1('Aspirin'); setDrug2('Ibuprofen'); }} style={{ color: '#7c3aed', cursor: 'pointer', fontWeight: 600 }}>Aspirin + Ibuprofen</span>
        </p>
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
