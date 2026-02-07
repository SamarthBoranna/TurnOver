export type ShoeCategory = "daily" | "workout" | "race"

export type ShoeTag =
  | "cushioned"
  | "responsive"
  | "lightweight"
  | "stable"
  | "neutral"
  | "plush"
  | "firm"
  | "breathable"
  | "durable"
  | "versatile"
  | "fast"
  | "comfortable"
  | string // Allow additional tags from the backend

export interface Shoe {
  id: string
  brand: string
  name: string
  category: ShoeCategory
  tags: ShoeTag[]
  weight: number
  drop: number
  stackHeightHeel: number
  stackHeightForefoot: number
  imageUrl?: string
}

export interface RotationShoe extends Shoe {
  startDate: string
}

export interface RetiredShoe extends Shoe {
  graveyardId: string  // Unique ID of the graveyard entry (allows same shoe multiple times)
  retiredAt: string
  rating: number
  review?: string
  milesRun?: number
}

export interface Recommendation {
  shoe: Shoe
  score: number
  explanation: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avgMilesPerWeek: number
  preferredCategories: ShoeCategory[]
}

// API Response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Auth types
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}
