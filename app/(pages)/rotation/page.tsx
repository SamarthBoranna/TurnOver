"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoeCard } from "@/components/features/shoes/shoe-card"
import { AddShoeModal } from "@/components/features/rotation/add-shoe-modal"
import { RetireShoeModal } from "@/components/features/rotation/retire-shoe-modal"
import { mockRotation, mockShoes } from "@/lib/data/mock-data"
import type { RotationShoe, Shoe } from "@/lib/types"
import { Plus, Archive, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type CategoryFilter = "all" | "daily" | "workout" | "race"

export default function RotationPage() {
  const [rotation, setRotation] = useState<RotationShoe[]>(mockRotation)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [retireModalOpen, setRetireModalOpen] = useState(false)
  const [selectedShoe, setSelectedShoe] = useState<RotationShoe | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")

  // Shoes not in rotation (available to add)
  const availableShoes = mockShoes.filter(
    (shoe) => !rotation.some((r) => r.id === shoe.id)
  )

  const filteredRotation = rotation.filter((shoe) =>
    categoryFilter === "all" ? true : shoe.category === categoryFilter
  )

  const handleAddShoe = (shoe: Shoe) => {
    const newRotationShoe: RotationShoe = {
      ...shoe,
      startDate: new Date().toISOString().split("T")[0],
    }
    setRotation([...rotation, newRotationShoe])
    setAddModalOpen(false)
  }

  const handleRetireShoe = (shoeId: string, rating: number, review: string) => {
    setRotation(rotation.filter((s) => s.id !== shoeId))
    setRetireModalOpen(false)
    setSelectedShoe(null)
    // In a real app, this would also add to graveyard via API
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Shoe Rotation</h1>
          <p className="text-muted-foreground">
            {rotation.length} active {rotation.length === 1 ? "shoe" : "shoes"} in your rotation
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
          <Button size="sm" onClick={() => setAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Shoe
          </Button>
        </div>
      </div>

      {/* Rotation Grid */}
      {filteredRotation.length === 0 ? (
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
      />

      {selectedShoe && (
        <RetireShoeModal
          open={retireModalOpen}
          onOpenChange={setRetireModalOpen}
          shoe={selectedShoe}
          onRetire={handleRetireShoe}
        />
      )}
    </div>
  )
}
