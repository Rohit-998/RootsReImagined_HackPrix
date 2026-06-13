# MediGuard — Implementation Plan

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js + React |
| Styling | Vanilla CSS (dark theme, glassmorphism) |
| Database | MongoDB |
| QR Scanning | html5-qrcode |
| QR Generation | qrcode.js (for demo QR codes) |
| Voice | Sarvam AI API (STT + TTS) |
| Hashing | Web Crypto API (SHA-256) |
| Charts | Recharts |
| Routing | React Router v6 |
| Icons | Lucide React |

## Folder Structure

```
mediguard/
├── public/
│   └── demo-qr/                    # Printed QR images for demo
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   └── Layout.jsx           # Page wrapper
│   │   ├── scanner/
│   │   │   ├── QRScanner.jsx        # Camera-based QR scanner
│   │   │   └── ManualEntry.jsx      # Type batch number manually
│   │   ├── verification/
│   │   │   ├── TrustScore.jsx       # Animated circular score (0-100)
│   │   │   ├── LayerResults.jsx     # 6 verification layer cards
│   │   │   └── SupplyChain.jsx      # Animated supply chain timeline
│   │   ├── voice/
│   │   │   └── VoiceVerify.jsx      # Sarvam AI voice input/output
│   │   ├── demo/
│   │   │   └── SideBySide.jsx       # Current system vs MediGuard
│   │   ├── dashboard/
│   │   │   ├── Analytics.jsx        # Charts and stats
│   │   │   └── PharmacyList.jsx     # Pharmacy trust scores
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       └── StatusBadge.jsx
│   ├── pages/
│   │   ├── HomePage.jsx             # Landing page + hero
│   │   ├── ScanPage.jsx             # QR scan + manual entry
│   │   ├── ResultsPage.jsx          # Verification results
│   │   ├── VoicePage.jsx            # Voice verification
│   │   ├── DemoPage.jsx             # Side-by-side comparison
│   │   └── DashboardPage.jsx        # Analytics + pharmacy scores
│   ├── services/
│   │   ├── supabase.js              # Supabase client init
│   │   ├── verification.js          # 6-layer verification engine
│   │   ├── sarvamAI.js              # Sarvam API wrapper
│   │   ├── blockchain.js            # Hash chain simulation
│   │   └── qrGenerator.js           # Generate demo QR codes
│   ├── data/
│   │   ├── medicines.js             # 10 sample medicines (6 real, 4 fake)
│   │   ├── supplyChains.js          # Supply chain journeys
│   │   └── scanHistory.js           # Simulated scan logs
│   ├── utils/
│   │   ├── crypto.js                # SHA-256 hash functions
│   │   ├── scoring.js               # Trust score calculator
│   │   └── geoCheck.js              # Location verification
│   ├── styles/
│   │   └── index.css                # Full design system + all styles
│   ├── App.jsx                      # Router setup
│   └── main.jsx                     # Entry point
├── scripts/
│   └── seedData.js                  # Seed Supabase with sample data
├── .env.example
├── package.json
└── README.md
```

## Database Schema (Supabase)

### Table: `manufacturers`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| name | text | "Sun Pharma", "Cipla", etc. |
| country | text | Country of origin |
| verified | boolean | Is this a real manufacturer? |
| secret_key | text | Used for hash generation |

### Table: `medicines`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| name | text | "Paracetamol 500mg" |
| manufacturer_id | uuid | FK → manufacturers |
| batch_id | text | "BATCH-2024-SP-4821" |
| serial_number | text | Unique per box |
| hash | text | SHA-256(batch + serial + secret) |
| mfg_date | date | Manufacturing date |
| exp_date | date | Expiry date |
| is_genuine | boolean | For demo: true/false |
| authorized_region | text | "India-Maharashtra" |

### Table: `supply_chain_events`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| medicine_id | uuid | FK → medicines |
| event_type | text | "manufactured", "qa_passed", "shipped", "received" |
| location | text | "Hyderabad Factory" |
| timestamp | timestamp | When this event occurred |
| prev_hash | text | Hash of previous event (blockchain) |
| event_hash | text | Hash of this event |

### Table: `scan_logs`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| medicine_id | uuid | FK → medicines |
| scanned_at | timestamp | When scanned |
| location_lat | float | Scanner's latitude |
| location_lng | float | Scanner's longitude |
| location_city | text | Approximate city |
| result_score | int | Trust score given |

### Table: `pharmacies`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| name | text | Pharmacy name |
| city | text | Location |
| trust_score | int | 0-100 |
| total_scans | int | Times they've scanned |
| flagged_count | int | Counterfeits found there |

## Pages Breakdown

### Page 1: HomePage — Landing + Hero
- Hero section with problem stats ("1 in 10 medicines is fake")
- How it works (3 steps: Scan → Verify → Know)
- Feature highlights (6 layers, voice, pharmacy scoring)
- CTA buttons: "Scan Medicine" / "Voice Verify" / "View Demo"

### Page 2: ScanPage — QR Scanner
- Camera feed with QR scanning overlay
- Manual entry form (batch ID + serial number)
- Recent scans list
- On successful scan → redirect to ResultsPage

### Page 3: ResultsPage — Verification Results
- Big animated Trust Score circle (0-100, color-coded)
- Medicine info card (name, manufacturer, batch, dates)
- 6 verification layer cards (each shows pass/fail with details)
- Supply chain timeline (animated, node-by-node)
- Action buttons: "Report", "Share", "Scan Another"

### Page 4: VoicePage — Sarvam AI Voice Verification
- Language selector (Hindi, Tamil, Telugu, Bengali, etc.)
- "Press & Speak" button
- Live transcription display
- Verification result spoken back + displayed

### Page 5: DemoPage — Side-by-Side Comparison
- Split screen: Left = "Current System", Right = "MediGuard"
- Pre-loaded fake medicine
- Left: scans barcode → ✅ "Verified" (wrong!)
- Right: scans QR → runs 6 layers → 🚨 "Counterfeit" (caught!)
- Animated, step-by-step comparison

### Page 6: DashboardPage — Analytics
- Total scans, counterfeits detected, lives saved counter
- Counterfeit hotspot map (India map with markers)
- Recent scan activity feed
- Pharmacy trust score leaderboard
- Charts: counterfeits by type, by region, over time

## Core Logic: Verification Engine

```javascript
// services/verification.js — simplified logic

async function verifyMedicine(qrData) {
  const results = {};
  let totalScore = 0;

  // Layer 1: Batch Existence (30 pts)
  const medicine = await lookupBatch(qrData.batch_id);
  results.batchCheck = {
    passed: !!medicine,
    score: medicine ? 30 : 0,
    message: medicine ? "Batch found in manufacturer database" : "Batch number not found"
  };
  totalScore += results.batchCheck.score;

  // Layer 2: Crypto Hash (25 pts)
  if (medicine) {
    const expectedHash = await computeHash(qrData.batch_id, qrData.serial, medicine.secret_key);
    const hashValid = expectedHash === qrData.hash;
    results.hashCheck = {
      passed: hashValid,
      score: hashValid ? 25 : 0,
      message: hashValid ? "Cryptographic signature verified" : "Hash mismatch — possible tampering"
    };
    totalScore += results.hashCheck.score;
  }

  // Layer 3: Scan Frequency (20 pts)
  const scanCount = await getScanCount(qrData.serial);
  const scanScore = scanCount <= 2 ? 20 : scanCount <= 5 ? 10 : scanCount <= 50 ? 5 : 0;
  results.scanFrequency = {
    passed: scanCount <= 2,
    score: scanScore,
    scanCount: scanCount,
    message: scanCount <= 2 
      ? `Scanned ${scanCount} time(s) — normal` 
      : `Scanned ${scanCount} times — likely cloned QR`
  };
  totalScore += scanScore;

  // Layer 4: Geographic Check (10 pts)
  const userLocation = await getUserLocation();
  const geoMatch = checkGeoMatch(userLocation, medicine.authorized_region);
  results.geoCheck = {
    passed: geoMatch,
    score: geoMatch ? 10 : 0,
    message: geoMatch 
      ? "Location matches authorized distribution region" 
      : `This batch is authorized for ${medicine.authorized_region}, not your location`
  };
  totalScore += results.geoCheck.score;

  // Layer 5: Temporal Validation (10 pts)
  const datesValid = validateDates(medicine.mfg_date, medicine.exp_date);
  results.temporalCheck = {
    passed: datesValid,
    score: datesValid ? 10 : 0,
    message: datesValid ? "Manufacturing and expiry dates are valid" : "Date anomaly detected"
  };
  totalScore += results.temporalCheck.score;

  // Layer 6: Supply Chain (5 pts)
  const chain = await getSupplyChain(medicine.id);
  const chainIntact = validateChain(chain);
  results.supplyChain = {
    passed: chainIntact,
    score: chainIntact ? 5 : 0,
    chain: chain,
    message: chainIntact ? "Supply chain complete — all nodes verified" : "Supply chain has missing nodes"
  };
  totalScore += results.supplyChain.score;

  return {
    medicine,
    results,
    totalScore,
    verdict: totalScore >= 80 ? "verified" : totalScore >= 40 ? "suspicious" : "counterfeit"
  };
}
```

## Sample Medicine Data (for Demo)

### Genuine Medicines ✅
| Name | Batch | Manufacturer | Region | Status |
|---|---|---|---|---|
| Paracetamol 500mg | BATCH-SUN-2024-001 | Sun Pharma | India-Maharashtra | ✅ All checks pass |
| Amoxicillin 250mg | BATCH-CIP-2024-015 | Cipla | India-Gujarat | ✅ All checks pass |
| Metformin 500mg | BATCH-DRL-2024-008 | Dr. Reddy's | India-Telangana | ✅ All checks pass |

### Fake Medicines 🚨
| Name | Batch | What's Wrong | Caught By |
|---|---|---|---|
| Fake Paracetamol | BATCH-FAKE-001 | Batch doesn't exist | Layer 1 (Batch Check) |
| Cloned Amoxicillin | BATCH-CIP-2024-015 | Same QR, scanned 847 times | Layer 3 (Scan Frequency) |
| Diverted Insulin | BATCH-NOV-2024-003 | Shipped to Nigeria, sold in India | Layer 4 (Geo Check) |
| Expired Cough Syrup | BATCH-GSK-2023-012 | Expired, relabeled with new date | Layer 5 (Temporal) |

## Team Task Split

### Person A — Frontend & UI
| Task | Hours | Priority |
|---|---|---|
| Project setup (Vite + React + Router) | 0-1 | 🔴 |
| Design system (CSS variables, dark theme) | 1-3 | 🔴 |
| HomePage (hero, features, stats) | 3-6 | 🔴 |
| ScanPage (QR scanner + manual entry) | 6-10 | 🔴 |
| ResultsPage (trust score, layer cards) | 10-16 | 🔴 |
| DemoPage (side-by-side) | 16-20 | 🟡 |
| Polish + animations | 20-24 | 🟡 |

### Person B — Backend & Logic
| Task | Hours | Priority |
|---|---|---|
| Supabase setup + schema | 0-2 | 🔴 |
| Seed sample medicine data | 2-4 | 🔴 |
| Verification engine (6 layers) | 4-10 | 🔴 |
| Blockchain hash chain simulation | 10-14 | 🟡 |
| Sarvam AI integration (voice) | 14-18 | 🟡 |
| QR code generation for demo | 18-20 | 🟡 |
| Dashboard data + charts | 20-24 | 🟡 |

### Person C (if available) — Dashboard & Demo
| Task | Hours | Priority |
|---|---|---|
| DashboardPage (analytics, charts) | 0-8 | 🟡 |
| Pharmacy trust scoring UI | 8-12 | 🟡 |
| VoicePage (Sarvam integration UI) | 12-16 | 🟡 |
| Supply chain timeline animation | 16-20 | 🟡 |
| Demo preparation + QR printouts | 20-24 | 🟡 |

### Everyone — Final Hours (24-36)
- Integration testing
- Bug fixes
- Demo rehearsal
- Pitch preparation
- README + screenshots

## Environment Variables (.env)

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SARVAM_API_KEY=your_sarvam_api_key
VITE_SECRET_KEY=mediguard_demo_secret_2024
```

## Priority Order (Build What Matters First)

1. 🔴 **QR Scan → Verification → Trust Score** (this IS the product)
2. 🔴 **Demo Page (side-by-side)** (this WINS the hackathon)
3. 🔴 **Landing Page** (first impression)
4. 🟡 **Voice Verification** (Sarvam AI integration)
5. 🟡 **Supply Chain Visualization** (visual wow)
6. 🟡 **Dashboard** (shows platform depth)
7. 🟢 **Pharmacy Trust Scoring** (nice to have)
