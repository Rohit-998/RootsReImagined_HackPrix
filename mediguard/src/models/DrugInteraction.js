import mongoose from 'mongoose';

const drugInteractionSchema = new mongoose.Schema({
  drug_a: { type: String, required: true }, // Medicine name
  drug_b: { type: String, required: true }, // Medicine name
  severity: { type: String, enum: ['mild', 'moderate', 'severe', 'contraindicated'], required: true },
  description: { type: String, required: true },
  recommendation: { type: String, required: true },
}, { timestamps: true });

// Compound index to efficiently look up interactions between two drugs
drugInteractionSchema.index({ drug_a: 1, drug_b: 1 });

const DrugInteraction = mongoose.models.DrugInteraction || mongoose.model('DrugInteraction', drugInteractionSchema);

export default DrugInteraction;
