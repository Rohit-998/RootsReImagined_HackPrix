'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ShieldAlert, ShieldX, Trash2, ArrowRight } from 'lucide-react';

const verdictStyle = {
  verified:    { color: '#5B46FF', Icon: ShieldCheck  },
  suspicious:  { color: '#6B7300', Icon: ShieldAlert  },
  counterfeit: { color: '#DC2626', Icon: ShieldX      },
};

export default function HistoryPage() {
  const router  = useRouter();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('mg_scan_history');
      setHistory(raw ? JSON.parse(raw) : []);
    } catch { setHistory([]); }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('mg_scan_history');
    setHistory([]);
  };

  return (
    <div className="container" style={{ maxWidth: '700px', margin: '0 auto', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Scan History</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>Your last {history.length} medicine verifications</p>
        </div>
        {history.length > 0 && (
          <button onClick={clearHistory} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
            <Trash2 size={14} /> Clear
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          <ShieldCheck size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No scans yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Start scanning medicines to build your history.</p>
          <button onClick={() => router.push('/scan')} style={{ padding: '10px 24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-primary)', background: 'var(--accent-primary)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'var(--font-sans)' }}>
            Scan a Medicine
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {history.map((item, i) => {
            const { color, Icon } = verdictStyle[item.verdict] || verdictStyle.suspicious;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', cursor: 'pointer', transition: 'border-color 0.2s', boxShadow: 'var(--shadow-sm)' }}
                onClick={() => router.push(`/scan?batch=${encodeURIComponent(item.batch)}`)}
                onMouseEnter={e => e.currentTarget.style.borderColor = color}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <Icon size={24} style={{ color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0, fontSize: '0.95rem' }}>{item.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0', fontFamily: 'monospace' }}>{item.batch}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color, margin: 0, lineHeight: 1 }}>{item.score}/100</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    {new Date(item.time).toLocaleDateString()} {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
