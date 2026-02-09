import type { SearchResult } from '@/types';

interface TavilySearchResponse {
  results: Array<{
    title: string;
    url: string;
    content: string;
    score: number;
  }>;
}

export async function searchTavily(query: string, maxResults = 5): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY is not configured');
  }

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      api_key: apiKey,
      search_depth: 'basic',
      max_results: maxResults,
      include_answer: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily search failed: ${response.status} ${response.statusText}`);
  }

  const data: TavilySearchResponse = await response.json();

  return data.results.map((r) => ({
    title: r.title,
    url: r.url,
    content: r.content,
    score: r.score,
    source: 'tavily' as const,
  }));
}
