"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoeCard } from "@/components/features/shoes/shoe-card"
import { RecommendationCard } from "@/components/features/shoes/recommendation-card"
import { useAuth } from "@/lib/auth"
import { useRotation, useGraveyard, useRecommendations } from "@/hooks"
import { ArrowRight, RefreshCw, Archive, Sparkles, TrendingUp, Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const { rotation, isLoading: rotationLoading } = useRotation()
  const { graveyard, isLoading: graveyardLoading } = useGraveyard()
  const { recommendations, isLoading: recommendationsLoading } = useRecommendations(undefined, 3)

  const isLoading = rotationLoading || graveyardLoading || recommendationsLoading

  // Transform API data to frontend format for ShoeCard
  const transformedRotation = rotation.map(shoe => ({
    id: shoe.id,
    brand: shoe.brand,
    name: shoe.name,
    category: shoe.category as "daily" | "workout" | "race",
    tags: shoe.tags,
    weight: shoe.weight,
    drop: shoe.drop,
    stackHeightHeel: shoe.stack_height_heel,
    stackHeightForefoot: shoe.stack_height_forefoot,
    imageUrl: shoe.image_url,
    startDate: shoe.start_date,
  }))

  // Transform recommendations
  const transformedRecommendations = recommendations.map(rec => ({
    shoe: {
      id: rec.shoe.id,
      brand: rec.shoe.brand,
      name: rec.shoe.name,
      category: rec.shoe.category as "daily" | "workout" | "race",
      tags: rec.shoe.tags,
      weight: rec.shoe.weight,
      drop: rec.shoe.drop,
      stackHeightHeel: rec.shoe.stack_height_heel,
      stackHeightForefoot: rec.shoe.stack_height_forefoot,
      imageUrl: rec.shoe.image_url,
    },
    score: rec.score,
    explanation: rec.explanation,
  }))

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">
          Welcome back{user ? `, ${user.firstName}` : ''}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your running shoe collection.
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                {rotationLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-2xl font-semibold">{rotation.length}</p>
                )}
                <p className="text-sm text-muted-foreground">Active Shoes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Archive className="w-4 h-4" />
              </div>
              <div>
                {graveyardLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-2xl font-semibold">{graveyard.length}</p>
                )}
                <p className="text-sm text-muted-foreground">Retired Shoes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                {recommendationsLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-2xl font-semibold">{recommendations.length}</p>
                )}
                <p className="text-sm text-muted-foreground">Recommendations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{user?.avgMilesPerWeek || 0}</p>
                <p className="text-sm text-muted-foreground">Miles/Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Rotation Preview */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Current Rotation</h2>
            <p className="text-sm text-muted-foreground">Your active running shoes</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/rotation" className="flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>
        
        {rotationLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : transformedRotation.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground mb-4">No shoes in your rotation yet.</p>
            <Button asChild>
              <Link href="/rotation">Add Your First Shoe</Link>
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {transformedRotation.slice(0, 3).map((shoe) => (
              <ShoeCard key={shoe.id} shoe={shoe} compact />
            ))}
          </div>
        )}
      </section>

      {/* Top Recommendation */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Top Recommendation</h2>
            <p className="text-sm text-muted-foreground">Based on your preferences</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/recommendations" className="flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>
        
        {recommendationsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : transformedRecommendations.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              Rate more shoes in your graveyard to get personalized recommendations.
            </p>
          </div>
        ) : (
          <RecommendationCard recommendation={transformedRecommendations[0]} rank={1} />
        )}
      </section>
    </div>
  )
}
