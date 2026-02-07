"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authApi, userApi, type AuthTokenResponse, type UserProfile } from '@/lib/api/client'
import { apiCache } from '@/lib/api/cache'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avgMilesPerWeek: number
  preferredCategories: string[]
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<SignUpResult>
  signOut: () => Promise<void>
  refreshToken: () => Promise<string | null>
  updateUser: (updates: Partial<User>) => void
}

interface SignUpResult {
  requiresConfirmation: boolean
  message?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'turnover_token'
const REFRESH_TOKEN_KEY = 'turnover_refresh_token'
const TOKEN_EXPIRY_KEY = 'turnover_token_expiry'

function transformUserProfile(profile: UserProfile): User {
  return {
    id: profile.user_id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    avgMilesPerWeek: profile.avg_miles_per_week || 0,
    preferredCategories: profile.preferred_categories || [],
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const router = useRouter()

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
    // Clear API cache to prevent stale data from previous user
    apiCache.clear()
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }, [])

  const setAuthFromTokens = useCallback(async (tokens: AuthTokenResponse) => {
    const expiresAt = Date.now() + tokens.expires_in * 1000
    
    // Clear any cached data from previous user before setting new auth
    apiCache.clear()
    
    localStorage.setItem(TOKEN_KEY, tokens.access_token)
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString())

    try {
      const profileResponse = await userApi.getProfile(tokens.access_token)
      const user = transformUserProfile(profileResponse.data)

      setState({
        user,
        token: tokens.access_token,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      clearAuth()
      throw error
    }
  }, [clearAuth])

  const refreshToken = useCallback(async (): Promise<string | null> => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!storedRefreshToken) {
      return null
    }

    try {
      const tokens = await authApi.refresh(storedRefreshToken)
      await setAuthFromTokens(tokens)
      return tokens.access_token
    } catch (error) {
      console.error('Failed to refresh token:', error)
      clearAuth()
      return null
    }
  }, [clearAuth, setAuthFromTokens])

  // Initialize auth state from stored tokens
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const storedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

      if (!storedToken || !storedRefreshToken) {
        setState(prev => ({ ...prev, isLoading: false }))
        return
      }

      // Check if token is expired or about to expire (within 5 minutes)
      const expiresAt = storedExpiry ? parseInt(storedExpiry, 10) : 0
      const isExpired = Date.now() > expiresAt - 5 * 60 * 1000

      if (isExpired) {
        // Try to refresh
        const newToken = await refreshToken()
        if (!newToken) {
          setState(prev => ({ ...prev, isLoading: false }))
        }
        return
      }

      // Token is still valid, fetch user profile
      try {
        const profileResponse = await userApi.getProfile(storedToken)
        const user = transformUserProfile(profileResponse.data)

        setState({
          user,
          token: storedToken,
          isLoading: false,
          isAuthenticated: true,
        })
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        // Try to refresh token
        const newToken = await refreshToken()
        if (!newToken) {
          clearAuth()
        }
      }
    }

    initAuth()
  }, [clearAuth, refreshToken])

  // Set up token refresh interval
  useEffect(() => {
    if (!state.isAuthenticated) return

    const checkAndRefresh = async () => {
      const storedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
      const expiresAt = storedExpiry ? parseInt(storedExpiry, 10) : 0
      
      // Refresh if token expires in less than 5 minutes
      if (Date.now() > expiresAt - 5 * 60 * 1000) {
        await refreshToken()
      }
    }

    // Check every minute
    const interval = setInterval(checkAndRefresh, 60 * 1000)
    return () => clearInterval(interval)
  }, [state.isAuthenticated, refreshToken])

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      const tokens = await authApi.signIn({ email, password })
      await setAuthFromTokens(tokens)
      router.push('/dashboard')
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<{ requiresConfirmation: boolean; message?: string }> => {
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      const response = await authApi.signUp({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      })
      
      // If email confirmation is required, return that info
      if (response.requires_confirmation || !response.access_token) {
        setState(prev => ({ ...prev, isLoading: false }))
        return { 
          requiresConfirmation: true, 
          message: response.message || 'Please check your email to confirm your account.' 
        }
      }
      
      // Email confirmation disabled - tokens available immediately
      await setAuthFromTokens({
        access_token: response.access_token,
        token_type: response.token_type,
        expires_in: response.expires_in!,
        refresh_token: response.refresh_token!,
      })
      router.push('/dashboard')
      return { requiresConfirmation: false }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const signOut = async () => {
    const token = state.token
    clearAuth()
    router.push('/')
    
    // Try to sign out on server, but don't wait for it
    if (token) {
      try {
        await authApi.signOut(token)
      } catch (error) {
        // Ignore sign out errors
      }
    }
  }

  const updateUser = (updates: Partial<User>) => {
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null,
    }))
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        refreshToken,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook to get a valid token (refreshes if needed)
export function useToken() {
  const { token, refreshToken } = useAuth()
  
  const getValidToken = useCallback(async (): Promise<string | null> => {
    const storedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
    const expiresAt = storedExpiry ? parseInt(storedExpiry, 10) : 0
    
    // If token expires in less than 1 minute, refresh it
    if (Date.now() > expiresAt - 60 * 1000) {
      return await refreshToken()
    }
    
    return token
  }, [token, refreshToken])

  return { token, getValidToken }
}
