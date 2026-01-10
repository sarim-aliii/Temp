import { Request, Response } from 'express';
import { GoogleGenAI } from "@google/genai";
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

// Use a specific server-side environment variable for safety
const apiKey = process.env.GEMINI_API_KEY;

// Initialize the client only if the key exists
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const refineMessage = asyncHandler(async (req: Request, res: Response) => {
  const { text, tone } = req.body;

  if (!text || !tone) {
    throw new AppError('Message text and tone are required.', 400);
  }

  // Fallback simulation if no API Key is configured on the server
  if (!ai) {
    console.warn("Gemini API Key missing on server. returning simulation.");
    return res.json({ text: `[Server-AI-SIM] Refined (${tone}): ${text}` });
  }

  try {
    const prompt = `Rewrite the following short message to be more ${tone}, adhering to a minimalist, modern aesthetic. Keep it brief. Message: "${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    
    // Handle SDK response structure
    const resultText = response.text ? response.text : "Could not generate text";

    res.json({ text: resultText?.trim() });
  } catch (error) {
    console.error("Gemini API Server Error:", error);
    // Fail gracefully so the client knows something went wrong, or return original text
    throw new AppError('Failed to refine message.', 500);
  }
});