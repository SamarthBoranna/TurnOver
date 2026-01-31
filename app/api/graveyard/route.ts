import { NextResponse } from "next/server"
import { mockGraveyard } from "@/lib/data/mock-data"

// GET /api/graveyard - Get user's retired shoes
export async function GET() {
  // TODO: Replace with database query
  // const graveyard = await db.graveyard.findMany({ where: { userId: session.user.id } })
  
  return NextResponse.json({
    data: mockGraveyard,
    success: true,
  })
}

// POST /api/graveyard - Retire a shoe (move from rotation to graveyard)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { shoeId, rating, review, milesRun } = body
    
    // TODO: Implement database transaction
    // 1. Remove shoe from rotation
    // 2. Add shoe to graveyard with rating/review
    
    return NextResponse.json({
      data: {
        ...body,
        retiredAt: new Date().toISOString().split("T")[0],
      },
      success: true,
      message: "Shoe retired successfully",
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to retire shoe",
    }, { status: 400 })
  }
}
