import connectDB from './src/lib/mongodb.js';
import Medicine from './src/models/Medicine.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function updateDB() {
  await connectDB();
  
  await Medicine.updateOne(
    { batch_id: 'BATCH-101' },
    { 
      $set: { 
        category: 'Analgesic', strength: '500mg', dosage: '1 tablet every 6-8 hours. Max 4 per day.',
        side_effects: ['Nausea', 'Liver damage (in high doses)', 'Allergic reaction'],
        instructions: 'Take with food or water. Do not exceed recommended dosage.',
        drug_interactions: ['Alcohol', 'Blood thinners']
      }
    }
  );

  await Medicine.updateOne(
    { batch_id: 'BATCH-102' },
    { 
      $set: { 
        category: 'Antibiotic', strength: '250mg', dosage: '1 capsule every 8 hours for 7 days.',
        side_effects: ['Diarrhea', 'Rash', 'Vomiting'],
        instructions: 'Finish the entire course. Do not stop early.',
        drug_interactions: ['Birth control pills', 'Probenecid']
      }
    }
  );

  console.log('Database updated with drug info!');
  process.exit(0);
}

updateDB().catch(console.error);
