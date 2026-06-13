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
    if (score >= 80) return { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Trusted',   Icon: ShieldCheck };
    if (score >= 50) return { color: '#D97706', bg: 'rgba(217,119,6,0.1)',  label: 'Caution',   Icon: ShieldAlert };
    return              { color: '#DC2626', bg: 'rgba(220,38,38,0.1)',   label: 'Flagged 🚨', Icon: ShieldX };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Pharmacy Trust Leaderboard</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Ranked by verification integrity and counterfeit report history.</p>
      </div>

      {/* Leaderboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading...</p>
        ) : pharmacies.length === 0 ? (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No pharmacy data yet. Run the seed script first.
          </div>
        ) : pharmacies.map((p, i) => {
          const { color, bg, label, Icon } = badge(p.trust_score);
          return (
            <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-surface)', border: `1px solid ${p.trust_score < 50 ? 'rgba(220,38,38,0.3)' : 'var(--border-color)'}`, borderRadius: '10px', padding: '1rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-muted)', minWidth: '24px' }}>#{i + 1}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{p.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{p.location || 'Unknown'} · {p.flagged_count || 0} report(s)</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.4rem', fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{p.trust_score}</p>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '99px', background: bg, color, fontWeight: 700 }}>{label}</span>
              </div>
              <Icon size={20} style={{ color }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
