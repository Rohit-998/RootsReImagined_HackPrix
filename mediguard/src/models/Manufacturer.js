import mongoose from 'mongoose';

const manufacturerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  verified: { type: Boolean, default: false },
  secret_key: { type: String, required: true }, // Used for hash generation
}, { timestamps: true });

const Manufacturer = mongoose.models.Manufacturer || mongoose.model('Manufacturer', manufacturerSchema);

export default Manufacturer;
