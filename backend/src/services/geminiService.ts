import { GoogleGenAI } from "@google/genai";

export interface GenerateContentOptions {
  systemInstruction?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
}

export class GeminiService {
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required");
    }
    this.client = new GoogleGenAI({ apiKey });
  }

  async generateContent(
    prompt: string | any,
    options?: GenerateContentOptions
  ): Promise<string> {
    try {
      const result = await this.client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: options?.systemInstruction,
          temperature: options?.temperature ?? 0.7,
          topP: options?.topP,
          topK: options?.topK,
          maxOutputTokens: options?.maxOutputTokens ?? 8000,
          responseMimeType: "text/plain",
        },
      });

      return result.text || "";
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error(
        `Gemini API error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
