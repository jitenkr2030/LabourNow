import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/employer/analytics/[userId] - Get employer analytics
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params
    
    // Get all bookings for the employer
    const bookings = await prisma.booking.findMany({
      where: {
        employerId: userId
      },
      include: {
        labour: {
          select: {
            id: true,
            name: true,
            labourProfile: {
              select: {
                avatar: true,
                category: true,
                rating: true
              }
            }
          }
        },
        reviews: {
          select: {
            rating: true,
            comment: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate spending trend
    const monthlySpending = bookings.reduce((acc: any, booking) => {
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

    const spendingTrend = Object.entries(monthlySpending).map(([month, amount]) => ({
      month,
      amount
    })).slice(-12) // Last 12 months

    // Calculate spending by category
    const spendingByCategory = bookings.reduce((acc: any, booking) => {
      const category = booking.category
      
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += booking.totalAmount
      
      return acc
    }, {})

    const categoryData = Object.entries(spendingByCategory).map(([category, amount]) => ({
      name: category,
      value: amount
    }))

    // Calculate total spent and growth
    const totalSpent = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0)
    
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
    
    const currentMonthSpent = bookings
      .filter(booking => {
        const date = new Date(booking.createdAt)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      })
      .reduce((sum, booking) => sum + booking.totalAmount, 0)
    
    const lastMonthSpent = bookings
      .filter(booking => {
        const date = new Date(booking.createdAt)
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
      })
      .reduce((sum, booking) => sum + booking.totalAmount, 0)
    
    const spendingGrowth = lastMonthSpent > 0 
      ? ((currentMonthSpent - lastMonthSpent) / lastMonthSpent) * 100 
      : 0

    // Calculate booking stats
    const totalBookings = bookings.length
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length
    const thisMonthBookings = bookings.filter(b => {
      const date = new Date(b.createdAt)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    }).length

    // Calculate active workers (unique labour IDs)
    const activeWorkers = new Set(bookings.map(b => b.labourId)).size

    // Calculate performance metrics
    const completedBookingIds = bookings.filter(b => b.status === 'COMPLETED').map(b => b.id)
    const onTimeCompletions = completedBookingIds.length * 0.85 // Mock 85% on-time
    const onTimeCompletionRate = completedBookingIds.length > 0 ? (onTimeCompletions / completedBookingIds.length) * 100 : 0

    // Calculate average rating
    const allRatings = bookings.flatMap(b => b.reviews.map(r => r.rating))
    const avgRating = allRatings.length > 0 
      ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length 
      : 0

    // Calculate repeat business (mock data)
    const repeatBusiness = 25 // Mock percentage

    // Get unique workers for favorites
    const uniqueWorkers = Array.from(new Set(bookings.map(b => b.labourId)))
      .map(labourId => {
        const worker = bookings.find(b => b.labourId === labourId)?.labour
        return worker ? {
          id: worker.id,
          name: worker.name,
          category: worker.labourProfile?.category || 'UNKNOWN',
          rating: worker.labourProfile?.rating || 0,
          avatar: worker.labourProfile?.avatar,
          totalJobs: bookings.filter(b => b.labourId === labourId).length
        } : null
      }).filter(Boolean)

    return NextResponse.json({
      success: true,
      data: {
        totalSpent,
        currentMonthSpent,
        spendingGrowth,
        totalBookings,
        thisMonthBookings,
        completedBookings,
        cancelledBookings,
        activeWorkers,
        onTimeCompletionRate,
        avgRating,
        repeatBusiness,
        spendingTrend,
        spendingByCategory: categoryData,
        uniqueWorkers
      }
    })

  } catch (error) {
    console.error('Error fetching employer analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}