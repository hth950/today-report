import type { AIProvider } from '@/types';
import { createClaudeProvider } from './claude';
import { createGeminiProvider } from './gemini';

export function getAIProvider(): AIProvider {
  // Primary: Claude
  if (process.env.ANTHROPIC_API_KEY) {
    return createClaudeProvider();
  }
  // Fallback: Gemini
  if (process.env.GEMINI_API_KEY) {
    return createGeminiProvider();
  }
  throw new Error('No AI provider configured. Set ANTHROPIC_API_KEY or GEMINI_API_KEY.');
}

export async function generateWithFallback(systemPrompt: string, userPrompt: string): Promise<{ text: string; model: string; usage: { input: number; output: number }; provider: string }> {
  // Try Claude first
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const claude = createClaudeProvider();
      const result = await claude.generate(systemPrompt, userPrompt);
      return { ...result, provider: 'claude' };
    } catch (error) {
      console.warn('Claude generation failed, trying Gemini fallback:', error instanceof Error ? error.message : error);
    }
  }

  // Try Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      const gemini = createGeminiProvider();
      const result = await gemini.generate(systemPrompt, userPrompt);
      return { ...result, provider: 'gemini' };
    } catch (error) {
      console.error('Gemini generation also failed:', error instanceof Error ? error.message : error);
      throw new Error('All AI providers failed');
    }
  }

  throw new Error('No AI provider configured');
}
