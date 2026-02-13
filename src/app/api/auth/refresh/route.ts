import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { db } from '@/lib/db'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

// POST /api/auth/refresh - Refresh access token
export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token is required' },
        { status: 401 }
      )
    }

    // Verify refresh token
    const { payload } = await jwtVerify(refreshToken, JWT_SECRET)
    const userId = payload.sub as string

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid refresh token' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        mobile: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        isBlocked: true
      }
    })

    if (!user || user.isBlocked) {
      return NextResponse.json(
        { success: false, message: 'User not found or blocked' },
        { status: 401 }
      )
    }

    // Generate new access token
    const accessToken = await generateAccessToken(user)

    return NextResponse.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    })

  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json(
      { success: false, message: 'Invalid or expired refresh token' },
      { status: 401 }
    )
  }
}

async function generateAccessToken(user: any) {
  const accessToken = btoa(JSON.stringify({
    id: user.id,
    mobile: user.mobile,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
  }))

  return accessToken
}