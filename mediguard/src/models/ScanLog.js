import mongoose from 'mongoose';

const scanLogSchema = new mongoose.Schema({
  medicine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }, // Might be null if scanned batch doesn't exist
  scanned_at: { type: Date, default: Date.now },
  location_lat: { type: Number },
  location_lng: { type: Number },
  location_city: { type: String },
  result_score: { type: Number }, // Trust score given
  scanned_batch_id: { type: String },
  scanned_serial_number: { type: String },
}, { timestamps: true });

const ScanLog = mongoose.models.ScanLog || mongoose.model('ScanLog', scanLogSchema);

export default ScanLog;
