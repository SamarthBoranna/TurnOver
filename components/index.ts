// Component barrel exports for cleaner imports
// Usage: import { Navigation, ShoeCard } from '@/components'

// Layout components
export { Navigation } from "./layout/navigation"

// Feature components - Shoes
export { ShoeCard } from "./features/shoes/shoe-card"
export { RecommendationCard } from "./features/shoes/recommendation-card"

// Feature components - Rotation
export { AddShoeModal } from "./features/rotation/add-shoe-modal"
export { RetireShoeModal } from "./features/rotation/retire-shoe-modal"
export { DeleteShoeModal } from "./features/rotation/delete-shoe-modal"

// Shared components
export { RatingStars } from "./shared/rating-stars"
export { TagPill } from "./shared/tag-pill"
