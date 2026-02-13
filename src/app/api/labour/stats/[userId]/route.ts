import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/labour/stats/[userId] - Get labour statistics
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params
    
    // Get all bookings for the labour
    const bookings = await prisma.booking.findMany({
      where: {
        labourId: userId
      },
      include: {
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate basic stats
    const totalJobs = bookings.length
    const completedJobs = bookings.filter(b => b.status === 'COMPLETED').length
    const cancelledJobs = bookings.filter(b => b.status === 'CANCELLED').length
    const pendingJobs = bookings.filter(b => b.status === 'PENDING').length
    const acceptedJobs = bookings.filter(b => b.status === 'ACCEPTED').length

    // Calculate completion rate
    const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0

    // Calculate on-time completion (assuming completion date = booking date + 1 day)
    const onTimeCompletions = bookings
      .filter(b => b.status === 'COMPLETED')
      .filter(b => {
        const completionDate = new Date(b.date)
        completionDate.setDate(completionDate.getDate() + 1) // Assume next day completion
        return b.updatedAt <= completionDate
      }).length
    
    const onTimeCompletionRate = completedJobs > 0 ? (onTimeCompletions / completedJobs) * 100 : 0

    // Calculate ratings
    const allRatings = bookings.flatMap(b => b.reviews.map(r => r.rating))
    const avgRating = allRatings.length > 0 
      ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length 
      : 0

    const totalReviews = allRatings.length

    // Calculate satisfaction score (ratings 4+ considered satisfied)
    const satisfiedReviews = allRatings.filter(rating => rating >= 4).length
    const satisfactionScore = totalReviews > 0 ? (satisfiedReviews / totalReviews) * 100 : 0

    // Calculate monthly stats
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const thisMonthJobs = bookings.filter(b => {
      const date = new Date(b.createdAt)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    }).length

    // Calculate jobs by category
    const jobsByCategory = bookings.reduce((acc: any, booking) => {
      const category = booking.category
      
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += 1
      
      return acc
    }, {})

    const categoryData = Object.entries(jobsByCategory).map(([category, count]) => ({
      category,
      count
    }))

    // Calculate earnings stats
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED' && b.paymentStatus === 'PAID')
    const totalEarnings = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0)
    const avgJobValue = completedBookings.length > 0 ? totalEarnings / completedBookings.length : 0

    // Find peak month
    const monthlyJobs = bookings.reduce((acc: any, booking) => {
      const month = new Date(booking.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      })
      
      if (!acc[month]) {
        acc[month] = 0
      }
      acc[month] += 1
      
      return acc
    }, {})

    let peakMonth = ''
    let maxJobs = 0
    Object.entries(monthlyJobs).forEach(([month, count]: [string, any]) => {
      if (count > maxJobs) {
        maxJobs = count
        peakMonth = month
      }
    })

    // Calculate repeat clients (employers who booked more than once)
    const employerBookings = bookings.reduce((acc: any, booking) => {
      const employerId = booking.employerId
      
      if (!acc[employerId]) {
        acc[employerId] = 0
      }
      acc[employerId] += 1
      
      return acc
    }, {})

    const repeatClients = Object.values(employerBookings).filter((count: any) => count > 1).length

    // Calculate average response time (mock data for now)
    const avgResponseTime = '2 hours'

    // Recent earnings for display
    const recentEarnings = completedBookings.slice(0, 5).map(booking => ({
      jobType: booking.category,
      date: new Date(booking.createdAt).toLocaleDateString(),
      amount: booking.totalAmount,
      duration: booking.duration,
      employer: booking.employerId
    }))

    // Performance trend (mock data for now)
    const performanceTrend = [
      { month: 'Jan', rating: 4.2, jobs: 12, earnings: 24000 },
      { month: 'Feb', rating: 4.3, jobs: 15, earnings: 30000 },
      { month: 'Mar', rating: 4.5, jobs: 18, earnings: 36000 },
      { month: 'Apr', rating: 4.4, jobs: 16, earnings: 32000 },
      { month: 'May', rating: 4.6, jobs: 20, earnings: 40000 },
      { month: 'Jun', rating: 4.7, jobs: 22, earnings: 44000 }
    ]

    // Recent activity (mock data for now)
    const recentActivity = [
      {
        description: 'Completed plumbing job for Mr. Sharma',
        timestamp: '2 hours ago'
      },
      {
        description: 'Received 5-star rating from ABC Construction',
        timestamp: '5 hours ago'
      },
      {
        description: 'Updated availability calendar',
        timestamp: '1 day ago'
      },
      {
        description: 'Added new skill verification',
        timestamp: '2 days ago'
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        totalJobs,
        completedJobs,
        cancelledJobs,
        pendingJobs,
        acceptedJobs,
        thisMonthJobs,
        totalEarnings,
        avgJobValue,
        completionRate,
        onTimeCompletionRate,
        avgRating,
        totalReviews,
        satisfactionScore,
        earningsGrowth: 12.5, // Mock growth percentage
        jobsByCategory: categoryData,
        recentEarnings,
        peakMonth,
        repeatClients,
        avgResponseTime,
        performanceTrend,
        recentActivity
      }
    })

  } catch (error) {
    console.error('Error fetching labour stats:', error)
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
  }
}