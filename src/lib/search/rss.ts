import type { SearchResult } from '@/types';

// Hacker News API - https://github.com/HackerNews/API
export async function searchHackerNews(tags: string[], limit = 10): Promise<SearchResult[]> {
  try {
    // Use HN Algolia search API
    const query = tags.slice(0, 3).join(' OR ');
    const response = await fetch(
      `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${limit}`
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.hits.map((hit: Record<string, unknown>) => ({
      title: hit.title as string || '',
      url: hit.url as string || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      content: (hit.title as string || '') + '. ' + (hit.story_text as string || '').slice(0, 500),
      source: 'hackernews' as const,
    })).filter((r: SearchResult) => r.title && r.url);
  } catch (error) {
    console.error('HackerNews search failed:', error);
    return [];
  }
}

// dev.to API
export async function searchDevTo(tags: string[], limit = 10): Promise<SearchResult[]> {
  try {
    const tag = tags[0] || 'javascript'; // dev.to only supports one tag at a time
    const response = await fetch(
      `https://dev.to/api/articles?tag=${encodeURIComponent(tag)}&per_page=${limit}&top=1`
    );

    if (!response.ok) return [];

    const articles = await response.json();
    return articles.map((article: Record<string, unknown>) => ({
      title: article.title as string,
      url: article.url as string,
      content: article.description as string || '',
      source: 'devto' as const,
    }));
  } catch (error) {
    console.error('dev.to search failed:', error);
    return [];
  }
}

export async function searchRSSFallback(tags: string[], limit = 15): Promise<SearchResult[]> {
  const [hnResults, devtoResults] = await Promise.allSettled([
    searchHackerNews(tags, Math.ceil(limit / 2)),
    searchDevTo(tags, Math.floor(limit / 2)),
  ]);

  const results: SearchResult[] = [];
  if (hnResults.status === 'fulfilled') results.push(...hnResults.value);
  if (devtoResults.status === 'fulfilled') results.push(...devtoResults.value);

  return results;
}
