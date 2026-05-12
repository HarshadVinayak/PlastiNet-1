export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export const cache = {
  set<T>(key: string, data: T, ttlHours = 24) {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlHours * 60 * 60 * 1000
    };
    localStorage.setItem(`chloe_cache_${key}`, JSON.stringify(item));
  },

  get<T>(key: string): T | null {
    const raw = localStorage.getItem(`chloe_cache_${key}`);
    if (!raw) return null;

    try {
      const item: CacheItem<T> = JSON.parse(raw);
      const isExpired = Date.now() - item.timestamp > item.ttl;
      
      if (isExpired) {
        localStorage.removeItem(`chloe_cache_${key}`);
        return null;
      }
      
      return item.data;
    } catch (e) {
      return null;
    }
  },

  clear() {
    Object.keys(localStorage)
      .filter(key => key.startsWith('chloe_cache_'))
      .forEach(key => localStorage.removeItem(key));
  }
};
