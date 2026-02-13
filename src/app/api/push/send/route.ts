import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import webpush from 'web-push'

// Configure web-push with your VAPID keys
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BLxWq1Yq8vH9rE6M3xK2Z7fP4tS8uN1vA5bC9dE2fG6hJ3kL8mN1qR4tW7yX0zV3b'
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'x9Wq1Yq8vH9rE6M3xK2Z7fP4tS8uN1vA5bC9dE2fG6hJ3kL8mN1qR4tW7yX0zV3b'

webpush.setVapidDetails(
  'mailto:notifications@labournow.com',
  publicVapidKey,
  privateVapidKey
)

const sendNotificationSchema = {
  title: 'string',
  body: 'string',
  icon: 'string?',
  badge: 'string?',
  data: 'object?',
  actions: 'array?',
  userId: 'string',
  type: 'string?' // booking, message, payment, etc.
}

// POST /api/push/send - Send push notification
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    
    // Only allow admins or system to send notifications
    if (!userId || (userRole !== 'ADMIN' && userId !== 'system')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, body: notificationBody, userId: targetUserId, type, data, actions } = body

    if (!title || !notificationBody || !targetUserId) {
      return NextResponse.json(
        { success: false, message: 'Title, body, and userId are required' },
        { status: 400 }
      )
    }

    // Get user's push subscriptions
    const subscriptions = await getPushSubscriptions(targetUserId)
    
    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No push subscriptions found for user'
      })
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body: notificationBody,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: `${type}-${targetUserId}-${Date.now()}`,
      renotify: true,
      requireInteraction: type === 'booking' || type === 'payment',
      data: {
        ...data,
        type,
        userId: targetUserId,
        timestamp: Date.now()
      },
      actions: actions || [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/icon-96x96.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/icon-96x96.png'
        }
      ]
    })

    // Send to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(subscription, payload)
          return { success: true, endpoint: subscription.endpoint }
        } catch (error) {
          console.error('Failed to send notification:', error)
          
          // Remove invalid subscriptions
          if (error.statusCode === 410) {
            await removePushSubscription(subscription.id)
          }
          
          return { success: false, endpoint: subscription.endpoint, error: error.message }
        }
      })
    )

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.length - successful

    // Log notification for audit
    console.log(`Push notification sent: ${successful} successful, ${failed} failed`, {
      title,
      targetUserId,
      type
    })

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${successful} device(s)`,
      stats: { successful, failed, total: results.length }
    })

  } catch (error) {
    console.error('Send push notification error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send push notification' },
      { status: 500 }
    )
  }
}

// Helper functions (in a real implementation, these would query your database)
async function getPushSubscriptions(userId) {
  // This would query your database for the user's push subscriptions
  // For now, return empty array
  console.log('Getting push subscriptions for user:', userId)
  return []
}

async function removePushSubscription(subscriptionId) {
  // This would remove the invalid subscription from your database
  console.log('Removing invalid push subscription:', subscriptionId)
}