// Deep Linking System for LabourNow
export class DeepLinkManager {
  constructor() {
    this.scheme = 'labournow'
    this.host = window.location.hostname
    this.isApp = this.checkIfRunningAsApp()
    this.routes = new Map()
    
    this.init()
  }

  init() {
    this.setupRoutes()
    this.handleInitialLink()
    this.setupLinkListeners()
  }

  checkIfRunningAsApp() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://')
  }

  // Define deep link routes
  setupRoutes() {
    this.routes.set('booking', {
      pattern: /^booking\/([a-zA-Z0-9_-]+)$/,
      handler: (matches) => this.handleBookingDeepLink(matches[1])
    })

    this.routes.set('profile', {
      pattern: /^profile\/([a-zA-Z0-9_-]+)$/,
      handler: (matches) => this.handleProfileDeepLink(matches[1])
    })

    this.routes.set('search', {
      pattern: /^search(?:\?(.+))?$/,
      handler: (matches) => this.handleSearchDeepLink(matches[1])
    })

    this.routes.set('chat', {
      pattern: /^chat\/([a-zA-Z0-9_-]+)$/,
      handler: (matches) => this.handleChatDeepLink(matches[1])
    })

    this.routes.set('city', {
      pattern: /^city\/([a-zA-Z0-9_-]+)$/,
      handler: (matches) => this.handleCityDeepLink(matches[1])
    })

    this.routes.set('category', {
      pattern: /^category\/([a-zA-Z0-9_-]+)$/,
      handler: (matches) => this.handleCategoryDeepLink(matches[1])
    })

    this.routes.set('invite', {
      pattern: /^invite\/([a-zA-Z0-9_-]+)$/,
      handler: (matches) => this.handleInviteDeepLink(matches[1])
    })

    this.routes.set('payment', {
      pattern: /^payment\/([a-zA-Z0-9_-]+)$/,
      handler: (matches) => this.handlePaymentDeepLink(matches[1])
    })

    this.routes.set('review', {
      pattern: /^review\/([a-zA-Z0-9_-]+)$/,
      handler: (matches) => this.handleReviewDeepLink(matches[1])
    })
  }

  // Handle initial deep link when app launches
  handleInitialLink() {
    const url = new URL(window.location.href)
    
    // Check for deep link parameters
    const deepLinkPath = url.searchParams.get('deep_link')
    const deepLinkData = url.searchParams.get('deep_link_data')
    
    if (deepLinkPath) {
      this.handleDeepLink(deepLinkPath, deepLinkData ? JSON.parse(deepLinkData) : {})
    }

    // Check URL path for deep links
    const path = url.pathname.substring(1) // Remove leading slash
    if (path) {
      this.handleDeepLink(path)
    }
  }

  // Setup listeners for deep links
  setupLinkListeners() {
    // Listen for custom URL scheme events (mobile apps)
    document.addEventListener('deep-link', (event) => {
      const { url, data } = event.detail
      this.handleDeepLink(url, data)
    })

    // Listen for launch queue (PWA)
    if ('launchQueue' in window) {
      window.launchQueue.setConsumer((launchParams) => {
        if (launchParams.url) {
          const url = new URL(launchParams.url)
          this.handleDeepLink(url.pathname.substring(1), 
            this.parseQueryString(url.search))
        }
      })
    }

    // Listen for visibility changes (app coming to foreground)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.handleAppForeground()
      }
    })
  }

  // Main deep link handler
  handleDeepLink(path, data = {}) {
    console.log('[DeepLink] Handling deep link:', path, data)

    // Try to match against registered routes
    for (const [routeName, route] of this.routes) {
      const matches = path.match(route.pattern)
      if (matches) {
        console.log(`[DeepLink] Matched route: ${routeName}`)
        
        // Add deep link data to matches
        matches.push(data)
        
        try {
          route.handler(matches)
          this.logDeepLinkEvent(routeName, path, data, 'success')
        } catch (error) {
          console.error(`[DeepLink] Error handling route ${routeName}:`, error)
          this.logDeepLinkEvent(routeName, path, data, 'error', error.message)
          this.handleDeepLinkError(path, error)
        }
        return
      }
    }

    // No route matched, try generic handling
    this.handleGenericDeepLink(path, data)
  }

  // Route handlers
  handleBookingDeepLink(bookingId, data = {}) {
    console.log('[DeepLink] Opening booking:', bookingId)
    
    // Navigate to booking details
    window.location.href = `/bookings/${bookingId}`
    
    // Show loading state or specific action based on data
    if (data.action === 'rate') {
      // Open rating modal after navigation
      setTimeout(() => {
        this.showRatingModal(bookingId)
      }, 1000)
    } else if (data.action === 'message') {
      // Open chat for this booking
      setTimeout(() => {
        window.location.href = `/chat/${bookingId}`
      }, 1000)
    }
  }

  handleProfileDeepLink(profileId, data = {}) {
    console.log('[DeepLink] Opening profile:', profileId)
    
    // Navigate to profile
    window.location.href = `/labour/${profileId}`
    
    // Show specific action based on data
    if (data.action === 'book') {
      setTimeout(() => {
        this.showBookingModal(profileId)
      }, 1000)
    } else if (data.action === 'call') {
      setTimeout(() => {
        this.initiateCall(profileId)
      }, 1000)
    }
  }

  handleSearchDeepLink(queryString, data = {}) {
    console.log('[DeepLink] Opening search:', queryString)
    
    const params = this.parseQueryString(queryString || '')
    const searchParams = new URLSearchParams(params)
    
    // Navigate to search with parameters
    const searchUrl = `/search${queryString ? '?' + queryString : ''}`
    window.location.href = searchUrl
  }

  handleChatDeepLink(bookingId, data = {}) {
    console.log('[DeepLink] Opening chat:', bookingId)
    
    window.location.href = `/chat/${bookingId}`
    
    // Pre-fill message if provided
    if (data.message) {
      setTimeout(() => {
        this.preFillChatMessage(bookingId, data.message)
      }, 1000)
    }
  }

  handleCityDeepLink(cityId, data = {}) {
    console.log('[DeepLink] Opening city:', cityId)
    
    window.location.href = `/city/${cityId}`
    
    // Filter by category if provided
    if (data.category) {
      setTimeout(() => {
        this.filterByCategory(data.category)
      }, 1000)
    }
  }

  handleCategoryDeepLink(categoryId, data = {}) {
    console.log('[DeepLink] Opening category:', categoryId)
    
    window.location.href = `/category/${categoryId}`
    
    // Filter by city if provided
    if (data.cityId) {
      setTimeout(() => {
        this.filterByCity(data.cityId)
      }, 1000)
    }
  }

  handleInviteDeepLink(inviteCode, data = {}) {
    console.log('[DeepLink] Handling invite:', inviteCode)
    
    // Process invite code
    this.processInviteCode(inviteCode, data)
  }

  handlePaymentDeepLink(paymentId, data = {}) {
    console.log('[DeepLink] Opening payment:', paymentId)
    
    window.location.href = `/payments/${paymentId}`
    
    // Auto-process payment if specified
    if (data.action === 'pay') {
      setTimeout(() => {
        this.initiatePayment(paymentId)
      }, 1000)
    }
  }

  handleReviewDeepLink(bookingId, data = {}) {
    console.log('[DeepLink] Opening review:', bookingId)
    
    window.location.href = `/bookings/${bookingId}`
    
    // Open review modal immediately
    setTimeout(() => {
      this.showReviewModal(bookingId)
    }, 1000)
  }

  handleGenericDeepLink(path, data) {
    console.log('[DeepLink] Generic deep link:', path, data)
    
    // Try to navigate to the path directly
    if (path.startsWith('http')) {
      window.location.href = path
    } else {
      window.location.href = `/${path}`
    }
  }

  handleDeepLinkError(path, error) {
    console.error('[DeepLink] Error handling deep link:', path, error)
    
    // Show error message to user
    this.showErrorNotification('Failed to open link', error.message)
    
    // Fallback to home page
    setTimeout(() => {
      window.location.href = '/'
    }, 2000)
  }

  handleAppForeground() {
    // Check for any pending deep links when app comes to foreground
    const pendingLink = sessionStorage.getItem('pending_deep_link')
    if (pendingLink) {
      sessionStorage.removeItem('pending_deep_link')
      this.handleDeepLink(pendingLink)
    }
  }

  // Deep link creation utilities
  createDeepLink(route, params = {}) {
    const baseUrl = this.isApp ? `${this.scheme}://` : `${window.location.origin}/`
    const queryString = Object.keys(params).length > 0 ? 
      '?' + new URLSearchParams(params).toString() : ''
    
    return `${baseUrl}${route}${queryString}`
  }

  createBookingLink(bookingId, action = null) {
    const params = action ? { action } : {}
    return this.createDeepLink(`booking/${bookingId}`, params)
  }

  createProfileLink(profileId, action = null) {
    const params = action ? { action } : {}
    return this.createDeepLink(`profile/${profileId}`, params)
  }

  createSearchLink(queryParams = {}) {
    const queryString = new URLSearchParams(queryParams).toString()
    return this.createDeepLink(`search${queryString ? '?' + queryString : ''}`)
  }

  createChatLink(bookingId, message = null) {
    const params = message ? { message } : {}
    return this.createDeepLink(`chat/${bookingId}`, params)
  }

  createInviteLink(inviteCode) {
    return this.createDeepLink(`invite/${inviteCode}`)
  }

  createPaymentLink(paymentId, action = null) {
    const params = action ? { action } : {}
    return this.createDeepLink(`payment/${paymentId}`, params)
  }

  // Share deep links
  async shareDeepLink(route, params = {}, shareOptions = {}) {
    const deepLink = this.createDeepLink(route, params)
    
    const { shareManager } = await import('@/lib/share')
    
    return shareManager.share({
      title: shareOptions.title || 'LabourNow',
      text: shareOptions.text || 'Check this out on LabourNow!',
      url: deepLink,
      fallback: true
    })
  }

  // Utility functions
  parseQueryString(queryString) {
    const params = {}
    new URLSearchParams(queryString).forEach((value, key) => {
      params[key] = value
    })
    return params
  }

  logDeepLinkEvent(route, path, data, status, error = null) {
    const event = {
      type: 'deep_link',
      route,
      path,
      data,
      status,
      error,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      isApp: this.isApp
    }

    console.log('[DeepLink] Event:', event)
    
    // Send to analytics
    this.sendAnalyticsEvent(event)
  }

  sendAnalyticsEvent(event) {
    // Send to your analytics service
    if (typeof gtag !== 'undefined') {
      gtag('event', 'deep_link', {
        event_category: 'engagement',
        event_label: event.route,
        custom_parameter_1: event.status
      })
    }
  }

  // UI Helper functions
  showRatingModal(bookingId) {
    // Dispatch custom event to show rating modal
    window.dispatchEvent(new CustomEvent('show-rating-modal', {
      detail: { bookingId }
    }))
  }

  showBookingModal(profileId) {
    window.dispatchEvent(new CustomEvent('show-booking-modal', {
      detail: { profileId }
    }))
  }

  showReviewModal(bookingId) {
    window.dispatchEvent(new CustomEvent('show-review-modal', {
      detail: { bookingId }
    }))
  }

  preFillChatMessage(bookingId, message) {
    window.dispatchEvent(new CustomEvent('prefill-chat-message', {
      detail: { bookingId, message }
    }))
  }

  initiateCall(profileId) {
    window.dispatchEvent(new CustomEvent('initiate-call', {
      detail: { profileId }
    }))
  }

  filterByCategory(category) {
    window.dispatchEvent(new CustomEvent('filter-by-category', {
      detail: { category }
    }))
  }

  filterByCity(cityId) {
    window.dispatchEvent(new CustomEvent('filter-by-city', {
      detail: { cityId }
    }))
  }

  processInviteCode(inviteCode, data) {
    window.dispatchEvent(new CustomEvent('process-invite', {
      detail: { inviteCode, ...data }
    }))
  }

  initiatePayment(paymentId) {
    window.dispatchEvent(new CustomEvent('initiate-payment', {
      detail: { paymentId }
    }))
  }

  showErrorNotification(title, message) {
    window.dispatchEvent(new CustomEvent('show-error', {
      detail: { title, message }
    }))
  }
}

// Export singleton instance
export const deepLinkManager = new DeepLinkManager()

// Export individual methods for easier usage
export const {
  createDeepLink,
  createBookingLink,
  createProfileLink,
  createSearchLink,
  createChatLink,
  createInviteLink,
  createPaymentLink,
  shareDeepLink,
  handleDeepLink
} = deepLinkManager

export default deepLinkManager