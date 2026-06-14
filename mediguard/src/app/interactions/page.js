'use client';
import { useState } from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, Loader2, Info } from 'lucide-react';
import Card from '@/components/ui/Card';

const DEMO_MEDICINES = [
  "Paracetamol 500mg",
  "Amoxicillin 250mg",
  "Metformin 500mg",
  "Insulin Novolin R",
  "Cough Syrup",
  "Warfarin",
  "Methotrexate",
  "Contrast dye",
  "Sedatives",
  "Beta-blockers"
];

export default function InteractionsPage() {
  const [drugA, setDrugA] = useState('');
  const [drugB, setDrugB] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const checkInteractions = async () => {
    if (!drugA || !drugB || drugA === drugB) return;
    setLoading(true);
    try {
      const res = await fetch('/api/interactions/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicines: [drugA, drugB] })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Drug Interaction Checker</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Cross-reference multiple medicines to identify potentially dangerous interactions before consumption.
        </p>
      </div>

      <Card style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Medicine 1</label>
              <select 
                value={drugA} 
                onChange={e => setDrugA(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '1rem' }}
              >
                <option value="">Select a medicine...</option>
                {DEMO_MEDICINES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Medicine 2</label>
              <select 
                value={drugB} 
                onChange={e => setDrugB(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '1rem' }}
              >
                <option value="">Select a medicine...</option>
                {DEMO_MEDICINES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          
          <button 
            onClick={checkInteractions}
            disabled={!drugA || !drugB || drugA === drugB || loading}
            style={{ marginTop: '1rem', padding: '0.875rem', borderRadius: 'var(--radius-sm)', background: 'var(--accent-primary)', color: 'white', fontWeight: 700, fontSize: '1rem', cursor: (!drugA || !drugB || drugA === drugB) ? 'not-allowed' : 'pointer', opacity: (!drugA || !drugB || drugA === drugB) ? 0.5 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Check Safety'}
          </button>
        </div>
      </Card>

      {result && (
        <div style={{ animation: 'fade-in 0.3s ease-out' }}>
          {result.safety_status === 'safe' ? (
            <Card style={{ padding: '2rem', textAlign: 'center', borderColor: 'var(--color-verified)', background: 'rgba(5, 150, 105, 0.05)' }}>
              <CheckCircle size={48} style={{ color: 'var(--color-verified)', margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-verified)', marginBottom: '0.5rem' }}>No Known Interactions</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Based on our database, there are no known dangerous interactions between {drugA} and {drugB}.</p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Found {result.total_interactions} Interaction(s)</h2>
              </div>
              
              {result.interactions.map((interaction, idx) => {
                const isSevere = interaction.severity === 'severe' || interaction.severity === 'contraindicated';
                const color = isSevere ? 'var(--color-danger)' : 'var(--color-warning)';
                const bg = isSevere ? 'rgba(220, 38, 38, 0.08)' : 'rgba(217, 119, 6, 0.08)';
                
                return (
                  <Card key={idx} style={{ borderLeft: `4px solid ${color}`, padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ marginTop: '0.25rem' }}>
                        {isSevere ? <ShieldAlert size={24} style={{ color }} /> : <AlertTriangle size={24} style={{ color }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
                            {interaction.drug_a} + {interaction.drug_b}
                          </h3>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', padding: '0.25rem 0.5rem', borderRadius: '4px', background: bg, color }}>
                            {interaction.severity}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                          {interaction.description}
                        </p>
                        <div style={{ background: 'var(--bg-body)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                          <Info size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
                          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Recommendation:</span> {interaction.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
