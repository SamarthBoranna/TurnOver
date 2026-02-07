"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useAuth } from '@/lib/auth/context'
import { graveyardApi, type RetiredShoe, type RetireShoeRequest, type GraveyardFilters } from '@/lib/api/client'
import { apiCache, createCacheKey } from '@/lib/api/cache'

interface UseGraveyardReturn {
  graveyard: RetiredShoe[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  retireShoe: (data: RetireShoeRequest) => Promise<RetiredShoe | null>
  updateRetiredShoe: (
    graveyardId: string,
    data: { rating?: number; review?: string; miles_run?: number }
  ) => Promise<RetiredShoe | null>
  deleteFromGraveyard: (graveyardId: string) => Promise<boolean>
}

export function useGraveyard(filters?: GraveyardFilters): UseGraveyardReturn {
  const { token, isAuthenticated } = useAuth()
  const [graveyard, setGraveyard] = useState<RetiredShoe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const isMountedRef = useRef(true)
  const hasFetchedRef = useRef(false)

  // Memoize filters to prevent unnecessary re-fetches
  const stableFilters = useMemo(() => {
    if (!filters) return undefined
    return {
      category: filters.category,
      min_rating: filters.min_rating,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
    }
  }, [filters?.category, filters?.min_rating, filters?.sort_by, filters?.sort_order])

  // Create a stable cache key
  const cacheKey = useMemo(() => 
    createCacheKey('graveyard', stableFilters as Record<string, unknown> | undefined),
    [stableFilters]
  )

  const fetchGraveyard = useCallback(async (skipCache = false) => {
    if (!token || !isAuthenticated) {
      setIsLoading(false)
      return
    }

    // Check cache first (unless forcing refresh)
    if (!skipCache) {
      const cached = apiCache.get<RetiredShoe[]>(cacheKey)
      if (cached) {
        setGraveyard(cached)
        setIsLoading(false)
        return
      }
    }

    // Use stale data while fetching
    const staleData = apiCache.getStale<RetiredShoe[]>(cacheKey)
    if (staleData) {
      setGraveyard(staleData)
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await graveyardApi.getGraveyard(token, stableFilters)
      
      if (isMountedRef.current) {
        setGraveyard(response.data)
        apiCache.set(cacheKey, response.data)
      }
    } catch (err) {
      if (isMountedRef.current) {
        const message = err instanceof Error ? err.message : 'Failed to fetch graveyard'
        setError(message)
        console.error('Error fetching graveyard:', err)
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [token, isAuthenticated, stableFilters, cacheKey])

  // Only fetch on mount or when key dependencies change
  useEffect(() => {
    isMountedRef.current = true

    // Check cache first
    const cached = apiCache.get<RetiredShoe[]>(cacheKey)
    if (cached) {
      setGraveyard(cached)
      setIsLoading(false)
      hasFetchedRef.current = true
      return
    }

    if (!hasFetchedRef.current && isAuthenticated && token) {
      fetchGraveyard()
      hasFetchedRef.current = true
    }

    return () => {
      isMountedRef.current = false
    }
  }, [cacheKey, isAuthenticated, token, fetchGraveyard])

  // Reset fetch flag when cache key changes
  useEffect(() => {
    hasFetchedRef.current = false
  }, [cacheKey])

  const retireShoe = useCallback(async (data: RetireShoeRequest): Promise<RetiredShoe | null> => {
    if (!token) return null

    try {
      const response = await graveyardApi.retireShoe(token, data)
      setGraveyard(prev => {
        const newGraveyard = [...prev, response.data]
        apiCache.set(cacheKey, newGraveyard)
        return newGraveyard
      })
      // Invalidate rotation cache since retiring affects it
      apiCache.invalidatePrefix('rotation')
      // Invalidate recommendations since new retired shoe can affect them
      apiCache.invalidatePrefix('recommendations')
      return response.data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to retire shoe'
      setError(message)
      throw err
    }
  }, [token, cacheKey])

  const updateRetiredShoe = useCallback(async (
    graveyardId: string,
    data: { rating?: number; review?: string; miles_run?: number }
  ): Promise<RetiredShoe | null> => {
    if (!token) return null

    try {
      const response = await graveyardApi.updateRetiredShoe(token, graveyardId, data)
      setGraveyard(prev => {
        const newGraveyard = prev.map(s => s.graveyard_id === graveyardId ? response.data : s)
        apiCache.set(cacheKey, newGraveyard)
        return newGraveyard
      })
      // Invalidate recommendations since ratings affect them
      apiCache.invalidatePrefix('recommendations')
      return response.data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update retired shoe'
      setError(message)
      throw err
    }
  }, [token, cacheKey])

  const deleteFromGraveyard = useCallback(async (graveyardId: string): Promise<boolean> => {
    if (!token) return false

    try {
      await graveyardApi.deleteFromGraveyard(token, graveyardId)
      setGraveyard(prev => {
        const newGraveyard = prev.filter(s => s.graveyard_id !== graveyardId)
        apiCache.set(cacheKey, newGraveyard)
        return newGraveyard
      })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete shoe from graveyard'
      setError(message)
      throw err
    }
  }, [token, cacheKey])

  // Manual refetch (bypasses cache)
  const refetch = useCallback(async () => {
    hasFetchedRef.current = false
    await fetchGraveyard(true)
  }, [fetchGraveyard])

  return {
    graveyard,
    isLoading,
    error,
    refetch,
    retireShoe,
    updateRetiredShoe,
    deleteFromGraveyard,
  }
}
