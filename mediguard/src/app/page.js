'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { QrCode, ArrowRight } from 'lucide-react';
import VerificationWorkflow from '@/components/VerificationWorkflow';
import VerificationIntelligence from '@/components/VerificationIntelligence';

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
                  padding: '12px 24px', background: 'var(--accent-primary)', color: 'var(--accent-primary-text)',
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
                  padding: '12px 24px', background: 'var(--accent-secondary)', color: 'var(--accent-secondary-text)',
                  borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.95rem',
                  textDecoration: 'none', border: '1px solid var(--accent-secondary)',
                  transition: 'all 0.2s ease',
                }}
              >
                How It Works <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingTop: '2rem', paddingBottom: '3.5rem' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem',
          padding: '1.5rem 0',
        }}>
          {[
            { label: 'Medicines Verified', value: stats ? stats.totalScans : null },
            { label: 'Counterfeits Caught Today', value: stats ? stats.counterfeitsToday : null },
            { label: 'Total Counterfeits Detected', value: stats ? stats.totalCounterfeits : null },
            { label: 'Pharmacies Monitored', value: stats ? stats.pharmaciesFlagged : null },
          ].map(({ label, value }, idx) => (
            <CountUpStat key={label} label={label} value={value} delayIdx={(idx % 4) + 1} />
          ))}
        </div>
      </section>

      <section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ paddingTop: '4.5rem', paddingBottom: '5rem' }}>
          <VerificationWorkflow />
        </div>
      </section>

      <section style={{ background: 'var(--bg-primary)', paddingTop: '5rem', paddingBottom: '2rem' }}>
        <VerificationIntelligence />
      </section>

    </div>
  );
}

function CountUpStat({ value, label, delayIdx }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || value === null || value === undefined) return;
    const end = value;
    const duration = 1500;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeOut * end));
      
      if (progress < 1) requestAnimationFrame(animate);
      else setCount(end);
    };
    requestAnimationFrame(animate);
  }, [isVisible, value]);

  return (
    <div 
      ref={ref} 
      className={isVisible ? `animate-fade-in animate-delay-${delayIdx}` : ""}
      style={{ textAlign: 'center', opacity: 0, animationFillMode: 'forwards' }}
    >
      <p style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--accent-secondary)', margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
        {value === null || value === undefined ? '\u2014' : count.toLocaleString()}
      </p>
      <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500, margin: '8px 0 0' }}>{label}</p>
    </div>
  );
}
