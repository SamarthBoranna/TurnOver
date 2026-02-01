"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useAuth } from '@/lib/auth/context'
import { recommendationsApi, type Recommendation, type RecommendationResponse } from '@/lib/api/client'
import { apiCache, createCacheKey } from '@/lib/api/cache'

interface UseRecommendationsReturn {
  recommendations: Recommendation[]
  basedOnShoes: string[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useRecommendations(category?: string, limit?: number): UseRecommendationsReturn {
  const { token, isAuthenticated } = useAuth()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [basedOnShoes, setBasedOnShoes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const isMountedRef = useRef(true)
  const hasFetchedRef = useRef(false)

  // Create a stable cache key
  const cacheKey = useMemo(() => {
    const params: Record<string, unknown> = {}
    if (category) params.category = category
    if (limit) params.limit = limit
    return createCacheKey('recommendations', Object.keys(params).length > 0 ? params : undefined)
  }, [category, limit])

  const fetchRecommendations = useCallback(async (skipCache = false) => {
    if (!token || !isAuthenticated) {
      setIsLoading(false)
      return
    }

    // Check cache first (unless forcing refresh)
    if (!skipCache) {
      const cached = apiCache.get<RecommendationResponse>(cacheKey)
      if (cached) {
        setRecommendations(cached.recommendations)
        setBasedOnShoes(cached.based_on_shoes)
        setIsLoading(false)
        return
      }
    }

    // Use stale data while fetching
    const staleData = apiCache.getStale<RecommendationResponse>(cacheKey)
    if (staleData) {
      setRecommendations(staleData.recommendations)
      setBasedOnShoes(staleData.based_on_shoes)
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await recommendationsApi.getRecommendations(token, category, limit)
      
      if (isMountedRef.current) {
        setRecommendations(response.data.recommendations)
        setBasedOnShoes(response.data.based_on_shoes)
        apiCache.set(cacheKey, response.data)
      }
    } catch (err) {
      if (isMountedRef.current) {
        const message = err instanceof Error ? err.message : 'Failed to fetch recommendations'
        setError(message)
        console.error('Error fetching recommendations:', err)
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [token, isAuthenticated, category, limit, cacheKey])

  // Only fetch on mount or when key dependencies change
  useEffect(() => {
    isMountedRef.current = true

    // Check cache first
    const cached = apiCache.get<RecommendationResponse>(cacheKey)
    if (cached) {
      setRecommendations(cached.recommendations)
      setBasedOnShoes(cached.based_on_shoes)
      setIsLoading(false)
      hasFetchedRef.current = true
      return
    }

    if (!hasFetchedRef.current && isAuthenticated && token) {
      fetchRecommendations()
      hasFetchedRef.current = true
    }

    return () => {
      isMountedRef.current = false
    }
  }, [cacheKey, isAuthenticated, token, fetchRecommendations])

  // Reset fetch flag when cache key changes
  useEffect(() => {
    hasFetchedRef.current = false
  }, [cacheKey])

  // Manual refetch (bypasses cache)
  const refetch = useCallback(async () => {
    hasFetchedRef.current = false
    await fetchRecommendations(true)
  }, [fetchRecommendations])

  return {
    recommendations,
    basedOnShoes,
    isLoading,
    error,
    refetch,
  }
}

export function useSimilarShoes(shoeId: string, limit?: number) {
  const { token, isAuthenticated } = useAuth()
  const [similarShoes, setSimilarShoes] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const isMountedRef = useRef(true)
  const hasFetchedRef = useRef(false)

  // Create a stable cache key
  const cacheKey = useMemo(() => {
    const params: Record<string, unknown> = { shoeId }
    if (limit) params.limit = limit
    return createCacheKey('similar-shoes', params)
  }, [shoeId, limit])

  const fetchSimilarShoes = useCallback(async (skipCache = false) => {
    if (!token || !isAuthenticated || !shoeId) {
      setIsLoading(false)
      return
    }

    // Check cache first (unless forcing refresh)
    if (!skipCache) {
      const cached = apiCache.get<Recommendation[]>(cacheKey)
      if (cached) {
        setSimilarShoes(cached)
        setIsLoading(false)
        return
      }
    }

    // Use stale data while fetching
    const staleData = apiCache.getStale<Recommendation[]>(cacheKey)
    if (staleData) {
      setSimilarShoes(staleData)
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await recommendationsApi.getSimilarShoes(token, shoeId, limit)
      
      if (isMountedRef.current) {
        setSimilarShoes(response.data)
        apiCache.set(cacheKey, response.data)
      }
    } catch (err) {
      if (isMountedRef.current) {
        const message = err instanceof Error ? err.message : 'Failed to fetch similar shoes'
        setError(message)
        console.error('Error fetching similar shoes:', err)
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [token, isAuthenticated, shoeId, limit, cacheKey])

  // Only fetch on mount or when key dependencies change
  useEffect(() => {
    isMountedRef.current = true

    // Check cache first
    const cached = apiCache.get<Recommendation[]>(cacheKey)
    if (cached) {
      setSimilarShoes(cached)
      setIsLoading(false)
      hasFetchedRef.current = true
      return
    }

    if (!hasFetchedRef.current && isAuthenticated && token && shoeId) {
      fetchSimilarShoes()
      hasFetchedRef.current = true
    }

    return () => {
      isMountedRef.current = false
    }
  }, [cacheKey, isAuthenticated, token, shoeId, fetchSimilarShoes])

  // Reset fetch flag when cache key changes
  useEffect(() => {
    hasFetchedRef.current = false
  }, [cacheKey])

  // Manual refetch (bypasses cache)
  const refetch = useCallback(async () => {
    hasFetchedRef.current = false
    await fetchSimilarShoes(true)
  }, [fetchSimilarShoes])

  return {
    similarShoes,
    isLoading,
    error,
    refetch,
  }
}
