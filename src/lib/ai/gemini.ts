import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIProvider, AIGenerationResult } from '@/types';

export function createGeminiProvider(): AIProvider {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 4096,
    },
  });

  return {
    async generate(systemPrompt: string, userPrompt: string): Promise<AIGenerationResult> {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: { role: 'model', parts: [{ text: systemPrompt }] },
      });

      const response = result.response;
      const text = response.text();
      const usage = response.usageMetadata;

      return {
        text,
        model: 'gemini-3-flash-preview',
        usage: {
          input: usage?.promptTokenCount || 0,
          output: usage?.candidatesTokenCount || 0,
        },
      };
    },
  };
}
