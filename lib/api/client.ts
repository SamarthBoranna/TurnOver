const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface RequestOptions extends RequestInit {
  token?: string
}

class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    let errorData
    try {
      errorData = await response.json()
    } catch {
      errorData = { detail: response.statusText }
    }
    throw new ApiError(
      errorData.detail || 'An error occurred',
      response.status,
      errorData
    )
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

// ============ Auth API ============

export interface AuthTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
}

export interface SignUpResponse {
  access_token?: string
  token_type: string
  expires_in?: number
  refresh_token?: string
  message?: string
  requires_confirmation: boolean
}

export interface SignUpRequest {
  email: string
  password: string
  first_name: string
  last_name: string
}

export interface SignInRequest {
  email: string
  password: string
}

export const authApi = {
  signUp: (data: SignUpRequest) =>
    request<SignUpResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  signIn: (data: SignInRequest) =>
    request<AuthTokenResponse>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  refresh: (refreshToken: string) =>
    request<AuthTokenResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  signOut: (token: string) =>
    request<void>('/api/auth/signout', {
      method: 'POST',
      token,
    }),
}

// ============ User API ============

export interface UserProfile {
  user_id: string
  first_name: string
  last_name: string
  email: string
  avg_miles_per_week: number
  preferred_categories: string[]
  created_at: string
  updated_at: string
}

export interface UserProfileUpdate {
  first_name?: string
  last_name?: string
  avg_miles_per_week?: number
  preferred_categories?: string[]
}

export interface UserStats {
  active_shoes: number
  retired_shoes: number
  total_shoes: number
  avg_rating: number
}

export const userApi = {
  getProfile: (token: string) =>
    request<{ data: UserProfile; success: boolean }>('/api/users/me', { token }),

  updateProfile: (token: string, data: UserProfileUpdate) =>
    request<{ data: UserProfile; success: boolean }>('/api/users/me', {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    }),

  getStats: (token: string, userId: string) =>
    request<{ data: UserStats; success: boolean }>(`/api/users/${userId}/stats`, { token }),
}

// ============ Shoes API ============

export interface Shoe {
  id: string
  brand: string
  name: string
  category: string
  tags: string[]
  weight: number
  drop: number
  stack_height_heel: number
  stack_height_forefoot: number
  image_url?: string
}

export interface ShoeFilters {
  category?: string
  brand?: string
  search?: string
  page?: number
  page_size?: number
}

export const shoesApi = {
  getShoes: (filters?: ShoeFilters, token?: string) => {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.brand) params.append('brand', filters.brand)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.page_size) params.append('page_size', filters.page_size.toString())

    const queryString = params.toString()
    const endpoint = queryString ? `/api/shoes?${queryString}` : '/api/shoes'
    return request<{ data: Shoe[]; success: boolean }>(endpoint, { token })
  },

  getShoe: (shoeId: string) =>
    request<{ data: Shoe; success: boolean }>(`/api/shoes/${shoeId}`),
}

// ============ Rotation API ============

export interface RotationShoe extends Shoe {
  start_date: string
  user_id: string
}

export interface AddToRotationRequest {
  shoe_id: string
  start_date?: string
}

export const rotationApi = {
  getRotation: (token: string, category?: string) => {
    const params = category ? `?category=${category}` : ''
    return request<{ data: RotationShoe[]; success: boolean }>(`/api/rotation${params}`, { token })
  },

  addToRotation: (token: string, data: AddToRotationRequest) =>
    request<{ data: RotationShoe; success: boolean; message?: string }>('/api/rotation', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),

  removeFromRotation: (token: string, shoeId: string) =>
    request<void>(`/api/rotation/${shoeId}`, {
      method: 'DELETE',
      token,
    }),
}

// ============ Graveyard API ============

export interface RetiredShoe extends Shoe {
  graveyard_id: string  // Unique ID of the graveyard entry (allows same shoe multiple times)
  retired_at: string
  rating: number
  review?: string
  miles_run?: number
  user_id: string
}

export interface RetireShoeRequest {
  shoe_id: string
  rating: number
  review?: string
  miles_run?: number
}

export interface GraveyardFilters {
  category?: string
  min_rating?: number
  sort_by?: 'retired_at' | 'rating' | 'name' | 'brand'
  sort_order?: 'asc' | 'desc'
}

export const graveyardApi = {
  getGraveyard: (token: string, filters?: GraveyardFilters) => {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.min_rating) params.append('min_rating', filters.min_rating.toString())
    if (filters?.sort_by) params.append('sort_by', filters.sort_by)
    if (filters?.sort_order) params.append('sort_order', filters.sort_order)

    const queryString = params.toString()
    const endpoint = queryString ? `/api/graveyard?${queryString}` : '/api/graveyard'
    return request<{ data: RetiredShoe[]; success: boolean }>(endpoint, { token })
  },

  retireShoe: (token: string, data: RetireShoeRequest) =>
    request<{ data: RetiredShoe; success: boolean; message?: string }>('/api/graveyard', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),

  updateRetiredShoe: (
    token: string,
    graveyardId: string,
    data: { rating?: number; review?: string; miles_run?: number }
  ) => {
    const params = new URLSearchParams()
    if (data.rating) params.append('rating', data.rating.toString())
    if (data.review) params.append('review', data.review)
    if (data.miles_run) params.append('miles_run', data.miles_run.toString())

    return request<{ data: RetiredShoe; success: boolean }>(`/api/graveyard/${graveyardId}?${params}`, {
      method: 'PATCH',
      token,
    })
  },

  deleteFromGraveyard: (token: string, graveyardId: string) =>
    request<void>(`/api/graveyard/${graveyardId}`, {
      method: 'DELETE',
      token,
    }),
}

// ============ Recommendations API ============

export interface RecommendedShoe extends Shoe {}

export interface Recommendation {
  shoe: RecommendedShoe
  score: number
  explanation: string
}

export interface RecommendationResponse {
  recommendations: Recommendation[]
  based_on_shoes: string[]
}

export const recommendationsApi = {
  getRecommendations: (token: string, category?: string, limit?: number) => {
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (limit) params.append('limit', limit.toString())

    const queryString = params.toString()
    const endpoint = queryString ? `/api/recommendations?${queryString}` : '/api/recommendations'
    return request<{ data: RecommendationResponse; success: boolean }>(endpoint, { token })
  },

  getSimilarShoes: (token: string, shoeId: string, limit?: number) => {
    const params = limit ? `?limit=${limit}` : ''
    return request<{ data: Recommendation[]; success: boolean }>(
      `/api/recommendations/similar/${shoeId}${params}`,
      { token }
    )
  },
}

export { ApiError }
