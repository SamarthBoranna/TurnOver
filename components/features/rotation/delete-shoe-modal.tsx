"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"

interface DeleteShoeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shoeName: string
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteShoeModal({
  open,
  onOpenChange,
  shoeName,
  onConfirm,
  isLoading = false,
}: DeleteShoeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            Remove Shoe
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <span className="font-medium text-foreground">{shoeName}</span> from your rotation? This will not add it to your graveyard or affect your recommendations.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
