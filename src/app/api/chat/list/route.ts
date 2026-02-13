import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/chat/list - Get user's chat list
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user's bookings with chat messages
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { employerId: user.id },
          { labourId: user.id }
        ],
        status: {
          in: ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED']
        }
      },
      include: {
        chatMessages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
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
            }
          }
        },
        employer: {
          select: {
            id: true,
            name: true,
            role: true,
            mobile: true,
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
        },
        labour: {
          select: {
            id: true,
            name: true,
            role: true,
            mobile: true,
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
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Transform data into chat list format
    const chatList = bookings.map(booking => {
      const otherUser = booking.employerId === user.id ? booking.labour : booking.employer
      const lastMessage = booking.chatMessages[0]
      
      return {
        id: booking.id,
        bookingId: booking.id,
        participant: {
          id: otherUser.id,
          name: otherUser.name,
          avatar: otherUser.labourProfile?.avatar || otherUser.employerProfile?.avatar,
          role: otherUser.role,
          mobile: otherUser.mobile
        },
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          timestamp: lastMessage.createdAt,
          senderId: lastMessage.senderId,
          read: lastMessage.isRead
        } : {
          content: 'Booking created',
          timestamp: booking.createdAt,
          senderId: booking.employerId,
          read: true
        },
        unreadCount: booking.chatMessages.filter(m => 
          m.receiverId === user.id && !m.isRead
        ).length,
        isActive: booking.status === 'IN_PROGRESS'
      }
    })

    return NextResponse.json({
      success: true,
      data: chatList
    })

  } catch (error) {
    console.error('Error fetching chat list:', error)
    return NextResponse.json({ error: 'Failed to fetch chat list' }, { status: 500 })
  }
}

async function verifyToken(token: string) {
  try {
    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    return decoded
  } catch (error) {
    return null
  }
}