import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/employer/budget/[userId] - Get employer budget data
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params
    
    // Get all bookings for the employer
    const bookings = await prisma.booking.findMany({
      where: {
        employerId: userId,
        paymentStatus: 'PAID'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate budget usage
    const totalBudget = 500000 // Mock monthly budget
    const used = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0)
    const remaining = totalBudget - used

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
      category,
      amount
    }))

    // Generate budget alerts
    const alerts: Array<{
      type: string
      severity: string
      title: string
      message: string
    }> = []
    
    if (used / totalBudget > 0.9) {
      alerts.push({
        type: 'error',
        severity: 'HIGH',
        title: 'Budget Almost Exhausted',
        message: `You have used ${Math.round((used / totalBudget) * 100)}% of your monthly budget`
      })
    } else if (used / totalBudget > 0.75) {
      alerts.push({
        type: 'warning',
        severity: 'MEDIUM',
        title: 'Budget Running Low',
        message: `You have used ${Math.round((used / totalBudget) * 100)}% of your monthly budget`
      })
    }

    // Calculate daily average spending
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    const dailyAverage = used / new Date().getDate()
    const projectedMonthlySpend = dailyAverage * daysInMonth

    if (projectedMonthlySpend > totalBudget) {
      alerts.push({
        type: 'warning',
        severity: 'MEDIUM',
        title: 'Projected Overspend',
        message: `At current rate, you may exceed your budget by ${formatCurrency(projectedMonthlySpend - totalBudget)}`
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        total: totalBudget,
        used,
        remaining,
        percentage: (used / totalBudget) * 100,
        dailyAverage,
        projectedMonthlySpend,
        spendingByCategory: categoryData,
        alerts
      }
    })

  } catch (error) {
    console.error('Error fetching budget data:', error)
    return NextResponse.json({ error: 'Failed to fetch budget data' }, { status: 500 })
  }
}

// POST /api/employer/budget/[userId] - Update budget settings
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params
    const body = await request.json()
    
    // Validate required fields
    const { totalBudget, alertThreshold } = body
    
    if (!totalBudget) {
      return NextResponse.json({ error: 'Budget amount is required' }, { status: 400 })
    }

    // Update budget settings
    const updatedBudget = {
      userId,
      totalBudget,
      alertThreshold: alertThreshold || 80,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      message: 'Budget settings updated successfully',
      data: updatedBudget
    })

  } catch (error) {
    console.error('Error updating budget settings:', error)
    return NextResponse.json({ error: 'Failed to update budget settings' }, { status: 500 })
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount)
}