import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

const createBookingSchema = z.object({
  labourId: z.string(),
  category: z.enum(['HELPER', 'MASON', 'PAINTER', 'ELECTRICIAN', 'PLUMBER', 'LOADER', 'AGRICULTURE_WORKER', 'CARPENTER', 'WELDER', 'MECHANIC', 'CLEANER', 'SECURITY']),
  jobLocation: z.string().min(1, 'Job location is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  date: z.string().transform(val => new Date(val)),
  duration: z.enum(['HALF_DAY', 'FULL_DAY']),
  labourCount: z.number().min(1).max(20),
  specialRequests: z.string().optional()
})

const JWT_SECRET = process.env.JWT_SECRET || 'labournow-secret-key'
const BOOKING_FEE = 99 // ₹99 per labour per booking

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createBookingSchema.parse(body)

    // Verify labour exists and is available
    const labour = await db.user.findUnique({
      where: { 
        id: validatedData.labourId,
        role: 'LABOUR',
        isBlocked: false,
        isVerified: true
      },
      include: { labourProfile: true }
    })

    if (!labour || !labour.labourProfile) {
      return NextResponse.json(
        { success: false, message: 'Labour not found or unavailable' },
        { status: 404 }
      )
    }

    // Generate booking number
    const bookingNumber = `LN${Date.now()}${Math.floor(Math.random() * 1000)}`

    // Calculate total amount
    const totalAmount = BOOKING_FEE * validatedData.labourCount

    // Create booking
    const booking = await db.booking.create({
      data: {
        bookingNumber,
        employerId: user.userId,
        labourId: validatedData.labourId,
        cityId: 'default-city-id', // TODO: Get from user or request
        category: validatedData.category,
        jobLocation: validatedData.jobLocation,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        date: validatedData.date,
        duration: validatedData.duration,
        labourCount: validatedData.labourCount,
        baseAmount: BOOKING_FEE,
        cityMultiplier: 1.0, // TODO: Get from city
        totalAmount,
        specialRequests: validatedData.specialRequests
      },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            mobile: true
          }
        },
        labour: {
          select: {
            id: true,
            name: true,
            mobile: true,
            labourProfile: true
          }
        }
      }
    })

    // Create notification for labour
    await db.notification.create({
      data: {
        userId: validatedData.labourId,
        title: 'New Job Request',
        message: `You have a new job request for ${validatedData.category.toLowerCase()} work on ${validatedData.date.toLocaleDateString()}`,
        type: 'BOOKING',
        actionUrl: `/bookings/${booking.id}`,
        actionText: 'View Booking',
        metadata: {
          bookingId: booking.id,
          bookingNumber: booking.bookingNumber
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      data: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        totalAmount,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt
      }
    })
  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause based on user role
    const where: any = {}
    
    if (user.role === 'EMPLOYER') {
      where.employerId = user.userId
    } else if (user.role === 'LABOUR') {
      where.labourId = user.userId
    }

    if (status) {
      where.status = status.toUpperCase()
    }

    const bookings = await db.booking.findMany({
      where,
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            mobile: true
          }
        },
        labour: {
          select: {
            id: true,
            name: true,
            mobile: true,
            labourProfile: true
          }
        },
        payments: true,
        reviews: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    const totalCount = await db.booking.count({ where })

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get bookings' },
      { status: 500 }
    )
  }
}