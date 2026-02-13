// App Shortcuts Management for LabourNow PWA
export class AppShortcutsManager {
  constructor() {
    this.isSupported = this.checkSupport()
    this.shortcuts = new Map()
    this.userRole = null
    
    this.init()
  }

  checkSupport() {
    return (
      'navigator' in window &&
      'serviceWorker' in navigator &&
      'mediaSession' in navigator
    )
  }

  async init() {
    if (this.isSupported) {
      await this.setupDefaultShortcuts()
      this.setupMediaSession()
      this.listenForShortcutEvents()
    }
  }

  // Define default shortcuts based on user role
  async setupDefaultShortcuts() {
    // Get user role from localStorage or context
    this.userRole = localStorage.getItem('userRole') || 'GUEST'

    const shortcuts = this.getShortcutsForRole(this.userRole)
    
    for (const shortcut of shortcuts) {
      this.shortcuts.set(shortcut.id, shortcut)
    }

    // Register shortcuts with service worker
    await this.registerShortcuts()
  }

  getShortcutsForRole(role) {
    const baseShortcuts = [
      {
        id: 'search',
        name: 'Search Workers',
        short_name: 'Search',
        description: 'Find skilled workers by category and location',
        url: '/search',
        icon: '/icons/shortcuts/search.png',
        categories: ['search', 'labour']
      },
      {
        id: 'bookings',
        name: 'My Bookings',
        short_name: 'Bookings',
        description: 'View and manage your bookings',
        url: '/bookings',
        icon: '/icons/shortcuts/bookings.png',
        categories: ['bookings', 'management']
      },
      {
        id: 'messages',
        name: 'Messages',
        short_name: 'Chat',
        description: 'Chat with workers and employers',
        url: '/messages',
        icon: '/icons/shortcuts/messages.png',
        categories: ['messages', 'communication']
      },
      {
        id: 'profile',
        name: 'My Profile',
        short_name: 'Profile',
        description: 'View and edit your profile',
        url: '/profile',
        icon: '/icons/shortcuts/profile.png',
        categories: ['profile', 'account']
      }
    ]

    const roleSpecificShortcuts = {
      LABOUR: [
        {
          id: 'earnings',
          name: 'My Earnings',
          short_name: 'Earnings',
          description: 'Track your earnings and payment history',
          url: '/earnings',
          icon: '/icons/shortcuts/earnings.png',
          categories: ['earnings', 'payments']
        },
        {
          id: 'availability',
          name: 'Availability',
          short_name: 'Available',
          description: 'Update your work availability status',
          url: '/availability',
          icon: '/icons/shortcuts/availability.png',
          categories: ['availability', 'status']
        }
      ],
      EMPLOYER: [
        {
          id: 'post-job',
          name: 'Post Job',
          short_name: 'Post Job',
          description: 'Create a new job posting',
          url: '/post-job',
          icon: '/icons/shortcuts/post-job.png',
          categories: ['jobs', 'posting']
        },
        {
          id: 'analytics',
          name: 'Analytics',
          short_name: 'Stats',
          description: 'View your hiring analytics',
          url: '/analytics',
          icon: '/icons/shortcuts/analytics.png',
          categories: ['analytics', 'reports']
        }
      ],
      ADMIN: [
        {
          id: 'admin-panel',
          name: 'Admin Panel',
          short_name: 'Admin',
          description: 'Access admin dashboard',
          url: '/admin',
          icon: '/icons/shortcuts/admin.png',
          categories: ['admin', 'management']
        },
        {
          id: 'users',
          name: 'Manage Users',
          short_name: 'Users',
          description: 'Manage user accounts and permissions',
          url: '/admin/users',
          icon: '/icons/shortcuts/users.png',
          categories: ['admin', 'users']
        }
      ],
      GUEST: [
        {
          id: 'register',
          name: 'Sign Up',
          short_name: 'Register',
          description: 'Create a new account',
          url: '/auth/register',
          icon: '/icons/shortcuts/register.png',
          categories: ['auth', 'register']
        },
        {
          id: 'login',
          name: 'Sign In',
          short_name: 'Login',
          description: 'Sign in to your account',
          url: '/auth/login',
          icon: '/icons/shortcuts/login.png',
          categories: ['auth', 'login']
        }
      ]
    }

    return [...baseShortcuts, ...(roleSpecificShortcuts[role] || [])]
  }

  // Register shortcuts with the service worker
  async registerShortcuts() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready
        
        // Send shortcuts to service worker for registration
        registration.active?.postMessage({
          type: 'REGISTER_SHORTCUTS',
          shortcuts: Array.from(this.shortcuts.values())
        })

        console.log('[AppShortcuts] Shortcuts registered successfully')
      } catch (error) {
        console.error('[AppShortcuts] Failed to register shortcuts:', error)
      }
    }
  }

  // Setup Media Session for app shortcuts
  setupMediaSession() {
    if ('mediaSession' in navigator) {
      // Set up media metadata for the app
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'LabourNow',
        artist: 'Quick Actions',
        album: 'Find Workers & Jobs',
        artwork: [
          { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      })

      // Set up action handlers for media session (acts as shortcuts)
      this.setupMediaSessionActions()
    }
  }

  setupMediaSessionActions() {
    const actions = this.getMediaSessionActions()

    actions.forEach(action => {
      navigator.mediaSession.setActionHandler(action.action, () => {
        this.handleShortcutAction(action.id)
      })
    })
  }

  getMediaSessionActions() {
    const baseActions = [
      {
        action: 'play',
        id: 'search',
        title: 'Search Workers'
      },
      {
        action: 'pause',
        id: 'bookings',
        title: 'My Bookings'
      },
      {
        action: 'previoustrack',
        id: 'messages',
        title: 'Messages'
      },
      {
        action: 'nexttrack',
        id: 'profile',
        title: 'Profile'
      }
    ]

    const roleSpecificActions = {
      LABOUR: [
        {
          action: 'seekbackward',
          id: 'earnings',
          title: 'Earnings'
        },
        {
          action: 'seekforward',
          id: 'availability',
          title: 'Availability'
        }
      ],
      EMPLOYER: [
        {
          action: 'seekbackward',
          id: 'post-job',
          title: 'Post Job'
        },
        {
          action: 'seekforward',
          id: 'analytics',
          title: 'Analytics'
        }
      ],
      ADMIN: [
        {
          action: 'seekbackward',
          id: 'admin-panel',
          title: 'Admin Panel'
        },
        {
          action: 'seekforward',
          id: 'users',
          title: 'Users'
        }
      ]
    }

    return [
      ...baseActions,
      ...(roleSpecificActions[this.userRole] || [])
    ]
  }

  // Handle shortcut actions
  handleShortcutAction(shortcutId) {
    const shortcut = this.shortcuts.get(shortcutId)
    
    if (shortcut) {
      console.log(`[AppShortcuts] Executing shortcut: ${shortcut.name}`)
      
      // Navigate to the shortcut URL
      window.location.href = shortcut.url
      
      // Log shortcut usage
      this.logShortcutUsage(shortcutId)
      
      // Show feedback (optional)
      this.showShortcutFeedback(shortcut)
    } else {
      console.warn(`[AppShortcuts] Unknown shortcut: ${shortcutId}`)
    }
  }

  // Listen for shortcut events from service worker
  listenForShortcutEvents() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, data } = event.data
        
        if (type === 'SHORTCUT_CLICKED') {
          this.handleShortcutAction(data.shortcutId)
        }
      })
    }

    // Listen for PWA install events to add shortcuts
    window.addEventListener('appinstalled', () => {
      console.log('[AppShortcuts] App installed, setting up shortcuts')
      this.setupDefaultShortcuts()
    })
  }

  // Add custom shortcut
  async addCustomShortcut(shortcut) {
    const customShortcut = {
      id: shortcut.id,
      name: shortcut.name,
      short_name: shortcut.short_name || shortcut.name,
      description: shortcut.description,
      url: shortcut.url,
      icon: shortcut.icon || '/icons/shortcuts/custom.png',
      categories: shortcut.categories || ['custom'],
      custom: true
    }

    this.shortcuts.set(customShortcut.id, customShortcut)
    await this.registerShortcuts()
    
    console.log('[AppShortcuts] Custom shortcut added:', customShortcut.id)
    return customShortcut
  }

  // Remove shortcut
  async removeShortcut(shortcutId) {
    if (this.shortcuts.has(shortcutId)) {
      this.shortcuts.delete(shortcutId)
      await this.registerShortcuts()
      
      console.log('[AppShortcuts] Shortcut removed:', shortcutId)
      return true
    }
    return false
  }

  // Update shortcuts when user role changes
  async updateUserRole(newRole) {
    this.userRole = newRole
    localStorage.setItem('userRole', newRole)
    
    // Clear existing shortcuts and setup new ones
    this.shortcuts.clear()
    await this.setupDefaultShortcuts()
    
    console.log(`[AppShortcuts] Updated shortcuts for role: ${newRole}`)
  }

  // Get all shortcuts
  getShortcuts() {
    return Array.from(this.shortcuts.values())
  }

  // Get shortcuts by category
  getShortcutsByCategory(category) {
    return this.getShortcuts().filter(shortcut => 
      shortcut.categories.includes(category)
    )
  }

  // Search shortcuts
  searchShortcuts(query) {
    const lowercaseQuery = query.toLowerCase()
    return this.getShortcuts().filter(shortcut => 
      shortcut.name.toLowerCase().includes(lowercaseQuery) ||
      shortcut.short_name.toLowerCase().includes(lowercaseQuery) ||
      shortcut.description.toLowerCase().includes(lowercaseQuery)
    )
  }

  // Log shortcut usage for analytics
  logShortcutUsage(shortcutId) {
    const usage = {
      shortcutId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      userRole: this.userRole
    }

    console.log('[AppShortcuts] Shortcut usage:', usage)

    // Send to analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'shortcut_used', {
        event_category: 'engagement',
        event_label: shortcutId,
        custom_parameter_1: this.userRole
      })
    }

    // Store usage statistics locally
    this.updateShortcutStats(shortcutId)
  }

  updateShortcutStats(shortcutId) {
    const statsKey = 'shortcut_stats'
    const stats = JSON.parse(localStorage.getItem(statsKey) || '{}')
    
    if (!stats[shortcutId]) {
      stats[shortcutId] = { count: 0, firstUsed: null, lastUsed: null }
    }
    
    stats[shortcutId].count++
    stats[shortcutId].lastUsed = new Date().toISOString()
    
    if (!stats[shortcutId].firstUsed) {
      stats[shortcutId].firstUsed = stats[shortcutId].lastUsed
    }
    
    localStorage.setItem(statsKey, JSON.stringify(stats))
  }

  // Get shortcut usage statistics
  getShortcutStats() {
    return JSON.parse(localStorage.getItem('shortcut_stats') || '{}')
  }

  // Show feedback when shortcut is used
  showShortcutFeedback(shortcut) {
    // Create a toast notification
    const toast = document.createElement('div')
    toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `
    toast.textContent = `Opening ${shortcut.name}...`
    
    document.body.appendChild(toast)
    
    // Animate in
    setTimeout(() => {
      toast.style.opacity = '1'
    }, 100)
    
    // Remove after delay
    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast)
        }
      }, 300)
    }, 1500)
  }

  // Create shortcut icons dynamically (for demo purposes)
  generateShortcutIcon(shortcutId, color = '#007bff') {
    const canvas = document.createElement('canvas')
    canvas.width = 96
    canvas.height = 96
    
    const ctx = canvas.getContext('2d')
    
    // Draw background
    ctx.fillStyle = color
    ctx.roundRect(0, 0, 96, 96, 20)
    ctx.fill()
    
    // Draw icon based on shortcut type
    ctx.fillStyle = 'white'
    ctx.font = 'bold 36px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    const icons = {
      search: '🔍',
      bookings: '📋',
      messages: '💬',
      profile: '👤',
      earnings: '💰',
      availability: '✅',
      'post-job': '➕',
      analytics: '📊',
      'admin-panel': '⚙️',
      users: '👥',
      register: '📝',
      login: '🔐'
    }
    
    ctx.fillText(icons[shortcutId] || '📱', 48, 48)
    
    return canvas.toDataURL()
  }

  // Check if shortcuts are supported
  isShortcutsSupported() {
    return this.isSupported
  }

  // Export shortcuts configuration
  exportShortcuts() {
    return {
      version: '1.0.0',
      userRole: this.userRole,
      shortcuts: this.getShortcuts(),
      stats: this.getShortcutStats(),
      timestamp: new Date().toISOString()
    }
  }
}

// Export singleton instance
export const appShortcutsManager = new AppShortcutsManager()

// Export individual methods for easier usage
export const {
  addCustomShortcut,
  removeShortcut,
  updateUserRole,
  getShortcuts,
  getShortcutsByCategory,
  searchShortcuts,
  handleShortcutAction,
  generateShortcutIcon,
  isShortcutsSupported
} = appShortcutsManager

export default appShortcutsManager