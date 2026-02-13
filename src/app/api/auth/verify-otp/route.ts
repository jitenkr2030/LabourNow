import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'

const verifyOTPSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  userId: z.string()
})

const JWT_SECRET = process.env.JWT_SECRET || 'labournow-secret-key'
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'labournow-refresh-secret-key'

// Refresh token store (in production, use Redis)
const refreshStore = global.refreshStore || new Map()
global.refreshStore = refreshStore

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mobile, otp, userId } = verifyOTPSchema.parse(body)

    // Verify OTP from memory store
    const otpStore = global.otpStore || new Map()
    const storedOTP = otpStore.get(mobile)
    
    if (!storedOTP || storedOTP.otp !== otp || storedOTP.expiresAt < Date.now()) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Clear OTP after successful verification
    otpStore.delete(mobile)
    global.otpStore = otpStore

    // Get user with profile
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        labourProfile: true,
        employerProfile: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.mobile, user.role)

    // Determine if profile setup is needed
    const needsProfileSetup = !user.labourProfile && !user.employerProfile

    const response = NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      user: {
        id: user.id,
        mobile: user.mobile,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        needsProfileSetup,
        labourProfile: user.labourProfile,
        employerProfile: user.employerProfile
      }
    })

    // Set secure cookies
    response.cookies.set('access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 // 15 minutes
    })

    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to verify OTP' },
      { status: 400 }
    )
  }
}