"use client"

import { useState } from "react"
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
import { RatingStars } from "@/components/rating-stars"
import type { RotationShoe } from "@/lib/types"

interface RetireShoeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shoe: RotationShoe
  onRetire: (shoeId: string, rating: number, review: string) => void
}

export function RetireShoeModal({
  open,
  onOpenChange,
  shoe,
  onRetire,
}: RetireShoeModalProps) {
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")

  const handleSubmit = () => {
    if (rating === 0) return
    onRetire(shoe.id, rating, review)
    setRating(0)
    setReview("")
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setRating(0)
      setReview("")
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Retire Shoe</DialogTitle>
          <DialogDescription>
            Move the {shoe.brand} {shoe.name} to your graveyard. A rating is required.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Shoe Preview */}
          <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground">
              {shoe.brand}
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

          {/* Review */}
          <div className="space-y-2">
            <Label htmlFor="review">Review (optional)</Label>
            <Textarea
              id="review"
              placeholder="How did this shoe perform for you?"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0}>
            Retire Shoe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
