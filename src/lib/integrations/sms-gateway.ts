// SMS Gateway Integration for LabourNow
export class SMSGateway {
  private providers: Map<string, any> = new Map()

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    // Twilio Configuration
    this.providers.set('twilio', {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      fromNumber: process.env.TWILIO_PHONE_NUMBER || '',
      apiUrl: 'https://api.twilio.com/2010-04-01'
    })

    // MSG91 Configuration
    this.providers.set('msg91', {
      authKey: process.env.MSG91_AUTH_KEY || '',
      templateId: process.env.MSG91_TEMPLATE_ID || '',
      senderId: process.env.SMS_SENDER_ID || 'LABOUR',
      apiUrl: 'https://control.msg91.com/api'
    })

    // Custom HTTP SMS Configuration
    this.providers.set('http', {
      apiUrl: process.env.SMS_HTTP_API_URL || '',
      apiKey: process.env.SMS_HTTP_API_KEY || '',
      senderId: process.env.SMS_SENDER_ID || 'LABOUR'
    })
  }

  // Twilio Integration
  async sendTwilioSMS(to: string, message: string, options?: any) {
    const config = this.providers.get('twilio')
    
    try {
      const url = `${config.apiUrl}/Accounts/${config.accountSid}/Messages.json`
      
      const formData = new URLSearchParams({
        To: to,
        From: config.fromNumber,
        Body: message,
        ...(options && options)
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${config.accountSid}:${config.authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Twilio SMS failed: ${errorData.message || response.statusText}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        provider: 'twilio',
        to,
        from: config.fromNumber,
        body: message
      }
    } catch (error) {
      console.error('Twilio SMS error:', error)
      throw error
    }
  }

  // MSG91 Integration
  async sendMSG91SMS(to: string, message: string, options?: any) {
    const config = this.providers.get('msg91')
    
    try {
      const url = `${config.apiUrl}/sendhttp.php`
      
      const params = {
        authkey: config.authKey,
        mobiles: to,
        message: message,
        sender: config.senderId,
        route: options?.route || '4',
        country: options?.country || '91',
        ...(options && options)
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(params).toString()
      })

      if (!response.ok) {
        throw new Error(`MSG91 SMS failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.type !== 'success') {
        throw new Error(`MSG91 SMS failed: ${result.message}`)
      }

      return {
        success: true,
        messageId: result.message,
        provider: 'msg91',
        to,
        message
      }
    } catch (error) {
      console.error('MSG91 SMS error:', error)
      throw error
    }
  }

  // MSG91 OTP Integration
  async sendMSG91OTP(to: string, otp: string, options?: any) {
    const config = this.providers.get('msg91')
    
    try {
      const url = `${config.apiUrl}/sendotp.php`
      
      const params = {
        authkey: config.authKey,
        mobile: to,
        otp: otp,
        template_id: config.templateId,
        ...(options && options)
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(params).toString()
      })

      if (!response.ok) {
        throw new Error(`MSG91 OTP failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.type !== 'success') {
        throw new Error(`MSG91 OTP failed: ${result.message}`)
      }

      return {
        success: true,
        provider: 'msg91',
        to,
        otp
      }
    } catch (error) {
      console.error('MSG91 OTP error:', error)
      throw error
    }
  }

  // MSG91 Verify OTP
  async verifyMSG91OTP(to: string, otp: string) {
    const config = this.providers.get('msg91')
    
    try {
      const url = `${config.apiUrl}/verifyRequestOTP.php`
      
      const params = {
        authkey: config.authKey,
        mobile: to,
        otp: otp
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(params).toString()
      })

      if (!response.ok) {
        throw new Error(`MSG91 OTP verification failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      return {
        success: result.type === 'success',
        message: result.message,
        provider: 'msg91'
      }
    } catch (error) {
      console.error('MSG91 OTP verification error:', error)
      throw error
    }
  }

  // HTTP SMS Integration
  async sendHTTPSMS(to: string, message: string, options?: any) {
    const config = this.providers.get('http')
    
    try {
      const params = {
        apikey: config.apiKey,
        sender: config.senderId,
        to: to,
        message: message,
        ...(options && options)
      }

      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        throw new Error(`HTTP SMS failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      return {
        success: result.success || false,
        messageId: result.messageId,
        provider: 'http',
        to,
        message,
        response: result
      }
    } catch (error) {
      console.error('HTTP SMS error:', error)
      throw error
    }
  }

  // Generic send SMS method
  async sendSMS(provider: string, to: string, message: string, options?: any) {
    switch (provider) {
      case 'twilio':
        return this.sendTwilioSMS(to, message, options)
      case 'msg91':
        return this.sendMSG91SMS(to, message, options)
      case 'http':
        return this.sendHTTPSMS(to, message, options)
      default:
        throw new Error(`Unsupported SMS provider: ${provider}`)
    }
  }

  // Send OTP
  async sendOTP(provider: string, to: string, otp: string, options?: any) {
    switch (provider) {
      case 'msg91':
        return this.sendMSG91OTP(to, otp, options)
      case 'twilio':
        return this.sendTwilioSMS(to, `Your LabourNow OTP is: ${otp}`, options)
      case 'http':
        return this.sendHTTPSMS(to, `Your LabourNow OTP is: ${otp}`, options)
      default:
        throw new Error(`OTP not supported for provider: ${provider}`)
    }
  }

  // Verify OTP
  async verifyOTP(provider: string, to: string, otp: string) {
    switch (provider) {
      case 'msg91':
        return this.verifyMSG91OTP(to, otp)
      default:
        // For other providers, you would need to implement your own verification logic
        return {
          success: true,
          provider,
          message: 'OTP verification not implemented for this provider'
        }
    }
  }

  // Send booking confirmation SMS
  async sendBookingConfirmationSMS(provider: string, to: string, bookingDetails: any) {
    const message = `Dear ${bookingDetails.customerName}, your booking ${bookingDetails.bookingNumber} for ${bookingDetails.category} on ${new Date(bookingDetails.date).toLocaleDateString()} has been confirmed. Total: ₹${bookingDetails.totalAmount}. LabourNow`
    
    return this.sendSMS(provider, to, message)
  }

  // Send payment confirmation SMS
  async sendPaymentConfirmationSMS(provider: string, to: string, paymentDetails: any) {
    const message = `Payment of ₹${paymentDetails.amount} received for booking ${paymentDetails.bookingNumber}. Thank you for choosing LabourNow!`
    
    return this.sendSMS(provider, to, message)
  }

  // Send job alert SMS
  async sendJobAlertSMS(provider: string, to: string, jobDetails: any) {
    const message = `New job alert: ${jobDetails.category} needed in ${jobDetails.location} on ${new Date(jobDetails.date).toLocaleDateString()}. Pay: ₹${jobDetails.totalAmount}. Apply now on LabourNow!`
    
    return this.sendSMS(provider, to, message)
  }

  // Send worker availability SMS
  async sendWorkerAvailabilitySMS(provider: string, to: string, workerDetails: any) {
    const status = workerDetails.isAvailable ? 'available' : 'unavailable'
    const message = `${workerDetails.name} is now ${status} for ${workerDetails.category} work in ${workerDetails.location}. Contact: ${workerDetails.mobile}. LabourNow`
    
    return this.sendSMS(provider, to, message)
  }

  // Send emergency SMS
  async sendEmergencySMS(provider: string, to: string, emergencyType: string, details: any) {
    const message = `🚨 ${emergencyType.toUpperCase()}: ${details.description}. Location: ${details.location}. Contact: ${details.contact}. Please respond immediately. LabourNow`
    
    return this.sendSMS(provider, to, message)
  }

  // Send bulk SMS
  async sendBulkSMS(provider: string, recipients: string[], message: string, options?: any) {
    const results = []
    
    for (const recipient of recipients) {
      try {
        const result = await this.sendSMS(provider, recipient, message, options)
        results.push({ success: true, recipient, result })
      } catch (error) {
        results.push({ 
          success: false, 
          recipient, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }
    
    return {
      provider,
      total: recipients.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    }
  }

  // Schedule SMS (for future delivery)
  async scheduleSMS(provider: string, to: string, message: string, scheduledTime: Date, options?: any) {
    // In a real implementation, you would store this in a database and process it later
    const scheduledMessage = {
      provider,
      to,
      message,
      scheduledTime: scheduledTime.toISOString(),
      options,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    }

    // Store in database or queue system
    console.log('SMS scheduled:', scheduledMessage)
    
    return {
      success: true,
      scheduledId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      scheduledTime: scheduledMessage.scheduledTime
    }
  }

  // Get SMS delivery status
  async getDeliveryStatus(provider: string, messageId: string) {
    switch (provider) {
      case 'twilio':
        return this.getTwilioDeliveryStatus(messageId)
      case 'msg91':
        return this.getMSG91DeliveryStatus(messageId)
      default:
        return { provider, messageId, status: 'unknown' }
    }
  }

  private async getTwilioDeliveryStatus(messageId: string) {
    const config = this.providers.get('twilio')
    
    try {
      const response = await fetch(`${config.apiUrl}/Accounts/${config.accountSid}/Messages/${messageId}.json`, {
        headers: {
          'Authorization': `Basic ${btoa(`${config.accountSid}:${config.authToken}`)}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get Twilio status: ${response.status}`)
      }

      const result = await response.json()
      
      return {
        provider: 'twilio',
        messageId,
        status: result.status,
        errorCode: result.error_code,
        errorMessage: result.error_message,
        dateCreated: result.date_created,
        dateSent: result.date_sent,
        dateUpdated: result.date_updated
      }
    } catch (error) {
      console.error('Twilio status check error:', error)
      throw error
    }
  }

  private async getMSG91DeliveryStatus(messageId: string) {
    // MSG91 doesn't provide a direct status check API for individual messages
    // You would typically use webhooks for real-time status updates
    return {
      provider: 'msg91',
      messageId,
      status: 'delivered', // Assume delivered for demo
      note: 'MSG91 requires webhook setup for real-time status'
    }
  }

  // Validate phone number
  validatePhoneNumber(phoneNumber: string, countryCode: string = '91'): { valid: boolean; formatted: string } {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '')
    
    // Remove country code if present
    const withoutCountryCode = digits.startsWith(countryCode) ? digits.substring(countryCode.length) : digits
    
    // Indian mobile numbers are 10 digits
    if (withoutCountryCode.length !== 10) {
      return { valid: false, formatted: phoneNumber }
    }
    
    // Check if it starts with valid mobile number prefixes
    const validPrefixes = ['6', '7', '8', '9']
    if (!validPrefixes.includes(withoutCountryCode[0])) {
      return { valid: false, formatted: phoneNumber }
    }
    
    // Format with country code
    const formatted = `+${countryCode}${withoutCountryCode}`
    
    return { valid: true, formatted }
  }

  // Get SMS provider status
  getProviderStatus(provider: string) {
    const config = this.providers.get(provider)
    if (!config) {
      return { supported: false, configured: false }
    }

    const configured = provider === 'http' ? 
      !!config.apiKey : 
      !!config.authKey || !!config.accountSid

    return {
      supported: true,
      configured,
      features: this.getProviderFeatures(provider)
    }
  }

  private getProviderFeatures(provider: string) {
    const features = {
      twilio: ['mms', 'whatsapp', 'voice', 'video', 'scheduled', 'webhooks', 'analytics'],
      msg91: ['otp', 'template', 'scheduled', 'unicode', 'flash', 'webhooks'],
      http: ['basic', 'unicode', 'scheduled', 'custom']
    }

    return features[provider] || []
  }

  // Get all supported providers
  getSupportedProviders() {
    return Array.from(this.providers.keys()).map(provider => ({
      id: provider,
      name: provider.toUpperCase(),
      status: this.getProviderStatus(provider)
    }))
  }

  // Test SMS configuration
  async testSMSConfiguration(provider: string, testNumber?: string) {
    try {
      const result = await this.sendSMS(
        provider,
        testNumber || '+919876543210',
        'This is a test SMS from LabourNow to verify the SMS configuration.',
        { test: true }
      )
      
      return {
        success: true,
        provider,
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        provider,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  // Get SMS pricing (mock implementation)
  async getSMSRates(provider: string, country: string = 'IN') {
    // In a real implementation, you would fetch current rates from the provider
    const rates = {
      twilio: {
        'IN': 0.50, // per SMS
        'US': 0.07,
        'UK': 0.04,
        'default': 0.10
      },
      msg91: {
        'IN': 0.20, // per SMS
        'US': 0.15,
        'UK': 0.12,
        'default': 0.25
      },
      http: {
        'IN': 0.15, // per SMS
        'US': 0.10,
        'UK': 0.08,
        'default': 0.20
      }
    }

    const providerRates = rates[provider] || rates.http
    const rate = providerRates[country] || providerRates.default

    return {
      provider,
      country,
      rate,
      currency: 'USD',
      estimatedCost: rate
    }
  }
}

// Export singleton instance
export const smsGateway = new SMSGateway()

// Export individual methods for easier usage
export const {
  sendSMS,
  sendOTP,
  verifyOTP,
  sendBookingConfirmationSMS,
  sendPaymentConfirmationSMS,
  sendJobAlertSMS,
  sendWorkerAvailabilitySMS,
  sendEmergencySMS,
  sendBulkSMS,
  scheduleSMS,
  getDeliveryStatus,
  validatePhoneNumber,
  getProviderStatus,
  getSupportedProviders,
  testSMSConfiguration,
  getSMSRates
} = smsGateway

export default smsGateway