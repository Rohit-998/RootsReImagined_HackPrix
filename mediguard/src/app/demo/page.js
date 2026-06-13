'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, QrCode, CheckCircle2, XCircle } from 'lucide-react';
import styles from './page.module.css';

// Static barcode widths — no Math.random() to avoid SSR/hydration mismatch
const BARCODE_WIDTHS = [3,6,3,3,6,3,6,6,3,6,3,3,6,3,6,3,3,6,6,3];

const DEMO_STEPS = [
  { label: 'Batch Check', status: 'success' },
  { label: 'Hash Check', status: 'success' },
  { label: 'Clone Detection', status: 'fail' },
  { label: 'Geo Validation', status: 'fail' },
];

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [done, setDone] = useState(false);
  const [running, setRunning] = useState(false);

  function runDemo() {
    setCurrentStep(-1);
    setDone(false);
    setRunning(true);
  }

  useEffect(() => {
    if (!running) return;
    if (currentStep >= DEMO_STEPS.length - 1) {
      setDone(true);
      setRunning(false);
      return;
    }
    const timer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 900);
    return () => clearTimeout(timer);
  }, [running, currentStep]);

  return (
    <div className="container">
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Live Verification Demo</h1>
        <p className={styles.subtitle}>
          See how MediGuard catches counterfeit medicines in seconds — compared to traditional barcode systems.
        </p>
      </div>

      <div className={styles.splitLayout}>
        {/* LEFT: Current System */}
        <div className={`${styles.panel} ${styles.legacyPanel}`}>
          <div className={styles.panelHeader}>
            <QrCode size={20} />
            <span>Current System</span>
          </div>
          <div className={styles.legacyBody}>
            <div className={styles.barcodeBox}>
              <div className={styles.barcodeLines}>
                {BARCODE_WIDTHS.map((w, i) => (
                  <div key={i} className={styles.barcodeLine} style={{ width: `${w}px` }} />
                ))}
              </div>
              <p className={styles.barcodeLabel}>|||| BARCODE-XF-9982 ||||</p>
            </div>

            <div className={styles.legacyResult}>
              <CheckCircle2 size={18} className={styles.legacyCheck} />
              <span>Product Found</span>
            </div>

            <div className={styles.legacyInfo}>
              <div className={styles.legacyRow}><span>Name:</span><span>Amoxicillin 500mg</span></div>
              <div className={styles.legacyRow}><span>Code:</span><span>BARCODE-XF-9982</span></div>
            </div>

            <div className={styles.legacyWarning}>
              <ShieldAlert size={16} />
              <span>No additional validation performed</span>
            </div>
          </div>
        </div>

        {/* RIGHT: MediGuard */}
        <div className={`${styles.panel} ${styles.mediguardPanel}`}>
          <div className={styles.panelHeader}>
            <ShieldCheck size={20} />
            <span>MediGuard</span>
          </div>
          <div className={styles.mediguardBody}>
            <div className={styles.stepsList}>
              {DEMO_STEPS.map((step, idx) => {
                const revealed = idx <= currentStep;
                const isSuccess = step.status === 'success';
                return (
                  <div
                    key={step.label}
                    className={`${styles.demoStep} ${revealed ? styles.stepRevealed : ''} ${revealed && isSuccess ? styles.stepSuccess : ''} ${revealed && !isSuccess ? styles.stepFail : ''}`}
                  >
                    {!revealed ? (
                      <div className={styles.stepPending} />
                    ) : isSuccess ? (
                      <CheckCircle2 size={20} className={styles.iconSuccess} />
                    ) : (
                      <XCircle size={20} className={styles.iconFail} />
                    )}
                    <span className={styles.stepLabel}>{step.label}</span>
                    {revealed && (
                      <span className={`${styles.stepResult} ${isSuccess ? styles.resultPass : styles.resultFail}`}>
                        {isSuccess ? 'PASS' : 'FAIL'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {done && (
              <div className={styles.verdictBox}>
                <ShieldAlert size={36} />
                <div>
                  <p className={styles.verdictLabel}>COUNTERFEIT DETECTED</p>
                  <p className={styles.verdictSub}>
                    Clone detection and geographic validation failed. Product is fraudulent.
                  </p>
                </div>
              </div>
            )}

            <button
              className={styles.runBtn}
              onClick={runDemo}
              disabled={running}
            >
              {running ? 'Verifying...' : done ? 'Run Again' : 'Run Verification'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
