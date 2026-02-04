import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

const verifyOTPSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  userId: z.string()
})

const JWT_SECRET = process.env.JWT_SECRET || 'labournow-secret-key'

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

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        mobile: user.mobile, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Determine if profile setup is needed
    const needsProfileSetup = !user.labourProfile && !user.employerProfile

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      token,
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
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to verify OTP' },
      { status: 400 }
    )
  }
}