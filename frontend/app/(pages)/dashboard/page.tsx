import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoeCard } from "@/components/shoe-card"
import { RecommendationCard } from "@/components/recommendation-card"
import { mockUser, mockRotation, mockGraveyard, mockRecommendations } from "@/lib/mock-data"
import { ArrowRight, RefreshCw, Archive, Sparkles, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">
          Welcome back, {mockUser.firstName}
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
                <p className="text-2xl font-semibold">{mockRotation.length}</p>
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
                <p className="text-2xl font-semibold">{mockGraveyard.length}</p>
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
                <p className="text-2xl font-semibold">{mockRecommendations.length}</p>
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
                <p className="text-2xl font-semibold">{mockUser.avgMilesPerWeek}</p>
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockRotation.slice(0, 3).map((shoe) => (
            <ShoeCard key={shoe.id} shoe={shoe} compact />
          ))}
        </div>
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
        <RecommendationCard recommendation={mockRecommendations[0]} rank={1} />
      </section>
    </div>
  )
}
