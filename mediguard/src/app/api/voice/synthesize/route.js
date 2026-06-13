import { NextResponse } from 'next/server';
import { textToSpeech } from '@/services/sarvamAI';
import { GoogleGenAI } from '@google/genai';

export async function POST(request) {
  try {
    const { text, language } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    let textForSarvam = text;

    // If the language is not English, translate it first using Gemini!
    if (language && !language.startsWith('en')) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Translate the following medical text accurately into the language corresponding to this code: "${language}" (e.g. hi-IN = Hindi, ta-IN = Tamil). Only return the raw translated text, nothing else.\n\n${text}`
        });
        if (response.text) {
          textForSarvam = response.text.trim();
        }
      } catch (translationError) {
        console.error("Gemini Translation Error:", translationError);
        // Fallback to original text if translation fails
      }
    }

    // Convert translated text to speech using Sarvam AI
    const { audioBase64 } = await textToSpeech(textForSarvam, language || 'hi-IN');
    
    return NextResponse.json({ audioBase64 }, { status: 200 });

  } catch (error) {
    console.error("TTS API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
