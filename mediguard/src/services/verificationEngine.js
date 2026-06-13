import Medicine from '../models/Medicine.js';
import Manufacturer from '../models/Manufacturer.js';
import ScanLog from '../models/ScanLog.js';
import SupplyChainEvent from '../models/SupplyChainEvent.js';
import { verifyHash, verifyChain } from '../lib/crypto.js';
import connectDB from '../lib/mongodb.js';

export async function verifyMedicine(qrData, userLocation) {
  await connectDB();

  const { batch_id, serial_number, hash } = qrData;
  const results = {};
  let totalScore = 0;

  // Layer 1: Batch Existence Check (30 pts)
  const medicine = await Medicine.findOne({ batch_id, serial_number }).populate('manufacturer_id');
  results.batchCheck = {
    passed: !!medicine,
    score: medicine ? 30 : 0,
    message: medicine ? "Batch found in manufacturer database" : "Batch number or serial not found"
  };
  totalScore += results.batchCheck.score;

  // Layer 2: Crypto Hash Check (25 pts)
  if (medicine) {
    // For demo purposes, we verify against the stored hash directly or recompute if we stored secret_key
    // In our model, we stored the hash directly, but we can also recompute using verifyHash
    const expectedHash = medicine.hash;
    const hashValid = expectedHash === hash;
    
    // Alternative if using manufacturer secret:
    // const hashValid = verifyHash(batch_id, serial_number, hash);

    results.hashCheck = {
      passed: hashValid,
      score: hashValid ? 25 : 0,
      message: hashValid ? "Cryptographic signature verified" : "Hash mismatch — possible tampering"
    };
    totalScore += results.hashCheck.score;
  } else {
    results.hashCheck = { passed: false, score: 0, message: "Cannot verify hash without valid batch" };
  }

  // Layer 3: Scan Frequency Analysis (20 pts)
  // Find how many times this specific serial has been scanned
  let scanCount = 0;
  if (medicine) {
      scanCount = await ScanLog.countDocuments({ medicine_id: medicine._id });
  } else {
      scanCount = await ScanLog.countDocuments({ scanned_batch_id: batch_id, scanned_serial_number: serial_number });
  }

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

  // Layer 4: Geographic Verification (10 pts)
  if (medicine && userLocation) {
    // Simple demo match logic
    const geoMatch = userLocation.region && medicine.authorized_region.toLowerCase().includes(userLocation.region.toLowerCase());
    results.geoCheck = {
      passed: geoMatch,
      score: geoMatch ? 10 : 0,
      message: geoMatch 
        ? "Location matches authorized distribution region" 
        : `This batch is authorized for ${medicine.authorized_region}, not your current region`
    };
    totalScore += results.geoCheck.score;
  } else {
    results.geoCheck = { passed: false, score: 0, message: "Geographic data missing" };
  }

  // Layer 5: Temporal Validation (10 pts)
  if (medicine) {
    const now = new Date();
    const isExpired = now > medicine.exp_date;
    const isFutureMfg = now < medicine.mfg_date;
    const datesValid = !isExpired && !isFutureMfg;
    
    results.temporalCheck = {
      passed: datesValid,
      score: datesValid ? 10 : 0,
      message: datesValid ? "Manufacturing and expiry dates are valid" : (isExpired ? "Medicine is expired" : "Invalid manufacturing date (in future)")
    };
    totalScore += results.temporalCheck.score;
  } else {
    results.temporalCheck = { passed: false, score: 0, message: "Cannot validate dates without batch record" };
  }

  // Layer 6: Supply Chain Integrity (5 pts)
  if (medicine) {
    const events = await SupplyChainEvent.find({ medicine_id: medicine._id }).sort({ timestamp: 1 });
    // Assuming at least 2 events for a "chain"
    const chainIntact = events.length > 0; // Simplified for demo; would use verifyChain(events)
    const { valid } = verifyChain(events); // Strict check

    results.supplyChain = {
      passed: valid && events.length > 0,
      score: valid && events.length > 0 ? 5 : 0,
      eventsCount: events.length,
      message: valid && events.length > 0 ? "Supply chain complete — all nodes verified" : "Supply chain broken or missing nodes"
    };
    totalScore += results.supplyChain.score;
  } else {
    results.supplyChain = { passed: false, score: 0, message: "No supply chain data available" };
  }

  // Log this scan
  try {
    await ScanLog.create({
      medicine_id: medicine ? medicine._id : null,
      scanned_batch_id: batch_id,
      scanned_serial_number: serial_number,
      location_lat: userLocation?.lat,
      location_lng: userLocation?.lng,
      location_city: userLocation?.city || userLocation?.region,
      result_score: totalScore
    });
  } catch (error) {
    console.error("Failed to log scan", error);
  }

  return {
    medicineInfo: medicine ? {
      name: medicine.name,
      manufacturer: medicine.manufacturer_id?.name,
      batch_id: medicine.batch_id,
      exp_date: medicine.exp_date
    } : null,
    results,
    totalScore,
    verdict: totalScore >= 80 ? "verified" : totalScore >= 40 ? "suspicious" : "counterfeit"
  };
}
