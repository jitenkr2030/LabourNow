# LabourNow Integration Guide

This comprehensive guide covers all third-party integrations implemented in the LabourNow platform.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Third-Party Integrations](#third-party-integrations)
   - [WhatsApp Business API](#whatsapp-business-api)
   - [Google Services](#google-services)
   - [Social Media Login](#social-media-login)
   - [Payment Gateways](#payment-gateways)
   - [Email Services](#email-services)
   - [SMS Gateways](#sms-gateways)
   - [Analytics Services](#analytics-services)
   - [Slack Integration](#slack-integration)
3. [Communication Channels](#communication-channels)
4. [Webhook System](#webhook-system)
5. [Integration Management](#integration-management)
6. [Environment Configuration](#environment-configuration)
7. [API Documentation](#api-documentation)
8. [Testing and Monitoring](#testing-and-monitoring)
9. [Troubleshooting](#troubleshooting)

## 🌟 Overview

LabourNow now supports comprehensive third-party integrations to enhance functionality, improve user experience, and streamline business operations. All integrations are built with:

- **Security First**: Proper authentication, encryption, and data protection
- **Scalability**: Built to handle enterprise-level usage
- **Reliability**: Error handling, retries, and fallback mechanisms
- **Flexibility**: Easy to configure, test, and monitor
- **Compliance**: GDPR and data privacy compliant

## 🔗 Third-Party Integrations

### WhatsApp Business API

**Purpose**: Direct communication with users via WhatsApp for booking confirmations, payment receipts, and support messages.

**Features**:
- ✅ Text messages with rich formatting
- ✅ Media sharing (images, documents)
- ✅ Template messages for notifications
- ✅ Interactive messages with buttons
- ✅ Location sharing
- ✅ Contact sharing
- ✅ Message reactions
- ✅ Read receipts
- ✅ QR code generation

**Configuration**:
```env
WHATSAPP_API_KEY=your_api_key
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

**Usage Example**:
```javascript
import { whatsappAPI } from '@/lib/integrations/whatsapp'

// Send booking confirmation
await whatsappAPI.sendBookingConfirmation('919876543210', {
  bookingNumber: 'BK001',
  category: 'MASON',
  date: '2024-01-15',
  location: 'Mumbai, Maharashtra',
  totalAmount: 1500,
  id: 'booking_123'
})
```

### Google Services

**Purpose**: Maps, geocoding, analytics, and OAuth authentication.

**Features**:
- ✅ Google Maps integration
- ✅ Geocoding and reverse geocoding
- ✅ Place search and details
- ✅ Directions and routing
- ✅ Google Analytics tracking
- ✅ Google OAuth login
- ✅ Google Drive file storage
- ✅ Google Calendar events

**Configuration**:
```env
GOOGLE_MAPS_API_KEY=your_maps_api_key
GOOGLE_ANALYTICS_ID=your_analytics_id
GOOGLE_OAUTH_CLIENT_ID=your_oauth_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_oauth_client_secret
```

**Usage Example**:
```javascript
import { googleServices } from '@/lib/integrations/google'

// Geocode address
const location = await googleServices.geocodeAddress('Mumbai, Maharashtra')

// Track analytics event
googleServices.trackEvent('booking_completed', {
  category: 'booking',
  value: 1500,
  currency: 'INR'
})
```

### Social Media Login

**Purpose**: Enable users to login using their social media accounts.

**Supported Providers**:
- ✅ Google OAuth 2.0
- ✅ Facebook Login
- ✅ Apple Sign In

**Features**:
- ✅ Secure OAuth 2.0 flow
- ✅ Profile information retrieval
- ✅ Token refresh
- ✅ Account linking
- ✅ Session management

**Configuration**:
```env
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=your_apple_private_key
```

**Usage Example**:
```javascript
import { socialLogin } from '@/lib/integrations/social-login'

// Get Google auth URL
const authUrl = socialLogin.getAuthUrl('google', callbackUrl, state)

// Exchange code for tokens
const tokens = await socialLogin.exchangeCodeForTokens('google', code, callbackUrl)
```

### Payment Gateways

**Purpose**: Process online payments securely with multiple payment options.

**Supported Gateways**:
- ✅ Razorpay (India-focused)
- ✅ Stripe (International)
- ✅ UPI (Direct bank transfers)

**Features**:
- ✅ Multiple payment methods
- ✅ Order creation and capture
- ✅ Webhook handling
- ✅ Refund processing
- ✅ Payment verification
- ✅ Subscription billing

**Configuration**:
```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
UPI_MERCHANT_ID=your_upi_merchant_id
UPI_MERCHANT_KEY=your_upi_merchant_key
```

**Usage Example**:
```javascript
import { paymentGateway } from '@/lib/integrations/payment-gateway'

// Create Razorpay order
const order = await paymentGateway.createRazorpayOrder(1500, 'INR', 'order_123')

// Process payment
const payment = await paymentGateway.processPayment('razorpay', {
  amount: 1500,
  currency: 'INR',
  receipt: 'order_123'
})
```

### Email Services

**Purpose**: Send transactional emails and notifications to users.

**Supported Providers**:
- ✅ SendGrid
- ✅ Amazon SES
- ✅ SMTP (custom servers)

**Features**:
- ✅ HTML and plain text emails
- ✅ Email templates
- ✅ Attachments
- ✅ Bulk sending
- ✅ Delivery tracking
- ✅ Bounce handling

**Configuration**:
```env
SENDGRID_API_KEY=your_sendgrid_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-south-1
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@labournow.in
```

**Usage Example**:
```javascript
import { emailService } from '@/lib/integrations/email-service'

// Send booking confirmation
await emailService.sendBookingConfirmation('sendgrid', 'user@example.com', {
  bookingNumber: 'BK001',
  customerName: 'John Doe',
  category: 'MASON',
  date: '2024-01-15',
  location: 'Mumbai',
  totalAmount: 1500
})
```

### SMS Gateways

**Purpose**: Send SMS notifications and OTP codes to users.

**Supported Providers**:
- ✅ Twilio
- ✅ MSG91
- ✅ Custom HTTP SMS APIs

**Features**:
- ✅ Text and Unicode SMS
- ✅ OTP generation and verification
- ✅ Bulk SMS
- ✅ Scheduled SMS
- ✅ Delivery tracking
- ✅ DLR (Delivery Receipt) handling

**Configuration**:
```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_TEMPLATE_ID=your_msg91_template_id
SMS_SENDER_ID=LABOUR
```

**Usage Example**:
```javascript
import { smsGateway } from '@/lib/integrations/sms-gateway'

// Send OTP
await smsGateway.sendOTP('twilio', '919876543210', '123456', 'login')

// Send booking confirmation
await smsGateway.sendBookingConfirmationSMS('twilio', '919876543210', {
  bookingNumber: 'BK001',
  customerName: 'John Doe',
  category: 'MASON'
})
```

### Analytics Services

**Purpose**: Track user behavior, app performance, and business metrics.

**Supported Services**:
- ✅ Google Analytics 4
- ✅ Mixpanel
- ✅ Amplitude
- ✅ Segment
- ✅ Hotjar
- ✅ Custom analytics

**Features**:
- ✅ Event tracking
- ✅ Page views
- ✅ User identification
- ✅ Conversion tracking
- ✅ Custom dimensions
- ✅ Real-time analytics

**Configuration**:
```env
GA_MEASUREMENT_ID=your_ga_measurement_id
MIXPANEL_TOKEN=your_mixpanel_token
AMPLITUDE_API_KEY=your_amplitude_api_key
SEGMENT_WRITE_KEY=your_segment_write_key
HOTJAR_SITE_ID=your_hotjar_site_id
```

**Usage Example**:
```javascript
import { analyticsServices } from '@/lib/integrations/analytics'

// Track event
analyticsServices.trackEvent('booking_completed', {
  category: 'booking',
  value: 1500,
  payment_method: 'razorpay'
})

// Identify user
analyticsServices.identify('user_123', {
  name: 'John Doe',
  email: 'john@example.com',
  plan: 'premium'
})
```

### Slack Integration

**Purpose**: Team collaboration, notifications, and automated workflows.

**Features**:
- ✅ Message sending
- ✅ Rich formatting with blocks
- ✅ File uploads
- ✅ Channel management
- ✅ Webhook handling
- ✅ Bot commands
- ✅ Daily reports

**Configuration**:
```env
SLACK_BOT_TOKEN=your_slack_bot_token
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_TEAM_ID=your_slack_team_id
```

**Usage Example**:
```javascript
import { slackIntegration } from '@/lib/integrations/slack'

// Send booking notification
await slackIntegration.sendBookingNotification({
  bookingNumber: 'BK001',
  category: 'MASON',
  date: '2024-01-15',
  location: 'Mumbai',
  totalAmount: 1500,
  id: 'booking_123',
  customerMobile: '919876543210'
})
```

## 📧 Communication Channels

### WhatsApp Business
- **Booking confirmations**
- **Payment receipts**
- **Job alerts**
- **Support messages**
- **OTP verification**

### Email
- **Welcome emails**
- **Booking confirmations**
- **Payment receipts**
- **Password resets**
- **Marketing campaigns**

### SMS
- **OTP codes**
- **Booking alerts**
- **Payment notifications**
- **Emergency alerts**
- **Service updates**

## 🔗 Webhook System

### Features
- ✅ Event-driven architecture
- ✅ Multiple webhook endpoints
- ✅ Retry mechanisms
- ✅ Signature verification
- ✅ Event filtering
- ✅ Payload customization

### Supported Events
- `booking.created`
- `booking.completed`
- `booking.cancelled`
- `payment.completed`
- `payment.failed`
- `user.registered`
- `user.verified`
- `support.ticket.created`

### Webhook Configuration
```javascript
const webhook = await integrationManager.createWebhook({
  name: 'Booking Notifications',
  url: 'https://api.example.com/webhooks/labournow',
  events: ['booking.created', 'booking.completed'],
  secret: 'webhook_secret_key',
  active: true,
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2
  }
})
```

## ⚙️ Integration Management

### Dashboard Features
- ✅ Real-time status monitoring
- ✅ Configuration management
- ✅ Health checks
- ✅ Usage analytics
- ✅ Error tracking
- ✅ Performance metrics

### API Endpoints
- `GET /api/integrations` - Get all integration statuses
- `POST /api/integrations/test` - Test an integration
- `PUT /api/integrations/configure` - Configure an integration
- `GET /api/integrations/health` - Get health status
- `POST /api/webhooks` - Create webhook
- `POST /api/webhooks/trigger` - Trigger webhooks

### Monitoring
- ✅ Real-time health checks
- ✅ Performance metrics
- ✅ Error tracking
- ✅ Usage analytics
- ✅ Alert notifications

## 🔧 Environment Configuration

### Required Environment Variables

```env
# WhatsApp Business
WHATSAPP_API_KEY=your_api_key
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id

# Google Services
GOOGLE_MAPS_API_KEY=your_maps_api_key
GOOGLE_ANALYTICS_ID=your_analytics_id
GOOGLE_OAUTH_CLIENT_ID=your_oauth_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_oauth_client_secret

# Social Login
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=your_apple_private_key

# Payment Gateways
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
UPI_MERCHANT_ID=your_upi_merchant_id
UPI_MERCHANT_KEY=your_upi_merchant_key

# Email Services
SENDGRID_API_KEY=your_sendgrid_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-south-1
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@labournow.in

# SMS Gateways
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_TEMPLATE_ID=your_msg91_template_id
SMS_SENDER_ID=LABOUR

# Analytics
GA_MEASUREMENT_ID=your_ga_measurement_id
MIXPANEL_TOKEN=your_mixpanel_token
AMPLITUDE_API_KEY=your_amplitude_api_key
SEGMENT_WRITE_KEY=your_segment_write_key
HOTJAR_SITE_ID=your_hotjar_site_id

# Slack
SLACK_BOT_TOKEN=your_slack_bot_token
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_TEAM_ID=your_slack_team_id

# Application
NEXT_PUBLIC_APP_URL=https://labournow.in
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

## 📚 API Documentation

### Integration Status API

**GET** `/api/integrations`

Get status of all integrations.

**Response**:
```json
{
  "success": true,
  "integrations": [
    {
      "id": "whatsapp",
      "name": "WhatsApp Business",
      "status": "active",
      "configured": true,
      "features": ["messaging", "media", "templates"],
      "lastTest": "2024-01-15T10:30:00Z",
      "health": {
        "status": "healthy",
        "responseTime": 245
      }
    }
  ]
}
```

### Test Integration API

**POST** `/api/integrations/test`

Test a specific integration.

**Request**:
```json
{
  "integrationId": "whatsapp",
  "config": {
    "testNumber": "+919876543210"
  }
}
```

**Response**:
```json
{
  "success": true,
  "result": {
    "provider": "whatsapp",
    "test": "send_message",
    "messageId": "wamid.HBgLWy5tRkCq",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Webhook API

**POST** `/api/webhooks`

Create a new webhook.

**Request**:
```json
{
  "name": "Booking Webhook",
  "url": "https://api.example.com/webhooks",
  "events": ["booking.created", "booking.completed"],
  "secret": "webhook_secret",
  "active": true
}
```

**Response**:
```json
{
  "success": true,
  "webhook": {
    "id": "webhook_123",
    "name": "Booking Webhook",
    "url": "https://api.example.com/webhooks",
    "events": ["booking.created", "booking.completed"],
    "active": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

## 🧪 Testing and Monitoring

### Automated Testing
- ✅ Unit tests for all integrations
- ✅ Integration tests with mock services
- ✅ End-to-end tests for critical flows
- ✅ Load testing for high-volume scenarios

### Monitoring
- ✅ Real-time health checks
- ✅ Performance metrics tracking
- ✅ Error rate monitoring
- ✅ Usage analytics
- ✅ Alert notifications

### Health Checks
```javascript
// Perform comprehensive health check
const health = await integrationManager.performHealthCheck()

console.log('Overall health:', health.overall)
console.log('Integration health:', health.integrations)
```

## 🔧 Troubleshooting

### Common Issues

#### WhatsApp Business API
**Problem**: Messages not sending
**Solution**: 
- Verify API key and phone number ID
- Check webhook URL configuration
- Ensure phone number is verified

#### Google Services
**Problem**: Maps not loading
**Solution**:
- Check API key validity
- Verify API key restrictions
- Ensure correct billing account

#### Payment Gateways
**Problem**: Payment failures
**Solution**:
- Verify API credentials
- Check webhook configuration
- Ensure proper order creation flow

#### Email Services
**Problem**: Emails not delivering
**Solution**:
- Check SPF/DKIM records
- Verify sender authentication
- Monitor bounce logs

#### SMS Gateways
**Problem**: OTP not receiving
**Solution**:
- Verify phone number format
- Check sender ID registration
- Monitor DLR reports

### Debug Mode
Enable debug mode for detailed logging:

```javascript
// Enable debug logging
process.env.DEBUG = 'true'

// Test integration with debug info
const result = await integrationManager.testIntegration('whatsapp', {
  debug: true,
  testNumber: '+919876543210'
})
```

### Support
For integration support:
1. Check the integration dashboard
2. Review error logs
3. Verify configuration
4. Test with debug mode
5. Contact support team

## 📈 Best Practices

### Security
- ✅ Use environment variables for secrets
- ✅ Implement proper authentication
- ✅ Validate all inputs
- ✅ Use HTTPS for all API calls
- ✅ Implement rate limiting
- ✅ Monitor for anomalies

### Performance
- ✅ Implement caching strategies
- ✅ Use connection pooling
- ✅ Optimize API calls
- ✅ Monitor response times
- ✅ Implement retries with backoff
- ✅ Use CDN for static assets

### Reliability
- ✅ Implement error handling
- ✅ Use circuit breakers
- ✅ Implement fallback mechanisms
- ✅ Monitor system health
- ✅ Set up alerting
- ✅ Document all integrations

### Compliance
- ✅ GDPR compliance
- ✅ Data encryption
- ✅ User consent management
- ✅ Data retention policies
- ✅ Audit logging
- ✅ Privacy by design

## 🚀 Getting Started

1. **Configure Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Fill in all required API keys and secrets

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Test Integrations**
   - Visit `/admin/integrations`
   - Test each integration individually
   - Monitor health status

4. **Configure Webhooks**
   - Set up webhook endpoints
   - Configure event subscriptions
   - Test webhook delivery

5. **Monitor Performance**
   - Check analytics dashboard
   - Monitor error rates
   - Set up alerts

## 📞 Support

For integration support and questions:
- **Email**: integrations@labournow.in
- **Slack**: #integrations-support
- **Documentation**: https://docs.labournow.in/integrations
- **Status Page**: https://status.labournow.in

---

*Last updated: January 2024*