import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const cities = await db.city.findMany({
      where: { isActive: true },
      include: {
        citySettings: true,
        partners: {
          where: { isActive: true },
          take: 5 // Limit partners for performance
        },
        transportOptions: {
          where: { isActive: true },
          take: 5 // Limit transport options for performance
        },
        _count: {
          select: {
            labourProfiles: true,
            employerProfiles: true,
            bookings: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: cities
    })
  } catch (error) {
    console.error('Get cities error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      state,
      country = 'India',
      latitude,
      longitude,
      timezone = 'Asia/Kolkata',
      primaryLanguage = 'Hindi',
      secondaryLanguages,
      basePrice = 99,
      priceMultiplier = 1.0,
      supportPhone,
      supportEmail,
      transportAvailable = true,
      description
    } = body

    const city = await db.city.create({
      data: {
        name,
        state,
        country,
        latitude,
        longitude,
        timezone,
        primaryLanguage,
        secondaryLanguages: secondaryLanguages ? JSON.stringify(secondaryLanguages) : null,
        basePrice,
        priceMultiplier,
        supportPhone,
        supportEmail,
        transportAvailable,
        description
      }
    })

    return NextResponse.json({
      success: true,
      message: 'City created successfully',
      data: city
    })
  } catch (error) {
    console.error('Create city error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create city' },
      { status: 500 }
    )
  }
}