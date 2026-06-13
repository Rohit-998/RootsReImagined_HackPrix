import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import crypto from 'crypto';
import QRCode from 'qrcode';

const SECRET_KEY = process.env.MEDIGUARD_SECRET_KEY || 'mediguard_demo_secret_2024';

function generateHash(batchId, serialNumber) {
  return crypto.createHash('sha256').update(`${batchId}:${serialNumber}:${SECRET_KEY}`).digest('hex');
}

const medicines = [
  // GENUINE ✅
  { batch_id: 'BATCH-SUN-2024-001', serial_number: 'SN-0001', label: 'genuine-paracetamol' },
  // CLONED 🚨 (same batch+serial used 50+ times in seed)
  { batch_id: 'BATCH-CIP-2024-015', serial_number: 'SN-0002', label: 'fake-cloned-amoxicillin' },
  // EXPIRED 🚨
  { batch_id: 'BATCH-CIP-2023-012', serial_number: 'SN-0004', label: 'fake-expired-cough-syrup' },
  // DIVERTED ⚠️ (wrong region)
  { batch_id: 'BATCH-NOV-2024-003', serial_number: 'SN-0003', label: 'suspicious-diverted-insulin' },
  // COMPLETELY FAKE 🚨 (doesn't exist in DB)
  { batch_id: 'BATCH-FAKE-9999', serial_number: 'SN-FAKE', label: 'fake-nonexistent' },
];

for (const med of medicines) {
  const hash = generateHash(med.batch_id, med.serial_number);
  const payload = JSON.stringify({ batch_id: med.batch_id, serial_number: med.serial_number, hash });
  const filename = `./public/${med.label}.png`;

  await QRCode.toFile(filename, payload, { width: 400, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
  console.log(`✅ Generated: ${filename}`);
  console.log(`   Payload: ${payload.substring(0, 60)}...`);
}

console.log('\n🎉 All QR codes saved to the /public folder!');
console.log('📂 Open D:\\RootsReImagined\\RootsReImagined_HackPrix\\mediguard\\public\\');
