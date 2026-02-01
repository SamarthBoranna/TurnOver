"use client"

import { Navigation } from "@/components/layout/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  )
}
