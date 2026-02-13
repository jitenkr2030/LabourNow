'use client'

import { useState, useEffect, useCallback } from 'react'
import { pwaManager } from '@/lib/pwa'

export interface PushNotificationState {
  isSupported: boolean
  isSubscribed: boolean
  permission: NotificationPermission
  isLoading: boolean
  error: string | null
}

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'default',
    isLoading: false,
    error: null
  })

  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  // Initialize push notification support
  useEffect(() => {
    const initialize = async () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window
      
      setState(prev => ({
        ...prev,
        isSupported: supported,
        permission: supported ? Notification.permission : 'denied'
      }))

      if (supported) {
        await checkExistingSubscription()
      }
    }

    initialize()
  }, [])

  // Check for existing subscription
  const checkExistingSubscription = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const existingSubscription = await registration.pushManager.getSubscription()
      
      if (existingSubscription) {
        setSubscription(existingSubscription as PushSubscription)
        setState(prev => ({ ...prev, isSubscribed: true }))
      }
    } catch (error) {
      console.error('Error checking push subscription:', error)
    }
  }, [])

  // Request permission and subscribe
  const subscribe = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Push notifications not supported' }))
      return false
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Request permission
      const permission = await Notification.requestPermission()
      setState(prev => ({ ...prev, permission }))

      if (permission !== 'granted') {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Notification permission denied'
        }))
        return false
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready
      
      // Subscribe to push notifications
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
      })

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pushSubscription)
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription on server')
      }

      setSubscription(pushSubscription as PushSubscription)
      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false
      }))

      console.log('Push notification subscription successful')
      return true

    } catch (error) {
      console.error('Push subscription error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to subscribe'
      }))
      return false
    }
  }, [state.isSupported])

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!subscription) {
      return true
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Unsubscribe from push service
      await subscription.unsubscribe()
      
      // Remove from server
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      })

      setSubscription(null)
      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false
      }))

      console.log('Push notification unsubscription successful')
      return true

    } catch (error) {
      console.error('Push unsubscription error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to unsubscribe'
      }))
      return false
    }
  }, [subscription])

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    if (!state.isSubscribed) {
      setState(prev => ({ ...prev, error: 'Not subscribed to push notifications' }))
      return false
    }

    try {
      // This would typically be done by your server
      // For testing, we'll trigger a local notification
      const registration = await navigator.serviceWorker.ready
      
      // Create a test notification
      await registration.showNotification('Test Notification', {
        body: 'This is a test push notification from LabourNow!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        tag: 'test',
        data: {
          type: 'test',
          timestamp: Date.now()
        },
        actions: [
          {
            action: 'view',
            title: 'View App',
            icon: '/icons/icon-96x96.png'
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
            icon: '/icons/icon-96x96.png'
          }
        ]
      })

      return true
    } catch (error) {
      console.error('Test notification error:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to send test notification'
      }))
      return false
    }
  }, [state.isSubscribed])

  // Toggle subscription
  const toggleSubscription = useCallback(async () => {
    if (state.isSubscribed) {
      return await unsubscribe()
    } else {
      return await subscribe()
    }
  }, [state.isSubscribed, subscribe, unsubscribe])

  return {
    ...state,
    subscription,
    subscribe,
    unsubscribe,
    toggleSubscription,
    sendTestNotification,
    checkExistingSubscription
  }
}

// Helper function to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  
  return outputArray
}

// Hook for handling incoming push notifications
export function usePushNotificationHandler() {
  const [lastNotification, setLastNotification] = useState<any>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, data } = event.data
        
        if (type === 'PUSH_NOTIFICATION_RECEIVED') {
          setLastNotification(data)
          
          // Handle different notification types
          handleNotificationAction(data)
        }
      })
    }
  }, [])

  const handleNotificationAction = useCallback((notification: any) => {
    const { type, data } = notification
    
    switch (type) {
      case 'booking':
        // Navigate to booking details
        if (data?.bookingId) {
          window.location.href = `/bookings/${data.bookingId}`
        }
        break
        
      case 'message':
        // Navigate to chat
        if (data?.bookingId) {
          window.location.href = `/chat/${data.bookingId}`
        }
        break
        
      case 'payment':
        // Navigate to payment history
        window.location.href = '/payments'
        break
        
      default:
        // Navigate to home
        window.location.href = '/'
    }
  }, [])

  return {
    lastNotification,
    handleNotificationAction
  }
}