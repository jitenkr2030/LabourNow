// PWA Utilities for LabourNow
export class PWAManager {
  constructor() {
    this.swRegistration = null
    this.isOnline = navigator.onLine
    this.installPrompt = null
    this.deferredPrompt = null
    
    this.init()
  }

  async init() {
    // Register service worker
    await this.registerServiceWorker()
    
    // Setup online/offline listeners
    this.setupNetworkListeners()
    
    // Setup install prompt
    this.setupInstallPrompt()
    
    // Setup app shortcuts
    this.setupAppShortcuts()
    
    // Initialize background sync
    this.initBackgroundSync()
  }

  // Service Worker Registration
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js')
        console.log('[PWA] Service Worker registered:', this.swRegistration.scope)
        
        // Listen for service worker updates
        this.swRegistration.addEventListener('updatefound', () => {
          const newWorker = this.swRegistration.installing
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateAvailable()
            }
          })
        })

        // Setup message channel with service worker
        this.setupServiceWorkerMessages()
        
        return this.swRegistration
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error)
      }
    }
    return null
  }

  // Setup communication with service worker
  setupServiceWorkerMessages() {
    if (!this.swRegistration) return

    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, data } = event.data
      
      switch (type) {
        case 'BACKGROUND_SYNC_COMPLETE':
          this.onBackgroundSyncComplete(data)
          break
        case 'CACHE_UPDATED':
          this.onCacheUpdated(data)
          break
      }
    })
  }

  // Network Status Management
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.onNetworkChange(true)
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.onNetworkChange(false)
    })
  }

  onNetworkChange(isOnline) {
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('networkchange', { 
      detail: { isOnline } 
    }))

    // Show/hide offline indicator
    this.updateOfflineIndicator(isOnline)

    // Trigger background sync when coming back online
    if (isOnline) {
      this.triggerBackgroundSync()
    }
  }

  updateOfflineIndicator(isOnline) {
    let indicator = document.getElementById('offline-indicator')
    
    if (!indicator) {
      indicator = document.createElement('div')
      indicator.id = 'offline-indicator'
      indicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: ${isOnline ? '#28a745' : '#dc3545'};
        color: white;
        text-align: center;
        padding: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 9999;
        transform: translateY(-100%);
        transition: transform 0.3s ease;
      `
      document.body.appendChild(indicator)
    }

    indicator.textContent = isOnline ? '🌐 Back Online' : '📡 Offline Mode'
    indicator.style.transform = isOnline ? 'translateY(-100%)' : 'translateY(0)'

    if (isOnline) {
      setTimeout(() => {
        indicator.style.transform = 'translateY(-100%)'
      }, 3000)
    }
  }

  // App Installation
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e
      this.showInstallButton()
    })

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully')
      this.hideInstallButton()
      this.deferredPrompt = null
    })
  }

  showInstallButton() {
    // Remove existing install button
    this.hideInstallButton()

    const installBtn = document.createElement('button')
    installBtn.id = 'pwa-install-btn'
    installBtn.innerHTML = '📱 Install App'
    installBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      transition: all 0.3s ease;
    `

    installBtn.addEventListener('click', () => this.installApp())
    installBtn.addEventListener('mouseenter', () => {
      installBtn.style.transform = 'translateY(-2px)'
      installBtn.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)'
    })
    installBtn.addEventListener('mouseleave', () => {
      installBtn.style.transform = 'translateY(0)'
      installBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)'
    })

    document.body.appendChild(installBtn)
  }

  hideInstallButton() {
    const existingBtn = document.getElementById('pwa-install-btn')
    if (existingBtn) {
      existingBtn.remove()
    }
  }

  async installApp() {
    if (!this.deferredPrompt) return

    try {
      this.deferredPrompt.prompt()
      const { outcome } = await this.deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted install prompt')
      } else {
        console.log('[PWA] User dismissed install prompt')
      }
      
      this.deferredPrompt = null
      this.hideInstallButton()
    } catch (error) {
      console.error('[PWA] Install prompt error:', error)
    }
  }

  // App Shortcuts
  setupAppShortcuts() {
    if ('navigator' in window && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'LabourNow',
        artist: 'Find Labour & Workers',
        album: 'Quick Actions',
        artwork: [
          { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }
        ]
      })

      navigator.mediaSession.setActionHandler('play', () => {
        this.quickAction('search')
      })
      
      navigator.mediaSession.setActionHandler('pause', () => {
        this.quickAction('bookings')
      })
    }
  }

  quickAction(action) {
    switch (action) {
      case 'search':
        window.location.href = '/search'
        break
      case 'bookings':
        window.location.href = '/bookings'
        break
      case 'messages':
        window.location.href = '/messages'
        break
      case 'profile':
        window.location.href = '/profile'
        break
    }
  }

  // Background Sync
  async initBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready
        console.log('[PWA] Background sync supported')
        return registration
      } catch (error) {
        console.log('[PWA] Background sync not supported')
      }
    }
    return null
  }

  async registerBackgroundSync(tag) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register(tag)
      console.log(`[PWA] Background sync registered: ${tag}`)
    } catch (error) {
      console.error('[PWA] Background sync registration failed:', error)
    }
  }

  async triggerBackgroundSync() {
    if (this.swRegistration) {
      try {
        await this.registerBackgroundSync('background-sync')
      } catch (error) {
        console.error('[PWA] Failed to trigger background sync:', error)
      }
    }
  }

  onBackgroundSyncComplete(data) {
    console.log('[PWA] Background sync completed:', data)
    // Show notification or update UI
    this.showSyncNotification()
  }

  showSyncNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('LabourNow', {
        body: 'Your data has been synced successfully!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png'
      })
    }
  }

  // Push Notifications
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      console.log('[PWA] Notification permission:', permission)
      return permission
    }
    return 'denied'
  }

  async subscribeToPushNotifications() {
    if (!this.swRegistration) return null

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
      })

      console.log('[PWA] Push subscription created:', subscription)
      
      // Send subscription to server
      await this.sendPushSubscriptionToServer(subscription)
      
      return subscription
    } catch (error) {
      console.error('[PWA] Push subscription failed:', error)
      return null
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    
    return outputArray
  }

  async sendPushSubscriptionToServer(subscription) {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      })
    } catch (error) {
      console.error('[PWA] Failed to send push subscription:', error)
    }
  }

  // Web Share API
  async shareContent(title, text, url, files = null) {
    if (navigator.share) {
      try {
        const shareData = { title, text, url }
        if (files) {
          shareData.files = files
        }
        
        await navigator.share(shareData)
        console.log('[PWA] Content shared successfully')
        return true
      } catch (error) {
        console.log('[PWA] Share cancelled or failed:', error)
        return false
      }
    } else {
      console.log('[PWA] Web Share API not supported')
      return false
    }
  }

  // Cache Management
  async clearCache() {
    if (this.swRegistration) {
      try {
        const messageChannel = new MessageChannel()
        
        messageChannel.port1.onmessage = (event) => {
          if (event.data.cleared) {
            console.log('[PWA] Cache cleared successfully')
          }
        }

        this.swRegistration.active.postMessage({
          type: 'CLEAR_CACHE'
        }, [messageChannel.port2])
      } catch (error) {
        console.error('[PWA] Failed to clear cache:', error)
      }
    }
  }

  async forceSync() {
    if (this.swRegistration) {
      try {
        const messageChannel = new MessageChannel()
        
        messageChannel.port1.onmessage = (event) => {
          if (event.data.synced) {
            console.log('[PWA] Force sync completed')
          }
        }

        this.swRegistration.active.postMessage({
          type: 'FORCE_SYNC'
        }, [messageChannel.port2])
      } catch (error) {
        console.error('[PWA] Failed to force sync:', error)
      }
    }
  }

  // Update Management
  showUpdateAvailable() {
    const updateBanner = document.createElement('div')
    updateBanner.id = 'update-banner'
    updateBanner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #007bff;
        color: white;
        padding: 12px;
        text-align: center;
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 15px;
      ">
        <span>🔄 A new version is available!</span>
        <button id="update-btn" style="
          background: white;
          color: #007bff;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        ">Update Now</button>
        <button id="dismiss-btn" style="
          background: transparent;
          color: white;
          border: 1px solid white;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        ">Later</button>
      </div>
    `

    document.body.appendChild(updateBanner)

    document.getElementById('update-btn').addEventListener('click', () => {
      this.applyUpdate()
    })

    document.getElementById('dismiss-btn').addEventListener('click', () => {
      updateBanner.remove()
    })
  }

  async applyUpdate() {
    if (this.swRegistration && this.swRegistration.waiting) {
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
      
      // Reload the page to activate the new service worker
      window.location.reload()
    }
  }

  // Deep Linking
  setupDeepLinking() {
    // Handle universal links and custom URL schemes
    if ('launchQueue' in window) {
      window.launchQueue.setConsumer((launchParams) => {
        console.log('[PWA] App launched with:', launchParams)
        this.handleDeepLink(launchParams.url)
      })
    }
  }

  handleDeepLink(url) {
    // Parse the deep link and navigate accordingly
    const urlObj = new URL(url)
    
    switch (urlObj.pathname) {
      case '/booking':
        // Navigate to specific booking
        const bookingId = urlObj.searchParams.get('id')
        if (bookingId) {
          window.location.href = `/bookings/${bookingId}`
        }
        break
      case '/profile':
        window.location.href = '/profile'
        break
      case '/search':
        const query = urlObj.searchParams.get('q')
        if (query) {
          window.location.href = `/search?q=${encodeURIComponent(query)}`
        }
        break
      default:
        window.location.href = urlObj.pathname
    }
  }

  // Biometric Authentication
  async authenticateBiometric(reason = 'Authenticate to access LabourNow') {
    if ('credentials' in navigator) {
      try {
        // Check if WebAuthn is supported
        if (typeof PublicKeyCredential !== 'undefined') {
          // For biometric authentication, you'd typically implement WebAuthn
          // This is a simplified version
          const credential = await navigator.credentials.get({
            publicKey: {
              challenge: new Uint8Array(32),
              allowCredentials: [],
              userVerification: 'required'
            }
          })
          
          console.log('[PWA] Biometric authentication successful')
          return { success: true, credential }
        }
      } catch (error) {
        console.log('[PWA] Biometric authentication failed:', error)
        return { success: false, error: error.message }
      }
    }
    
    return { success: false, error: 'Biometric authentication not supported' }
  }

  // Get PWA Info
  getPWAInfo() {
    return {
      isInstalled: window.matchMedia('(display-mode: standalone)').matches,
      isOnline: this.isOnline,
      serviceWorkerSupported: 'serviceWorker' in navigator,
      backgroundSyncSupported: 'sync' in window.ServiceWorkerRegistration.prototype,
      pushSupported: 'PushManager' in window,
      shareSupported: 'share' in navigator,
      webAuthnSupported: typeof PublicKeyCredential !== 'undefined'
    }
  }
}

// Export singleton instance
export const pwaManager = new PWAManager()

// Export individual functions for easier usage
export const {
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPushNotifications,
  shareContent,
  authenticateBiometric,
  installApp,
  triggerBackgroundSync,
  clearCache
} = pwaManager

export default pwaManager