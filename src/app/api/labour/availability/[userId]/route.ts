import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/labour/availability/[userId] - Get labour availability
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params
    
    // Mock availability data
    const availability = [
      {
        id: '1',
        date: '2024-01-20',
        status: 'available',
        timeSlots: ['morning', 'afternoon']
      },
      {
        id: '2',
        date: '2024-01-21',
        status: 'unavailable',
        timeSlots: []
      },
      {
        id: '3',
        date: '2024-01-22',
        status: 'available',
        timeSlots: ['full_day']
      },
      {
        id: '4',
        date: '2024-01-23',
        status: 'available',
        timeSlots: ['morning']
      },
      {
        id: '5',
        date: '2024-01-24',
        status: 'available',
        timeSlots: ['afternoon', 'evening']
      }
    ]

    return NextResponse.json({
      success: true,
      data: availability
    })

  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}

// POST /api/labour/availability/[userId] - Update availability
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params
    const body = await request.json()
    
    // Validate required fields
    const { date, status, timeSlots } = body
    
    if (!date || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update availability
    const updatedAvailability = {
      id: Date.now().toString(),
      date,
      status,
      timeSlots: timeSlots || [],
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      message: 'Availability updated successfully',
      data: updatedAvailability
    })

  } catch (error) {
    console.error('Error updating availability:', error)
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 })
  }
}

// PUT /api/labour/availability/[userId] - Bulk update availability
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params
    const body = await request.json()
    
    // Validate required fields
    const { availability } = body
    
    if (!availability || !Array.isArray(availability)) {
      return NextResponse.json({ error: 'Invalid availability data' }, { status: 400 })
    }

    // Bulk update availability
    const updatedAvailability = availability.map((avail: any) => ({
      id: Date.now().toString() + Math.random(),
      ...avail,
      userId,
      updatedAt: new Date()
    }))

    return NextResponse.json({
      success: true,
      message: 'Availability updated successfully',
      data: updatedAvailability
    })

  } catch (error) {
    console.error('Error bulk updating availability:', error)
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 })
  }
}