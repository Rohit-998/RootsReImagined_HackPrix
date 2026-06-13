import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  report_id: { type: String, required: true, unique: true }, // e.g., "RPT-2024-00001"
  medicine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
  batch_id: { type: String, required: true },
  serial_number: { type: String, required: true },
  // Verification results snapshot
  total_score: { type: Number, required: true },
  verdict: { type: String, enum: ['verified', 'suspicious', 'counterfeit'], required: true },
  layer_results: { type: mongoose.Schema.Types.Mixed }, // Full 6-layer results object
  ai_analysis: { type: String }, // AI-generated analysis text
  // Location info
  scan_location: {
    lat: { type: Number },
    lng: { type: Number },
    city: { type: String },
    region: { type: String },
  },
  // Reporter info
  reported_by: { type: String, default: 'anonymous' }, // user ID or 'anonymous'
  reporter_role: { type: String, enum: ['consumer', 'pharmacy', 'regulator'], default: 'consumer' },
  // Status tracking
  status: { type: String, enum: ['open', 'investigating', 'resolved', 'dismissed'], default: 'open' },
  notes: { type: String },
  // Evidence
  medicine_name: { type: String },
  manufacturer_name: { type: String },
}, { timestamps: true });

reportSchema.index({ report_id: 1 });
reportSchema.index({ batch_id: 1 });
reportSchema.index({ status: 1 });

const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

export default Report;
