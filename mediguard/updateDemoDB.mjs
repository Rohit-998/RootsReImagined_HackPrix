import connectDB from './src/lib/mongodb.js';
import Medicine from './src/models/Medicine.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function updateDB() {
  await connectDB();
  
  await Medicine.updateOne(
    { batch_id: '70454' },
    { 
      $set: { 
        name: 'Cyclopam Tablet',
        category: 'Antispasmodic', 
        strength: '20mg/500mg', 
        dosage: '1 tablet every 8 hours as needed for stomach pain.',
        side_effects: ['Dry mouth', 'Dizziness', 'Blurred vision'],
        instructions: 'Take after meals. Do not drive if you feel dizzy.',
        drug_interactions: ['Antihistamines', 'Antidepressants']
      }
    }
  );

  console.log('Database updated with Cyclopam test batch info!');
  process.exit(0);
}

updateDB().catch(console.error);
