"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { Shoe } from "@/lib/types"
import { Search, Plus, Loader2 } from "lucide-react"

interface AddShoeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableShoes: Shoe[]
  onAddShoe: (shoe: Shoe) => void
  isLoading?: boolean
}

export function AddShoeModal({
  open,
  onOpenChange,
  availableShoes,
  onAddShoe,
  isLoading = false,
}: AddShoeModalProps) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [addingShoeId, setAddingShoeId] = useState<string | null>(null)

  const filteredShoes = availableShoes.filter((shoe) => {
    const matchesSearch =
      shoe.name.toLowerCase().includes(search.toLowerCase()) ||
      shoe.brand.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      categoryFilter === "all" || shoe.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categoryLabel = {
    daily: "Daily",
    workout: "Workout",
    race: "Race",
  }

  const handleAddShoe = async (shoe: Shoe) => {
    setAddingShoeId(shoe.id)
    try {
      await onAddShoe(shoe)
    } finally {
      setAddingShoeId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Shoe to Rotation</DialogTitle>
        </DialogHeader>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search shoes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1">
            <Button
              variant={categoryFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter("all")}
            >
              All
            </Button>
            {(Object.keys(categoryLabel) as Array<keyof typeof categoryLabel>).map((category) => (
              <Button
                key={category}
                variant={categoryFilter === category ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(category)}
              >
                {categoryLabel[category]}
              </Button>
            ))}
          </div>
        </div>

        {/* Shoe List */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredShoes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {availableShoes.length === 0 
                ? "All available shoes are already in your rotation."
                : "No shoes found matching your search."}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredShoes.map((shoe) => (
                <div
                  key={shoe.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-foreground/20 transition-colors"
                >
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground shrink-0 overflow-hidden">
                    {shoe.imageUrl ? (
                      <img 
                        src={shoe.imageUrl} 
                        alt={shoe.brand}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      shoe.brand
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{shoe.name}</p>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {categoryLabel[shoe.category]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {shoe.brand} · {shoe.weight}g · {shoe.drop}mm drop
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleAddShoe(shoe)}
                    disabled={addingShoeId !== null}
                  >
                    {addingShoeId === shoe.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
