// Persistent cache for blog posts (in-memory + localStorage)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class BlogCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private storageKey = 'blog-cache';
  private isClient = typeof window !== 'undefined';

  constructor() {
    // Load cache from localStorage on initialization
    if (this.isClient) {
      this.loadFromStorage();
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const entries = JSON.parse(stored) as Array<[string, CacheEntry<any>]>;
        this.cache = new Map(entries);
        
        // Clean up expired entries
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
          if (now > entry.expiresAt) {
            this.cache.delete(key);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
      this.cache.clear();
    }
  }

  private saveToStorage(): void {
    if (!this.isClient) return;
    
    try {
      const entries = Array.from(this.cache.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(entries));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
    this.saveToStorage();
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.saveToStorage();
      return false;
    }
    
    return true;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    this.saveToStorage();
  }

  invalidateAll(): void {
    this.cache.clear();
    if (this.isClient) {
      localStorage.removeItem(this.storageKey);
    }
  }

  // Get stale data while revalidating
  getStale<T>(key: string): { data: T | null; isStale: boolean } {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return { data: null, isStale: false };
    }

    const isStale = Date.now() > entry.expiresAt;
    return { data: entry.data as T, isStale };
  }
}

// Singleton instance
export const blogCache = new BlogCache();

// Helper to generate cache keys
export const getCacheKey = (
  page: number,
  searchTerm: string,
  sortBy: string
): string => {
  return `blog-posts-${page}-${searchTerm}-${sortBy}`;
};
