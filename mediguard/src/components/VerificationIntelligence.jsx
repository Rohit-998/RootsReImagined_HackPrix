'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FileKey, Database, PackageSearch, GitMerge, Clock, Activity } from 'lucide-react';

export default function VerificationIntelligence() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="container">
      <div className={isVisible ? "animate-fade-in" : ""} style={{ marginBottom: '3.5rem', opacity: 0, animationFillMode: 'forwards' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Trust Engine
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '800px', lineHeight: 1.6 }}>
          MediGuard evaluates every package through multiple independent verification layers to identify authenticity signals and counterfeit risk indicators.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {[
          {
            title: 'Digital Signature Verification',
            desc: 'Validates manufacturer-issued cryptographic signatures to ensure package identity has not been altered.',
            conf: 'Very High',
            icon: FileKey,
            delay: 1
          },
          {
            title: 'Hash Integrity Validation',
            desc: 'Recomputes and validates payload hashes to detect tampering and data inconsistencies.',
            conf: 'Very High',
            icon: Database,
            delay: 2
          },
          {
            title: 'Batch Verification',
            desc: 'Confirms that the scanned batch exists within authorized manufacturer records.',
            conf: 'High',
            icon: PackageSearch,
            delay: 3
          },
          {
            title: 'Supply Chain Validation',
            desc: 'Verifies package movement through expected distribution checkpoints and identifies missing events.',
            conf: 'Moderate',
            icon: GitMerge,
            delay: 1
          },
          {
            title: 'Temporal Validation',
            desc: 'Validates manufacturing and expiration timelines to prevent the distribution of expired or recalled medical products.',
            conf: 'Moderate',
            icon: Clock,
            delay: 2
          },
          {
            title: 'Duplicate Scan Analysis',
            desc: 'Monitors repeated scan activity and identifies patterns commonly associated with cloned identifiers.',
            conf: 'High',
            icon: Activity,
            delay: 3
          }
        ].map((cap) => (
          <div
            key={cap.title}
            className={isVisible ? `animate-fade-in animate-delay-${cap.delay}` : ""}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              opacity: 0,
              animationFillMode: 'forwards',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
              boxShadow: 'var(--shadow-sm)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              e.currentTarget.style.borderColor = 'var(--accent-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '48px', height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-primary)',
                color: 'var(--accent-primary-text)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 6px rgba(210, 248, 3, 0.2)'
              }}>
                <cap.icon size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                {cap.title}
              </h3>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1, marginBottom: 0 }}>
              {cap.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
