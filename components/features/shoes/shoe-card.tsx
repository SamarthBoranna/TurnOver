"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Shoe } from "@/lib/types"
import { TagPill } from "@/components/shared/tag-pill"

interface ShoeCardProps {
  shoe: Shoe
  children?: React.ReactNode
  compact?: boolean
}

export function ShoeCard({ shoe, children, compact = false }: ShoeCardProps) {
  const categoryLabel = {
    daily: "Daily Trainer",
    workout: "Workout",
    race: "Race Day",
  }

  return (
    <Card className="overflow-hidden border border-border hover:border-foreground/20 transition-colors">
      <div className={`bg-muted flex items-center justify-center ${compact ? "h-32" : "h-48"} overflow-hidden`}>
        {shoe.imageUrl ? (
          <img 
            src={shoe.imageUrl} 
            alt={`${shoe.brand} ${shoe.name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground text-sm">
            {shoe.brand} {shoe.name}
          </div>
        )}
      </div>
      <CardContent className={compact ? "p-4" : "p-6"}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {shoe.brand}
            </p>
            <h3 className={`font-semibold text-foreground ${compact ? "text-base" : "text-lg"}`}>
              {shoe.name}
            </h3>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            {categoryLabel[shoe.category]}
          </Badge>
        </div>

        {!compact && (
          <>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {shoe.tags.map((tag) => (
                <TagPill key={tag} tag={tag} />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm border-t border-border pt-4">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Weight</p>
                <p className="font-medium">{shoe.weight}g</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Drop</p>
                <p className="font-medium">{shoe.drop}mm</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Stack (Heel)</p>
                <p className="font-medium">{shoe.stackHeightHeel}mm</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Stack (Forefoot)</p>
                <p className="font-medium">{shoe.stackHeightForefoot}mm</p>
              </div>
            </div>
          </>
        )}

        {children && (
          <div className={`${compact ? "mt-3" : "mt-4"} pt-4 border-t border-border`}>
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
