import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'labournow-secret-key'
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'labournow-refresh-secret-key'

// Refresh token store (in production, use Redis)
const refreshStore = new Map()

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
})

// Generate tokens
function generateTokens(userId: string, mobile: string, role: string) {
  const accessToken = jwt.sign(
    { userId, mobile, role, type: 'access' },
    JWT_SECRET,
    { expiresIn: '15m' }
  )
  
  const refreshToken = jwt.sign(
    { userId, mobile, role, type: 'refresh' },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  )
  
  // Store refresh token
  const tokenId = randomBytes(16).toString('hex')
  refreshStore.set(tokenId, {
    refreshToken,
    userId,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  })
  
  return { accessToken, refreshToken, tokenId }
}

// Clean expired tokens
function cleanExpiredTokens() {
  const now = Date.now()
  for (const [tokenId, data] of refreshStore.entries()) {
    if (data.expiresAt < now) {
      refreshStore.delete(tokenId)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refreshToken } = refreshSchema.parse(body)

    // Clean expired tokens
    cleanExpiredTokens()

    // Find the refresh token in store
    let tokenId = null
    let storedData = null
    
    for (const [id, data] of refreshStore.entries()) {
      if (data.refreshToken === refreshToken) {
        tokenId = id
        storedData = data
        break
      }
    }

    if (!storedData || !storedData.expiresAt || storedData.expiresAt < Date.now()) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired refresh token' },
        { status: 401 }
      )
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET)
    if (!decoded || decoded.type !== 'refresh') {
      return NextResponse.json(
        { success: false, message: 'Invalid refresh token' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        mobile: true,
        role: true,
        isVerified: true,
        isBlocked: true
      }
    })

    if (!user || user.isBlocked) {
      // Remove the refresh token if user no longer exists or is blocked
      if (tokenId) refreshStore.delete(tokenId)
      return NextResponse.json(
        { success: false, message: 'User not found or blocked' },
        { status: 401 }
      )
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken, tokenId: newTokenId } = generateTokens(
      user.id,
      user.mobile,
      user.role
    )

    // Remove old refresh token
    if (tokenId) refreshStore.delete(tokenId)

    // Set HTTP-only cookies for better security
    const response = NextResponse.json({
      success: true,
      message: 'Tokens refreshed successfully',
      user: {
        id: user.id,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified
      }
    })

    // Set secure cookies
    response.cookies.set('access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 // 15 minutes
    })

    response.cookies.set('refresh-token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response

  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to refresh token' },
      { status: 401 }
    )
  }
}

// Logout - invalidate refresh token
export async function DELETE(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh-token')?.value

    if (refreshToken) {
      // Remove refresh token from store
      for (const [tokenId, data] of refreshStore.entries()) {
        if (data.refreshToken === refreshToken) {
          refreshStore.delete(tokenId)
          break
        }
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear cookies
    response.cookies.delete('access-token')
    response.cookies.delete('refresh-token')

    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to logout' },
      { status: 500 }
    )
  }
}