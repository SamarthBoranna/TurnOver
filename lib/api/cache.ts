/**
 * Simple in-memory cache for API responses.
 * Prevents duplicate requests and allows stale-while-revalidate pattern.
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  promise?: Promise<T>
}

interface CacheOptions {
  /** Time in milliseconds before cache is considered stale. Default: 5 minutes */
  staleTime?: number
  /** Time in milliseconds before cache entry is removed. Default: 10 minutes */
  cacheTime?: number
}

const DEFAULT_STALE_TIME = 5 * 60 * 1000 // 5 minutes
const DEFAULT_CACHE_TIME = 10 * 60 * 1000 // 10 minutes

class ApiCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private subscribers = new Map<string, Set<() => void>>()

  /**
   * Get cached data if available and not stale
   */
  get<T>(key: string, options: CacheOptions = {}): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null

    const staleTime = options.staleTime ?? DEFAULT_STALE_TIME
    const isStale = Date.now() - entry.timestamp > staleTime

    if (isStale) return null
    return entry.data
  }

  /**
   * Check if we have any cached data (even if stale)
   */
  has(key: string): boolean {
    return this.cache.has(key)
  }

  /**
   * Get cached data even if stale (for stale-while-revalidate)
   */
  getStale<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    return entry?.data ?? null
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
    this.notifySubscribers(key)
    
    // Schedule cleanup
    this.scheduleCleanup(key)
  }

  /**
   * Invalidate a specific cache key
   */
  invalidate(key: string): void {
    this.cache.delete(key)
    this.notifySubscribers(key)
  }

  /**
   * Invalidate all cache entries matching a prefix
   */
  invalidatePrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key)
        this.notifySubscribers(key)
      }
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear()
    for (const key of this.subscribers.keys()) {
      this.notifySubscribers(key)
    }
  }

  /**
   * Subscribe to cache changes for a key
   */
  subscribe(key: string, callback: () => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set())
    }
    this.subscribers.get(key)!.add(callback)

    return () => {
      const subs = this.subscribers.get(key)
      if (subs) {
        subs.delete(callback)
        if (subs.size === 0) {
          this.subscribers.delete(key)
        }
      }
    }
  }

  private notifySubscribers(key: string): void {
    const subs = this.subscribers.get(key)
    if (subs) {
      subs.forEach(callback => callback())
    }
  }

  private scheduleCleanup(key: string, cacheTime = DEFAULT_CACHE_TIME): void {
    setTimeout(() => {
      const entry = this.cache.get(key)
      if (entry && Date.now() - entry.timestamp > cacheTime) {
        this.cache.delete(key)
      }
    }, cacheTime)
  }
}

// Singleton instance
export const apiCache = new ApiCache()

/**
 * Generate a cache key from parameters
 */
export function createCacheKey(base: string, params?: Record<string, unknown>): string {
  if (!params) return base
  
  // Sort keys for consistent cache keys
  const sortedParams = Object.keys(params)
    .filter(k => params[k] !== undefined && params[k] !== null)
    .sort()
    .map(k => `${k}=${JSON.stringify(params[k])}`)
    .join('&')
  
  return sortedParams ? `${base}?${sortedParams}` : base
}
