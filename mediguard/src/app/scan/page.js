'use client';

import { useState } from 'react';
import { QrCode, Keyboard, History, CheckCircle2, Circle, AlertTriangle, XCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

export default function ScanPage() {
  const [activeTab, setActiveTab] = useState('scan');
  const [isScanning, setIsScanning] = useState(true);
  
  // Dummy verification state for UI
  const verificationSteps = [
    { id: 'batch', label: 'Batch Validation', status: 'pending' },
    { id: 'hash', label: 'Hash Verification', status: 'pending' },
    { id: 'clone', label: 'Clone Detection', status: 'pending' },
    { id: 'geo', label: 'Geo Validation', status: 'pending' },
    { id: 'temp', label: 'Temporal Validation', status: 'pending' },
    { id: 'supply', label: 'Supply Chain Validation', status: 'pending' },
  ];

  return (
    <div className={`container ${styles.scanContainer}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Verify Medicine</h1>
        <p className={styles.subtitle}>Scan the QR code or manually enter the batch details to verify authenticity.</p>
      </div>

      <div className={styles.layout}>
        {/* Left Column: Input */}
        <div className={styles.leftCol}>
          <Card className={styles.inputCard}>
            <div className={styles.tabs}>
              <button 
                className={`${styles.tab} ${activeTab === 'scan' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('scan')}
              >
                <QrCode size={18} /> QR Scanner
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'manual' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('manual')}
              >
                <Keyboard size={18} /> Manual Entry
              </button>
            </div>

            <div className={styles.inputContent}>
              {activeTab === 'scan' ? (
                <div className={styles.scannerContainer}>
                  <div className={styles.scannerFrame}>
                    <div className={styles.scannerLine}></div>
                    <div className={styles.scannerCorner + ' ' + styles.tl}></div>
                    <div className={styles.scannerCorner + ' ' + styles.tr}></div>
                    <div className={styles.scannerCorner + ' ' + styles.bl}></div>
                    <div className={styles.scannerCorner + ' ' + styles.br}></div>
                    <p className={styles.scannerText}>Position QR code within frame</p>
                  </div>
                  <Button variant="outline" className={styles.fullWidthBtn}>Upload Image</Button>
                </div>
              ) : (
                <div className={styles.manualEntry}>
                  <div className={styles.formGroup}>
                    <label>Batch ID</label>
                    <input type="text" placeholder="e.g. BATCH-2026-X7" className={styles.input} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Serial Number</label>
                    <input type="text" placeholder="e.g. SN-998-1234" className={styles.input} />
                  </div>
                  <Button variant="primary" className={styles.fullWidthBtn}>Verify Batch</Button>
                </div>
              )}
            </div>
          </Card>

          <div className={styles.recentScans}>
            <h3 className={styles.sectionTitle}>
              <History size={16} /> Recent Scans
            </h3>
            <div className={styles.recentList}>
              <p className={styles.emptyState}>No recent scans.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Progress */}
        <div className={styles.rightCol}>
          <Card className={styles.progressCard}>
            <h3 className={styles.panelTitle}>Verification Progress</h3>
            <div className={styles.stepsList}>
              {verificationSteps.map((step) => (
                <div key={step.id} className={styles.step}>
                  <div className={styles.stepIcon}>
                    {step.status === 'pending' && <Circle size={20} className={styles.iconPending} />}
                    {step.status === 'success' && <CheckCircle2 size={20} className={styles.iconSuccess} />}
                    {step.status === 'warning' && <AlertTriangle size={20} className={styles.iconWarning} />}
                    {step.status === 'error' && <XCircle size={20} className={styles.iconError} />}
                  </div>
                  <span className={`${styles.stepLabel} ${styles[`text-${step.status}`]}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            
            <div className={styles.progressFooter}>
              <p className={styles.waitingText}>Waiting for input...</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
