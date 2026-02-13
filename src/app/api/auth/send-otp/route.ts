import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const sendOTPSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
  role: z.enum(['LABOUR', 'EMPLOYER'])
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mobile, role } = sendOTPSchema.parse(body)

    // Generate OTP (in production, use a proper SMS service)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store OTP in memory (in production, use Redis)
    const otpStore = global.otpStore || new Map()
    otpStore.set(mobile, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }) // 10 minutes
    global.otpStore = otpStore

    // Log OTP for development (remove in production)
    console.log(`OTP for ${mobile}: ${otp}`)

    // Check if user exists
    let user = await db.user.findUnique({
      where: { mobile },
      include: {
        labourProfile: true,
        employerProfile: true
      }
    })

    // Create user if not exists
    if (!user) {
      user = await db.user.create({
        data: {
          mobile,
          name: 'User',
          role,
          email: null,
          avatar: null,
          isVerified: false,
          isBlocked: false
        }
      }) as any
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      userId: user?.id || '',
      isNewUser: !user || (!user.labourProfile && !user.employerProfile)
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP' },
      { status: 400 }
    )
  }
}