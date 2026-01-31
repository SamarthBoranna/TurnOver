import { NextResponse } from "next/server"
import { mockRotation } from "@/lib/data/mock-data"

// GET /api/rotation - Get user's current rotation
export async function GET() {
  // TODO: Replace with database query
  // const rotation = await db.rotation.findMany({ where: { userId: session.user.id } })
  
  return NextResponse.json({
    data: mockRotation,
    success: true,
  })
}

// POST /api/rotation - Add shoe to rotation
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // TODO: Validate input and save to database
    // const rotationShoe = await db.rotation.create({
    //   data: {
    //     ...body,
    //     userId: session.user.id,
    //     startDate: new Date(),
    //   }
    // })
    
    return NextResponse.json({
      data: {
        ...body,
        startDate: new Date().toISOString().split("T")[0],
      },
      success: true,
      message: "Shoe added to rotation",
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to add shoe to rotation",
    }, { status: 400 })
  }
}
