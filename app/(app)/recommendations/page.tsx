"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RecommendationCard } from "@/components/recommendation-card"
import { mockRecommendations, mockGraveyard } from "@/lib/mock-data"
import { RatingStars } from "@/components/rating-stars"
import { Filter, Info } from "lucide-react"
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

  const categoryLabel = {
    all: "All Categories",
    daily: "Daily Trainer",
    workout: "Workout",
    race: "Race Day",
  }

  const filteredRecommendations = mockRecommendations.filter((rec) =>
    categoryFilter === "all" ? true : rec.shoe.category === categoryFilter
  )

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
            {filteredRecommendations.length} {filteredRecommendations.length === 1 ? "shoe" : "shoes"} picked for you
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
      <div className="mb-8 p-4 bg-secondary/30 rounded-lg border border-border">
        <p className="text-sm font-medium mb-3">Based on your top-rated shoes:</p>
        <div className="flex flex-wrap gap-4">
          {mockGraveyard
            .filter((shoe) => shoe.rating >= 4)
            .slice(0, 3)
            .map((shoe) => (
              <div key={shoe.id} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                  {shoe.brand.slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium">{shoe.name}</p>
                  <RatingStars rating={shoe.rating} size="sm" />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Recommendations */}
      {filteredRecommendations.length === 0 ? (
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
          {filteredRecommendations.map((recommendation, index) => (
            <RecommendationCard
              key={recommendation.shoeId}
              recommendation={recommendation}
              rank={index + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
