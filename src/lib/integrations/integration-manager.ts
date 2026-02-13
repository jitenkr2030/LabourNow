// Integration Management System for LabourNow
export class IntegrationManager {
  private integrations: Map<string, any> = new Map()
  private webhooks: Map<string, any> = new Map()
  private analytics: Map<string, any> = new Map()

  constructor() {
    this.initializeIntegrations()
    this.loadWebhooks()
    this.loadAnalytics()
  }

  private initializeIntegrations() {
    // Import all integration modules
    const { whatsappAPI } = require('./whatsapp')
    const { googleServices } = require('./google')
    const { socialLogin } = require('./social-login')
    const { paymentGateway } = require('./payment-gateway')
    const { emailService } = require('./email-service')
    const { smsGateway } = require('./sms-gateway')

    this.integrations.set('whatsapp', whatsappAPI)
    this.integrations.set('google', googleServices)
    this.integrations.set('social', socialLogin)
    this.integrations.set('payment', paymentGateway)
    this.integrations.set('email', emailService)
    this.integrations.set('sms', smsGateway)
  }

  // Get integration status
  getIntegrationStatus(integrationId: string) {
    const integration = this.integrations.get(integrationId)
    if (!integration) {
      return {
        id: integrationId,
        name: integrationId,
        status: 'not_found',
        configured: false,
        features: [],
        lastTest: null
      }
    }

    // Check if integration is configured
    const isConfigured = this.isIntegrationConfigured(integrationId)
    
    return {
      id: integrationId,
      name: this.getIntegrationName(integrationId),
      status: isConfigured ? 'active' : 'inactive',
      configured: isConfigured,
      features: this.getIntegrationFeatures(integrationId),
      lastTest: this.getLastTestTime(integrationId),
      health: { status: 'unknown' } // Simplified for build
    }
  }

  // Get all integrations status
  getAllIntegrationStatus() {
    const integrations = ['whatsapp', 'google', 'social', 'payment', 'email', 'sms']
    
    return integrations.map(id => this.getIntegrationStatus(id))
  }

  // Test integration
  async testIntegration(integrationId: string, testConfig?: any) {
    const integration = this.integrations.get(integrationId)
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`)
    }

    try {
      let result: any = { success: false, integration: integrationId }

      switch (integrationId) {
        case 'whatsapp':
          result = await this.testWhatsAppIntegration(integration, testConfig)
          break
        case 'google':
          result = await this.testGoogleIntegration(integration, testConfig)
          break
        case 'social':
          result = await this.testSocialIntegration(integration, testConfig)
          break
        case 'payment':
          result = await this.testPaymentIntegration(integration, testConfig)
          break
        case 'email':
          result = await this.testEmailIntegration(integration, testConfig)
          break
        case 'sms':
          result = await this.testSMSIntegration(integration, testConfig)
          break
        default:
          throw new Error(`Test not implemented for integration: ${integrationId}`)
      }

      // Update last test time
      this.updateLastTestTime(integrationId, result.success)
      
      return result
    } catch (error) {
      this.updateLastTestTime(integrationId, false)
      throw error
    }
  }

  // Integration-specific test methods
  private async testWhatsAppIntegration(integration: any, config?: any) {
    const testNumber = config?.testNumber || '+919876543210'
    const testMessage = 'Test message from LabourNow Integration Manager'
    
    try {
      // Test sending a message
      const result = await integration.sendTextMessage(testNumber, testMessage)
      
      return {
        success: true,
        integration: 'whatsapp',
        test: 'send_message',
        result,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        integration: 'whatsapp',
        test: 'send_message',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  private async testGoogleIntegration(integration: any, config?: any) {
    try {
      // Test geocoding
      const geocodeResult = await integration.geocodeAddress('Mumbai, India')
      
      // Test analytics tracking
      integration.trackEvent('integration_test', { category: 'test', label: 'google' })
      
      return {
        success: true,
        integration: 'google',
        test: 'geocoding',
        result: {
          address: geocodeResult.address,
          location: geocodeResult.location
        },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        integration: 'google',
        test: 'geocoding',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  private async testSocialIntegration(integration: any, config?: any) {
    try {
      // Test getting auth URL
      const redirectUri = config?.redirectUri || `${process.env.NEXT_PUBLIC_APP_URL}/auth/google/callback`
      const authUrl = integration.getAuthUrl('google', redirectUri)
      
      return {
        success: true,
        integration: 'social',
        test: 'auth_url',
        result: { authUrl },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        integration: 'social',
        test: 'auth_url',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  private async testPaymentIntegration(integration: any, config?: any) {
    try {
      // Test creating a Razorpay order
      const orderResult = await integration.createRazorpayOrder(99, 'INR', 'test_order_123')
      
      return {
        success: true,
        integration: 'payment',
        test: 'create_order',
        result: {
          orderId: orderResult.id,
          amount: orderResult.amount
        },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        integration: 'payment',
        test: 'create_order',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  private async testEmailIntegration(integration: any, config?: any) {
    try {
      const testEmail = config?.testEmail || 'test@labournow.in'
      const result = await integration.testEmailConfiguration('sendgrid', testEmail)
      
      return {
        success: result.success,
        integration: 'email',
        test: 'send_email',
        result,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        integration: 'email',
        test: 'send_email',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  private async testSMSIntegration(integration: any, config?: any) {
    try {
      const testNumber = config?.testNumber || '+919876543210'
      const result = await integration.testSMSConfiguration('twilio', testNumber)
      
      return {
        success: result.success,
        integration: 'sms',
        test: 'send_sms',
        result,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        integration: 'sms',
        test: 'send_sms',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  // Configure integration
  async configureIntegration(integrationId: string, config: any) {
    const integration = this.integrations.get(integrationId)
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`)
    }

    try {
      // Validate configuration
      const validation = this.validateIntegrationConfig(integrationId, config)
      if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`)
      }

      // Save configuration (in a real implementation, this would go to a database)
      this.saveIntegrationConfig(integrationId, config)
      
      // Test the configuration
      const testResult = await this.testIntegration(integrationId, config)
      
      return {
        success: testResult.success,
        integration: integrationId,
        config,
        testResult,
        configuredAt: new Date().toISOString()
      }
    } catch (error) {
      throw error
    }
  }

  // Webhook Management
  async createWebhook(webhook: any) {
    const webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const webhookData = {
      id: webhookId,
      name: webhook.name,
      url: webhook.url,
      events: webhook.events || [],
      secret: webhook.secret || this.generateWebhookSecret(),
      active: webhook.active !== false,
      retryConfig: webhook.retryConfig || {
        maxRetries: 3,
        retryDelay: 1000,
        backoffMultiplier: 2
      },
      headers: webhook.headers || {},
      createdAt: new Date().toISOString(),
      lastTriggered: null,
      successCount: 0,
      failureCount: 0
    }

    this.webhooks.set(webhookId, webhookData)
    
    return webhookData
  }

  async triggerWebhook(event: string, data: any, integrationId?: string) {
    const relevantWebhooks = Array.from(this.webhooks.values()).filter(webhook => 
      webhook.active && webhook.events.includes(event)
    )

    const results = []

    for (const webhook of relevantWebhooks) {
      try {
        const result = await this.executeWebhook(webhook, event, data)
        results.push(result)
      } catch (error) {
        results.push({
          webhookId: webhook.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return {
      event,
      data,
      triggered: results.length,
      results
    }
  }

  private async executeWebhook(webhook: any, event: string, data: any) {
    const payload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      integrationId: data.integrationId,
      webhookId: webhook.id
    }

    const signature = this.generateWebhookSignature(JSON.stringify(payload), webhook.secret)

    let attempt = 0
    const maxRetries = webhook.retryConfig.maxRetries
    let lastError: any

    while (attempt <= maxRetries) {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': event,
            ...webhook.headers
          },
          body: JSON.stringify(payload)
        })

        if (response.ok) {
          webhook.successCount++
          webhook.lastTriggered = new Date().toISOString()
          return {
            webhookId: webhook.id,
            success: true,
            attempt: attempt + 1,
            statusCode: response.status
          }
        } else {
          throw new Error(`Webhook failed with status: ${response.status}`)
        }
      } catch (error) {
        lastError = error
        attempt++
        
        if (attempt <= maxRetries) {
          const delay = webhook.retryConfig.retryDelay * 
            Math.pow(webhook.retryConfig.backoffMultiplier, attempt - 1)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    webhook.failureCount++
    webhook.lastTriggered = new Date().toISOString()
    
    return {
      webhookId: webhook.id,
      success: false,
      attempt,
      error: lastError instanceof Error ? lastError.message : 'Unknown error'
    }
  }

  // Analytics Management
  async trackIntegrationEvent(integrationId: string, event: string, properties: any = {}) {
    const analyticsData = {
      integrationId,
      event,
      properties,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      sessionId: this.getSessionId()
    }

    // Store analytics data
    this.storeAnalyticsEvent(analyticsData)
    
    // Send to external analytics services
    await this.sendToAnalyticsServices(analyticsData)
    
    return analyticsData
  }

  // Get integration metrics
  async getIntegrationMetrics(integrationId: string, timeRange: string = '7d') {
    const metrics = {
      integrationId,
      timeRange,
      events: [],
      performance: {},
      errors: [],
      usage: {}
    }

    // Get analytics data for the time range
    const analyticsData = this.getAnalyticsData(integrationId, timeRange)
    
    // Process analytics data
    metrics.events = analyticsData.events || []
    metrics.performance = this.calculatePerformanceMetrics(analyticsData)
    metrics.errors = analyticsData.errors || []
    metrics.usage = this.calculateUsageMetrics(analyticsData)

    return metrics
  }

  // Health check for all integrations
  async performHealthCheck() {
    const healthStatus = {
      overall: 'healthy',
      integrations: {},
      timestamp: new Date().toISOString()
    }

    const integrationIds = Array.from(this.integrations.keys())
    
    for (const integrationId of integrationIds) {
      try {
        const health = await this.checkIntegrationHealth(integrationId)
        healthStatus.integrations[integrationId] = health
        
        if (health.status !== 'healthy') {
          healthStatus.overall = 'degraded'
        }
      } catch (error) {
        healthStatus.integrations[integrationId] = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
        healthStatus.overall = 'unhealthy'
      }
    }

    return healthStatus
  }

  // Helper methods
  private isIntegrationConfigured(integrationId: string): boolean {
    switch (integrationId) {
      case 'whatsapp':
        return !!process.env.WHATSAPP_API_KEY && !!process.env.WHATSAPP_PHONE_NUMBER_ID
      case 'google':
        return !!process.env.GOOGLE_MAPS_API_KEY && !!process.env.GOOGLE_ANALYTICS_ID
      case 'social':
        return !!process.env.GOOGLE_OAUTH_CLIENT_ID
      case 'payment':
        return !!process.env.RAZORPAY_KEY_ID || !!process.env.STRIPE_PUBLISHABLE_KEY
      case 'email':
        return !!process.env.SENDGRID_API_KEY || !!process.env.AWS_ACCESS_KEY_ID
      case 'sms':
        return !!process.env.TWILIO_ACCOUNT_SID || !!process.env.MSG91_AUTH_KEY
      default:
        return false
    }
  }

  private getIntegrationName(integrationId: string): string {
    const names = {
      whatsapp: 'WhatsApp Business',
      google: 'Google Services',
      social: 'Social Login',
      payment: 'Payment Gateways',
      email: 'Email Services',
      sms: 'SMS Gateways'
    }
    return names[integrationId] || integrationId
  }

  private getIntegrationFeatures(integrationId: string): string[] {
    const features = {
      whatsapp: ['messaging', 'media', 'templates', 'webhooks'],
      google: ['maps', 'analytics', 'oauth', 'drive', 'calendar'],
      social: ['oauth', 'profile', 'login'],
      payment: ['razorpay', 'stripe', 'upi', 'refunds'],
      email: ['sendgrid', 'ses', 'smtp', 'templates'],
      sms: ['twilio', 'msg91', 'otp', 'bulk']
    }
    return features[integrationId] || []
  }

  private getLastTestTime(integrationId: string): string | null {
    // In a real implementation, this would come from a database
    return localStorage.getItem(`integration_test_${integrationId}`) || null
  }

  private updateLastTestTime(integrationId: string, success: boolean) {
    localStorage.setItem(`integration_test_${integrationId}`, JSON.stringify({
      success,
      timestamp: new Date().toISOString()
    }))
  }

  private async checkIntegrationHealth(integrationId: string) {
    try {
      // Perform a basic health check
      const isConfigured = this.isIntegrationConfigured(integrationId)
      
      if (!isConfigured) {
        return {
          status: 'not_configured',
          message: 'Integration is not properly configured'
        }
      }

      // Try a simple test
      const testResult = await this.testIntegration(integrationId)
      
      return {
        status: testResult.success ? 'healthy' : 'unhealthy',
        lastTest: testResult.timestamp,
        lastTestSuccess: testResult.success,
        message: testResult.success ? 'Integration is working properly' : testResult.error
      }
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private validateIntegrationConfig(integrationId: string, config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    switch (integrationId) {
      case 'payment':
        if (!config.gateway) errors.push('Payment gateway is required')
        break
      case 'email':
        if (!config.provider) errors.push('Email provider is required')
        break
      case 'sms':
        if (!config.provider) errors.push('SMS provider is required')
        break
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  private saveIntegrationConfig(integrationId: string, config: any) {
    // In a real implementation, save to database
    localStorage.setItem(`integration_config_${integrationId}`, JSON.stringify({
      config,
      updatedAt: new Date().toISOString()
    }))
  }

  private generateWebhookSecret(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  private generateWebhookSignature(payload: string, secret: string): string {
    const crypto = require('crypto')
    return crypto.createHmac('sha256', secret).update(payload).digest('hex')
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('integration_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('integration_session_id', sessionId)
    }
    return sessionId
  }

  private storeAnalyticsEvent(eventData: any) {
    // In a real implementation, store in database or analytics service
    console.log('Analytics Event:', eventData)
  }

  private async sendToAnalyticsServices(eventData: any) {
    // Send to Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', eventData.event, {
        custom_parameter_1: eventData.integrationId,
        custom_parameter_2: eventData.properties,
        event_category: 'integration'
      })
    }

    // Send to other analytics services as needed
  }

  private getAnalyticsData(integrationId: string, timeRange: string): any {
    // In a real implementation, query analytics database
    return {
      events: [],
      errors: [],
      performance: {},
      usage: {}
    }
  }

  private calculatePerformanceMetrics(data: any): any {
    // Calculate performance metrics from analytics data
    return {
      avgResponseTime: 0,
      successRate: 0,
      errorRate: 0,
      throughput: 0
    }
  }

  private calculateUsageMetrics(data: any): any {
    // Calculate usage metrics from analytics data
    return {
      totalEvents: 0,
      uniqueUsers: 0,
      topEvents: [],
      peakHours: []
    }
  }

  private loadWebhooks() {
    // Load webhooks from storage
    const stored = localStorage.getItem('integration_webhooks')
    if (stored) {
      const webhooks = JSON.parse(stored)
      webhooks.forEach((webhook: any) => {
        this.webhooks.set(webhook.id, webhook)
      })
    }
  }

  private loadAnalytics() {
    // Load analytics configuration
    const stored = localStorage.getItem('integration_analytics')
    if (stored) {
      this.analytics = JSON.parse(stored)
    }
  }
}

// Export singleton instance
export const integrationManager = new IntegrationManager()

// Export individual methods for easier usage
export const {
  getIntegrationStatus,
  getAllIntegrationStatus,
  testIntegration,
  configureIntegration,
  createWebhook,
  triggerWebhook,
  trackIntegrationEvent,
  getIntegrationMetrics,
  performHealthCheck
} = integrationManager

export default integrationManager