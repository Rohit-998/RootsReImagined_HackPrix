import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  manufacturer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer', required: true },
  batch_id: { type: String, required: true },
  serial_number: { type: String, required: true },
  hash: { type: String, required: true },
  mfg_date: { type: Date, required: true },
  exp_date: { type: Date, required: true },
  is_genuine: { type: Boolean, default: true }, // For demo purposes
  authorized_region: { type: String, required: true },
}, { timestamps: true });

medicineSchema.index({ batch_id: 1, serial_number: 1 }, { unique: true });

const Medicine = mongoose.models.Medicine || mongoose.model('Medicine', medicineSchema);

export default Medicine;
