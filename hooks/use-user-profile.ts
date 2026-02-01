"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useAuth } from '@/lib/auth/context'
import { userApi, type UserProfileUpdate, type UserStats } from '@/lib/api/client'
import { apiCache, createCacheKey } from '@/lib/api/cache'

interface UseUserProfileReturn {
  updateProfile: (data: UserProfileUpdate) => Promise<boolean>
  isUpdating: boolean
  error: string | null
}

export function useUserProfile(): UseUserProfileReturn {
  const { token, updateUser } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProfile = useCallback(async (data: UserProfileUpdate): Promise<boolean> => {
    if (!token) return false

    setIsUpdating(true)
    setError(null)

    try {
      const response = await userApi.updateProfile(token, data)
      
      // Update local auth state
      updateUser({
        firstName: response.data.first_name,
        lastName: response.data.last_name,
        avgMilesPerWeek: response.data.avg_miles_per_week,
        preferredCategories: response.data.preferred_categories,
      })

      // Invalidate stats cache since profile update might affect stats
      apiCache.invalidatePrefix('user-stats')

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      setError(message)
      throw err
    } finally {
      setIsUpdating(false)
    }
  }, [token, updateUser])

  return {
    updateProfile,
    isUpdating,
    error,
  }
}

interface UseUserStatsReturn {
  stats: UserStats | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useUserStats(): UseUserStatsReturn {
  const { token, user, isAuthenticated } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const isMountedRef = useRef(true)
  const hasFetchedRef = useRef(false)

  // Create a stable cache key based on user id
  const cacheKey = useMemo(() => 
    user?.id ? createCacheKey('user-stats', { userId: user.id }) : null,
    [user?.id]
  )

  const fetchStats = useCallback(async (skipCache = false) => {
    if (!token || !user || !isAuthenticated || !cacheKey) {
      setIsLoading(false)
      return
    }

    // Check cache first (unless forcing refresh)
    if (!skipCache) {
      const cached = apiCache.get<UserStats>(cacheKey)
      if (cached) {
        setStats(cached)
        setIsLoading(false)
        return
      }
    }

    // Use stale data while fetching
    const staleData = apiCache.getStale<UserStats>(cacheKey)
    if (staleData) {
      setStats(staleData)
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await userApi.getStats(token, user.id)
      
      if (isMountedRef.current) {
        setStats(response.data)
        apiCache.set(cacheKey, response.data)
      }
    } catch (err) {
      if (isMountedRef.current) {
        const message = err instanceof Error ? err.message : 'Failed to fetch stats'
        setError(message)
        console.error('Error fetching stats:', err)
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [token, user, isAuthenticated, cacheKey])

  // Only fetch on mount or when key dependencies change
  useEffect(() => {
    isMountedRef.current = true

    if (!cacheKey) {
      setIsLoading(false)
      return
    }

    // Check cache first
    const cached = apiCache.get<UserStats>(cacheKey)
    if (cached) {
      setStats(cached)
      setIsLoading(false)
      hasFetchedRef.current = true
      return
    }

    if (!hasFetchedRef.current && isAuthenticated && token && user) {
      fetchStats()
      hasFetchedRef.current = true
    }

    return () => {
      isMountedRef.current = false
    }
  }, [cacheKey, isAuthenticated, token, user, fetchStats])

  // Reset fetch flag when cache key changes
  useEffect(() => {
    hasFetchedRef.current = false
  }, [cacheKey])

  // Manual refetch (bypasses cache)
  const refetch = useCallback(async () => {
    hasFetchedRef.current = false
    await fetchStats(true)
  }, [fetchStats])

  return {
    stats,
    isLoading,
    error,
    refetch,
  }
}
