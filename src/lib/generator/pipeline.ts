import { getProfile } from '@/lib/db/queries';
import { createBriefing, updateBriefingStatus, getBriefingByDate } from '@/lib/db/queries';
import { executeSearches } from '@/lib/generator/searcher';
import { generateWithFallback } from '@/lib/ai/provider';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/ai/prompts';
import { parseBriefingContent } from '@/lib/generator/formatter';

// Concurrency guard
let generating = false;

export function isGenerating(): boolean {
  return generating;
}

export async function generateBriefing(date?: string): Promise<{ success: boolean; date: string; error?: string }> {
  const targetDate = date || new Date().toISOString().split('T')[0];

  // Concurrency guard
  if (generating) {
    return { success: false, date: targetDate, error: 'Generation already in progress' };
  }

  // Check if briefing already exists
  const existing = getBriefingByDate(targetDate);
  if (existing && existing.status === 'completed') {
    return { success: true, date: targetDate };
  }

  generating = true;
  const startTime = Date.now();

  try {
    // Step 1: Create or get pending briefing record
    createBriefing(targetDate);
    updateBriefingStatus(targetDate, 'generating');

    // Step 2: Load user profile
    const profile = getProfile();
    if (profile.skills.length === 0 && profile.technologies.length === 0) {
      updateBriefingStatus(targetDate, 'failed', {
        error: 'No skills or technologies configured. Please set up your profile first.',
      });
      return { success: false, date: targetDate, error: 'Profile not configured' };
    }

    // Step 3: Execute web searches
    console.log(`[pipeline] Searching for ${targetDate}...`);
    const searchResults = await executeSearches(profile);
    console.log(`[pipeline] Got ${searchResults.length} search results`);

    // Step 4: Build prompts
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(profile, searchResults, targetDate);

    // Step 5: Generate with AI (Claude -> Gemini fallback)
    console.log(`[pipeline] Generating briefing with AI...`);
    const aiResult = await generateWithFallback(systemPrompt, userPrompt);
    console.log(`[pipeline] AI response from ${aiResult.provider} (${aiResult.model})`);

    // Step 6: Parse the response
    const content = parseBriefingContent(aiResult.text);

    // Step 7: Store the briefing
    const generationTimeMs = Date.now() - startTime;
    updateBriefingStatus(targetDate, 'completed', {
      content,
      rawSearchResults: JSON.stringify(searchResults),
      aiProvider: aiResult.provider,
      aiModel: aiResult.model,
      tokenUsage: aiResult.usage,
      generationTimeMs,
    });

    console.log(`[pipeline] Briefing generated for ${targetDate} in ${generationTimeMs}ms`);
    return { success: true, date: targetDate };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[pipeline] Generation failed for ${targetDate}:`, errorMessage);

    try {
      updateBriefingStatus(targetDate, 'failed', { error: errorMessage });
    } catch {
      // DB write failed too - just log
      console.error('[pipeline] Failed to store error status');
    }

    return { success: false, date: targetDate, error: errorMessage };
  } finally {
    generating = false;
  }
}
