import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import DrugInteraction from '../../../../models/DrugInteraction';
import Medicine from '../../../../models/Medicine';

// POST /api/interactions/check — Check drug interactions between medicines
export async function POST(request) {
  try {
    await connectDB();
    const { medicines } = await request.json();

    // Accept either medicine names or batch_ids
    if (!medicines || !Array.isArray(medicines) || medicines.length < 2) {
      return NextResponse.json({
        error: 'Provide an array of at least 2 medicine names or batch_ids',
        example: { medicines: ["Paracetamol 500mg", "Metformin 500mg"] }
      }, { status: 400 });
    }

    // Resolve batch_ids to medicine names if needed
    const medicineNames = [];
    for (const item of medicines) {
      if (item.startsWith('BATCH-')) {
        const med = await Medicine.findOne({ batch_id: item });
        medicineNames.push(med?.name || item);
      } else {
        medicineNames.push(item);
      }
    }

    // Check all pairs for interactions
    const interactions = [];
    for (let i = 0; i < medicineNames.length; i++) {
      for (let j = i + 1; j < medicineNames.length; j++) {
        const drugA = medicineNames[i];
        const drugB = medicineNames[j];

        // Search both directions
        const found = await DrugInteraction.find({
          $or: [
            { drug_a: { $regex: new RegExp(drugA, 'i') }, drug_b: { $regex: new RegExp(drugB, 'i') } },
            { drug_a: { $regex: new RegExp(drugB, 'i') }, drug_b: { $regex: new RegExp(drugA, 'i') } },
          ]
        }).lean();

        for (const interaction of found) {
          interactions.push({
            drug_a: interaction.drug_a,
            drug_b: interaction.drug_b,
            severity: interaction.severity,
            description: interaction.description,
            recommendation: interaction.recommendation,
          });
        }
      }
    }

    // Also check the drug_interactions field on Medicine documents
    const medicineWarnings = [];
    for (const name of medicineNames) {
      const med = await Medicine.findOne({ name: { $regex: new RegExp(name, 'i') } });
      if (med?.drug_interactions?.length) {
        for (const otherName of medicineNames) {
          if (otherName !== name) {
            const hasInteraction = med.drug_interactions.some(
              di => di.toLowerCase().includes(otherName.toLowerCase()) ||
                    otherName.toLowerCase().includes(di.toLowerCase())
            );
            if (hasInteraction) {
              medicineWarnings.push({
                drug: name,
                interacts_with: otherName,
                source: 'medicine_record',
              });
            }
          }
        }
      }
    }

    const hasDangerousInteractions = interactions.some(i => 
      i.severity === 'severe' || i.severity === 'contraindicated'
    );

    return NextResponse.json({
      medicines_checked: medicineNames,
      interactions,
      medicine_warnings: medicineWarnings,
      total_interactions: interactions.length + medicineWarnings.length,
      has_dangerous_interactions: hasDangerousInteractions,
      safety_status: interactions.length === 0 && medicineWarnings.length === 0
        ? 'safe'
        : hasDangerousInteractions
        ? 'dangerous'
        : 'caution',
    }, { status: 200 });

  } catch (error) {
    console.error("Error checking interactions:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
