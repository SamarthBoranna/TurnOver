interface TagPillProps {
  tag: string
  variant?: "default" | "outline"
}

export function TagPill({ tag, variant = "default" }: TagPillProps) {
  if (variant === "outline") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-border text-muted-foreground">
        {tag}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground">
      {tag}
    </span>
  )
}
