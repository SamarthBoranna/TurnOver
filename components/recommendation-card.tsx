"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Recommendation } from "@/lib/types"
import { TagPill } from "./tag-pill"
import { Sparkles } from "lucide-react"

interface RecommendationCardProps {
  recommendation: Recommendation
  rank: number
}

export function RecommendationCard({ recommendation, rank }: RecommendationCardProps) {
  const { shoe, score, explanation } = recommendation

  const categoryLabel = {
    daily: "Daily Trainer",
    workout: "Workout",
    race: "Race Day",
  }

  return (
    <Card className="overflow-hidden border border-border hover:border-foreground/20 transition-colors">
      <div className="flex flex-col md:flex-row">
        <div className="bg-muted flex items-center justify-center h-48 md:h-auto md:w-56 shrink-0 relative">
          <div className="text-muted-foreground text-sm">
            {shoe.brand} {shoe.name}
          </div>
          <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-semibold">
            {rank}
          </div>
        </div>
        <CardContent className="p-6 flex-1">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {shoe.brand}
              </p>
              <h3 className="text-lg font-semibold text-foreground">{shoe.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {categoryLabel[shoe.category]}
              </Badge>
              <Badge className="bg-foreground text-background text-xs">
                {Math.round(score * 100)}% Match
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {shoe.tags.map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </div>

          <div className="flex gap-6 text-sm mb-4">
            <div>
              <span className="text-muted-foreground">Weight:</span>{" "}
              <span className="font-medium">{shoe.weight}g</span>
            </div>
            <div>
              <span className="text-muted-foreground">Drop:</span>{" "}
              <span className="font-medium">{shoe.drop}mm</span>
            </div>
            <div>
              <span className="text-muted-foreground">Stack:</span>{" "}
              <span className="font-medium">{shoe.stackHeightHeel}/{shoe.stackHeightForefoot}mm</span>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <Sparkles className="w-4 h-4" />
              Why we recommend this
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {explanation}
            </p>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
