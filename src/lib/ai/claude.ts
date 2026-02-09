import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, AIGenerationResult } from '@/types';

export function createClaudeProvider(): AIProvider {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const model = process.env.AI_MODEL || 'claude-sonnet-4-5-20250929';

  return {
    async generate(systemPrompt: string, userPrompt: string): Promise<AIGenerationResult> {
      const response = await client.messages.create({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt },
        ],
      });

      const textBlock = response.content.find(block => block.type === 'text');
      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('No text response from Claude');
      }

      return {
        text: textBlock.text,
        model: response.model,
        usage: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
        },
      };
    },
  };
}
