"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RatingStars } from "@/components/shared/rating-stars"
import { TagPill } from "@/components/shared/tag-pill"
import { useGraveyard } from "@/hooks"
import { Filter, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type CategoryFilter = "all" | "daily" | "workout" | "race"
type SortOption = "rating" | "name" | "brand" | "retired_at"

export default function GraveyardPage() {
  const { graveyard, isLoading } = useGraveyard()
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")
  const [sortBy, setSortBy] = useState<SortOption>("rating")

  const categoryLabel = {
    all: "All Categories",
    daily: "Daily Trainer",
    workout: "Workout",
    race: "Race Day",
  }

  const sortLabel = {
    rating: "Highest Rated",
    name: "Name",
    brand: "Brand",
    retired_at: "Most Recent",
  }

  // Transform and sort graveyard data
  const filteredGraveyard = useMemo(() => {
    let filtered = graveyard.filter((shoe) =>
      categoryFilter === "all" ? true : shoe.category === categoryFilter
    )

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "name":
          return a.name.localeCompare(b.name)
        case "brand":
          return a.brand.localeCompare(b.brand)
        case "retired_at":
          return new Date(b.retired_at).getTime() - new Date(a.retired_at).getTime()
        default:
          return 0
      }
    })
  }, [graveyard, categoryFilter, sortBy])

  const averageRating = useMemo(() => {
    if (graveyard.length === 0) return 0
    return graveyard.reduce((sum, shoe) => sum + shoe.rating, 0) / graveyard.length
  }, [graveyard])

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Shoe Graveyard</h1>
          <p className="text-muted-foreground">
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
              </span>
            ) : (
              `${graveyard.length} retired ${graveyard.length === 1 ? "shoe" : "shoes"} · ${averageRating.toFixed(1)} avg rating`
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Sort: {sortLabel[sortBy]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(sortLabel) as SortOption[]).map((option) => (
                <DropdownMenuCheckboxItem
                  key={option}
                  checked={sortBy === option}
                  onCheckedChange={() => setSortBy(option)}
                >
                  {sortLabel[option]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Graveyard Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredGraveyard.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">
            {categoryFilter === "all"
              ? "No retired shoes yet. Retire shoes from your rotation to see them here."
              : `No ${categoryLabel[categoryFilter].toLowerCase()} shoes in your graveyard.`}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGraveyard.map((shoe) => (
            <Card key={shoe.id} className="overflow-hidden border border-border">
              <div className="bg-muted h-40 flex items-center justify-center">
                {shoe.image_url ? (
                  <img 
                    src={shoe.image_url} 
                    alt={`${shoe.brand} ${shoe.name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground text-sm">
                    {shoe.brand} {shoe.name}
                  </div>
                )}
              </div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      {shoe.brand}
                    </p>
                    <h3 className="font-semibold text-foreground">{shoe.name}</h3>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {categoryLabel[shoe.category as keyof typeof categoryLabel]}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <RatingStars rating={shoe.rating} size="sm" />
                  <span className="text-sm text-muted-foreground">
                    {shoe.rating}/5
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {shoe.tags.slice(0, 3).map((tag) => (
                    <TagPill key={tag} tag={tag} />
                  ))}
                </div>

                {shoe.review && (
                  <div className="border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      "{shoe.review}"
                    </p>
                  </div>
                )}

                <div className="border-t border-border pt-3 mt-3">
                  <p className="text-xs text-muted-foreground">
                    Retired {new Date(shoe.retired_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {shoe.miles_run && ` · ${shoe.miles_run} miles`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
