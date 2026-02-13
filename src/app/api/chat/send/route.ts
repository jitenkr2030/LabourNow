import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const sendMessageSchema = z.object({
  bookingId: z.string(),
  receiverId: z.string(),
  content: z.string().min(1).max(1000),
  type: z.enum(['TEXT', 'IMAGE', 'FILE']).default('TEXT')
})

// POST /api/chat/send - Send a message
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token and get user
    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = sendMessageSchema.parse(body)

    // Check if booking exists and user is part of it
    const booking = await prisma.booking.findUnique({
      where: { id: validatedData.bookingId },
      include: {
        employer: true,
        labour: true
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.employerId !== user.id && booking.labourId !== user.id) {
      return NextResponse.json({ error: 'Not authorized to send message' }, { status: 403 })
    }

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        bookingId: validatedData.bookingId,
        senderId: user.id,
        receiverId: validatedData.receiverId,
        content: validatedData.content,
        messageType: validatedData.type,
        isRead: false
      }
    })

    // Update booking last activity
    await prisma.booking.update({
      where: { id: validatedData.bookingId },
      data: { updatedAt: new Date() }
    })

    // Get sender info
    const sender = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        role: true,
        labourProfile: {
          select: {
            avatar: true
          }
        },
        employerProfile: {
          select: {
            avatar: true
          }
        }
      }
    })

    if (!sender) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Send real-time notification (WebSocket implementation would go here)
    await sendChatNotification(message, sender, validatedData.receiverId)

    return NextResponse.json({
      success: true,
      data: {
        id: message.id,
        content: message.content,
        messageType: message.messageType,
        timestamp: message.createdAt,
        read: message.isRead,
        sender: {
          id: sender.id,
          name: sender.name,
          role: sender.role,
          avatar: sender.labourProfile?.avatar || sender.employerProfile?.avatar
        }
      }
    })

  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

// Helper functions
async function verifyToken(token: string) {
  try {
    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    return decoded
  } catch (error) {
    return null
  }
}

async function sendChatNotification(message: any, sender: any, receiverId: string) {
  try {
    // Get receiver info
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { name: true, mobile: true }
    })

    if (!receiver) return

    // Create notification
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'MESSAGE',
        title: `New message from ${sender.name}`,
        message: message.content,
        actionUrl: `/bookings/${message.bookingId}`,
        actionText: 'View Chat',
        read: false,
        metadata: {
          messageId: message.id,
          senderId: sender.id,
          bookingId: message.bookingId
        }
      }
    })

    // Send SMS notification (if enabled)
    if (process.env.SMS_API_KEY && receiver.mobile) {
      await sendSMSNotification(receiver.mobile, `New message from ${sender.name}: ${message.content}`)
    }

    // Send push notification (if enabled)
    // This would integrate with Firebase Cloud Messaging or similar service
    
  } catch (error) {
    console.error('Error sending chat notification:', error)
  }
}

async function sendSMSNotification(mobile: string, message: string) {
  try {
    // Implement SMS sending logic
    // This would integrate with services like Twilio, MSG91, etc.
    console.log(`SMS to ${mobile}: ${message}`)
  } catch (error) {
    console.error('Error sending SMS:', error)
  }
}