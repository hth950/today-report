import type { AIProvider } from '@/types';
import { createClaudeProvider } from './claude';
import { createGeminiProvider } from './gemini';

export function getAIProvider(): AIProvider {
  // Primary: Gemini
  if (process.env.GEMINI_API_KEY) {
    return createGeminiProvider();
  }
  // Fallback: Claude
  if (process.env.ANTHROPIC_API_KEY) {
    return createClaudeProvider();
  }
  throw new Error('No AI provider configured. Set GEMINI_API_KEY or ANTHROPIC_API_KEY.');
}

export async function generateWithFallback(systemPrompt: string, userPrompt: string): Promise<{ text: string; model: string; usage: { input: number; output: number }; provider: string }> {
  // Try Gemini first
  if (process.env.GEMINI_API_KEY) {
    try {
      const gemini = createGeminiProvider();
      const result = await gemini.generate(systemPrompt, userPrompt);
      return { ...result, provider: 'gemini' };
    } catch (error) {
      console.warn('Gemini generation failed, trying Claude fallback:', error instanceof Error ? error.message : error);
    }
  }

  // Try Claude
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const claude = createClaudeProvider();
      const result = await claude.generate(systemPrompt, userPrompt);
      return { ...result, provider: 'claude' };
    } catch (error) {
      console.error('Claude generation also failed:', error instanceof Error ? error.message : error);
      throw new Error('All AI providers failed');
    }
  }

  throw new Error('No AI provider configured');
}
