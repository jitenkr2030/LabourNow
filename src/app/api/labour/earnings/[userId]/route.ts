import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/labour/earnings/[userId] - Get labour earnings data
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params
    
    // Get completed bookings for the labour
    const bookings = await prisma.booking.findMany({
      where: {
        labourId: userId,
        status: 'COMPLETED',
        paymentStatus: 'PAID'
      },
      include: {
        employer: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate monthly earnings
    const monthlyEarnings = bookings.reduce((acc: any, booking) => {
      const month = new Date(booking.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      })
      
      if (!acc[month]) {
        acc[month] = 0
      }
      acc[month] += booking.totalAmount
      
      return acc
    }, {})

    // Convert to chart format
    const earningsData = Object.entries(monthlyEarnings).map(([month, earnings]) => ({
      month,
      earnings
    })).slice(-12) // Last 12 months

    // Calculate earnings by category
    const earningsByCategory = bookings.reduce((acc: any, booking) => {
      const category = booking.category
      
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += booking.totalAmount
      
      return acc
    }, {})

    const categoryData = Object.entries(earningsByCategory).map(([category, value]) => ({
      name: category,
      value
    }))

    // Calculate total and growth
    const totalEarnings = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0)
    
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
    
    const currentMonthEarnings = bookings
      .filter(booking => {
        const date = new Date(booking.createdAt)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      })
      .reduce((sum, booking) => sum + booking.totalAmount, 0)
    
    const lastMonthEarnings = bookings
      .filter(booking => {
        const date = new Date(booking.createdAt)
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
      })
      .reduce((sum, booking) => sum + booking.totalAmount, 0)
    
    const earningsGrowth = lastMonthEarnings > 0 
      ? ((currentMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 
      : 0

    // Recent earnings for display
    const recentEarnings = bookings.slice(0, 10).map(booking => ({
      jobType: booking.category,
      date: new Date(booking.createdAt).toLocaleDateString(),
      amount: booking.totalAmount,
      duration: booking.duration,
      employer: booking.employer.name
    }))

    return NextResponse.json({
      success: true,
      data: earningsData,
      analytics: {
        totalEarnings,
        currentMonthEarnings,
        earningsGrowth,
        earningsByCategory: categoryData,
        recentEarnings
      }
    })

  } catch (error) {
    console.error('Error fetching labour earnings:', error)
    return NextResponse.json({ error: 'Failed to fetch earnings' }, { status: 500 })
  }
}