"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { mockUser, mockRotation, mockGraveyard } from "@/lib/data/mock-data"
import type { User } from "@/lib/types"
import { Check, RefreshCw, Archive } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<User>(mockUser)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    }, 500)
  }

  const handleChange = (field: keyof User, value: string | number) => {
    setUser({ ...user, [field]: value })
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Profile Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your profile details here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={user.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={user.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avgMilesPerWeek">Average Miles Per Week</Label>
              <Input
                id="avgMilesPerWeek"
                type="number"
                min={0}
                value={user.avgMilesPerWeek}
                onChange={(e) => handleChange("avgMilesPerWeek", parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                This helps us provide better shoe recommendations.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              {showSuccess && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Check className="w-4 h-4" />
                  Saved successfully
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Running Stats</CardTitle>
          <CardDescription>
            A summary of your shoe collection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{mockRotation.length}</p>
                <p className="text-sm text-muted-foreground">Active Shoes</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                <Archive className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{mockGraveyard.length}</p>
                <p className="text-sm text-muted-foreground">Retired Shoes</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
              <div>
                <p className="text-2xl font-semibold">
                  {mockRotation.length + mockGraveyard.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Shoes Tracked</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
              <div>
                <p className="text-2xl font-semibold">
                  {(mockGraveyard.reduce((sum, s) => sum + s.rating, 0) / mockGraveyard.length).toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Avg Shoe Rating</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
