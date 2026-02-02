"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RatingStars } from "@/components/shared/rating-stars"
import { Loader2 } from "lucide-react"

interface RetiredShoe {
  id: string
  graveyard_id: string  // Unique ID of the graveyard entry
  brand: string
  name: string
  rating: number
  review?: string
  miles_run?: number
  image_url?: string
}

interface EditRetiredShoeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shoe: RetiredShoe
  onSave: (graveyardId: string, data: { rating?: number; review?: string; miles_run?: number }) => Promise<void>
}

export function EditRetiredShoeModal({
  open,
  onOpenChange,
  shoe,
  onSave,
}: EditRetiredShoeModalProps) {
  const [rating, setRating] = useState(shoe.rating)
  const [review, setReview] = useState(shoe.review || "")
  const [milesRun, setMilesRun] = useState(shoe.miles_run?.toString() || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when shoe changes or modal opens
  useEffect(() => {
    if (open) {
      setRating(shoe.rating)
      setReview(shoe.review || "")
      setMilesRun(shoe.miles_run?.toString() || "")
    }
  }, [open, shoe])

  const handleSubmit = async () => {
    if (rating === 0) return
    setIsSubmitting(true)
    try {
      await onSave(shoe.graveyard_id, {
        rating,
        review: review || undefined,
        miles_run: milesRun ? parseInt(milesRun, 10) : undefined,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasChanges = 
    rating !== shoe.rating || 
    review !== (shoe.review || "") ||
    milesRun !== (shoe.miles_run?.toString() || "")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Retired Shoe</DialogTitle>
          <DialogDescription>
            Update your rating and review for the {shoe.brand} {shoe.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Shoe Preview */}
          <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground overflow-hidden">
              {shoe.image_url ? (
                <img 
                  src={shoe.image_url} 
                  alt={shoe.brand}
                  className="h-full w-full object-cover"
                />
              ) : (
                shoe.brand
              )}
            </div>
            <div>
              <p className="font-medium">{shoe.name}</p>
              <p className="text-sm text-muted-foreground">{shoe.brand}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>
              Rating <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-3">
              <RatingStars
                rating={rating}
                size="lg"
                interactive
                onRatingChange={setRating}
              />
              {rating > 0 && (
                <span className="text-sm text-muted-foreground">
                  {rating} of 5 stars
                </span>
              )}
            </div>
          </div>

          {/* Miles Run */}
          <div className="space-y-2">
            <Label htmlFor="milesRun">Miles Run (optional)</Label>
            <Input
              id="milesRun"
              type="number"
              placeholder="e.g., 300"
              value={milesRun}
              onChange={(e) => setMilesRun(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Review */}
          <div className="space-y-2">
            <Label htmlFor="review">Review (optional)</Label>
            <Textarea
              id="review"
              placeholder="How did this shoe perform for you?"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0 || isSubmitting || !hasChanges}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
