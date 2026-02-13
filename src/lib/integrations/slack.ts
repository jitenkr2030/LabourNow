// Slack Integration for LabourNow Team Collaboration
export class SlackIntegration {
  private botToken: string
  private signingSecret: string
  private teamId: string
  private apiUrl: string

  constructor() {
    this.botToken = process.env.SLACK_BOT_TOKEN || ''
    this.signingSecret = process.env.SLACK_SIGNING_SECRET || ''
    this.teamId = process.env.SLACK_TEAM_ID || ''
    this.apiUrl = 'https://slack.com/api'
  }

  // Send message to Slack channel
  async sendMessage(channel: string, text: string, options?: any) {
    try {
      const payload: any = {
        channel,
        text,
        ...options
      }

      // Add blocks if provided
      if (options.blocks) {
        payload.blocks = options.blocks
        delete payload.blocks
      }

      // Add attachments if provided
      if (options.attachments) {
        payload.attachments = options.attachments
        delete payload.attachments
      }

      const response = await fetch(`${this.apiUrl}/chat.postMessage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Slack message failed: ${errorData.error || response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Slack message error:', error)
      throw error
    }
  }

  // Send formatted message with blocks
  async sendFormattedMessage(channel: string, blocks: any[], text?: string) {
    return this.sendMessage(channel, text || '', { blocks })
  }

  // Send booking notification to Slack
  async sendBookingNotification(booking: any) {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎉 New Booking Received!'
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Booking Number:*\n${booking.bookingNumber}`
          },
          {
            type: 'mrkdwn',
            text: `*Category:*\n${booking.category}`
          },
          {
            type: 'mrkdwn',
            text: `*Date:*\n${new Date(booking.date).toLocaleDateString()}`
          },
          {
            type: 'mrkdwn',
            text: `*Location:*\n${booking.location}`
          },
          {
            type: 'mrkdwn',
            text: `*Amount:*\n₹${booking.totalAmount}`
          }
        ]
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Booking'
            },
            url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/bookings/${booking.id}`,
            style: 'primary'
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Contact Customer'
            },
            url: `tel:${booking.customerMobile}`,
            style: 'default'
          }
        ]
      }
    ]

    return this.sendFormattedMessage('#bookings', blocks, 'New booking received!')
  }

  // Send payment notification to Slack
  async sendPaymentNotification(payment: any) {
    const color = payment.status === 'completed' ? '#36a64f' : '#e01e5a'
    
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: payment.status === 'completed' ? '💰 Payment Received!' : '⚠️ Payment Failed!'
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Payment ID:*\n${payment.paymentId}`
          },
          {
            type: 'mrkdwn',
            text: `*Booking:*\n${payment.bookingNumber}`
          },
          {
            type: 'mrkdwn',
            text: `*Amount:*\n₹${payment.amount}`
          },
          {
            type: 'mrkdwn',
            text: `*Method:*\n${payment.method}`
          },
          {
            type: 'mrkdwn',
            text: `*Status:*\n${payment.status}`
          }
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `*Time:*\n${new Date(payment.timestamp).toLocaleString()}`
          }
        ]
      }
    ]

    const attachments = [
      {
        color,
        blocks
      }
    ]

    return this.sendMessage('#payments', '', { attachments })
  }

  // Send user registration notification
  async sendUserRegistrationNotification(user: any) {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '👤 New User Registered!'
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Name:*\n${user.name}`
          },
          {
            type: 'mrkdwn',
            text: `*Mobile:*\n${user.mobile}`
          },
          {
            type: 'mrkdwn',
            text: `*Email:*\n${user.email || 'Not provided'}`
          },
          {
            type: 'mrkdwn',
            text: `*Role:*\n${user.role}`
          },
          {
            type: 'mrkdwn',
            text: `*Verified:*\n${user.isVerified ? 'Yes' : 'No'}`
          }
        ]
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View User'
            },
            url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/users/${user.id}`,
            style: 'primary'
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Verify User'
            },
            url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/users/${user.id}/verify`,
            style: 'default'
          }
        ]
      }
    ]

    return this.sendFormattedMessage('#users', blocks, 'New user registered!')
  }

  // Send system alert to Slack
  async sendSystemAlert(level: 'info' | 'warning' | 'error', title: string, message: string, metadata?: any) {
    const colors = {
      info: '#3b82f6',
      warning: '#f59e0b',
      error: '#ef4444'
    }

    const emojis = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '🚨'
    }

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emojis[level]} ${title}`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message
        }
      }
    ]

    // Add metadata if provided
    if (metadata) {
      blocks.push({
        type: 'section',
        fields: Object.entries(metadata).map(([key, value]) => ({
          type: 'mrkdwn',
          text: `*${key}*\n${value}`
        }))
      })
    }

    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `*Time:*\n${new Date().toLocaleString()}`
        }
      ]
    })

    const attachments = [
      {
        color: colors[level],
        blocks
      }
    ]

    return this.sendMessage('#alerts', '', { attachments })
  }

  // Send daily summary report
  async sendDailySummary() {
    try {
      // In a real implementation, you would fetch actual data from your database
      const summary = await this.getDailySummaryData()

      const blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📊 Daily Summary Report'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Date:*\n${new Date().toLocaleDateString()}\n*Generated at:*\n${new Date().toLocaleString()}`
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*📈 Key Metrics*'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*New Bookings:*\n${summary.newBookings}`
            },
            {
              type: 'mrkdwn',
              text: `*Completed Bookings:*\n${summary.completedBookings}`
            },
            {
              type: 'mrkdwn',
              text: `*Total Revenue:*\n₹${summary.totalRevenue}`
            },
            {
              type: 'mrkdwn',
              text: `*New Users:*\n${summary.newUsers}`
            },
            {
              type: 'mrkdwn',
              text: `*Active Users:*\n${summary.activeUsers}`
            },
            {
              type: 'mrkdwn',
              text: `*Support Tickets:*\n${summary.supportTickets}`
            }
          ]
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*🔝 Top Categories*'
          }
        },
        {
          type: 'section',
          fields: summary.topCategories.map((cat: any, index: number) => ({
            type: 'mrkdwn',
            text: `*${index + 1}. ${cat.category}*\n${cat.count} bookings (₹${cat.revenue})`
          }))
        }
      ]

      return this.sendFormattedMessage('#reports', blocks, 'Daily summary report')
    } catch (error) {
      console.error('Failed to send daily summary:', error)
      throw error
    }
  }

  // Send error notification with stack trace
  async sendErrorNotification(error: Error, context?: any) {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🚨 Application Error'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Error:*\n\`${error.message}\``
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Stack Trace:*\n\`\`\`${error.stack}\`\`\``
        }
      }
    ]

    // Add context if provided
    if (context) {
      blocks.push({
        type: 'section',
        fields: Object.entries(context).map(([key, value]) => ({
          type: 'mrkdwn',
          text: `*${key}*\n${JSON.stringify(value, null, 2)}`
        }))
      })
    }

    const attachments = [
      {
        color: '#ef4444',
        blocks
      }
    ]

    return this.sendMessage('#errors', '', { attachments })
  }

  // Create a channel
  async createChannel(name: string, isPrivate: boolean = false) {
    try {
      const response = await fetch(`${this.apiUrl}/conversations.create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          is_private: isPrivate
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Channel creation failed: ${errorData.error || response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Create channel error:', error)
      throw error
    }
  }

  // Invite user to channel
  async inviteToChannel(channelId: string, userIds: string[]) {
    try {
      const response = await fetch(`${this.apiUrl}/conversations.invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel: channelId,
          users: userIds
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Channel invitation failed: ${errorData.error || response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Invite to channel error:', error)
      throw error
    }
  }

  // Upload file to Slack
  async uploadFile(channelId: string, file: File, title?: string) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('channels', channelId)
      if (title) {
        formData.append('title', title)
      }

      const response = await fetch(`${this.apiUrl}/files.upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.botToken}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`File upload failed: ${errorData.error || response.statusText}`)
      }

      const result = await response.json()
      
      // Share the file in the channel
      await this.sendMessage(channelId, '', {
        files: [
          {
            id: result.file.id,
            title: result.file.name
          }
        ]
      })

      return result
    } catch (error) {
      console.error('File upload error:', error)
      throw error
    }
  }

  // Get channel information
  async getChannelInfo(channelId: string) {
    try {
      const response = await fetch(`${this.apiUrl}/conversations.info?channel=${channelId}`, {
        headers: {
          'Authorization': `Bearer ${this.botToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get channel info: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Get channel info error:', error)
      throw error
    }
  }

  // Get user information
  async getUserInfo(userId: string) {
    try {
      const response = await fetch(`${this.apiUrl}/users.info?user=${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.botToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Get user info error:', error)
      throw error
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(body: string, signature: string, timestamp: string): boolean {
    const crypto = require('crypto')
    
    const baseString = `v0:${timestamp}:${body}`
    const expectedSignature = crypto
      .createHmac('sha256', this.signingSecret)
      .update(baseString, 'utf8')
      .digest('hex')

    return `v0=${expectedSignature}` === signature
  }

  // Handle Slack events (webhook handler)
  async handleSlackEvent(event: any) {
    try {
      switch (event.type) {
        case 'message':
          return this.handleMessageEvent(event)
        case 'app_home_opened':
          return this.handleAppHomeOpened(event)
        case 'team_join':
          return this.handleTeamJoin(event)
        default:
          console.log('Unhandled Slack event:', event.type)
          return { handled: false, event: event.type }
      }
    } catch (error) {
      console.error('Handle Slack event error:', error)
      throw error
    }
  }

  private handleMessageEvent(event: any) {
    // Handle incoming messages
    if (event.subtype === 'bot_message') {
      return { handled: false, reason: 'Bot message' }
    }

    const message = {
      user: event.user,
      channel: event.channel,
      text: event.text,
      timestamp: event.ts
    }

    // You can implement custom message handling here
    console.log('Received Slack message:', message)

    return { handled: true, message }
  }

  private handleAppHomeOpened(event: any) {
    // Handle app home opened event
    console.log('App home opened by user:', event.user)
    
    return { handled: true, user: event.user }
  }

  private handleTeamJoin(event: any) {
    // Handle team join event
    console.log('User joined team:', event.user)
    
    // Send welcome message to new user
    this.sendMessage(event.user, 'Welcome to the LabourNow Slack workspace! 🎉')
    
    return { handled: true, user: event.user }
  }

  // Mock daily summary data (in real implementation, fetch from database)
  private async getDailySummaryData() {
    return {
      newBookings: 15,
      completedBookings: 12,
      totalRevenue: 18500,
      newUsers: 8,
      activeUsers: 234,
      supportTickets: 3,
      topCategories: [
        { category: 'MASON', count: 8, revenue: 8000 },
        { category: 'ELECTRICIAN', count: 5, revenue: 5500 },
        { category: 'PAINTER', count: 3, revenue: 3000 },
        { category: 'PLUMBER', count: 2, revenue: 2000 }
      ]
    }
  }

  // Get Slack workspace info
  async getWorkspaceInfo() {
    try {
      const response = await fetch(`${this.apiUrl}/team.info`, {
        headers: {
          'Authorization': `Bearer ${this.botToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get workspace info: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Get workspace info error:', error)
      throw error
    }
  }

  // Test Slack integration
  async testSlackIntegration() {
    try {
      const result = await this.sendMessage('#general', '🧪 Slack integration test from LabourNow!')
      return {
        success: true,
        messageId: result.ts,
        channel: result.channel,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  // Check if Slack is configured
  isConfigured(): boolean {
    return !!(this.botToken && this.signingSecret && this.teamId)
  }

  // Get configuration status
  getConfigurationStatus() {
    return {
      configured: this.isConfigured(),
      botToken: !!this.botToken,
      signingSecret: !!this.signingSecret,
      teamId: !!this.teamId,
      features: [
        'messaging',
        'file_upload',
        'webhooks',
        'channels',
        'users',
        'analytics'
      ]
    }
  }
}

// Export singleton instance
export const slackIntegration = new SlackIntegration()

// Export individual methods for easier usage
export const {
  sendMessage,
  sendFormattedMessage,
  sendBookingNotification,
  sendPaymentNotification,
  sendUserRegistrationNotification,
  sendSystemAlert,
  sendDailySummary,
  sendErrorNotification,
  createChannel,
  inviteToChannel,
  uploadFile,
  getChannelInfo,
  getUserInfo,
  verifyWebhookSignature,
  handleSlackEvent,
  getWorkspaceInfo,
  testSlackIntegration,
  isConfigured,
  getConfigurationStatus
} = slackIntegration

export default slackIntegration