// WhatsApp Business API Integration for LabourNow
export class WhatsAppBusinessAPI {
  private apiKey: string
  private phoneNumberId: string
  private version: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.WHATSAPP_API_KEY || ''
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || ''
    this.version = process.env.WHATSAPP_API_VERSION || 'v18.0'
    this.baseUrl = `https://graph.facebook.com/${this.version}`
  }

  // Send text message
  async sendTextMessage(to: string, message: string, options?: any) {
    const payload = {
      messaging_product: 'whatsapp',
      to: to.replace(/[^\d]/g, ''), // Remove non-digits
      text: {
        body: message
      },
      ...options
    }

    return this.makeRequest('/messages', payload)
  }

  // Send media message (image, document, audio, video)
  async sendMediaMessage(
    to: string, 
    mediaType: 'image' | 'document' | 'audio' | 'video', 
    mediaUrl: string, 
    caption?: string,
    options?: any
  ) {
    const payload = {
      messaging_product: 'whatsapp',
      to: to.replace(/[^\d]/g, ''),
      [mediaType]: {
        link: mediaUrl,
        ...(caption && { caption })
      },
      ...options
    }

    return this.makeRequest('/messages', payload)
  }

  // Send template message
  async sendTemplateMessage(
    to: string, 
    templateName: string, 
    languageCode: string = 'en',
    components?: any[]
  ) {
    const payload = {
      messaging_product: 'whatsapp',
      to: to.replace(/[^\d]/g, ''),
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode
        },
        components: components || []
      }
    }

    return this.makeRequest('/messages', payload)
  }

  // Send location message
  async sendLocationMessage(
    to: string,
    latitude: number,
    longitude: number,
    name: string,
    address?: string
  ) {
    const payload = {
      messaging_product: 'whatsapp',
      to: to.replace(/[^\d]/g, ''),
      location: {
        latitude,
        longitude,
        name,
        address
      }
    }

    return this.makeRequest('/messages', payload)
  }

  // Send contact message
  async sendContactMessage(to: string, contacts: any[]) {
    const payload = {
      messaging_product: 'whatsapp',
      to: to.replace(/[^\d]/g, ''),
      contacts
    }

    return this.makeRequest('/messages', payload)
  }

  // Send interactive message (buttons, list)
  async sendInteractiveMessage(
    to: string,
    type: 'button' | 'list',
    header?: any,
    body: any,
    footer?: any,
    action: any
  ) {
    const payload = {
      messaging_product: 'whatsapp',
      to: to.replace(/[^\d]/g, ''),
      type: 'interactive',
      interactive: {
        type,
        ...(header && { header }),
        body,
        ...(footer && { footer }),
        action
      }
    }

    return this.makeRequest('/messages', payload)
  }

  // Send reaction message
  async sendReactionMessage(to: string, messageId: string, emoji: string) {
    const payload = {
      messaging_product: 'whatsapp',
      to: to.replace(/[^\d]/g, ''),
      type: 'reaction',
      reaction: {
        message_id: messageId,
        emoji
      }
    }

    return this.makeRequest('/messages', payload)
  }

  // Mark message as read
  async markMessageAsRead(messageId: string) {
    const payload = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId
    }

    return this.makeRequest('/messages', payload)
  }

  // Create QR code for WhatsApp
  async createQRCode(message: string, prefilledMessage?: string) {
    const payload = {
      generate_qr_code: message,
      ...(prefilledMessage && { prefilled_message: prefilledMessage })
    }

    return this.makeRequest('/message_qrdls', payload)
  }

  // Get QR code status
  async getQRCodeStatus(qrCodeId: string) {
    return this.makeRequest(`/message_qrdls/${qrCodeId}`)
  }

  // Verify webhook signature
  verifyWebhookSignature(body: string, signature: string, appSecret: string): boolean {
    const hmac = require('crypto').createHmac('sha256', appSecret)
    const expectedSignature = 'sha256=' + hmac.update(body).digest('hex')
    return signature === expectedSignature
  }

  // Handle incoming webhook
  handleWebhook(body: any) {
    const entries = body.entry || []
    const messages: any[] = []

    for (const entry of entries) {
      const changes = entry.changes || []
      
      for (const change of changes) {
        if (change.field === 'messages') {
          const value = change.value
          
          if (value.messages && value.messages.length > 0) {
            for (const message of value.messages) {
              messages.push({
                messageId: message.id,
                from: message.from,
                timestamp: message.timestamp,
                type: message.type,
                text: message.text?.body,
                media: message.image || message.document || message.audio || message.video,
                location: message.location,
                contacts: message.contacts,
                interactive: message.interactive,
                reaction: message.reaction,
                referrer: message.referrer,
                context: message.context,
                metadata: {
                  phoneNumberId: value.metadata.phone_number_id,
                  displayPhoneNumber: value.metadata.display_phone_number
                }
              })
            }
          }
        } else if (change.field === 'message_template_status_update') {
          // Handle template status updates
          console.log('Template status update:', change.value)
        }
      }
    }

    return messages
  }

  // Send booking confirmation
  async sendBookingConfirmation(to: string, bookingDetails: any) {
    const templateData = [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: bookingDetails.bookingNumber
          },
          {
            type: 'text',
            text: bookingDetails.category
          },
          {
            type: 'text',
            text: bookingDetails.date
          },
          {
            type: 'text',
            text: bookingDetails.location
          },
          {
            type: 'text',
            text: `₹${bookingDetails.totalAmount}`
          }
        ]
      },
      {
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [
          {
            type: 'text',
            text: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${bookingDetails.id}`
          }
        ]
      }
    ]

    return this.sendTemplateMessage(
      to,
      'booking_confirmation',
      'en',
      templateData
    )
  }

  // Send payment reminder
  async sendPaymentReminder(to: string, paymentDetails: any) {
    const templateData = [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: paymentDetails.bookingNumber
          },
          {
            type: 'text',
            text: `₹${paymentDetails.amount}`
          },
          {
            type: 'text',
            text: paymentDetails.dueDate
          }
        ]
      },
      {
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [
          {
            type: 'text',
            text: `${process.env.NEXT_PUBLIC_APP_URL}/payments/${paymentDetails.id}`
          }
        ]
      }
    ]

    return this.sendTemplateMessage(
      to,
      'payment_reminder',
      'en',
      templateData
    )
  }

  // Send job alert
  async sendJobAlert(to: string, jobDetails: any) {
    const message = `🔔 New Job Alert!\n\n` +
      `📋 Position: ${jobDetails.category}\n` +
      `📍 Location: ${jobDetails.location}\n` +
      `📅 Date: ${jobDetails.date}\n` +
      `⏰ Duration: ${jobDetails.duration}\n` +
      `💰 Pay: ₹${jobDetails.totalAmount}\n\n` +
      `Interested? View details: ${process.env.NEXT_PUBLIC_APP_URL}/jobs/${jobDetails.id}`

    return this.sendTextMessage(to, message)
  }

  // Send worker availability update
  async sendAvailabilityUpdate(to: string, workerDetails: any) {
    const status = workerDetails.isAvailable ? '✅ Available' : '❌ Unavailable'
    const message = `${status}\n\n` +
      `👷 Worker: ${workerDetails.name}\n` +
      `🔧 Category: ${workerDetails.category}\n` +
      `📍 Location: ${workerDetails.location}\n` +
      `⭐ Rating: ${workerDetails.rating}/5\n` +
      `💰 Rate: ₹${workerDetails.hourlyWage}/hour\n\n` +
      `Book now: ${process.env.NEXT_PUBLIC_APP_URL}/labour/${workerDetails.id}`

    return this.sendTextMessage(to, message)
  }

  // Send verification code
  async sendVerificationCode(to: string, code: string) {
    const message = `🔐 Your LabourNow verification code is: ${code}\n\n` +
      `This code will expire in 10 minutes.\n` +
      `Please do not share this code with anyone.`

    return this.sendTextMessage(to, message)
  }

  // Send support message
  async sendSupportMessage(to: string, subject: string, message: string) {
    const fullMessage = `📞 Support Message\n\n` +
      `Subject: ${subject}\n` +
      `Message: ${message}\n\n` +
      `For immediate assistance, call us at: ${process.env.SUPPORT_PHONE}`

    return this.sendTextMessage(to, fullMessage)
  }

  // Make API request
  private async makeRequest(endpoint: string, payload: any) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`WhatsApp API Error: ${response.status} - ${errorData.error?.message || response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('WhatsApp API Error:', error)
      throw error
    }
  }

  // Get phone number info
  async getPhoneNumberInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get phone number info: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting phone number info:', error)
      throw error
    }
  }

  // Get message templates
  async getMessageTemplates() {
    try {
      const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/message_templates`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get message templates: ${response.status}`)
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error getting message templates:', error)
      throw error
    }
  }

  // Check phone number verification status
  async checkVerificationStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}?fields=verified_name`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to check verification status: ${response.status}`)
      }

      const data = await response.json()
      return data.verified_name ? 'verified' : 'not_verified'
    } catch (error) {
      console.error('Error checking verification status:', error)
      throw error
    }
  }
}

// Export singleton instance
export const whatsappAPI = new WhatsAppBusinessAPI()

// Export individual methods for easier usage
export const {
  sendTextMessage,
  sendMediaMessage,
  sendTemplateMessage,
  sendLocationMessage,
  sendContactMessage,
  sendInteractiveMessage,
  sendReactionMessage,
  markMessageAsRead,
  createQRCode,
  getQRCodeStatus,
  verifyWebhookSignature,
  handleWebhook,
  sendBookingConfirmation,
  sendPaymentReminder,
  sendJobAlert,
  sendAvailabilityUpdate,
  sendVerificationCode,
  sendSupportMessage
} = whatsappAPI

export default whatsappAPI