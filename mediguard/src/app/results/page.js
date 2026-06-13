'use client';

import { ShieldCheck, Calendar, Hash, Building2, Package, GitBranch, ShieldAlert } from 'lucide-react';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import styles from './page.module.css';

export default function ResultsPage() {
  // Dummy data for presentation
  const medicineData = {
    name: "Amoxicillin Trihydrate 500mg",
    manufacturer: "PharmaCorp Global",
    batchId: "BATCH-2026-X7",
    serialNumber: "SN-998-12345678",
    mfgDate: "2025-10-15",
    expDate: "2027-10-15"
  };

  const layers = [
    { name: "Batch Validation", status: "PASSED", desc: "Batch ID confirmed in manufacturer database.", score: "+20" },
    { name: "Cryptographic Hash", status: "PASSED", desc: "Digital signature matches origin record.", score: "+25" },
    { name: "Clone Detection", status: "PASSED", desc: "No duplicate scans detected for this serial number.", score: "+20" },
    { name: "Geographic Validation", status: "PASSED", desc: "Scan location matches authorized distribution region.", score: "+15" },
    { name: "Temporal Validation", status: "PASSED", desc: "Product is within valid shelf life.", score: "+10" },
    { name: "Supply Chain Integrity", status: "PASSED", desc: "Complete cryptographic handover history verified.", score: "+10" }
  ];

  const timeline = [
    { node: "Factory", date: "Oct 15, 2025", hash: "0x3f...9a2b" },
    { node: "Distributor", date: "Oct 22, 2025", hash: "0x7c...1e4f" },
    { node: "Warehouse", date: "Nov 05, 2025", hash: "0x1a...8d2c" },
    { node: "Pharmacy", date: "Current", hash: "Pending scan" }
  ];

  return (
    <div className={`container ${styles.resultsContainer}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Verification Results</h1>
        <p className={styles.subtitle}>Analysis complete. Cryptographic trust score generated.</p>
      </div>

      {/* Top Section: Score & Grade */}
      <div className={styles.scoreSection}>
        <Card className={styles.scoreCard}>
          <div className={styles.scoreBox}>
            <p className={styles.scoreLabel}>AUTHENTICITY SCORE</p>
            <h2 className={styles.scoreValue}>100 <span className={styles.scoreMax}>/ 100</span></h2>
          </div>
          <div className={styles.gradeBox}>
            <div className={styles.gradeScale}>
              <span className={`${styles.grade} ${styles.gradeActive}`}>A+</span>
              <span className={styles.grade}>A</span>
              <span className={styles.grade}>B</span>
              <span className={styles.grade}>C</span>
              <span className={styles.grade}>D</span>
              <span className={styles.grade}>F</span>
            </div>
            <p className={styles.gradeDesc}>Highest Trust Tier</p>
          </div>
        </Card>

        {/* Medicine Info Grid */}
        <Card className={styles.infoCard}>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <Package size={16} className={styles.infoIcon} />
              <div>
                <p className={styles.infoLabel}>Medicine Name</p>
                <p className={styles.infoValue}>{medicineData.name}</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <Building2 size={16} className={styles.infoIcon} />
              <div>
                <p className={styles.infoLabel}>Manufacturer</p>
                <p className={styles.infoValue}>{medicineData.manufacturer}</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <Hash size={16} className={styles.infoIcon} />
              <div>
                <p className={styles.infoLabel}>Batch ID</p>
                <p className={styles.infoValue}>{medicineData.batchId}</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <Hash size={16} className={styles.infoIcon} />
              <div>
                <p className={styles.infoLabel}>Serial Number</p>
                <p className={styles.infoValue}>{medicineData.serialNumber}</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <Calendar size={16} className={styles.infoIcon} />
              <div>
                <p className={styles.infoLabel}>Manufacturing Date</p>
                <p className={styles.infoValue}>{medicineData.mfgDate}</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <Calendar size={16} className={styles.infoIcon} />
              <div>
                <p className={styles.infoLabel}>Expiry Date</p>
                <p className={styles.infoValue}>{medicineData.expDate}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Layer Results Grid */}
      <h3 className={styles.sectionTitle}>Security Layer Analysis</h3>
      <div className={styles.layerGrid}>
        {layers.map((layer, idx) => (
          <Card key={idx} className={styles.layerCard}>
            <div className={styles.layerHeader}>
              <h4 className={styles.layerName}>{layer.name}</h4>
              <StatusBadge status="verified" label={layer.status} />
            </div>
            <p className={styles.layerDesc}>{layer.desc}</p>
            <div className={styles.layerScore}>{layer.score} Points</div>
          </Card>
        ))}
      </div>

      {/* Supply Chain Timeline */}
      <h3 className={styles.sectionTitle}>Supply Chain Handover History</h3>
      <Card className={styles.timelineCard}>
        <div className={styles.timeline}>
          {timeline.map((item, idx) => (
            <div key={idx} className={styles.timelineNode}>
              <div className={styles.timelineIcon}>
                {idx < timeline.length - 1 ? <ShieldCheck size={20} /> : <GitBranch size={20} />}
              </div>
              <div className={styles.timelineContent}>
                <p className={styles.nodeName}>{item.node}</p>
                <p className={styles.nodeDate}>{item.date}</p>
                <div className={styles.hashTooltip}>
                  <span>Hash: </span>{item.hash}
                </div>
              </div>
              {idx < timeline.length - 1 && <div className={styles.connector}></div>}
            </div>
          ))}
        </div>
      </Card>

      {/* Final Verdict */}
      <div className={`${styles.verdictBanner} ${styles.verdictVerified}`}>
        <ShieldCheck size={48} />
        <div>
          <h2 className={styles.verdictTitle}>AUTHENTICITY VERIFIED</h2>
          <p className={styles.verdictSubtitle}>This product has passed all 6 security layers and is safe to consume.</p>
        </div>
      </div>
    </div>
  );
}
