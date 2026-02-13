import { NextRequest, NextResponse } from 'next/server'
import { integrationManager } from '@/lib/integrations/integration-manager'

// POST /api/webhooks - Create a new webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, url, events, secret, active, retryConfig, headers } = body

    if (!name || !url || !events) {
      return NextResponse.json(
        { success: false, message: 'Name, URL, and events are required' },
        { status: 400 }
      )
    }

    const webhook = await integrationManager.createWebhook({
      name,
      url,
      events,
      secret,
      active,
      retryConfig,
      headers
    })

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

// POST /api/webhooks/trigger - Trigger webhooks for an event
export async function TRIGGER(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, data, integrationId } = body

    if (!event || !data) {
      return NextResponse.json(
        { success: false, message: 'Event and data are required' },
        { status: 400 }
      )
    }

    const result = await integrationManager.triggerWebhook(event, data, integrationId)
    
    return NextResponse.json({
      success: true,
      result
    })
  } catch (error) {
    console.error('Trigger webhook error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to trigger webhooks' },
      { status: 500 }
    )
  }
}

// GET /api/webhooks/metrics - Get webhook metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const webhookId = searchParams.get('id')
    const timeRange = searchParams.get('range') || '7d'

    if (!webhookId) {
      return NextResponse.json(
        { success: false, message: 'Webhook ID is required' },
        { status: 400 }
      )
    }

    // In a real implementation, you would fetch metrics from your database
    const metrics = {
      webhookId,
      timeRange,
      totalTriggers: 0,
      successfulTriggers: 0,
      failedTriggers: 0,
      averageResponseTime: 0,
      lastTriggered: null,
      topEvents: [],
      errorRate: 0
    }

    return NextResponse.json({
      success: true,
      metrics
    })
  } catch (error) {
    console.error('Get webhook metrics error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get webhook metrics' },
      { status: 500 }
    )
  }
}