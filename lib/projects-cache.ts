/**
 * Projects Cache - Stale-While-Revalidate Strategy
 * 
 * Caches GitHub projects data with automatic invalidation and background revalidation.
 * Uses in-memory Map + localStorage for persistence across page refreshes.
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class ProjectsCache {
  private cache: Map<string, CacheEntry<any>>
  private readonly STORAGE_KEY = 'projects-cache'
  private readonly DEFAULT_TTL = 10 * 60 * 1000 // 10 minutes (projects change less frequently)

  constructor() {
    this.cache = new Map()
    this.loadFromStorage()
  }

  /**
   * Load cache from localStorage on initialization
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        Object.entries(parsed).forEach(([key, value]) => {
          this.cache.set(key, value as CacheEntry<any>)
        })
        console.log('[ProjectsCache] Loaded from localStorage:', this.cache.size, 'entries')
      }
    } catch (error) {
      console.error('[ProjectsCache] Failed to load from localStorage:', error)
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const obj = Object.fromEntries(this.cache.entries())
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(obj))
    } catch (error) {
      console.error('[ProjectsCache] Failed to save to localStorage:', error)
    }
  }

  /**
   * Set cache entry with optional TTL
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    }
    this.cache.set(key, entry)
    this.saveToStorage()
    console.log('[ProjectsCache] Set:', key, 'TTL:', ttl, 'ms')
  }

  /**
   * Get fresh cache entry (not expired)
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    if (isExpired) {
      console.log('[ProjectsCache] Expired:', key)
      return null
    }

    console.log('[ProjectsCache] Hit (fresh):', key)
    return entry.data as T
  }

  /**
   * Get stale cache entry (even if expired) - for SWR pattern
   */
  getStale<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    console.log('[ProjectsCache] Hit (stale):', key, 'expired:', isExpired)
    return entry.data as T
  }

  /**
   * Check if cache entry is stale (expired but exists)
   */
  isStale(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    return Date.now() - entry.timestamp > entry.ttl
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key)
    this.saveToStorage()
    console.log('[ProjectsCache] Invalidated:', key)
  }

  /**
   * Invalidate all cache entries
   */
  invalidateAll(): void {
    this.cache.clear()
    this.saveToStorage()
    console.log('[ProjectsCache] Invalidated all entries')
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const entries = Array.from(this.cache.entries())
    const fresh = entries.filter(([_, entry]) => Date.now() - entry.timestamp <= entry.ttl)
    const stale = entries.filter(([_, entry]) => Date.now() - entry.timestamp > entry.ttl)

    return {
      total: entries.length,
      fresh: fresh.length,
      stale: stale.length,
    }
  }
}

// Singleton instance
export const projectsCache = new ProjectsCache()

// Cache key generator
export const getProjectsCacheKey = () => 'github-projects'
