import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  medicine_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
  batch_id:       { type: String, required: true },
  serial_number:  { type: String },
  reporter_phone: { type: String, required: true }, // stored masked e.g. +91******7890
  pharmacy_name:  { type: String },
  location:       { type: String },
  trust_score:    { type: Number },
  verdict:        { type: String }, // 'counterfeit' | 'suspicious'
  status:         { type: String, default: 'pending' }, // 'pending' | 'reviewed' | 'dismissed'
}, { timestamps: true });

const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);
export default Report;
