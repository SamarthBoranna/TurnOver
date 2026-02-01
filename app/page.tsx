"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { RotateCcw, ArrowRight, RefreshCw, Archive, Sparkles, ChevronRight, Loader2 } from "lucide-react"

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            <span className="font-semibold text-lg tracking-tight">TurnOver</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Button asChild size="sm">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-balance leading-tight mb-6">
              Know your shoes.
              <br />
              <span className="text-muted-foreground">Run smarter.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl">
              Track your running shoe rotation, archive past favorites, and get personalized recommendations based on what you actually love wearing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-base">
                <Link href="/signup">
                  Start Tracking
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Everything you need to manage your rotation.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Shoe Rotation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Keep track of your active shoes. Know what you're running in and when you started using each pair.
              </p>
            </div>

            <div className="group">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4">
                <Archive className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Shoe Graveyard</h3>
              <p className="text-muted-foreground leading-relaxed">
                Archive retired shoes with ratings and reviews. Build your running history and remember what worked.
              </p>
            </div>

            <div className="group">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Recommendations</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get personalized shoe suggestions based on your preferences and past ratings. No more guessing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-border bg-secondary/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Simple workflow, smarter decisions.
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Add your shoes", desc: "Start by adding shoes to your current rotation." },
              { step: "02", title: "Track usage", desc: "See your active lineup at a glance." },
              { step: "03", title: "Archive & rate", desc: "Retire shoes and rate your experience." },
              { step: "04", title: "Get recommendations", desc: "Receive personalized suggestions for your next pair." },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-4xl font-semibold text-muted-foreground/20 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Ready to optimize your rotation?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join runners who make smarter shoe choices based on their own experience.
          </p>
          <Button asChild size="lg" className="text-base">
            <Link href="/signup">
              Get Started Free
              <ChevronRight className="ml-1 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">TurnOver</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for runners, by runners.
          </p>
        </div>
      </footer>
    </div>
  )
}
