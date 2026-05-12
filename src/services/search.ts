import { CONFIG } from '../config';
import { usageService } from './usage';

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export const searchService = {
  async searchEnvironmentalInfo(query: string): Promise<SearchResult[]> {
    if (!CONFIG.API_KEYS.GOOGLE) return [];

    const startTime = Date.now();
    // Simple cache check
    const cacheKey = `search_${query}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 1000 * 60 * 60 * 24) {
        usageService.logRequest('Search', 'Custom Search (Cache)', 200, 0);
        return data;
      }
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${CONFIG.API_KEYS.GOOGLE}&cx=${CONFIG.API_KEYS.SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`
      );

      const latency = Date.now() - startTime;
      usageService.logRequest('Search', 'Custom Search API', response.status, latency);

      if (!response.ok) return [];

      const data = await response.json();
      const results = (data.items || []).map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet
      }));

      // Cache for 24h
      localStorage.setItem(cacheKey, JSON.stringify({ data: results, timestamp: Date.now() }));

      return results;
    } catch (error) {
      console.error('Search Service Error:', error);
      usageService.logRequest('Search', 'Custom Search API', 500, Date.now() - startTime);
      return [];
    }
  }
};

