
import { GoogleGenAI } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

// IMPORTANT: API Key must be set in the environment variable process.env.API_KEY
// The application assumes this is pre-configured.
const API_KEY = process.env.API_KEY;

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: API_KEY });
    } else {
      console.warn("Gemini API key not found. Game over messages will be default.");
    }
  }

  public async getGameOverMessage(score: number): Promise<string> {
    if (!this.ai) {
      return score > 50 ? `Amazing score: ${score}! You're a star!` : `Good try! Score: ${score}. Keep practicing!`;
    }

    const prompt = `Generate a short, witty, and slightly epic game over message for a player who scored ${score} points in a 2D top-down space shooter game called 'Astro Blaster'. If the score is low (e.g. < 50), be a bit cheeky but encouraging. If high (e.g. > 200), be more congratulatory. Keep it under 25 words.`;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17", // Corrected model name
        contents: prompt,
      });
      
      // Ensure response.text is used correctly
      const text = response.text;
      if (text && text.trim().length > 0) {
        return text.trim();
      }
      return `Score: ${score}. The cosmos awaits your return!`; // Fallback if Gemini response is empty
    } catch (error) {
      console.error("Error fetching game over message from Gemini:", error);
      return `Score: ${score}. An error occurred, but you fought well!`; // Fallback on API error
    }
  }
}
