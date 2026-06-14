'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
                Verify authenticity, identify counterfeit risks, and make informed decisions using SafeDose's multi-layer verification system.
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
      <div className={styles.footerContent}>
        <div className={`container ${styles.footerContainer}`}>
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.footerLogo}>
              <Image src="/logo.svg" alt="SafeDose Logo" width={34} height={34} />
              SafeDose
            </Link>
            <p className={styles.footerDesc}>
              SafeDose helps consumers and pharmacies assess medicine authenticity using batch verification, supply chain validation, duplicate scan detection, and trust assessment.
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
              <Link href="/results" className={styles.link}>Results</Link>
              <Link href="/history" className={styles.link}>Scan History</Link>
              <Link href="/pharmacies" className={styles.link}>Pharmacies</Link>
              <Link href="/demo" className={styles.link}>Live Demo</Link>
            </div>
          </div>

          <div className={styles.footerColumn}>
            <span className={styles.columnTitle}>Verification</span>
            <div className={styles.footerLinks}>
              <Link href="/demo" className={styles.link}>Batch Verification</Link>
              <Link href="/demo" className={styles.link}>Hash Validation</Link>
              <Link href="/demo" className={styles.link}>Supply Chain</Link>
              <Link href="/demo" className={styles.link}>Geo Validation</Link>
              <Link href="/demo" className={styles.link}>Clone Detection</Link>
              <Link href="/demo" className={styles.link}>Trust Assessment</Link>
            </div>
          </div>

          <div className={styles.footerColumn}>
            <span className={styles.columnTitle}>Resources</span>
            <div className={styles.footerLinks}>
              <span className={styles.linkDisabled}>Documentation</span>
              <span className={styles.linkDisabled}>Project Overview</span>
              <span className={styles.linkDisabled}>Future Roadmap</span>
              <Link href="/login" className={styles.link}>Login / Sign Up</Link>
              <Link href="/report" className={styles.link}>Report Counterfeit</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className={styles.footerBottom}>
        <div className={`container ${styles.footerBottomContainer}`}>
          <span>&copy; {new Date().getFullYear()} SafeDose</span>
          <span className={styles.footerBottomCenter}>Built with Next.js and MongoDB</span>
          <span className={styles.versionBadge}>SafeDose v1.0</span>
        </div>
      </div>
    </footer>
  );
}
