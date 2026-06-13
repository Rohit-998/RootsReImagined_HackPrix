import crypto from "crypto";

const SECRET_KEY = process.env.MEDIGUARD_SECRET_KEY || "mediguard_demo_secret_2024";

/**
 * Generate a SHA-256 hash for medicine verification
 * Hash = SHA256(batch_id + serial_number + secret_key)
 */
export function generateHash(batchId, serialNumber) {
  const data = `${batchId}:${serialNumber}:${SECRET_KEY}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Verify a hash against batch_id and serial_number
 */
export function verifyHash(batchId, serialNumber, hash) {
  const expectedHash = generateHash(batchId, serialNumber);
  return expectedHash === hash;
}

/**
 * Generate a blockchain-style event hash
 * Links events in a chain: hash = SHA256(prev_hash + event_data)
 */
export function generateEventHash(prevHash, eventData) {
  const data = `${prevHash}:${JSON.stringify(eventData)}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Verify the integrity of a supply chain (hash chain)
 */
export function verifyChain(events) {
  for (let i = 1; i < events.length; i++) {
    const expectedHash = generateEventHash(
      events[i - 1].eventHash,
      {
        type: events[i].eventType,
        location: events[i].location,
        timestamp: events[i].timestamp,
      }
    );
    if (expectedHash !== events[i].eventHash) {
      return { valid: false, brokenAt: i };
    }
  }
  return { valid: true };
}
