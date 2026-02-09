import type { BriefingContent } from '@/types';

export function parseBriefingContent(raw: string): BriefingContent {
  // Tier 1: Direct JSON parse (works when AI returns clean JSON)
  try {
    const parsed = JSON.parse(raw);
    if (isValidBriefingContent(parsed)) return parsed;
  } catch {
    // Continue to tier 2
  }

  // Tier 2: Strip markdown code fences and try again
  const stripped = raw.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
  try {
    const parsed = JSON.parse(stripped);
    if (isValidBriefingContent(parsed)) return parsed;
  } catch {
    // Continue to tier 3
  }

  // Tier 3: Extract first JSON object block
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (isValidBriefingContent(parsed)) return parsed;
    } catch {
      // All tiers failed
    }
  }

  throw new Error(`Failed to parse briefing content. Raw response: ${raw.slice(0, 500)}`);
}

function isValidBriefingContent(obj: unknown): obj is BriefingContent {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;

  if (typeof o.summary !== 'string') return false;
  if (!o.sections || typeof o.sections !== 'object') return false;

  const sections = o.sections as Record<string, unknown>;
  if (!sections.newTechnologies || !sections.techNews || !sections.projectIdeas) return false;

  // Validate each section has title and items array
  for (const key of ['newTechnologies', 'techNews', 'projectIdeas']) {
    const section = sections[key] as Record<string, unknown>;
    if (!section || typeof section.title !== 'string' || !Array.isArray(section.items)) return false;
  }

  return true;
}
