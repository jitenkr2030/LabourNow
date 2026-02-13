// Offline Data Management System for LabourNow
export class OfflineDataManager {
  constructor() {
    this.dbName = 'LabourNowOffline'
    this.dbVersion = 1
    this.db = null
    this.syncQueue = []
    this.isOnline = navigator.onLine
    
    this.init()
  }

  async init() {
    await this.initDB()
    this.setupNetworkListeners()
    this.setupPeriodicSync()
  }

  // Initialize IndexedDB
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        console.log('[OfflineDB] Database initialized')
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Create stores for different data types
        if (!db.objectStoreNames.contains('profiles')) {
          const profileStore = db.createObjectStore('profiles', { keyPath: 'id' })
          profileStore.createIndex('category', 'category', { unique: false })
          profileStore.createIndex('city', 'cityId', { unique: false })
          profileStore.createIndex('lastUpdated', 'lastUpdated', { unique: false })
        }

        if (!db.objectStoreNames.contains('bookings')) {
          const bookingStore = db.createObjectStore('bookings', { keyPath: 'id' })
          bookingStore.createIndex('userId', 'userId', { unique: false })
          bookingStore.createIndex('status', 'status', { unique: false })
          bookingStore.createIndex('date', 'date', { unique: false })
        }

        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', { keyPath: 'id' })
          messageStore.createIndex('bookingId', 'bookingId', { unique: false })
          messageStore.createIndex('senderId', 'senderId', { unique: false })
          messageStore.createIndex('timestamp', 'createdAt', { unique: false })
        }

        if (!db.objectStoreNames.contains('cities')) {
          const cityStore = db.createObjectStore('cities', { keyPath: 'id' })
          cityStore.createIndex('name', 'name', { unique: false })
        }

        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true })
          syncStore.createIndex('timestamp', 'timestamp', { unique: false })
          syncStore.createIndex('type', 'type', { unique: false })
        }

        if (!db.objectStoreNames.contains('userPreferences')) {
          db.createObjectStore('userPreferences', { keyPath: 'key' })
        }

        console.log('[OfflineDB] Database schema created')
      }
    })
  }

  // Network Listeners
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('[OfflineDB] Back online - starting sync')
      this.processSyncQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('[OfflineDB] Gone offline')
    })
  }

  // Data Storage Methods
  async saveProfiles(profiles) {
    if (!this.db) await this.initDB()
    
    const transaction = this.db.transaction(['profiles'], 'readwrite')
    const store = transaction.objectStore('profiles')
    
    const timestamp = Date.now()
    const profilesWithTimestamp = profiles.map(profile => ({
      ...profile,
      lastUpdated: timestamp
    }))

    for (const profile of profilesWithTimestamp) {
      await store.put(profile)
    }

    console.log(`[OfflineDB] Saved ${profiles.length} profiles`)
  }

  async getProfiles(filters = {}) {
    if (!this.db) await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['profiles'], 'readonly')
      const store = transaction.objectStore('profiles')
      const request = store.getAll()

      request.onsuccess = () => {
        let profiles = request.result

        // Apply filters
        if (filters.category) {
          profiles = profiles.filter(p => p.category === filters.category)
        }
        if (filters.cityId) {
          profiles = profiles.filter(p => p.cityId === filters.cityId)
        }
        if (filters.availableOnly) {
          profiles = profiles.filter(p => p.isAvailable)
        }

        resolve(profiles)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async saveBookings(bookings) {
    if (!this.db) await this.initDB()
    
    const transaction = this.db.transaction(['bookings'], 'readwrite')
    const store = transaction.objectStore('bookings')
    
    for (const booking of bookings) {
      await store.put(booking)
    }

    console.log(`[OfflineDB] Saved ${bookings.length} bookings`)
  }

  async getBookings(userId) {
    if (!this.db) await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['bookings'], 'readonly')
      const store = transaction.objectStore('bookings')
      const index = store.index('userId')
      const request = index.getAll(userId)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async saveMessages(messages) {
    if (!this.db) await this.initDB()
    
    const transaction = this.db.transaction(['messages'], 'readwrite')
    const store = transaction.objectStore('messages')
    
    for (const message of messages) {
      await store.put(message)
    }

    console.log(`[OfflineDB] Saved ${messages.length} messages`)
  }

  async getMessages(bookingId) {
    if (!this.db) await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['messages'], 'readonly')
      const store = transaction.objectStore('messages')
      const index = store.index('bookingId')
      const request = index.getAll(bookingId)

      request.onsuccess = () => {
        const messages = request.result.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        )
        resolve(messages)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async saveCities(cities) {
    if (!this.db) await this.initDB()
    
    const transaction = this.db.transaction(['cities'], 'readwrite')
    const store = transaction.objectStore('cities')
    
    for (const city of cities) {
      await store.put(city)
    }

    console.log(`[OfflineDB] Saved ${cities.length} cities`)
  }

  async getCities() {
    if (!this.db) await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['cities'], 'readonly')
      const store = transaction.objectStore('cities')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Sync Queue Management
  async addToSyncQueue(action, data, endpoint) {
    if (!this.db) await this.initDB()
    
    const syncItem = {
      id: Date.now() + Math.random(),
      action,
      data,
      endpoint,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: 3
    }

    const transaction = this.db.transaction(['syncQueue'], 'readwrite')
    const store = transaction.objectStore('syncQueue')
    await store.put(syncItem)

    console.log('[OfflineDB] Added to sync queue:', syncItem)

    // Try to sync immediately if online
    if (this.isOnline) {
      this.processSyncQueue()
    }
  }

  async getSyncQueue() {
    if (!this.db) await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['syncQueue'], 'readonly')
      const store = transaction.objectStore('syncQueue')
      const request = store.getAll()

      request.onsuccess = () => {
        const queue = request.result.sort((a, b) => a.timestamp - b.timestamp)
        resolve(queue)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async processSyncQueue() {
    if (!this.isOnline) return

    const queue = await this.getSyncQueue()
    console.log(`[OfflineDB] Processing ${queue.length} sync items`)

    for (const item of queue) {
      try {
        await this.syncItem(item)
        await this.removeFromSyncQueue(item.id)
      } catch (error) {
        console.error('[OfflineDB] Sync failed for item:', item, error)
        
        // Increment retry count
        item.retries++
        if (item.retries < item.maxRetries) {
          await this.updateSyncQueueItem(item)
        } else {
          console.error('[OfflineDB] Max retries exceeded for item:', item)
          await this.removeFromSyncQueue(item.id)
        }
      }
    }
  }

  async syncItem(item) {
    const { action, data, endpoint } = item

    switch (action) {
      case 'CREATE_BOOKING':
        return await this.createBooking(data)
      case 'UPDATE_BOOKING':
        return await this.updateBooking(data.id, data.updates)
      case 'SEND_MESSAGE':
        return await this.sendMessage(data)
      case 'UPDATE_PROFILE':
        return await this.updateProfile(data.id, data.updates)
      default:
        throw new Error(`Unknown sync action: ${action}`)
    }
  }

  async createBooking(bookingData) {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    })

    if (!response.ok) {
      throw new Error(`Failed to create booking: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('[OfflineDB] Booking created successfully:', result)
    return result
  }

  async updateBooking(bookingId, updates) {
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      throw new Error(`Failed to update booking: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('[OfflineDB] Booking updated successfully:', result)
    return result
  }

  async sendMessage(messageData) {
    const response = await fetch('/api/chat/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    })

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('[OfflineDB] Message sent successfully:', result)
    return result
  }

  async updateProfile(profileId, updates) {
    const response = await fetch(`/api/labour/profile/${profileId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('[OfflineDB] Profile updated successfully:', result)
    return result
  }

  async removeFromSyncQueue(itemId) {
    if (!this.db) await this.initDB()
    
    const transaction = this.db.transaction(['syncQueue'], 'readwrite')
    const store = transaction.objectStore('syncQueue')
    await store.delete(itemId)
  }

  async updateSyncQueueItem(item) {
    if (!this.db) await this.initDB()
    
    const transaction = this.db.transaction(['syncQueue'], 'readwrite')
    const store = transaction.objectStore('syncQueue')
    await store.put(item)
  }

  // User Preferences
  async savePreference(key, value) {
    if (!this.db) await this.initDB()
    
    const transaction = this.db.transaction(['userPreferences'], 'readwrite')
    const store = transaction.objectStore('userPreferences')
    await store.put({ key, value, timestamp: Date.now() })
  }

  async getPreference(key) {
    if (!this.db) await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['userPreferences'], 'readonly')
      const store = transaction.objectStore('userPreferences')
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result?.value)
      request.onerror = () => reject(request.error)
    })
  }

  // Cache Management
  async clearCache() {
    if (!this.db) await this.initDB()
    
    const stores = ['profiles', 'bookings', 'messages', 'syncQueue']
    
    for (const storeName of stores) {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      await store.clear()
    }

    console.log('[OfflineDB] Cache cleared')
  }

  async getCacheSize() {
    if (!this.db) await this.initDB()
    
    const stores = ['profiles', 'bookings', 'messages', 'cities', 'categories', 'syncQueue']
    let totalSize = 0
    const sizes = {}

    for (const storeName of stores) {
      const count = await this.getStoreCount(storeName)
      sizes[storeName] = count
      totalSize += count
    }

    return { total: totalSize, byStore: sizes }
  }

  async getStoreCount(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.count()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Periodic Sync
  setupPeriodicSync() {
    // Sync every 5 minutes when online
    setInterval(() => {
      if (this.isOnline) {
        this.processSyncQueue()
      }
    }, 5 * 60 * 1000)

    // Cleanup old data every hour
    setInterval(() => {
      this.cleanupOldData()
    }, 60 * 60 * 1000)
  }

  async cleanupOldData() {
    if (!this.db) await this.initDB()
    
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    
    // Clean up old sync queue items
    const transaction = this.db.transaction(['syncQueue'], 'readwrite')
    const store = transaction.objectStore('syncQueue')
    const index = store.index('timestamp')
    const request = index.openCursor(IDBKeyRange.upperBound(oneWeekAgo))

    request.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      }
    }

    console.log('[OfflineDB] Cleanup completed')
  }

  // Export/Import for debugging
  async exportData() {
    const data = {
      profiles: await this.getProfiles(),
      bookings: await this.getBookings(),
      messages: [],
      cities: await this.getCities(),
      syncQueue: await this.getSyncQueue()
    }

    return data
  }

  async importData(data) {
    if (data.profiles) await this.saveProfiles(data.profiles)
    if (data.bookings) await this.saveBookings(data.bookings)
    if (data.messages) await this.saveMessages(data.messages)
    if (data.cities) await this.saveCities(data.cities)
    
    console.log('[OfflineDB] Data imported successfully')
  }
}

// Export singleton instance
export const offlineManager = new OfflineDataManager()

// Export individual methods for easier usage
export const {
  saveProfiles,
  getProfiles,
  saveBookings,
  getBookings,
  saveMessages,
  getMessages,
  addToSyncQueue,
  processSyncQueue,
  savePreference,
  getPreference,
  clearCache
} = offlineManager

export default offlineManager