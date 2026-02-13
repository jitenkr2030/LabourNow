const CACHE_VERSION = '2.0.0'
const CACHE_NAME = `labournow-v${CACHE_VERSION}`
const STATIC_CACHE = `labournow-static-v${CACHE_VERSION}`
const DYNAMIC_CACHE = `labournow-dynamic-v${CACHE_VERSION}`
const API_CACHE = `labournow-api-v${CACHE_VERSION}`

// Cache strategies
const CACHE_STRATEGIES = {
  STATIC: 'cache-first',
  API: 'network-first',
  DYNAMIC: 'stale-while-revalidate'
}

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/mobile-page',
  '/admin',
  '/manifest.json',
  '/_next/static/css/',
  '/_next/static/chunks/',
  '/logo.svg',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/cities',
  '/api/categories',
  '/api/location/search'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v', CACHE_VERSION)
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      }),
      
      // Create dynamic cache
      caches.open(DYNAMIC_CACHE),
      
      // Create API cache
      caches.open(API_CACHE)
    ]).then(() => {
      console.log('[SW] Installation complete')
      return self.skipWaiting()
    }).catch(error => {
      console.error('[SW] Installation failed:', error)
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v', CACHE_VERSION)
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheName.includes(CACHE_VERSION)) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('[SW] Activation complete')
      return self.clients.claim()
    }).catch(error => {
      console.error('[SW] Activation failed:', error)
    })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    if (request.method === 'POST' && url.pathname.includes('/api/')) {
      // Handle POST requests for background sync
      event.respondWith(handlePostRequest(request))
    }
    return
  }

  // Handle different request types
  if (url.pathname.startsWith('/api/')) {
    // API requests
    event.respondWith(handleApiRequest(request))
  } else if (STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.startsWith(asset))) {
    // Static assets
    event.respondWith(handleStaticRequest(request))
  } else {
    // Dynamic pages
    event.respondWith(handleDynamicRequest(request))
  }
})

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url)
  const isCacheable = API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))
  
  if (isCacheable) {
    try {
      // Try network first
      const networkResponse = await fetch(request)
      
      if (networkResponse.ok) {
        // Cache successful response
        const cache = await caches.open(API_CACHE)
        cache.put(request, networkResponse.clone())
        return networkResponse
      }
    } catch (error) {
      console.log('[SW] Network failed, trying cache for:', request.url)
    }
    
    // Fallback to cache
    return caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse
      }
      
      // Return offline fallback for API
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Offline - Please check your connection',
          offline: true 
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    })
  }
  
  // Non-cacheable API requests go directly to network
  return fetch(request)
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        const cache = await caches.open(STATIC_CACHE)
        cache.put(request, networkResponse)
      }
    }).catch(() => {
      // Ignore network errors for static assets
    })
    
    return cachedResponse
  }
  
  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('[SW] Failed to fetch static asset:', request.url)
    
    // Return offline fallback
    return new Response(
      JSON.stringify({ error: 'Offline - Resource not available' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// Handle dynamic pages with stale-while-revalidate
async function handleDynamicRequest(request) {
  const cachedResponse = await caches.match(request)
  
  // Create network request
  const networkPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(error => {
    console.log('[SW] Network request failed:', error)
    return null
  })
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse
  }
  
  // Wait for network response
  const networkResponse = await networkPromise
  
  if (networkResponse) {
    return networkResponse
  }
  
  // Return offline page
  return caches.match('/offline.html') || new Response(
    `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Offline - LabourNow</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: system-ui; text-align: center; padding: 2rem; }
        .offline-icon { font-size: 4rem; margin-bottom: 1rem; }
        .offline-message { color: #666; margin-bottom: 2rem; }
        .retry-btn { 
          background: #2563eb; 
          color: white; 
          border: none; 
          padding: 0.75rem 2rem; 
          border-radius: 0.5rem; 
          cursor: pointer;
          font-size: 1rem;
        }
        .retry-btn:hover { background: #1d4ed8; }
      </style>
    </head>
    <body>
      <div class="offline-icon">📱</div>
      <h1>You're Offline</h1>
      <p class="offline-message">
        Please check your internet connection and try again.
        Some features may be available offline.
      </p>
      <button class="retry-btn" onclick="window.location.reload()">
        Try Again
      </button>
    </body>
    </html>
    `,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    }
  )
}

// Handle POST requests for background sync
async function handlePostRequest(request) {
  try {
    // Try to send request immediately
    const response = await fetch(request.clone())
    return response
  } catch (error) {
    // Store request for background sync
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.text(),
      timestamp: Date.now()
    }
    
    // Store in IndexedDB for background sync
    const db = await openDB()
    await db.add('pendingRequests', requestData)
    
    // Register for background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      await self.registration.sync.register('background-sync')
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Request saved for background sync',
        offline: true 
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(processBackgroundSync())
  } else if (event.tag === 'periodic-sync') {
    event.waitUntil(processPeriodicSync())
  }
})

// Process background sync
async function processBackgroundSync() {
  try {
    const db = await openDB()
    const pendingRequests = await db.getAll('pendingRequests')
    
    console.log(`[SW] Processing ${pendingRequests.length} pending requests`)
    
    for (const requestData of pendingRequests) {
      try {
        const response = await fetch(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body
        })
        
        if (response.ok) {
          // Remove successful request from pending
          await db.delete('pendingRequests', requestData.id)
          console.log('[SW] Synced request:', requestData.url)
        }
      } catch (error) {
        console.error('[SW] Failed to sync request:', requestData.url, error)
      }
    }
    
    // Notify clients about sync completion
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_COMPLETE',
        timestamp: Date.now()
      })
    })
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

// Process periodic sync
async function processPeriodicSync() {
  try {
    // Refresh cached data
    const cache = await caches.open(API_CACHE)
    
    for (const endpoint of API_ENDPOINTS) {
      try {
        const response = await fetch(endpoint)
        if (response.ok) {
          await cache.put(endpoint, response)
        }
      } catch (error) {
        console.log('[SW] Periodic sync failed for:', endpoint)
      }
    }
    
    console.log('[SW] Periodic sync completed')
  } catch (error) {
    console.error('[SW] Periodic sync failed:', error)
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')
  
  const options = {
    body: 'You have a new notification from LabourNow',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-96x96.png'
      }
    ]
  }
  
  if (event.data) {
    const data = event.data.json()
    options.body = data.body || options.body
    options.title = data.title || 'LabourNow'
    options.data = { ...options.data, ...data }
  }
  
  event.waitUntil(
    self.registration.showNotification(options.title || 'LabourNow', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received')
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open app
    event.waitUntil(
      clients.matchAll().then(clientList => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/')
        }
      })
    )
  }
})

// IndexedDB helper
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('LabourNowSW', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      if (!db.objectStoreNames.contains('pendingRequests')) {
        const store = db.createObjectStore('pendingRequests', { 
          keyPath: 'id', 
          autoIncrement: true 
        })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

// Message event for client communication
self.addEventListener('message', (event) => {
  const { type, data } = event.data
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_VERSION })
      break
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ cleared: true })
      })
      break
      
    case 'FORCE_SYNC':
      processBackgroundSync().then(() => {
        event.ports[0].postMessage({ synced: true })
      })
      break
  }
})

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys()
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  )
}

console.log('[SW] Service worker loaded v', CACHE_VERSION)