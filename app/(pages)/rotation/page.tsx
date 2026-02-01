"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoeCard } from "@/components/features/shoes/shoe-card"
import { AddShoeModal } from "@/components/features/rotation/add-shoe-modal"
import { RetireShoeModal } from "@/components/features/rotation/retire-shoe-modal"
import { useRotation, useShoes, useGraveyard } from "@/hooks"
import type { RotationShoe, Shoe } from "@/lib/types"
import { Plus, Archive, Filter, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type CategoryFilter = "all" | "daily" | "workout" | "race"

export default function RotationPage() {
  const { rotation, isLoading: rotationLoading, addToRotation, removeFromRotation, refetch: refetchRotation } = useRotation()
  const { shoes, isLoading: shoesLoading } = useShoes({ page_size: 100 })
  const { retireShoe, refetch: refetchGraveyard } = useGraveyard()
  
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [retireModalOpen, setRetireModalOpen] = useState(false)
  const [selectedShoe, setSelectedShoe] = useState<RotationShoe | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Transform API rotation data to frontend format
  const transformedRotation: RotationShoe[] = rotation.map(shoe => ({
    id: shoe.id,
    brand: shoe.brand,
    name: shoe.name,
    category: shoe.category as "daily" | "workout" | "race",
    tags: shoe.tags as any[],
    weight: shoe.weight,
    drop: shoe.drop,
    stackHeightHeel: shoe.stack_height_heel,
    stackHeightForefoot: shoe.stack_height_forefoot,
    imageUrl: shoe.image_url,
    startDate: shoe.start_date,
  }))

  // Transform API shoes data to frontend format
  const transformedShoes: Shoe[] = shoes.map(shoe => ({
    id: shoe.id,
    brand: shoe.brand,
    name: shoe.name,
    category: shoe.category as "daily" | "workout" | "race",
    tags: shoe.tags as any[],
    weight: shoe.weight,
    drop: shoe.drop,
    stackHeightHeel: shoe.stack_height_heel,
    stackHeightForefoot: shoe.stack_height_forefoot,
    imageUrl: shoe.image_url,
  }))

  // Shoes not in rotation (available to add)
  const rotationIds = new Set(rotation.map(s => s.id))
  const availableShoes = transformedShoes.filter(shoe => !rotationIds.has(shoe.id))

  const filteredRotation = transformedRotation.filter((shoe) =>
    categoryFilter === "all" ? true : shoe.category === categoryFilter
  )

  const handleAddShoe = async (shoe: Shoe) => {
    setIsSubmitting(true)
    try {
      await addToRotation({ shoe_id: shoe.id })
      setAddModalOpen(false)
    } catch (error) {
      console.error('Failed to add shoe:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetireShoe = async (shoeId: string, rating: number, review: string) => {
    setIsSubmitting(true)
    try {
      await retireShoe({
        shoe_id: shoeId,
        rating,
        review: review || undefined,
      })
      setRetireModalOpen(false)
      setSelectedShoe(null)
      // Refresh both rotation and graveyard
      await Promise.all([refetchRotation(), refetchGraveyard()])
    } catch (error) {
      console.error('Failed to retire shoe:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenRetireModal = (shoe: RotationShoe) => {
    setSelectedShoe(shoe)
    setRetireModalOpen(true)
  }

  const categoryLabel = {
    all: "All Categories",
    daily: "Daily Trainer",
    workout: "Workout",
    race: "Race Day",
  }

  const isLoading = rotationLoading || shoesLoading

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Shoe Rotation</h1>
          <p className="text-muted-foreground">
            {rotationLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
              </span>
            ) : (
              `${rotation.length} active ${rotation.length === 1 ? "shoe" : "shoes"} in your rotation`
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
          <Button size="sm" onClick={() => setAddModalOpen(true)} disabled={isLoading}>
            <Plus className="w-4 h-4 mr-2" />
            Add Shoe
          </Button>
        </div>
      </div>

      {/* Rotation Grid */}
      {rotationLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredRotation.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {categoryFilter === "all"
              ? "No shoes in your rotation yet."
              : `No ${categoryLabel[categoryFilter].toLowerCase()} shoes in your rotation.`}
          </p>
          {categoryFilter === "all" && (
            <Button onClick={() => setAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Shoe
            </Button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRotation.map((shoe) => (
            <ShoeCard key={shoe.id} shoe={shoe}>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Since {new Date(shoe.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenRetireModal(shoe)}
                  className="text-muted-foreground hover:text-foreground"
                  disabled={isSubmitting}
                >
                  <Archive className="w-4 h-4 mr-1" />
                  Retire
                </Button>
              </div>
            </ShoeCard>
          ))}
        </div>
      )}

      {/* Modals */}
      <AddShoeModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        availableShoes={availableShoes}
        onAddShoe={handleAddShoe}
        isLoading={shoesLoading || isSubmitting}
      />

      {selectedShoe && (
        <RetireShoeModal
          open={retireModalOpen}
          onOpenChange={setRetireModalOpen}
          shoe={selectedShoe}
          onRetire={handleRetireShoe}
          isLoading={isSubmitting}
        />
      )}
    </div>
  )
}
