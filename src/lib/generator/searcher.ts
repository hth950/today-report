import type { UserProfile, SearchResult } from '@/types';
import { searchTavily } from '@/lib/search/tavily';
import { searchRSSFallback } from '@/lib/search/rss';

interface SearchPlan {
  queries: string[];
  tags: string[]; // For RSS fallback
}

export function buildSearchPlan(profile: UserProfile): SearchPlan {
  const queries: string[] = [];
  const tags: string[] = [];
  const today = new Date().toISOString().split('T')[0];
  const year = new Date().getFullYear();

  // Technology-specific searches (2-3)
  const topTechs = profile.technologies.slice(0, 3);
  for (const tech of topTechs) {
    queries.push(`${tech} latest updates new features ${year}`);
    tags.push(tech.toLowerCase());
  }

  // Project-relevant searches (1-2)
  for (const project of profile.projects.slice(0, 2)) {
    const stack = project.techStack.join(' ');
    queries.push(`${stack} best practices improvements ${year}`);
  }

  // Interest-based searches (1-2)
  for (const interest of profile.interests.slice(0, 2)) {
    queries.push(`${interest} latest news developments ${year}`);
    tags.push(interest.toLowerCase());
  }

  // General tech news (1)
  queries.push(`developer technology news today ${today}`);

  // Add skills as tags for RSS
  tags.push(...profile.skills.map(s => s.toLowerCase()));

  return { queries: queries.slice(0, 8), tags: [...new Set(tags)].slice(0, 5) };
}

export async function executeSearches(profile: UserProfile): Promise<SearchResult[]> {
  const plan = buildSearchPlan(profile);

  let results: SearchResult[] = [];
  let usedFallback = false;

  // Try Tavily first
  if (process.env.TAVILY_API_KEY) {
    try {
      const searchPromises = plan.queries.map(query =>
        searchTavily(query, 3).catch(err => {
          console.warn(`Tavily search failed for "${query}":`, err.message);
          return [] as SearchResult[];
        })
      );

      const allResults = await Promise.allSettled(searchPromises);
      for (const result of allResults) {
        if (result.status === 'fulfilled') {
          results.push(...result.value);
        }
      }
    } catch (error) {
      console.warn('Tavily search failed entirely, falling back to RSS:', error);
      usedFallback = true;
    }
  } else {
    usedFallback = true;
  }

  // Fallback to RSS if Tavily failed or returned no results
  if (usedFallback || results.length === 0) {
    console.log('Using RSS fallback for search...');
    const rssResults = await searchRSSFallback(plan.tags);
    results.push(...rssResults);
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const deduped = results.filter(r => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  return deduped;
}
