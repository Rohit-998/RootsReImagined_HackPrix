# MediGuard — UI Specification & Design Plan
> **Active Frontend Branch:** `frontend-v1`

Design and implement a modern healthcare-security web application called MediGuard. This is NOT a consumer wellness app, medicine reminder app, or generic healthcare dashboard. MediGuard is a pharmaceutical authenticity verification platform focused on counterfeit medicine detection. The design language should combine the professionalism of Stripe Dashboard, Linear, Vercel, Cloudflare Zero Trust, Palantir Gotham, and modern enterprise compliance software. Users should immediately feel that they are interacting with a critical verification system used by pharmacies, hospitals, regulators, and manufacturers.


Use a clean, high-contrast light enterprise theme. Avoid bright gradients, startup aesthetics, neumorphism, glassmorphism overload, cartoon illustrations, oversized hero graphics, or playful design patterns. Avoid large rounded rectangles and bubble UI. Use border radii between 6px and 8px only. Components should feel structured, dense, and information-focused rather than decorative.

Color System:
- Background: #F8FAFC
- Secondary Surface: #FFFFFF
- Elevated Surface: #FFFFFF
- Borders: #E2E8F0
- Text Primary: #0F172A
- Text Secondary: #475569
- Text Muted: #94A3B8
- Primary Accent: #2563EB
- Secondary Accent: #3B82F6
- Warning: #D97706
- Danger: #DC2626
- Verified State: #0284C7

Do not use green as the primary success color. Verified states should use blue/sky tones to communicate trust and verification rather than celebration. All text must maintain high contrast ratios against light backgrounds.

Typography:
- Use Inter, Geist, or IBM Plex Sans.
- Font weights: 500, 600, 700.
- Strong visual hierarchy.
- Dense but readable enterprise spacing.

Build the application using Next.js (App Router), Vanilla CSS, and a CSS variable-based design system. Do not use Tailwind. Do not use component libraries. Build reusable custom components.

The MVP consists of only four pages:

1. Home Page
2. Scan Page
3. Results Page
4. Demo Comparison Page

PAGE 1 — HOME PAGE

Create a professional landing page focused on the counterfeit medicine problem.

Hero Section:
Headline:
"Verify Medicine Authenticity in Seconds"

Subheadline:
"Multi-layer pharmaceutical verification using cryptographic signatures, supply chain validation, and counterfeit detection."

Primary CTA:
"Start Verification"

Secondary CTA:
"View Live Demo"

Below the hero, display a structured feature grid showing:

- Batch Verification
  Manufacturer database validation

- Cryptographic Validation
  Tamper detection using digital signatures

- Clone Detection
  Identify reused QR codes

- Geographic Validation
  Detect unauthorized distribution

- Temporal Validation
  Expiry and manufacturing checks

- Supply Chain Integrity
  Track product movement history

Use professional security and compliance style icons.

PAGE 2 — SCAN PAGE

This is the most important operational screen.

Use a two-column layout.

LEFT SIDE:
- Large QR Scanner container
- Professional scanning frame
- Subtle animated scan line
- Manual Batch Entry form below scanner
- Recent scan information section

RIGHT SIDE:
Verification Progress Panel

Display all verification layers before scanning:

○ Batch Validation
○ Hash Verification
○ Clone Detection
○ Geo Validation
○ Temporal Validation
○ Supply Chain Validation

As verification runs, update each status in real time:

✓ Batch Validation
✓ Hash Verification
⚠ Clone Detection
✓ Geo Validation

Use subtle transitions and status updates.

PAGE 3 — RESULTS PAGE

This is the showcase page and must look premium.

Top Section:
Display a large authenticity score.

Do NOT use circular progress indicators.

Instead use:

AUTHENTICITY SCORE

92 / 100

Along with a horizontal security-grade indicator similar to:

A+
A
B
C
D

Color the grade based on result severity.

Below that create a structured medicine information panel showing:

- Medicine Name
- Manufacturer
- Batch ID
- Serial Number
- Manufacturing Date
- Expiry Date

Use a professional information grid.

Verification Layer Results Section:

Create six separate verification cards.

Each card must contain:
- Layer Name
- Status
- Technical Explanation
- Score Contribution

Example:

Cryptographic Validation

PASSED

Digital signature matches manufacturer record.

+25 Points

Supply Chain Timeline Section:

Display a horizontal supply chain timeline:

Factory
↓
Distributor
↓
Warehouse
↓
Pharmacy

Use verification connectors between nodes.

Show hash information on hover.

Final Verdict Section:

Large verdict banner at the bottom.

Possible states:

VERIFIED (Blue)
SUSPICIOUS (Amber)
COUNTERFEIT (Red)

The verdict should dominate the page visually.

PAGE 4 — DEMO COMPARISON PAGE

This is the hackathon-winning page and should communicate the product value within 10 seconds.

Create a 50/50 split layout.

LEFT SIDE:
Current System

Use muted grey styling.

Show:

Barcode Scan
✓ Product Found

No additional validation.

Display minimal information.

RIGHT SIDE:
MediGuard

Display the complete verification process.

Animate verification layers running one after another:

Batch Check ✓
Hash Check ✓
Clone Detection ✕
Geo Validation ✕

Then display:

COUNTERFEIT DETECTED

Use strong visual contrast to demonstrate the advantage of MediGuard over traditional barcode verification.

REUSABLE COMPONENTS

Create:
- Security Status Badge
- Authenticity Score Indicator
- Verification Layer Card
- Supply Chain Timeline
- Scanner Container
- Verdict Banner
- Verification Progress Panel
- Medicine Information Grid
- Feature Grid Card

Avoid generic dashboard widgets.

ANIMATIONS

Use subtle Framer Motion animations.

Allowed:
- Fade In
- Slide In
- Verification Progress Updates
- Timeline Progress

Avoid:
- Bounce Animations
- Floating Elements
- Excessive Scaling
- Neon Effects
- Glowing Backgrounds

GENERAL DESIGN REQUIREMENTS

The interface should feel like enterprise-grade pharmaceutical verification software rather than a startup landing page. Every page should reinforce trust, security, compliance, authenticity, and verification. The overall aesthetic should resemble software used by regulators, hospitals, pharmaceutical manufacturers, and supply-chain auditors. Prioritize clarity, credibility, and operational usability over visual gimmicks.