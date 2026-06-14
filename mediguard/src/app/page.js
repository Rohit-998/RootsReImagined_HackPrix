'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { QrCode, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import VerificationWorkflow from '@/components/VerificationWorkflow';
import VerificationIntelligence from '@/components/VerificationIntelligence';

import mobileImg from '../../mobile.png';
import containerImg from '../../container.png';
import tablet1Img from '../../tablet1.png';
import tablet2Img from '../../tablet2.png';

export default function Home() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => { });
  }, []);



  return (
    <div>
      <style>{`
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
          .hero-image-col { display: none !important; }
          .hero-text-col { flex: 1 1 100% !important; text-align: center; }
          .hero-cta-row { justify-content: center !important; }
        }
        @media (max-width: 480px) {
          .hero-cta-row { flex-direction: column !important; align-items: stretch !important; }
          .hero-cta-row a { justify-content: center !important; width: 100%; }
        }
      `}</style>

      <section
        style={{
          overflow: 'hidden',
          position: 'relative',
          minHeight: '92vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div className="container" style={{ paddingTop: '8rem', paddingBottom: '6rem', width: '100%' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '4rem',
            flexWrap: 'wrap'
          }}>

            {/* Left Side: Image Composition — hidden on mobile */}
            <motion.div 
              className="hero-image-col"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
              style={{
              position: 'relative',
              flex: '1 1 400px',
              minHeight: '500px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>

              {/* Layer 2: mobile (Anchor Stage) */}
              <motion.div style={{
                position: 'absolute',
                zIndex: 4, // Top most Z position
                width: '100%',
                maxWidth: '280px',
                left: 0, right: 0, margin: '0 auto',
              }}>
                <Image src={mobileImg} alt="Mobile Phone" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} priority />
              </motion.div>

              {/* Layer 3: container (Sits inside phone bounds) */}
              <motion.div style={{
                position: 'absolute',
                zIndex: 3, // Below phone
                bottom: '-7%',
                width: '60%',
                maxWidth: '200px',
                left: 0, right: 0, margin: '0 auto',
              }}>
                <Image src={containerImg} alt="Medicine Container" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
              </motion.div>

              {/* Layer 4: tablet1 (Emerges from container) */}
              <motion.div className="hide-on-mobile" 
                initial={{ x: 0, y: 20, rotate: 0 }}
                animate={{ x: -40, y: -90, rotate: -25 }}
                transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                style={{
                position: 'absolute',
                zIndex: 1, // Below container
                bottom: '25%',
                left: '35%', // Starts horizontally near container
                width: '35%',
                maxWidth: '90px',
              }}>
                <Image src={tablet1Img} alt="Tablet 1" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
              </motion.div>

              {/* Layer 5: tablet2 (Emerges from container) */}
              <motion.div className="hide-on-mobile" 
                initial={{ x: 0, y: 20, rotate: 0 }}
                animate={{ x: 40, y: -80, rotate: 30 }}
                transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
                style={{
                position: 'absolute',
                zIndex: 2, // Below container
                bottom: '22%',
                right: '35%', // Starts horizontally near container
                width: '30%',
                maxWidth: '80px',
              }}>
                <Image src={tablet2Img} alt="Tablet 2" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
              </motion.div>

            </motion.div>

            {/* Layer 6: Text Content */}
            <motion.div 
              className="hero-text-col"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              style={{
              flex: '1 1 500px',
              position: 'relative',
              zIndex: 5,
            }}>
              <h1 style={{
                fontSize: 'clamp(3rem, 6.5vw, 4.75rem)',
                fontWeight: 800,
                lineHeight: 1.05,
                marginBottom: '1.5rem',
                color: '#111827',
                letterSpacing: '-0.03em',
                textTransform: 'uppercase'
              }}>
                VERIFY MEDICINE<br />
                AUTHENTICITY <span style={{ fontWeight: 400, fontStyle: 'italic' }}>IN SECONDS</span>
              </h1>
              <p style={{
                fontSize: '1.15rem',
                color: 'rgba(17, 24, 39, 0.8)',
                maxWidth: '560px',
                marginBottom: '3rem',
                lineHeight: 1.6,
                fontWeight: 400
              }}>
                Multi-layer pharmaceutical verification using cryptographic signatures, supply chain validation, and counterfeit detection.
              </p>
              <div className="hero-cta-row" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link
                  href="/scan"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '16px 32px', background: 'var(--accent-primary)', color: 'var(--accent-primary-text)',
                    borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '1.05rem',
                    textDecoration: 'none', border: '1px solid #111827',
                    transition: 'all 0.2s ease',
                    boxShadow: '4px 4px 0px #111827'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Start Verification
                </Link>
                <Link
                  href="/demo"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '16px 32px', background: 'var(--accent-secondary)', color: 'var(--accent-secondary-text)',
                    borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '1.05rem',
                    textDecoration: 'none', border: '1px solid #111827',
                    transition: 'all 0.2s ease',
                    boxShadow: '4px 4px 0px #111827'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Watch a demo
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
        }}
        className="container" style={{ paddingTop: '2rem', paddingBottom: '3.5rem' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem',
          padding: '1.5rem 0',
        }}>
          {[
            { label: 'Medicines Verified', value: stats ? stats.totalScans : null },
            { label: 'Counterfeits Caught Today', value: stats ? stats.counterfeitsToday : null },
            { label: 'Total Counterfeits Detected', value: stats ? stats.totalCounterfeits : null },
            { label: 'Pharmacies Monitored', value: stats ? stats.pharmaciesFlagged : null },
          ].map(({ label, value }) => (
            <motion.div key={label} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}>
              <CountUpStat label={label} value={value} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container" style={{ paddingTop: '4.5rem', paddingBottom: '5rem' }}>
          <VerificationWorkflow />
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ paddingTop: '5rem', paddingBottom: '2rem' }}>
        <VerificationIntelligence />
      </motion.section>

    </div>
  );
}

function CountUpStat({ value, label }) {
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
    <div ref={ref} style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--accent-secondary)', margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
        {value === null || value === undefined ? '\u2014' : count.toLocaleString()}
      </p>
      <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500, margin: '8px 0 0' }}>{label}</p>
    </div>
  );
}
