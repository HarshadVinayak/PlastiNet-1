import { CONFIG } from '../config';

export interface EcoNews {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source_id: string;
}

class NewsService {
  private static instance: NewsService;
  private readonly TOPICS = 'pollution,environment,eco,ecosystem,plants,nature';

  private constructor() { }

  static getInstance(): NewsService {
    if (!NewsService.instance) {
      NewsService.instance = new NewsService();
    }
    return NewsService.instance;
  }

  async fetchEcoNews(): Promise<EcoNews[]> {
    const results: EcoNews[] = [];

    // Source 1: NewsData.io
    if (CONFIG.API_KEYS.NEWSDATA) {
      try {
        const response = await fetch(
          `https://newsdata.io/api/1/news?apikey=${CONFIG.API_KEYS.NEWSDATA}&q=${this.TOPICS}&language=en&category=environment`
        );
        const data = await response.json();
        if (data.status === 'success' && data.results) {
          results.push(...data.results.map((article: any) => ({
            title: article.title,
            link: article.link,
            description: article.description || 'No description available.',
            pubDate: article.pubDate,
            source_id: `newsdata:${article.source_id}`
          })));
        }
      } catch (e) {
        console.warn('NewsData.io fetch failed:', e);
      }
    }

    // Source 2: NewsAPI.org
    if (CONFIG.API_KEYS.NEWS_API) {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${this.TOPICS.replace(/,/g, ' OR ')}&language=en&sortBy=publishedAt&apiKey=${CONFIG.API_KEYS.NEWS_API}`
        );
        const data = await response.json();
        if (data.status === 'ok' && data.articles) {
          results.push(...data.articles.slice(0, 10).map((article: any) => ({
            title: article.title,
            link: article.url,
            description: article.description || 'No description available.',
            pubDate: article.publishedAt,
            source_id: `newsapi:${article.source?.id || 'unknown'}`
          })));
        }
      } catch (e) {
        console.warn('NewsAPI.org fetch failed:', e);
      }
    }

    // Simple deduplication based on title
    const unique = new Map();
    results.forEach(n => unique.set(n.title.toLowerCase().trim(), n));
    return Array.from(unique.values()).sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  }
}

export const newsService = NewsService.getInstance();
