'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <footer className={styles.footer}>
      {/* CTA Banner Layer - Only visible on Home page */}
      {isHome && (
        <div className="container">
          <div className={styles.ctaBanner}>
            <div className={styles.ctaBannerInner}>
              <div className={styles.ctaCircle}></div>
            </div>
            
            <div className={styles.ctaBannerLeft}>
              <h2 className={styles.ctaHeadline}>Ready to Verify Medicines with Confidence?</h2>
              <p className={styles.ctaSupport}>
                Verify authenticity, identify counterfeit risks, and make informed decisions using MediGuard's multi-layer verification system.
              </p>
              <div className={styles.ctaActions}>
                <Link href="/scan" className={styles.ctaPrimary}>
                  Start Verification
                </Link>
                <Link href="/demo" className={styles.ctaSecondary}>
                  View Demo
                </Link>
              </div>
            </div>
            
            <div className={styles.ctaBannerRight}>
              <img src="/woman.png" alt="User verifying medicine" className={styles.ctaImage} />
            </div>
          </div>
        </div>
      )}

      {/* Footer Content Section */}
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.footerBrand}>
          <Link href="/" className={styles.footerLogo}>
            <ShieldCheck size={24} color="var(--accent-secondary)" />
            MediGuard
          </Link>
          <p className={styles.footerDesc}>
            MediGuard helps consumers and pharmacies assess medicine authenticity using batch verification, supply chain validation, duplicate scan detection, and trust assessment.
          </p>
          <span className={styles.footerTrust}>
            Built for pharmaceutical authenticity verification.
          </span>
        </div>

        <div className={styles.footerColumn}>
          <span className={styles.columnTitle}>Platform</span>
          <div className={styles.footerLinks}>
            <Link href="/" className={styles.link}>Home</Link>
            <Link href="/scan" className={styles.link}>Scan Medicine</Link>
            <Link href="/report" className={styles.link}>Results</Link>
            <Link href="/demo" className={styles.link}>Live Demo</Link>
            <Link href="/#workflow" className={styles.link}>How MediGuard Works</Link>
            <Link href="/#engine" className={styles.link}>Trust Engine</Link>
          </div>
        </div>

        <div className={styles.footerColumn}>
          <span className={styles.columnTitle}>Verification</span>
          <div className={styles.footerLinks}>
            <Link href="/demo" className={styles.link}>Batch Verification</Link>
            <Link href="/demo" className={styles.link}>Hash Validation</Link>
            <Link href="/demo" className={styles.link}>Supply Chain Validation</Link>
            <Link href="/demo" className={styles.link}>Geographic Validation</Link>
            <Link href="/demo" className={styles.link}>Duplicate Scan Analysis</Link>
            <Link href="/demo" className={styles.link}>Trust Assessment</Link>
          </div>
        </div>

        <div className={styles.footerColumn}>
          <span className={styles.columnTitle}>Resources</span>
          <div className={styles.footerLinks}>
            <Link href="#" className={styles.link}>Documentation</Link>
            <Link href="#" className={styles.link}>Project Overview</Link>
            <Link href="#" className={styles.link}>Future Roadmap</Link>
            <Link href="#" className={styles.link}>Privacy Policy</Link>
            <Link href="#" className={styles.link}>Terms of Use</Link>
            <Link href="#" className={styles.link}>Contact</Link>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className={styles.footerBottom}>
        <div className={`container ${styles.footerBottomContainer}`}>
          <span>&copy; {new Date().getFullYear()} MediGuard</span>
          <span className={styles.footerBottomCenter}>Built with Next.js and MongoDB</span>
          <span className={styles.versionBadge}>MediGuard v1.0</span>
        </div>
      </div>
    </footer>
  );
}
