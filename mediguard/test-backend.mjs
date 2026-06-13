import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import crypto from 'crypto';
import { verifyMedicine } from './src/services/verificationEngine.js';
import mongoose from 'mongoose';

// Ensure DB is connected
await mongoose.connect(process.env.MONGODB_URI);

const SECRET_KEY = process.env.MEDIGUARD_SECRET_KEY || "mediguard_demo_secret_2024";

function generateHash(batchId, serialNumber) {
  const data = `${batchId}:${serialNumber}:${SECRET_KEY}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

async function runTests() {
  console.log("\n====================================");
  console.log("🧪 TESTING MEDIGUARD BACKEND 🧪");
  console.log("====================================\n");

  // TEST 1: GENUINE MEDICINE (Paracetamol)
  console.log("▶️ TEST 1: Scanning a Genuine Medicine");
  const genuineQR = {
    batch_id: "BATCH-SUN-2024-001",
    serial_number: "SN-0001",
    hash: generateHash("BATCH-SUN-2024-001", "SN-0001")
  };
  const location1 = { lat: 19.0760, lng: 72.8777, city: "Mumbai", region: "Maharashtra" };
  
  const result1 = await verifyMedicine(genuineQR, location1);
  console.log(`Medicine: ${result1.medicineInfo?.name}`);
  console.log(`Trust Score: ${result1.totalScore}/100`);
  console.log(`Verdict: ${result1.verdict.toUpperCase()}`);
  console.log("Layers passed: ", Object.values(result1.results).map(r => r.passed ? '✅' : '❌').join(' '));
  console.log("------------------------------------\n");

  // TEST 2: CLONED MEDICINE (Amoxicillin)
  console.log("▶️ TEST 2: Scanning a Cloned QR Code (Fake Medicine)");
  const clonedQR = {
    batch_id: "BATCH-CIP-2024-015",
    serial_number: "SN-0002",
    hash: generateHash("BATCH-CIP-2024-015", "SN-0002")
  };
  const location2 = { lat: 28.7041, lng: 77.1025, city: "Delhi", region: "Delhi" };

  const result2 = await verifyMedicine(clonedQR, location2);
  console.log(`Medicine: ${result2.medicineInfo?.name}`);
  console.log(`Trust Score: ${result2.totalScore}/100`);
  console.log(`Verdict: ${result2.verdict.toUpperCase()}`);
  console.log(`Reason: ${result2.results.scanFrequency.message}`);
  console.log("Layers passed: ", Object.values(result2.results).map(r => r.passed ? '✅' : '❌').join(' '));
  
  console.log("\n====================================\n");
  process.exit(0);
}

runTests();
