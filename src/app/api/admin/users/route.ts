import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'labournow-secret-key'

// Admin verification schema
const adminActionSchema = z.object({
  action: z.enum(['block_user', 'unblock_user', 'verify_user', 'delete_user', 'update_role']),
  userId: z.string(),
  reason: z.string().optional()
})

// GET /api/admin/users - List all users with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const role = searchParams.get('role') as any
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (role) where.role = role
    if (status === 'blocked') where.isBlocked = true
    if (status === 'verified') where.isVerified = true
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get users with their profiles
    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          labourProfile: {
            select: {
              category: true,
              rating: true,
              totalJobs: true,
              verificationBadge: true
            }
          },
          employerProfile: {
            select: {
              businessName: true,
              businessType: true,
              totalBookings: true
            }
          },
          sentBookings: {
            select: { id: true, status: true, createdAt: true }
          },
          receivedBookings: {
            select: { id: true, status: true, createdAt: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.user.count({ where })
    ])

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Admin users fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Admin actions on users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, reason } = adminActionSchema.parse(body)

    // Check if target user exists
    const targetUser = await db.user.findUnique({
      where: { id: userId },
      include: {
        labourProfile: true,
        employerProfile: true
      }
    })

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    let updatedUser
    let auditLog

    switch (action) {
      case 'block_user':
        updatedUser = await db.user.update({
          where: { id: userId },
          data: { isBlocked: true }
        })
        auditLog = `Blocked user ${targetUser.mobile} (${targetUser.name}). Reason: ${reason || 'No reason provided'}`
        break

      case 'unblock_user':
        updatedUser = await db.user.update({
          where: { id: userId },
          data: { isBlocked: false }
        })
        auditLog = `Unblocked user ${targetUser.mobile} (${targetUser.name})`
        break

      case 'verify_user':
        updatedUser = await db.user.update({
          where: { id: userId },
          data: { isVerified: true }
        })
        
        // Also verify labour profile if exists
        if (targetUser.labourProfile) {
          await db.labourProfile.update({
            where: { userId },
            data: { verificationBadge: 'VERIFIED' }
          })
        }
        
        auditLog = `Verified user ${targetUser.mobile} (${targetUser.name})`
        break

      case 'update_role':
        const { newRole } = body
        if (!['LABOUR', 'EMPLOYER', 'ADMIN'].includes(newRole)) {
          return NextResponse.json(
            { success: false, message: 'Invalid role' },
            { status: 400 }
          )
        }
        
        updatedUser = await db.user.update({
          where: { id: userId },
          data: { role: newRole }
        })
        auditLog = `Updated user ${targetUser.mobile} (${targetUser.name}) role to ${newRole}`
        break

      case 'delete_user':
        // Soft delete by blocking and marking as deleted
        updatedUser = await db.user.update({
          where: { id: userId },
          data: { 
            isBlocked: true,
            email: `deleted_${Date.now()}_${targetUser.email || 'no-email'}`
          }
        })
        auditLog = `Deleted user ${targetUser.mobile} (${targetUser.name}). Reason: ${reason || 'No reason provided'}`
        break

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        )
    }

    // Log admin action
    console.log(`[ADMIN AUDIT] ${auditLog}`)

    return NextResponse.json({
      success: true,
      message: `Action ${action} completed successfully`,
      user: updatedUser
    })

  } catch (error) {
    console.error('Admin action error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to perform admin action' },
      { status: 500 }
    )
  }
}