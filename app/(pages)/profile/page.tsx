"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"
import { useUserProfile, useRotation, useGraveyard } from "@/hooks"
import { Check, RefreshCw, Archive, Loader2, LogOut } from "lucide-react"

export default function ProfilePage() {
  const { user, signOut, isLoading: authLoading } = useAuth()
  const { updateProfile, isUpdating, error: updateError } = useUserProfile()
  const { rotation, isLoading: rotationLoading } = useRotation()
  const { graveyard, isLoading: graveyardLoading } = useGraveyard()
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avgMilesPerWeek: 0,
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avgMilesPerWeek: user.avgMilesPerWeek,
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        avg_miles_per_week: formData.avgMilesPerWeek,
      })
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    }
  }

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSignOut = async () => {
    await signOut()
  }

  // Calculate average rating from graveyard
  const avgRating = graveyard.length > 0
    ? graveyard.reduce((sum, s) => sum + s.rating, 0) / graveyard.length
    : 0

  const isLoading = authLoading || rotationLoading || graveyardLoading

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
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
            {(error || updateError) && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {error || updateError}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  disabled={isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  disabled={isUpdating}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avgMilesPerWeek">Average Miles Per Week</Label>
              <Input
                id="avgMilesPerWeek"
                type="number"
                min={0}
                value={formData.avgMilesPerWeek}
                onChange={(e) => handleChange("avgMilesPerWeek", parseInt(e.target.value) || 0)}
                disabled={isUpdating}
              />
              <p className="text-xs text-muted-foreground">
                This helps us provide better shoe recommendations.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{rotation.length}</p>
                  <p className="text-sm text-muted-foreground">Active Shoes</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                  <Archive className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{graveyard.length}</p>
                  <p className="text-sm text-muted-foreground">Retired Shoes</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                <div>
                  <p className="text-2xl font-semibold">
                    {rotation.length + graveyard.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Shoes Tracked</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                <div>
                  <p className="text-2xl font-semibold">
                    {avgRating.toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Shoe Rating</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
