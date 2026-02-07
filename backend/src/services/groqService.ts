import { Groq } from "groq-sdk";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";

export type templateType = "node" | "react";

type messageParts = [
  { text: string  }, // basePrompt
  { text: string }, // enhancedUserPrompt
];

export type getContentParam = {
  role: "user";
  parts: messageParts;
};

export class GroqService {
  private groq: Groq;
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
    this.groq = new Groq({ apiKey: apiKey || undefined ,timeout:300000});
    console.log("✓ GroqService initialized" + (apiKey ? " with custom API key" : ""));
  }

  /**
   * Determine project template type (node or react)
   */
  async getTemplate(prompt: string): Promise<templateType> {
    try {
      const messages: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content:
            "Determine if the user wants a 'node' or 'react' project based on their request. " +
            "Consider keywords like 'frontend', 'UI', 'component', 'website' for React. " +
            "Consider keywords like 'backend', 'API', 'server', 'database' for Node. " +
            "Respond with ONLY the word 'node' or 'react', nothing else.",
        },
        {
          role: "user",
          content: prompt,
        },
      ];
      const chatCompletion = await this.groq.chat.completions.create({
        messages,
        model: "openai/gpt-oss-120b",
        temperature: 1,
        max_completion_tokens: 1000,
        top_p: 0.97,
        stream: false,
        reasoning_effort: "medium",
      });

      const modelResponse = chatCompletion.choices[0]?.message?.content || "";

      if (!modelResponse || !modelResponse.trim()) {
        throw new Error("Received empty output from Groq");
      }

      const choice = modelResponse.trim().toLowerCase();

      if (choice.includes("react")) {
        console.log(`[GroqService] ✓ Selected template: REACT`);
        return "react";
      }

      if (choice.includes("node")) {
        console.log(`[GroqService] ✓ Selected template: NODE`);
        return "node";
      }

      console.warn(
        `[GroqService] ⚠️ Could not determine template from: "${modelResponse}". Defaulting to REACT`,
      );
      return "react";
    } catch (error) {
      console.error(`[GroqService] Error in getTemplate:`, error);
      throw error;
    }
  }

  /**
   * Generate project content based on prompt and instructions
   */
  async getContent(userPrompt: getContentParam, instructions?: string): Promise<string> {
    if (instructions) {
      console.log(
        `[GroqService] Instructions provided: ${instructions.substring(0, 200)}...`,
      );
    }

    const systemInstruction = userPrompt.parts[0]?.text || "You are a helpful assistant.";
    const enhancedUserPrompt = userPrompt.parts[1]?.text || "";
    try {
      const messages: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: systemInstruction,
        },
        {
          role: "user",
          content: enhancedUserPrompt,
        },
      ];

      const chatCompletion = await this.groq.chat.completions.create({
        messages,
        model: "openai/gpt-oss-120b",
        temperature: 0.5,
        max_completion_tokens: 65536,
        top_p: 0.9,
        stream: false,
        reasoning_effort: "high",
      });

      const modelResponse = chatCompletion.choices[0]?.message?.content || "";

      if (!modelResponse || !modelResponse.trim()) {
        throw new Error("Received empty output from Groq model");
      }

      console.log(
        `[GroqService] ✓ Content generated - Length: ${modelResponse.length} chars`,
      );

      if (
        !modelResponse.includes("<boltArtifact") &&
        !modelResponse.includes("<boltAction")
      ) {
        console.warn(
          `[GroqService] ⚠️ Response may not contain proper artifact structure`,
        );
      }

      return modelResponse;
    } catch (error) {
      console.error(`[GroqService] Error in getContent:`, error);
      throw error;
    }
  }

  /**
   * Health check to verify API connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      console.log(`[GroqService] Running health check...`);

      const messages: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: "Respond with exactly 'OK'",
        },
        {
          role: "user",
          content: "Say 'OK' if you can read this.",
        },
      ];

      const chatCompletion = await this.groq.chat.completions.create({
        messages,
        model: "openai/gpt-oss-120b",
        temperature: 1,
        max_completion_tokens: 65536,
        top_p: 1,
        stream: false,
        reasoning_effort: "high",
      });

      const response = chatCompletion.choices[0]?.message?.content || "";
      const isHealthy = response && response.toLowerCase().includes("ok");

      console.log(
        `[GroqService] Health check: ${isHealthy ? "PASSED ✓" : "FAILED ✗"}`,
      );

      return !!isHealthy;
    } catch (error) {
      console.error(`[GroqService] Health check failed:`, error);
      return false;
    }
  }

  /**
   * Get model information
   */
  getModelInfo(): { model: string; provider: string } {
    return {
      model: "openai/gpt-oss-120b",
      provider: "Groq",
    };
  }

  /**
   * Create a new instance with a custom API key
   */
  static createWithKey(apiKey: string): GroqService {
    return new GroqService(apiKey);
  }
}
