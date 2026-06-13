import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fs from 'fs';
import { textToSpeech } from './src/services/sarvamAI.js';

async function runVoiceTest() {
  console.log("🗣️ Requesting audio from Sarvam AI...");
  
  // Hindi for: "This medicine is completely safe. You can consume it."
  const textToSay = "यह दवा बिल्कुल सुरक्षित है। आप इसका सेवन कर सकते हैं।";
  
  try {
    const { audioBase64 } = await textToSpeech(textToSay, 'hi-IN');
    
    if (audioBase64) {
      // Decode the base64 audio and save it to a file
      const buffer = Buffer.from(audioBase64, 'base64');
      fs.writeFileSync('./public/sarvam_test.wav', buffer);
      console.log("✅ Success! Audio saved to: D:/RootsReImagined/RootsReImagined_HackPrix/mediguard/public/sarvam_test.wav");
      console.log("▶️ Go to that folder and double-click the file to listen!");
    } else {
      console.log("❌ Failed to get audio. Check your API key.");
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

runVoiceTest();
