// Payment Gateway Integration for LabourNow
export class PaymentGateway {
  private gateways: Map<string, any> = new Map()

  constructor() {
    this.initializeGateways()
  }

  private initializeGateways() {
    // Razorpay Configuration
    this.gateways.set('razorpay', {
      keyId: process.env.RAZORPAY_KEY_ID || '',
      keySecret: process.env.RAZORPAY_KEY_SECRET || '',
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
      apiUrl: 'https://api.razorpay.com/v1'
    })

    // Stripe Configuration
    this.gateways.set('stripe', {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      apiUrl: 'https://api.stripe.com/v1'
    })

    // UPI Configuration
    this.gateways.set('upi', {
      merchantId: process.env.UPI_MERCHANT_ID || '',
      merchantKey: process.env.UPI_MERCHANT_KEY || '',
      callbackUrl: process.env.UPI_CALLBACK_URL || '',
      supportedApps: ['paytm', 'phonepe', 'gpay', 'upi', 'bhim']
    })
  }

  // Razorpay Integration
  async createRazorpayOrder(amount: number, currency: string = 'INR', receipt?: string, notes?: any) {
    const config = this.gateways.get('razorpay')
    
    try {
      const response = await fetch(`${config.apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${config.keyId}:${config.keySecret}`)}`
        },
        body: JSON.stringify({
          amount: amount * 100, // Razorpay expects amount in paise
          currency,
          receipt: receipt || `order_${Date.now()}`,
          notes: notes || {},
          payment_capture: 1
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Razorpay order creation failed: ${errorData.error?.description || response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Razorpay order error:', error)
      throw error
    }
  }

  async captureRazorpayPayment(paymentId: string, amount: number) {
    const config = this.gateways.get('razorpay')
    
    try {
      const response = await fetch(`${config.apiUrl}/payments/${paymentId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${config.keyId}:${config.keySecret}`)}`
        },
        body: JSON.stringify({
          amount: amount * 100
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Razorpay payment capture failed: ${errorData.error?.description || response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Razorpay capture error:', error)
      throw error
    }
  }

  async verifyRazorpayPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) {
    const config = this.gateways.get('razorpay')
    
    try {
      const crypto = require('crypto')
      const body = `${razorpayOrderId}|${razorpayPaymentId}`
      
      const expectedSignature = crypto
        .createHmac('sha256', config.keySecret)
        .update(body.toString())
        .digest('hex')

      return expectedSignature === razorpaySignature
    } catch (error) {
      console.error('Razorpay verification error:', error)
      return false
    }
  }

  // Stripe Integration
  async createStripePaymentIntent(amount: number, currency: string = 'inr', metadata?: any) {
    const config = this.gateways.get('stripe')
    
    try {
      const response = await fetch(`${config.apiUrl}/payment_intents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount * 100, // Stripe expects amount in cents
          currency,
          metadata: metadata || {},
          automatic_payment_methods: {
            enabled: true
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Stripe payment intent creation failed: ${errorData.error?.message || response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Stripe payment intent error:', error)
      throw error
    }
  }

  async confirmStripePayment(paymentIntentId: string) {
    const config = this.gateways.get('stripe')
    
    try {
      const response = await fetch(`${config.apiUrl}/payment_intents/${paymentIntentId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Stripe payment confirmation failed: ${errorData.error?.message || response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Stripe confirmation error:', error)
      throw error
    }
  }

  async retrieveStripePayment(paymentIntentId: string) {
    const config = this.gateways.get('stripe')
    
    try {
      const response = await fetch(`${config.apiUrl}/payment_intents/${paymentIntentId}`, {
        headers: {
          'Authorization': `Bearer ${config.secretKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to retrieve Stripe payment: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Stripe retrieve error:', error)
      throw error
    }
  }

  // UPI Integration
  async initiateUPIPayment(upiId: string, amount: number, transactionNote: string = 'LabourNow Payment') {
    const config = this.gateways.get('upi')
    
    try {
      // Generate transaction ID
      const transactionId = `LABOURNOW_${Date.now()}`
      
      // Create UPI payment URL
      const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent('LabourNow')}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${transactionId}&mc=${config.merchantId}`

      return {
        upiUrl,
        transactionId,
        merchantId: config.merchantId,
        amount,
        note: transactionNote
      }
    } catch (error) {
      console.error('UPI initiation error:', error)
      throw error
    }
  }

  async generateUPIQRCode(upiId: string, amount: number, transactionNote: string) {
    const config = this.gateways.get('upi')
    
    try {
      const transactionId = `LABOURNOW_${Date.now()}`
      
      // UPI QR code URL format
      const qrData = `upi://pay?pa=${upiId}&pn=${encodeURIComponent('LabourNow')}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${transactionId}&mc=${config.merchantId}`

      // Generate QR code (you would use a QR code library in production)
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`

      return {
        qrCodeUrl,
        upiUrl: qrData,
        transactionId,
        amount
      }
    } catch (error) {
      console.error('UPI QR code generation error:', error)
      throw error
    }
  }

  async verifyUPITransaction(transactionId: string) {
    // In a real implementation, you would check with your payment gateway
    // This is a mock implementation
    try {
      // Simulate API call to verify transaction status
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock verification - in production, check with actual UPI provider
      const isVerified = Math.random() > 0.2 // 80% success rate for demo
      
      return {
        verified: isVerified,
        transactionId,
        status: isVerified ? 'success' : 'pending'
      }
    } catch (error) {
      console.error('UPI verification error:', error)
      throw error
    }
  }

  // Generic Payment Methods
  async processPayment(gateway: string, paymentData: any) {
    switch (gateway) {
      case 'razorpay':
        return this.processRazorpayPayment(paymentData)
      case 'stripe':
        return this.processStripePayment(paymentData)
      case 'upi':
        return this.processUPIPayment(paymentData)
      default:
        throw new Error(`Unsupported payment gateway: ${gateway}`)
    }
  }

  private async processRazorpayPayment(paymentData: any) {
    const { amount, currency, receipt, notes } = paymentData
    
    // Create order
    const order = await this.createRazorpayOrder(amount, currency, receipt, notes)
    
    return {
      gateway: 'razorpay',
      orderId: order.id,
      amount,
      currency,
      keyId: this.gateways.get('razorpay').keyId,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/razorpay/callback`
    }
  }

  private async processStripePayment(paymentData: any) {
    const { amount, currency, metadata } = paymentData
    
    // Create payment intent
    const paymentIntent = await this.createStripePaymentIntent(amount, currency, metadata)
    
    return {
      gateway: 'stripe',
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      currency,
      publishableKey: this.gateways.get('stripe').publishableKey
    }
  }

  private async processUPIPayment(paymentData: any) {
    const { upiId, amount, note } = paymentData
    
    // Initiate UPI payment
    const upiPayment = await this.initiateUPIPayment(upiId, amount, note)
    
    return {
      gateway: 'upi',
      upiUrl: upiPayment.upiUrl,
      transactionId: upiPayment.transactionId,
      amount,
      note
    }
  }

  // Webhook Handling
  async handleWebhook(gateway: string, signature: string, payload: any) {
    switch (gateway) {
      case 'razorpay':
        return this.handleRazorpayWebhook(signature, payload)
      case 'stripe':
        return this.handleStripeWebhook(signature, payload)
      default:
        throw new Error(`Webhook handling not implemented for gateway: ${gateway}`)
    }
  }

  private async handleRazorpayWebhook(signature: string, payload: any) {
    const config = this.gateways.get('razorpay')
    
    // Verify webhook signature
    const crypto = require('crypto')
    const receivedSignature = signature
    const expectedSignature = crypto
      .createHmac('sha256', config.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex')

    if (receivedSignature !== expectedSignature) {
      throw new Error('Invalid Razorpay webhook signature')
    }

    // Process webhook event
    const event = payload.event
    const payment = payload.payload.payment.entity

    switch (event) {
      case 'payment.authorized':
        return {
          event: 'authorized',
          paymentId: payment.id,
          orderId: payment.order_id,
          amount: payment.amount / 100,
          status: 'authorized'
        }

      case 'payment.captured':
        return {
          event: 'captured',
          paymentId: payment.id,
          orderId: payment.order_id,
          amount: payment.amount / 100,
          status: 'captured',
          method: payment.method,
          email: payment.email,
          contact: payment.contact
        }

      case 'payment.failed':
        return {
          event: 'failed',
          paymentId: payment.id,
          orderId: payment.order_id,
          amount: payment.amount / 100,
          status: 'failed',
          error: payment.error_description,
          reason: payment.reason
        }

      default:
        return { event, payment }
    }
  }

  private async handleStripeWebhook(signature: string, payload: any) {
    const config = this.gateways.get('stripe')
    const crypto = require('crypto')
    
    // Verify webhook signature
    const payloadString = JSON.stringify(payload, null, 2)
    const expectedSignature = crypto
      .createHmac('sha256', config.webhookSecret)
      .update(payloadString, 'utf8')
      .digest('hex')

    const receivedSignature = signature.split(',')[1] // Remove "t=" prefix
    
    if (receivedSignature !== expectedSignature) {
      throw new Error('Invalid Stripe webhook signature')
    }

    // Process webhook event
    const eventType = payload.type
    const eventObject = payload.data.object

    switch (eventType) {
      case 'payment_intent.succeeded':
        return {
          event: 'succeeded',
          paymentIntentId: eventObject.id,
          amount: eventObject.amount / 100,
          currency: eventObject.currency,
          status: 'succeeded',
          paymentMethod: eventObject.payment_method_types[0],
          metadata: eventObject.metadata
        }

      case 'payment_intent.payment_failed':
        return {
          event: 'failed',
          paymentIntentId: eventObject.id,
          amount: eventObject.amount / 100,
          currency: eventObject.currency,
          status: 'failed',
          lastPaymentError: eventObject.last_payment_error
        }

      case 'payment_intent.canceled':
        return {
          event: 'canceled',
          paymentIntentId: eventObject.id,
          status: 'canceled'
        }

      default:
        return { eventType, eventObject }
    }
  }

  // Refund Processing
  async processRefund(gateway: string, paymentId: string, amount?: number, reason?: string) {
    switch (gateway) {
      case 'razorpay':
        return this.processRazorpayRefund(paymentId, amount, reason)
      case 'stripe':
        return this.processStripeRefund(paymentId, amount, reason)
      default:
        throw new Error(`Refund not implemented for gateway: ${gateway}`)
    }
  }

  private async processRazorpayRefund(paymentId: string, amount?: number, reason?: string) {
    const config = this.gateways.get('razorpay')
    
    try {
      const refundData: any = {
        payment_id: paymentId
      }

      if (amount) {
        refundData.amount = amount * 100 // Convert to paise
      }

      if (reason) {
        refundData.notes = {
          reason
        }
      }

      const response = await fetch(`${config.apiUrl}/refunds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${config.keyId}:${config.keySecret}`)}`
        },
        body: JSON.stringify(refundData)
      })

      if (!response.ok) {
        throw new Error(`Razorpay refund failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Razorpay refund error:', error)
      throw error
    }
  }

  private async processStripeRefund(paymentIntentId: string, amount?: number, reason?: string) {
    const config = this.gateways.get('stripe')
    
    try {
      const refundData: any = {
        payment_intent: paymentIntentId
      }

      if (amount) {
        refundData.amount = amount * 100 // Convert to cents
      }

      if (reason) {
        refundData.reason = reason
      }

      const response = await fetch(`${config.apiUrl}/refunds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(refundData)
      })

      if (!response.ok) {
        throw new Error(`Stripe refund failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Stripe refund error:', error)
      throw error
    }
  }

  // Get supported payment methods
  getSupportedPaymentMethods() {
    return [
      {
        id: 'razorpay',
        name: 'Razorpay',
        type: 'gateway',
        supported: !!this.gateways.get('razorpay').keyId,
        features: ['cards', 'upi', 'wallets', 'netbanking'],
        icon: '/icons/payments/razorpay.png'
      },
      {
        id: 'stripe',
        name: 'Stripe',
        type: 'gateway',
        supported: !!this.gateways.get('stripe').secretKey,
        features: ['cards', 'apple_pay', 'google_pay'],
        icon: '/icons/payments/stripe.png'
      },
      {
        id: 'upi',
        name: 'UPI',
        type: 'direct',
        supported: !!this.gateways.get('upi').merchantId,
        features: ['upi_apps', 'qr_code'],
        icon: '/icons/payments/upi.png'
      }
    ]
  }

  // Validate payment gateway configuration
  validateGatewayConfig(gateway: string): { valid: boolean; errors: string[] } {
    const config = this.gateways.get(gateway)
    const errors: string[] = []

    if (!config) {
      errors.push(`Payment gateway ${gateway} is not supported`)
      return { valid: false, errors }
    }

    switch (gateway) {
      case 'razorpay':
        if (!config.keyId) errors.push('Razorpay Key ID is missing')
        if (!config.keySecret) errors.push('Razorpay Key Secret is missing')
        break

      case 'stripe':
        if (!config.publishableKey) errors.push('Stripe Publishable Key is missing')
        if (!config.secretKey) errors.push('Stripe Secret Key is missing')
        break

      case 'upi':
        if (!config.merchantId) errors.push('UPI Merchant ID is missing')
        break
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Export singleton instance
export const paymentGateway = new PaymentGateway()

// Export individual methods for easier usage
export const {
  createRazorpayOrder,
  captureRazorpayPayment,
  verifyRazorpayPayment,
  createStripePaymentIntent,
  confirmStripePayment,
  retrieveStripePayment,
  initiateUPIPayment,
  generateUPIQRCode,
  verifyUPITransaction,
  processPayment,
  handleWebhook,
  processRefund,
  getSupportedPaymentMethods,
  validateGatewayConfig
} = paymentGateway

export default paymentGateway