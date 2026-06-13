'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldAlert, Flag, CheckCircle2, ArrowLeft, Loader2, MapPin, User, FileText } from 'lucide-react';

export default function ReportPage() {
  const params = useSearchParams();
  const router = useRouter();

  // Pre-fill from URL params if coming from results page
  const batchId    = params.get('batch_id')    || '';
  const verdict    = params.get('verdict')     || '';
  const trustScore = params.get('trust_score') || '';

  const [form, setForm] = useState({
    reporter_name:    '',
    pharmacy_name:    '',
    location:         '',
    additional_notes: '',
  });
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportId,  setReportId]  = useState('');
  const [error,     setError]     = useState('');

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.pharmacy_name.trim()) {
      setError('Please enter the pharmacy name');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res  = await fetch('/api/report/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          batch_id:         batchId,
          verdict,
          trust_score:      Number(trustScore),
          pharmacy_name:    form.pharmacy_name,
          location:         form.location,
          reporter_name:    form.reporter_name,
          additional_notes: form.additional_notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReportId(data.reportId);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: '520px', margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: '50%', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '2px solid #10b981' }}>
          <CheckCircle2 size={44} style={{ color: '#10b981' }} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Report Submitted
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
          Thank you for reporting. The pharmacy's trust score has been flagged and authorities will be notified.
        </p>
        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', margin: '1.5rem 0', display: 'inline-block' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>Report Reference ID</p>
          <p style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
            {String(reportId).slice(-10).toUpperCase()}
          </p>
        </div>
        <div style={{ background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '2rem', textAlign: 'left' }}>
          <p style={{ color: '#2563EB', fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>
            🔒 In Production: This report will require DigiLocker / Aadhaar verification so every report is legally admissible as evidence.
          </p>
        </div>
        <button onClick={() => router.push('/')}
          style={{ padding: '12px 32px', borderRadius: '8px', border: 'none', background: '#2563EB', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '560px', margin: '2rem auto', padding: '0 1rem' }}>
      {/* Back */}
      <button onClick={() => router.back()}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(220,38,38,0.1)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(220,38,38,0.2)' }}>
          <Flag size={28} style={{ color: '#DC2626' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Report Counterfeit Medicine
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            Help protect others. Your report is anonymous.
          </p>
        </div>
      </div>

      {/* Medicine Badge (if coming from results) */}
      {batchId && (
        <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, margin: 0 }}>REPORTING MEDICINE</p>
            <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'monospace', margin: '2px 0 0' }}>{batchId}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, margin: 0 }}>TRUST SCORE</p>
            <p style={{ color: '#DC2626', fontWeight: 800, fontSize: '1.2rem', margin: '2px 0 0' }}>{trustScore}/100</p>
          </div>
        </div>
      )}

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        <div>
          <label style={labelStyle}>
            <User size={14} /> Your Name <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional — stays anonymous)</span>
          </label>
          <input placeholder="e.g. Rahul Sharma" value={form.reporter_name} onChange={set('reporter_name')} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>
            <ShieldAlert size={14} /> Pharmacy Name <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <input placeholder="e.g. Sharma Medical Store" value={form.pharmacy_name} onChange={set('pharmacy_name')} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>
            <MapPin size={14} /> Location / Address
          </label>
          <input placeholder="e.g. Dharavi, Mumbai, Maharashtra" value={form.location} onChange={set('location')} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>
            <FileText size={14} /> Additional Notes
          </label>
          <textarea
            placeholder="Describe what you noticed (e.g. packaging looks different, pills are discoloured...)"
            value={form.additional_notes}
            onChange={set('additional_notes')}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        {/* DigiLocker note */}
        <div style={{ background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '10px', padding: '12px' }}>
          <p style={{ color: '#2563EB', fontSize: '0.82rem', margin: 0 }}>
            🔒 <strong>Coming Soon:</strong> DigiLocker / Aadhaar verification will make every report legally admissible as evidence against the pharmacy.
          </p>
        </div>

        {error && (
          <p style={{ color: '#DC2626', fontSize: '0.875rem', margin: 0 }}>{error}</p>
        )}

        <button onClick={handleSubmit} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: '#DC2626', color: 'white', fontWeight: 800, fontSize: '1rem' }}>
          {loading
            ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
            : <><Flag size={18} /> Submit Report to Authorities</>}
        </button>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'flex', alignItems: 'center', gap: '6px',
  fontSize: '0.875rem', fontWeight: 700,
  color: 'var(--text-primary)', marginBottom: '6px',
};

const inputStyle = {
  width: '100%', padding: '11px 14px',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px', color: 'var(--text-primary)',
  fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
};
