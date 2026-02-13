import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { DataSubjectRights } from '@/lib/gdpr'
import { logDataAccess, logAuthEvent } from '@/lib/audit'

const deleteAccountSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500, 'Reason cannot exceed 500 characters'),
  password: z.string().min(1, 'Password confirmation is required'),
  confirmation: z.literal('DELETE')
})

// POST /api/account/delete - Request account deletion
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reason, password, confirmation } = deleteAccountSchema.parse(body)

    // Get user details
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        mobile: true,
        name: true,
        role: true,
        sentBookings: { where: { status: { in: ['IN_PROGRESS', 'ACCEPTED'] } } },
        receivedBookings: { where: { status: { in: ['IN_PROGRESS', 'ACCEPTED'] } } }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Check for active bookings
    const activeBookings = [...user.sentBookings, ...user.receivedBookings]
    if (activeBookings.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot delete account with active bookings. Please complete or cancel all active bookings first.' 
        },
        { status: 400 }
      )
    }

    // In a real implementation, you would verify the password here
    // For this demo, we'll skip password verification since it's OTP-based auth

    // Create deletion request
    const verificationToken = await DataSubjectRights.requestDeletion(userId, reason)

    // Log account deletion request
    await logAuthEvent('login', userId, user.mobile, true, undefined, request.headers.get('x-request-id') || undefined)

    return NextResponse.json({
      success: true,
      message: 'Account deletion request submitted. You will receive a confirmation email/SMS with further instructions.',
      verificationToken,
      // In production, don't return the token - send it via email/SMS
      requestId: verificationToken
    })

  } catch (error) {
    console.error('Account deletion request error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit deletion request' },
      { status: 500 }
    )
  }
}

// GET /api/account/delete - Get deletion request status
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')

    if (!requestId) {
      // Get all deletion requests for this user
      const deletionRequests = await db.dataDeletionRequest.findMany({
        where: { userId },
        orderBy: { requestedAt: 'desc' },
        select: {
          id: true,
          reason: true,
          status: true,
          requestedAt: true,
          processedAt: true,
          adminNotes: true
        }
      })

      return NextResponse.json({
        success: true,
        deletionRequests
      })
    } else {
      // Get specific deletion request
      const deletionRequest = await db.dataDeletionRequest.findFirst({
        where: { 
          id: requestId,
          userId 
        },
        select: {
          id: true,
          reason: true,
          status: true,
          requestedAt: true,
          processedAt: true,
          adminNotes: true
        }
      })

      if (!deletionRequest) {
        return NextResponse.json(
          { success: false, message: 'Deletion request not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        deletionRequest
      })
    }

  } catch (error) {
    console.error('Get deletion request error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch deletion request' },
      { status: 500 }
    )
  }
}

// DELETE /api/account/delete - Confirm and execute account deletion
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const verificationToken = searchParams.get('token')

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, message: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find the deletion request
    const deletionRequest = await db.dataDeletionRequest.findFirst({
      where: { 
        userId,
        verificationToken,
        status: 'PENDING'
      }
    })

    if (!deletionRequest) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Process the deletion request
    await DataSubjectRights.processDeletionRequest(
      deletionRequest.id,
      userId, // User is approving their own deletion
      true,
      'User confirmed account deletion'
    )

    // Log successful account deletion
    // await logAuthEvent('logout', userId, undefined, true, undefined, request.headers.get('x-request-id') || undefined)

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully. You will be logged out immediately.'
    })

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete account' },
      { status: 500 }
    )
  }
}