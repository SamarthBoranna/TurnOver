"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/lib/auth/context'
import { rotationApi, type RotationShoe, type AddToRotationRequest } from '@/lib/api/client'
import { apiCache, createCacheKey } from '@/lib/api/cache'

interface UseRotationReturn {
  rotation: RotationShoe[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  addToRotation: (data: AddToRotationRequest) => Promise<RotationShoe | null>
  removeFromRotation: (shoeId: string) => Promise<boolean>
}

export function useRotation(category?: string): UseRotationReturn {
  const { token, isAuthenticated } = useAuth()
  const [rotation, setRotation] = useState<RotationShoe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const isMountedRef = useRef(true)
  const hasFetchedRef = useRef(false)

  // Create a stable cache key
  const cacheKey = createCacheKey('rotation', category ? { category } : undefined)

  const fetchRotation = useCallback(async (skipCache = false) => {
    if (!token || !isAuthenticated) {
      setIsLoading(false)
      return
    }

    // Check cache first (unless forcing refresh)
    if (!skipCache) {
      const cached = apiCache.get<RotationShoe[]>(cacheKey)
      if (cached) {
        setRotation(cached)
        setIsLoading(false)
        return
      }
    }

    // Use stale data while fetching
    const staleData = apiCache.getStale<RotationShoe[]>(cacheKey)
    if (staleData) {
      setRotation(staleData)
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await rotationApi.getRotation(token, category)
      
      if (isMountedRef.current) {
        setRotation(response.data)
        apiCache.set(cacheKey, response.data)
      }
    } catch (err) {
      if (isMountedRef.current) {
        const message = err instanceof Error ? err.message : 'Failed to fetch rotation'
        setError(message)
        console.error('Error fetching rotation:', err)
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [token, isAuthenticated, category, cacheKey])

  // Only fetch on mount or when key dependencies change
  useEffect(() => {
    isMountedRef.current = true

    // Check cache first
    const cached = apiCache.get<RotationShoe[]>(cacheKey)
    if (cached) {
      setRotation(cached)
      setIsLoading(false)
      hasFetchedRef.current = true
      return
    }

    if (!hasFetchedRef.current && isAuthenticated && token) {
      fetchRotation()
      hasFetchedRef.current = true
    }

    return () => {
      isMountedRef.current = false
    }
  }, [cacheKey, isAuthenticated, token, fetchRotation])

  // Reset fetch flag when cache key changes
  useEffect(() => {
    hasFetchedRef.current = false
  }, [cacheKey])

  const addToRotation = useCallback(async (data: AddToRotationRequest): Promise<RotationShoe | null> => {
    if (!token) return null

    try {
      const response = await rotationApi.addToRotation(token, data)
      setRotation(prev => {
        const newRotation = [...prev, response.data]
        // Update cache with new data
        apiCache.set(cacheKey, newRotation)
        return newRotation
      })
      return response.data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add shoe to rotation'
      setError(message)
      throw err
    }
  }, [token, cacheKey])

  const removeFromRotation = useCallback(async (shoeId: string): Promise<boolean> => {
    if (!token) return false

    try {
      await rotationApi.removeFromRotation(token, shoeId)
      setRotation(prev => {
        const newRotation = prev.filter(s => s.id !== shoeId)
        // Update cache with new data
        apiCache.set(cacheKey, newRotation)
        return newRotation
      })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove shoe from rotation'
      setError(message)
      throw err
    }
  }, [token, cacheKey])

  // Manual refetch (bypasses cache)
  const refetch = useCallback(async () => {
    hasFetchedRef.current = false
    await fetchRotation(true)
  }, [fetchRotation])

  return {
    rotation,
    isLoading,
    error,
    refetch,
    addToRotation,
    removeFromRotation,
  }
}
