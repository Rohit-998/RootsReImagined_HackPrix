import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

// The SDK automatically uses process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({});

async function main() {
  console.log("Testing connection to Gemini 3.5 Flash using @google/genai SDK...");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Explain how AI works in 5 words.",
    });

    console.log("Success! Response from Gemini:");
    console.log(response.text);
  } catch (error) {
    console.error("API Call Failed:", error);
  }
}

main();
