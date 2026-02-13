// Email Service Integration for LabourNow
export class EmailService {
  private providers: Map<string, any> = new Map()

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    // SendGrid Configuration
    this.providers.set('sendgrid', {
      apiKey: process.env.SENDGRID_API_KEY || '',
      apiUrl: 'https://api.sendgrid.com/v3',
      fromEmail: process.env.EMAIL_FROM || 'noreply@labournow.in',
      fromName: 'LabourNow'
    })

    // AWS SES Configuration
    this.providers.set('ses', {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      region: process.env.AWS_REGION || 'ap-south-1',
      fromEmail: process.env.EMAIL_FROM || 'noreply@labournow.in',
      fromName: 'LabourNow'
    })

    // NodeMailer Configuration (for SMTP)
    this.providers.set('smtp', {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      },
      fromEmail: process.env.EMAIL_FROM || 'noreply@labournow.in',
      fromName: 'LabourNow'
    })
  }

  // SendGrid Integration
  async sendSendGridEmail(to: string | string[], subject: string, content: string, isHtml: boolean = false, attachments?: any[]) {
    const config = this.providers.get('sendgrid')
    
    try {
      const emailData = {
        personalizations: [{
          to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
          subject: subject
        }],
        from: {
          email: config.fromEmail,
          name: config.fromName
        },
        content: [{
          type: isHtml ? 'text/html' : 'text/plain',
          value: content
        }],
        ...(attachments && attachments.length > 0 && { attachments })
      }

      const response = await fetch(`${config.apiUrl}/mail/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`SendGrid email failed: ${errorData.errors?.[0]?.message || response.statusText}`)
      }

      const result = await response.json()
      return {
        success: true,
        messageId: result.headers?.['x-message-id'] || 'unknown',
        provider: 'sendgrid'
      }
    } catch (error) {
      console.error('SendGrid email error:', error)
      throw error
    }
  }

  // AWS SES Integration
  async sendSESEmail(to: string | string[], subject: string, content: string, isHtml: boolean = false, attachments?: any[]) {
    const config = this.providers.get('ses')
    
    try {
      // AWS SES requires AWS SDK
      const AWS = require('aws-sdk')
      
      const ses = new AWS.SES({
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
        region: config.region
      })

      const emailParams = {
        Destination: {
          ToAddresses: Array.isArray(to) ? to : [to]
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: isHtml ? content : undefined
            },
            Text: {
              Charset: 'UTF-8',
              Data: isHtml ? this.stripHtml(content) : content
            }
          },
          Subject: {
            Charset: 'UTF-8',
            Data: subject
          }
        },
        Source: `${config.fromName} <${config.fromEmail}>`,
        ...(attachments && attachments.length > 0 && {
          Attachments: attachments.map(attachment => ({
            Filename: attachment.filename,
            Content: Buffer.from(attachment.content, 'base64'),
            ContentType: attachment.contentType
          }))
        })
      }

      const result = await ses.sendEmail(emailParams).promise()
      
      return {
        success: true,
        messageId: result.MessageId,
        provider: 'ses'
      }
    } catch (error) {
      console.error('AWS SES email error:', error)
      throw error
    }
  }

  // SMTP Integration (using a server-side implementation)
  async sendSMTPEmail(to: string | string[], subject: string, content: string, isHtml: boolean = false, attachments?: any[]) {
    const config = this.providers.get('smtp')
    
    try {
      // In a real implementation, you would use a library like nodemailer on the server
      // For client-side, we'll use a fetch-based approach to your email API
      
      const emailData = {
        to: Array.isArray(to) ? to : [to],
        subject,
        content,
        isHtml,
        attachments,
        provider: 'smtp'
      }

      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      })

      if (!response.ok) {
        throw new Error(`SMTP email failed: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        success: true,
        messageId: result.messageId || 'unknown',
        provider: 'smtp'
      }
    } catch (error) {
      console.error('SMTP email error:', error)
      throw error
    }
  }

  // Generic send email method
  async sendEmail(provider: string, to: string | string[], subject: string, content: string, options: any = {}) {
    const { isHtml = false, attachments = [], templateData = null } = options

    switch (provider) {
      case 'sendgrid':
        return this.sendSendGridEmail(to, subject, content, isHtml, attachments)
      case 'ses':
        return this.sendSESEmail(to, subject, content, isHtml, attachments)
      case 'smtp':
        return this.sendSMTPEmail(to, subject, content, isHtml, attachments)
      default:
        throw new Error(`Unsupported email provider: ${provider}`)
    }
  }

  // Send templated email
  async sendTemplatedEmail(provider: string, to: string | string[], templateId: string, templateData: any, options: any = {}) {
    const config = this.providers.get(provider)
    
    if (provider === 'sendgrid') {
      try {
        const emailData = {
          personalizations: [{
            to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
            dynamic_template_data: templateData
          }],
          from: {
            email: config.fromEmail,
            name: config.fromName
          },
          template_id: templateId,
          ...(options.attachments && { attachments: options.attachments })
        }

        const response = await fetch(`${config.apiUrl}/mail/send`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailData)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(`SendGrid template email failed: ${errorData.errors?.[0]?.message || response.statusText}`)
        }

        const result = await response.json()
        return {
          success: true,
          messageId: result.headers?.['x-message-id'] || 'unknown',
          provider: 'sendgrid'
        }
      } catch (error) {
        console.error('SendGrid template email error:', error)
        throw error
      }
    } else {
      // For other providers, you would need to implement template rendering
      throw new Error(`Template emails not implemented for provider: ${provider}`)
    }
  }

  // Send booking confirmation email
  async sendBookingConfirmation(provider: string, to: string, bookingDetails: any) {
    const subject = `Booking Confirmed - ${bookingDetails.bookingNumber}`
    const content = this.generateBookingConfirmationTemplate(bookingDetails)
    
    return this.sendEmail(provider, to, subject, content, { isHtml: true })
  }

  // Send payment receipt email
  async sendPaymentReceipt(provider: string, to: string, paymentDetails: any) {
    const subject = `Payment Receipt - ${paymentDetails.paymentNumber}`
    const content = this.generatePaymentReceiptTemplate(paymentDetails)
    
    return this.sendEmail(provider, to, subject, content, { isHtml: true })
  }

  // Send welcome email
  async sendWelcomeEmail(provider: string, to: string, userDetails: any) {
    const subject = 'Welcome to LabourNow!'
    const content = this.generateWelcomeTemplate(userDetails)
    
    return this.sendEmail(provider, to, subject, content, { isHtml: true })
  }

  // Send OTP email
  async sendOTPEmail(provider: string, to: string, otp: string, purpose: string = 'login') {
    const subject = `Your LabourNow OTP - ${purpose.charAt(0).toUpperCase() + purpose.slice(1)}`
    const content = this.generateOTPTemplate(otp, purpose)
    
    return this.sendEmail(provider, to, subject, content, { isHtml: true })
  }

  // Send job alert email
  async sendJobAlertEmail(provider: string, to: string, jobDetails: any) {
    const subject = `New Job Alert: ${jobDetails.category} in ${jobDetails.location}`
    const content = this.generateJobAlertTemplate(jobDetails)
    
    return this.sendEmail(provider, to, subject, content, { isHtml: true })
  }

  // Send password reset email
  async sendPasswordResetEmail(provider: string, to: string, resetToken: string, userName: string) {
    const subject = 'Reset Your LabourNow Password'
    const content = this.generatePasswordResetTemplate(resetToken, userName)
    
    return this.sendEmail(provider, to, subject, content, { isHtml: true })
  }

  // Email Template Generators
  private generateBookingConfirmationTemplate(booking: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
          .detail { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
          .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <p>Your booking has been successfully confirmed</p>
          </div>
          <div class="content">
            <h2>Booking Details</h2>
            <div class="detail"><strong>Booking Number:</strong> ${booking.bookingNumber}</div>
            <div class="detail"><strong>Category:</strong> ${booking.category}</div>
            <div class="detail"><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</div>
            <div class="detail"><strong>Duration:</strong> ${booking.duration}</div>
            <div class="detail"><strong>Location:</strong> ${booking.location}</div>
            <div class="detail"><strong>Total Amount:</strong> ₹${booking.totalAmount}</div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings/${booking.id}" class="btn">View Booking Details</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private generatePaymentReceiptTemplate(payment: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
          .detail { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
          .total { background: #e5e7eb; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Payment Receipt</h1>
            <p>Thank you for your payment</p>
          </div>
          <div class="content">
            <h2>Payment Details</h2>
            <div class="detail"><strong>Receipt Number:</strong> ${payment.paymentNumber}</div>
            <div class="detail"><strong>Date:</strong> ${new Date(payment.paidAt).toLocaleDateString()}</div>
            <div class="detail"><strong>Payment Method:</strong> ${payment.method}</div>
            <div class="detail"><strong>Booking:</strong> ${payment.bookingNumber}</div>
            <div class="detail total"><strong>Total Amount Paid:</strong> ₹${payment.amount}</div>
            
            <p style="margin-top: 20px; text-align: center; color: #666;">
              This receipt serves as proof of payment for your records.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private generateWelcomeTemplate(user: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to LabourNow</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; }
          .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👋 Welcome to LabourNow!</h1>
            <p>We're excited to have you join our community</p>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>Thank you for signing up with LabourNow! Your account has been successfully created.</p>
            
            <h3>What's Next?</h3>
            <ul>
              <li>Complete your profile to get better matches</li>
              <li>Browse available workers or post job requirements</li>
              <li>Book services with just a few taps</li>
              <li>Enjoy secure payments and reliable service</li>
            </ul>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">Go to Dashboard</a>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/help" class="btn" style="background: #6b7280;">Get Help</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private generateOTPTemplate(otp: string, purpose: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; }
          .container { max-width: 400px; margin: 50px auto; padding: 20px; }
          .otp-box { background: #2563eb; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0; }
          .purpose { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔐 Your Verification Code</h1>
          <p>Use this code to ${purpose}:</p>
          <div class="otp-box">${otp}</div>
          <div class="purpose">
            <strong>Purpose:</strong> ${purpose.charAt(0).toUpperCase() + purpose.slice(1)}<br>
            <strong>Valid for:</strong> 10 minutes
          </div>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      </body>
      </html>
    `
  }

  private generateJobAlertTemplate(job: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Job Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
          .job-detail { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #f59e0b; }
          .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Job Alert!</h1>
            <p>A new job matching your profile is available</p>
          </div>
          <div class="content">
            <h2>Job Details</h2>
            <div class="job-detail"><strong>Category:</strong> ${job.category}</div>
            <div class="job-detail"><strong>Location:</strong> ${job.location}</div>
            <div class="job-detail"><strong>Date:</strong> ${new Date(job.date).toLocaleDateString()}</div>
            <div class="job-detail"><strong>Duration:</strong> ${job.duration}</div>
            <div class="job-detail"><strong>Pay:</strong> ₹${job.totalAmount}</div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/jobs/${job.id}" class="btn">View Job Details</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private generatePasswordResetTemplate(token: string, userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 500px; margin: 50px auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; }
          .btn { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
          .warning { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Reset Your Password</h1>
            <p>Hi ${userName}, we received a request to reset your password</p>
          </div>
          <div class="content">
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}" class="btn">Reset Password</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  // Utility method to strip HTML
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '')
  }

  // Get email provider status
  getProviderStatus(provider: string) {
    const config = this.providers.get(provider)
    if (!config) {
      return { supported: false, configured: false }
    }

    const configured = provider === 'smtp' ? 
      !!config.auth.user : 
      !!config.apiKey || !!config.accessKeyId

    return {
      supported: true,
      configured,
      features: this.getProviderFeatures(provider)
    }
  }

  private getProviderFeatures(provider: string) {
    const features = {
      sendgrid: ['templates', 'attachments', 'analytics', 'sandbox'],
      ses: ['templates', 'attachments', 'analytics', 'sandbox'],
      smtp: ['attachments', 'html', 'text']
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

  // Test email configuration
  async testEmailConfiguration(provider: string, testEmail?: string) {
    try {
      const result = await this.sendEmail(
        provider,
        testEmail || process.env.EMAIL_FROM || 'test@example.com',
        'LabourNow Email Test',
        'This is a test email from LabourNow to verify the email configuration.',
        { isHtml: false }
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
}

// Export singleton instance
export const emailService = new EmailService()

// Export individual methods for easier usage
export const {
  sendEmail,
  sendTemplatedEmail,
  sendBookingConfirmation,
  sendPaymentReceipt,
  sendWelcomeEmail,
  sendOTPEmail,
  sendJobAlertEmail,
  sendPasswordResetEmail,
  getProviderStatus,
  getSupportedProviders,
  testEmailConfiguration
} = emailService

export default emailService