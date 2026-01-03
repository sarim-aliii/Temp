import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will be simulated.");
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
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return text; // Return original on error
  }
};