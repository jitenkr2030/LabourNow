import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { DataSubjectRights } from '@/lib/gdpr'
import { logAdminAction } from '@/lib/audit'

const processDeletionSchema = z.object({
  approved: z.boolean(),
  adminNotes: z.string().optional()
})

// GET /api/admin/deletion-requests/[requestId] - Get specific deletion request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const adminId = request.headers.get('x-user-id')
    const adminRole = request.headers.get('x-user-role')
    
    if (!adminId || adminRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { requestId } = await params

    const deletionRequest = await db.dataDeletionRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            mobile: true,
            role: true,
            createdAt: true,
            labourProfile: {
              select: { category: true, rating: true, totalJobs: true }
            },
            employerProfile: {
              select: { businessName: true, businessType: true, totalBookings: true }
            }
          }
        }
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
      request: deletionRequest
    })

  } catch (error) {
    console.error('Get deletion request error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch deletion request' },
      { status: 500 }
    )
  }
}

// POST /api/admin/deletion-requests/[requestId] - Process deletion request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const adminId = request.headers.get('x-user-id')
    const adminRole = request.headers.get('x-user-role')
    
    if (!adminId || adminRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { requestId } = await params
    const body = await request.json()
    const { approved, adminNotes } = processDeletionSchema.parse(body)

    // Get the deletion request with user details
    const deletionRequest = await db.dataDeletionRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            mobile: true,
            role: true
          }
        }
      }
    })

    if (!deletionRequest) {
      return NextResponse.json(
        { success: false, message: 'Deletion request not found' },
        { status: 404 }
      )
    }

    if (deletionRequest.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, message: 'Deletion request has already been processed' },
        { status: 400 }
      )
    }

    // Process the deletion request
    await DataSubjectRights.processDeletionRequest(
      requestId,
      adminId,
      approved,
      adminNotes
    )

    // Log admin action
    await logAdminAction(
      approved ? 'approve_deletion' : 'reject_deletion',
      adminId,
      deletionRequest.userId,
      'user',
      deletionRequest.userId,
      null,
      null,
      adminNotes,
      request.headers.get('x-request-id') || undefined
    )

    return NextResponse.json({
      success: true,
      message: `Deletion request ${approved ? 'approved and processed' : 'rejected'} successfully`,
      request: {
        id: requestId,
        status: approved ? 'COMPLETED' : 'REJECTED',
        processedAt: new Date()
      }
    })

  } catch (error) {
    console.error('Process deletion request error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process deletion request' },
      { status: 500 }
    )
  }
}