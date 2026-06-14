'use client';
import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetch('/api/pharmacies').then(r => r.json()).then(d => {
      setPharmacies(d.pharmacies || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const badge = (score) => {
    if (score >= 80) return { color: 'var(--color-verified)', bg: 'rgba(5,150,105,0.1)', label: 'Trusted',   Icon: ShieldCheck };
    if (score >= 50) return { color: 'var(--color-warning)', bg: 'rgba(217,119,6,0.1)',  label: 'Caution',   Icon: ShieldAlert };
    return              { color: 'var(--color-danger)', bg: 'rgba(220,38,38,0.1)',   label: 'Flagged', Icon: ShieldX };
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Pharmacy Trust Leaderboard</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>Ranked by verification integrity and counterfeit report history.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading...</p>
        ) : pharmacies.length === 0 ? (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No pharmacy data available yet.
          </div>
        ) : pharmacies.map((p, i) => {
          const { color, bg, label, Icon } = badge(p.trust_score);
          return (
            <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-surface)', border: `1px solid ${p.trust_score < 50 ? 'rgba(220,38,38,0.3)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', padding: '1rem', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', minWidth: '24px' }}>#{i + 1}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0, fontSize: '0.95rem' }}>{p.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{p.location || 'Unknown'} | {p.flagged_count || 0} report(s)</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, color, margin: 0, lineHeight: 1 }}>{p.trust_score}</p>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '9999px', background: bg, color, fontWeight: 600 }}>{label}</span>
              </div>
              <Icon size={18} style={{ color }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
