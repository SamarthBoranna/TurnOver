import { NextResponse } from "next/server"
import { mockShoes, mockRotation } from "@/lib/data/mock-data"

// GET /api/shoes - Get all shoes
export async function GET() {
  // TODO: Replace with database query
  return NextResponse.json({
    data: mockShoes,
    success: true,
  })
}

// POST /api/shoes - Create a new shoe
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // TODO: Validate input and save to database
    // const shoe = await db.shoes.create(body)
    
    return NextResponse.json({
      data: body,
      success: true,
      message: "Shoe created successfully",
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to create shoe",
    }, { status: 400 })
  }
}
