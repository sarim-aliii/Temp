import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY is missing. AI features will be simulated.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const refineMessage = async (text: string, tone: 'romantic' | 'cryptic' | 'poetic'): Promise<string> => {
  const ai = getAiClient();
  
  if (!ai) {
    // Fallback if no API key
    return `[AI-SIMULATION] Refined (${tone}): ${text}`;
  }

  try {
    const prompt = `Rewrite the following short message to be more ${tone}, adhering to a minimalist, modern aesthetic. Keep it brief. Message: "${text}"`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', // Updated to match likely available model
      contents: prompt,
    });

    // Handle response.text properly depending on SDK version
    const responseText = typeof response.text === 'function' ? response.text : response.text;
    return responseText ? responseText.trim() : text;
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    return text; // Return original on error
  }
};