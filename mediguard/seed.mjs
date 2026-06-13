import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import crypto from 'crypto';

// Note: Ensure your .env.local or .env has MONGODB_URI and MEDIGUARD_SECRET_KEY
const MONGODB_URI = process.env.MONGODB_URI;
const SECRET_KEY = process.env.MEDIGUARD_SECRET_KEY || "mediguard_demo_secret_2024";

if (!MONGODB_URI) {
  console.error("Please set MONGODB_URI in your environment");
  process.exit(1);
}

// Schemas
const manufacturerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  verified: { type: Boolean, default: false },
  secret_key: { type: String, required: true },
}, { timestamps: true });

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  manufacturer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer', required: true },
  batch_id: { type: String, required: true },
  serial_number: { type: String, required: true },
  hash: { type: String, required: true },
  mfg_date: { type: Date, required: true },
  exp_date: { type: Date, required: true },
  is_genuine: { type: Boolean, default: true },
  authorized_region: { type: String, required: true },
}, { timestamps: true });

const supplyChainEventSchema = new mongoose.Schema({
  medicine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  event_type: { type: String, required: true },
  location: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  prev_hash: { type: String },
  event_hash: { type: String, required: true },
}, { timestamps: true });

const scanLogSchema = new mongoose.Schema({
    medicine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    scanned_at: { type: Date, default: Date.now },
    location_lat: { type: Number },
    location_lng: { type: Number },
    location_city: { type: String },
    result_score: { type: Number },
    scanned_batch_id: { type: String },
    scanned_serial_number: { type: String },
}, { timestamps: true });

const Manufacturer = mongoose.models.Manufacturer || mongoose.model('Manufacturer', manufacturerSchema);
const Medicine = mongoose.models.Medicine || mongoose.model('Medicine', medicineSchema);
const SupplyChainEvent = mongoose.models.SupplyChainEvent || mongoose.model('SupplyChainEvent', supplyChainEventSchema);
const ScanLog = mongoose.models.ScanLog || mongoose.model('ScanLog', scanLogSchema);

function generateHash(batchId, serialNumber) {
  const data = `${batchId}:${serialNumber}:${SECRET_KEY}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

function generateEventHash(prevHash, eventData) {
  const data = `${prevHash}:${JSON.stringify(eventData)}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Clear existing
  await Manufacturer.deleteMany({});
  await Medicine.deleteMany({});
  await SupplyChainEvent.deleteMany({});
  await ScanLog.deleteMany({});
  console.log("Cleared existing data.");

  // 1. Create Manufacturers
  const sunPharma = await Manufacturer.create({
    name: "Sun Pharma",
    country: "India",
    verified: true,
    secret_key: SECRET_KEY
  });
  
  const cipla = await Manufacturer.create({
    name: "Cipla",
    country: "India",
    verified: true,
    secret_key: SECRET_KEY
  });

  const novartis = await Manufacturer.create({
    name: "Novartis",
    country: "Switzerland",
    verified: true,
    secret_key: SECRET_KEY
  });

  // 2. Create Genuine Medicines
  const realPara = await Medicine.create({
    name: "Paracetamol 500mg",
    manufacturer_id: sunPharma._id,
    batch_id: "BATCH-SUN-2024-001",
    serial_number: "SN-0001",
    hash: generateHash("BATCH-SUN-2024-001", "SN-0001"),
    mfg_date: new Date("2024-01-10"),
    exp_date: new Date("2026-01-10"),
    is_genuine: true,
    authorized_region: "India-Maharashtra"
  });

  const realAmox = await Medicine.create({
    name: "Amoxicillin 250mg",
    manufacturer_id: cipla._id,
    batch_id: "BATCH-CIP-2024-015",
    serial_number: "SN-0002",
    hash: generateHash("BATCH-CIP-2024-015", "SN-0002"),
    mfg_date: new Date("2024-02-15"),
    exp_date: new Date("2025-02-15"),
    is_genuine: true,
    authorized_region: "India-Gujarat"
  });

  // Diverted Medicine (Real, but will be scanned in wrong region during demo)
  const divertedInsulin = await Medicine.create({
    name: "Insulin Novolin R",
    manufacturer_id: novartis._id,
    batch_id: "BATCH-NOV-2024-003",
    serial_number: "SN-0003",
    hash: generateHash("BATCH-NOV-2024-003", "SN-0003"),
    mfg_date: new Date("2024-03-01"),
    exp_date: new Date("2025-03-01"),
    is_genuine: true,
    authorized_region: "Nigeria-Lagos" // We will simulate user in India
  });

  // Expired Relabeled
  const expiredSyrup = await Medicine.create({
    name: "Cough Syrup",
    manufacturer_id: cipla._id,
    batch_id: "BATCH-CIP-2023-012",
    serial_number: "SN-0004",
    hash: generateHash("BATCH-CIP-2023-012", "SN-0004"),
    mfg_date: new Date("2021-01-01"),
    exp_date: new Date("2023-01-01"), // Already expired
    is_genuine: true,
    authorized_region: "India-Delhi"
  });

  // 3. Create Supply Chain for realPara
  let prevHash = "GENESIS";
  const events = [
    { type: "manufactured", loc: "Hyderabad Factory", time: "2024-01-10T10:00:00Z" },
    { type: "qa_passed", loc: "Hyderabad QC Lab", time: "2024-01-11T14:30:00Z" },
    { type: "shipped", loc: "Central Warehouse, Mumbai", time: "2024-01-15T09:00:00Z" },
    { type: "received", loc: "Licensed Pharmacy, Nagpur", time: "2024-01-22T11:00:00Z" }
  ];

  for (const ev of events) {
    const evData = { type: ev.type, location: ev.loc, timestamp: new Date(ev.time) };
    const eventHash = generateEventHash(prevHash, evData);
    await SupplyChainEvent.create({
      medicine_id: realPara._id,
      event_type: ev.type,
      location: ev.loc,
      timestamp: evData.timestamp,
      prev_hash: prevHash,
      event_hash: eventHash
    });
    prevHash = eventHash;
  }

  // 4. Cloned QR Simulation
  // For SN-0002 (Amoxicillin), we pretend it was scanned 847 times
  const cloneLogs = Array.from({ length: 50 }).map((_, i) => ({
    medicine_id: realAmox._id,
    scanned_batch_id: realAmox.batch_id,
    scanned_serial_number: realAmox.serial_number,
    location_city: `City ${i}`,
    result_score: 100 // Previous scans passed, until frequency caught up
  }));
  await ScanLog.insertMany(cloneLogs);

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Error seeding data:", err);
  process.exit(1);
});
