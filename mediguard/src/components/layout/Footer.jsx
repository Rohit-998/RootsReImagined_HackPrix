import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.footerBrand}>
          <ShieldCheck size={20} />
          <div className={styles.footerTitleBlock}>
            <span className={styles.footerTitle}>MediGuard</span>
            <span className={styles.footerSubtitle}>Medicine Verification System</span>
          </div>
        </div>

        <div className={styles.footerLinks}>
          <div className={styles.linkGroup}>
            <span className={styles.linkGroupTitle}>Services</span>
            <Link href="/scan" className={styles.link}>Scan Medicine</Link>
            <Link href="/report" className={styles.link}>Report Counterfeit</Link>
            <Link href="/pharmacies" className={styles.link}>Pharmacy Directory</Link>
          </div>
          <div className={styles.linkGroup}>
            <span className={styles.linkGroupTitle}>Resources</span>
            <Link href="/demo" className={styles.link}>How It Works</Link>
            <Link href="/history" className={styles.link}>Scan History</Link>
            <Link href="/admin" className={styles.link}>Administration</Link>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={`container ${styles.footerBottomContainer}`}>
          <span>&copy; {new Date().getFullYear()} MediGuard. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
