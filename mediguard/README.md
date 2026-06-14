# SafeDose 🛡️

🔗 **Live Demo**: [https://roots-re-imagined-hack-prix-zeta.vercel.app](https://roots-re-imagined-hack-prix-zeta.vercel.app/)

**SafeDose** is a next-generation pharmaceutical authenticity verification platform built for the MLH Hackathon. It leverages a 6-layer verification engine, cryptographic hashing, and AI-powered voice interfaces to detect and report counterfeit medicines.

## Features
- **6-Layer Verification Engine**: Validates batch numbers, cryptographic hashes, supply chain events, geographic locations, scan frequency, and expiration dates.
- **AI Voice Assistant**: Uses Sarvam AI (TTS) and Web Speech API to provide localized voice feedback and voice-based counterfeit reporting in multiple Indian languages (Hindi, Tamil, Bengali, etc.).
- **Gemini Chatbot**: An AI assistant that helps users understand their medicine, potential side effects, and dosage instructions.
- **Drug Interactions**: Cross-references medicines to warn about potentially dangerous interactions.
- **Trust Leaderboard**: Ranks pharmacies based on their verification integrity and counterfeit report history.
- **Anonymous Reporting**: Report counterfeit medicines securely with OTP verification.

## Tech Stack
- **Frontend**: Next.js 14, React, Framer Motion, Vanilla CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB & Mongoose
- **AI/Voice**: Sarvam AI API (TTS), Google Gemini API, Web Speech API

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file with the following:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   MEDIGUARD_SECRET_KEY=mediguard_demo_secret_2024
   SARVAM_API_KEY=your_sarvam_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Seed the Database**
   Run the seed script to populate the database with demo medicines, pharmacies, and supply chain events:
   ```bash
   node seed.mjs
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials
Use these accounts to test the platform (Password: `demo123` for all):
- **Consumer**: `consumer@demo.com`
- **Pharmacy**: `pharmacy@demo.com`
- **Manufacturer**: `manufacturer@demo.com`
- **Regulator**: `regulator@demo.com`
