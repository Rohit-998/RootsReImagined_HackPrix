import Link from 'next/link';
import { 
  ShieldCheck, 
  Database, 
  LockKeyhole, 
  Fingerprint, 
  MapPin, 
  Clock, 
  GitBranch 
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import styles from './page.module.css';

export default function Home() {
  const features = [
    {
      icon: <Database size={24} className={styles.featureIcon} />,
      title: "Batch Verification",
      description: "Manufacturer database validation"
    },
    {
      icon: <LockKeyhole size={24} className={styles.featureIcon} />,
      title: "Cryptographic Validation",
      description: "Tamper detection using digital signatures"
    },
    {
      icon: <Fingerprint size={24} className={styles.featureIcon} />,
      title: "Clone Detection",
      description: "Identify reused QR codes"
    },
    {
      icon: <MapPin size={24} className={styles.featureIcon} />,
      title: "Geographic Validation",
      description: "Detect unauthorized distribution"
    },
    {
      icon: <Clock size={24} className={styles.featureIcon} />,
      title: "Temporal Validation",
      description: "Expiry and manufacturing checks"
    },
    {
      icon: <GitBranch size={24} className={styles.featureIcon} />,
      title: "Supply Chain Integrity",
      description: "Track product movement history"
    }
  ];

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <ShieldCheck size={16} />
              <span>Enterprise-Grade Security</span>
            </div>
            <h1 className={styles.heroTitle}>
              Verify Medicine Authenticity in Seconds
            </h1>
            <p className={styles.heroSubtitle}>
              Multi-layer pharmaceutical verification using cryptographic signatures, supply chain validation, and counterfeit detection.
            </p>
            <div className={styles.heroActions}>
              <Link href="/scan">
                <Button size="lg" variant="primary">Start Verification</Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="secondary">View Live Demo</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className={styles.featuresSection}>
        <div className="container">
          <div className={styles.featureGrid}>
            {features.map((feature, index) => (
              <Card key={index} className={styles.featureCard}>
                <div className={styles.iconContainer}>
                  {feature.icon}
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
