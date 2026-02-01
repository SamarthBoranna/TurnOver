"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useAuth } from '@/lib/auth/context'
import { shoesApi, type Shoe, type ShoeFilters } from '@/lib/api/client'
import { apiCache, createCacheKey } from '@/lib/api/cache'

interface UseShoesReturn {
  shoes: Shoe[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useShoes(filters?: ShoeFilters): UseShoesReturn {
  const { token } = useAuth()
  const [shoes, setShoes] = useState<Shoe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Track if this is the initial mount
  const hasFetchedRef = useRef(false)
  const isMountedRef = useRef(true)

  // Memoize filters to prevent unnecessary re-fetches
  // Only re-create when actual filter values change
  const stableFilters = useMemo(() => {
    if (!filters) return undefined
    return {
      category: filters.category,
      brand: filters.brand,
      search: filters.search,
      page: filters.page,
      page_size: filters.page_size,
    }
  }, [filters?.category, filters?.brand, filters?.search, filters?.page, filters?.page_size])

  // Create a stable cache key
  const cacheKey = useMemo(() => 
    createCacheKey('shoes', stableFilters as Record<string, unknown> | undefined),
    [stableFilters]
  )

  const fetchShoes = useCallback(async (skipCache = false) => {
    // Check cache first (unless forcing refresh)
    if (!skipCache) {
      const cached = apiCache.get<Shoe[]>(cacheKey)
      if (cached) {
        setShoes(cached)
        setIsLoading(false)
        return
      }
    }

    // Use stale data while fetching
    const staleData = apiCache.getStale<Shoe[]>(cacheKey)
    if (staleData) {
      setShoes(staleData)
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await shoesApi.getShoes(stableFilters, token || undefined)
      
      if (isMountedRef.current) {
        setShoes(response.data)
        apiCache.set(cacheKey, response.data)
      }
    } catch (err) {
      if (isMountedRef.current) {
        const message = err instanceof Error ? err.message : 'Failed to fetch shoes'
        setError(message)
        console.error('Error fetching shoes:', err)
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [token, stableFilters, cacheKey])

  // Only fetch on mount or when cache key changes
  useEffect(() => {
    isMountedRef.current = true
    
    // Check cache first - if we have fresh data, use it immediately
    const cached = apiCache.get<Shoe[]>(cacheKey)
    if (cached) {
      setShoes(cached)
      setIsLoading(false)
      hasFetchedRef.current = true
      return
    }

    // Only fetch if we haven't already for this cache key
    if (!hasFetchedRef.current) {
      fetchShoes()
      hasFetchedRef.current = true
    }

    return () => {
      isMountedRef.current = false
    }
  }, [cacheKey, fetchShoes])

  // Reset fetch flag when cache key changes
  useEffect(() => {
    hasFetchedRef.current = false
  }, [cacheKey])

  // Manual refetch (bypasses cache)
  const refetch = useCallback(async () => {
    await fetchShoes(true)
  }, [fetchShoes])

  return {
    shoes,
    isLoading,
    error,
    refetch,
  }
}
