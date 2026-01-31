import { NextResponse } from "next/server"
import { mockUser } from "@/lib/data/mock-data"

// GET /api/user - Get current user profile
export async function GET() {
  // TODO: Replace with authenticated user from session
  // const user = await db.users.findUnique({ where: { id: session.user.id } })
  
  return NextResponse.json({
    data: mockUser,
    success: true,
  })
}

// PATCH /api/user - Update user profile
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    
    // TODO: Validate input and update database
    // const user = await db.users.update({
    //   where: { id: session.user.id },
    //   data: body,
    // })
    
    return NextResponse.json({
      data: { ...mockUser, ...body },
      success: true,
      message: "Profile updated successfully",
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to update profile",
    }, { status: 400 })
  }
}
