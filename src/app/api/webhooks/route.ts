import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const webhookSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  events: z.array(z.string()),
  secret: z.string().optional(),
  active: z.boolean().default(true)
})

// POST /api/webhooks - Create a new webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, url, events, secret, active } = webhookSchema.parse(body)

    // Mock webhook creation
    const webhook = {
      id: 'webhook_' + Math.random().toString(36).substring(2, 15),
      name,
      url,
      events,
      active,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      webhook
    })

  } catch (error) {
    console.error('Create webhook error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create webhook' },
      { status: 500 }
    )
  }
}

// GET /api/webhooks - Get all webhooks
export async function GET(request: NextRequest) {
  try {
    // Mock webhooks
    const webhooks = [
      {
        id: 'webhook_123',
        name: 'Booking Notifications',
        url: 'https://example.com/webhooks/labournow',
        events: ['booking.created', 'booking.completed'],
        active: true,
        createdAt: new Date().toISOString()
      }
    ]

    return NextResponse.json({
      success: true,
      webhooks
    })

  } catch (error) {
    console.error('Get webhooks error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch webhooks' },
      { status: 500 }
    )
  }
}