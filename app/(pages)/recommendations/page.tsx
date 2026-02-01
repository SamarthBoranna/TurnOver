"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { RecommendationCard } from "@/components/features/shoes/recommendation-card"
import { RatingStars } from "@/components/shared/rating-stars"
import { useRecommendations, useGraveyard, useShoes } from "@/hooks"
import { Filter, Info, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type CategoryFilter = "all" | "daily" | "workout" | "race"

export default function RecommendationsPage() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")
  
  const { 
    recommendations, 
    basedOnShoes, 
    isLoading: recommendationsLoading 
  } = useRecommendations(categoryFilter === "all" ? undefined : categoryFilter, 10)
  
  const { graveyard, isLoading: graveyardLoading } = useGraveyard()
  const { shoes, isLoading: shoesLoading } = useShoes()

  const categoryLabel = {
    all: "All Categories",
    daily: "Daily Trainer",
    workout: "Workout",
    race: "Race Day",
  }

  // Transform recommendations for the frontend
  const transformedRecommendations = useMemo(() => {
    return recommendations.map(rec => ({
      shoe: {
        id: rec.shoe.id,
        brand: rec.shoe.brand,
        name: rec.shoe.name,
        category: rec.shoe.category as "daily" | "workout" | "race",
        tags: rec.shoe.tags as any[],
        weight: rec.shoe.weight,
        drop: rec.shoe.drop,
        stackHeightHeel: rec.shoe.stack_height_heel,
        stackHeightForefoot: rec.shoe.stack_height_forefoot,
        imageUrl: rec.shoe.image_url,
      },
      score: rec.score,
      explanation: rec.explanation,
    }))
  }, [recommendations])

  // Get top-rated shoes from graveyard that recommendations are based on
  const topRatedShoes = useMemo(() => {
    return graveyard
      .filter(shoe => shoe.rating >= 4)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3)
  }, [graveyard])

  const isLoading = recommendationsLoading || graveyardLoading

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-semibold tracking-tight">Recommended For You</h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    Recommendations are based on your graveyard ratings and shoe preferences.
                    The more shoes you rate, the better our suggestions become.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-muted-foreground">
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
              </span>
            ) : (
              `${transformedRecommendations.length} ${transformedRecommendations.length === 1 ? "shoe" : "shoes"} picked for you`
            )}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              {categoryLabel[categoryFilter]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(categoryLabel) as CategoryFilter[]).map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={categoryFilter === category}
                onCheckedChange={() => setCategoryFilter(category)}
              >
                {categoryLabel[category]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Based On Section */}
      {!graveyardLoading && topRatedShoes.length > 0 && (
        <div className="mb-8 p-4 bg-secondary/30 rounded-lg border border-border">
          <p className="text-sm font-medium mb-3">Based on your top-rated shoes:</p>
          <div className="flex flex-wrap gap-4">
            {topRatedShoes.map((shoe) => (
              <div key={shoe.id} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground overflow-hidden">
                  {shoe.image_url ? (
                    <img 
                      src={shoe.image_url} 
                      alt={shoe.brand}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    shoe.brand.slice(0, 2)
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{shoe.name}</p>
                  <RatingStars rating={shoe.rating} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : transformedRecommendations.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-2">
            {categoryFilter === "all"
              ? "No recommendations yet."
              : `No ${categoryLabel[categoryFilter].toLowerCase()} recommendations.`}
          </p>
          <p className="text-sm text-muted-foreground">
            Rate more shoes in your graveyard to get personalized suggestions.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transformedRecommendations.map((recommendation, index) => (
            <RecommendationCard
              key={recommendation.shoe.id}
              recommendation={recommendation}
              rank={index + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
