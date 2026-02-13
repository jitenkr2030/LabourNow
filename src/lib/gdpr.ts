import { db } from '@/lib/db'
import { logDataAccess, logAuthEvent } from '@/lib/audit'
import { encrypt, decrypt, maskSensitiveData } from '@/lib/encryption'
import { randomBytes } from 'crypto'

// Consent management
export class ConsentManager {
  /**
   * Record user consent
   */
  static async recordConsent(
    userId: string,
    consentType: any,
    granted: boolean,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const existingConsent = await db.userConsent.findUnique({
      where: {
        userId_consentType: {
          userId,
          consentType
        }
      }
    })

    if (existingConsent) {
      await db.userConsent.update({
        where: {
          userId_consentType: {
            userId,
            consentType
          }
        },
        data: {
          granted,
          grantedAt: new Date(),
          revokedAt: granted ? null : new Date(),
          ipAddress,
          userAgent
        }
      })
    } else {
      await db.userConsent.create({
        data: {
          userId,
          consentType,
          granted,
          ipAddress,
          userAgent
        }
      })
    }

    // Log consent change
    await logDataAccess(
      granted ? 'consent_granted' : 'consent_revoked',
      'consent',
      `${userId}_${consentType}`,
      userId,
      { consentType, granted, ipAddress }
    )
  }

  /**
   * Check if user has given consent
   */
  static async hasConsent(userId: string, consentType: any): Promise<boolean> {
    const consent = await db.userConsent.findUnique({
      where: {
        userId_consentType: {
          userId,
          consentType
        }
      }
    })

    return consent?.granted && !consent.revokedAt || false
  }

  /**
   * Get all user consents
   */
  static async getUserConsents(userId: string): Promise<any[]> {
    return await db.userConsent.findMany({
      where: { userId },
      orderBy: { grantedAt: 'desc' }
    })
  }

  /**
   * Get required consents for registration
   */
  static getRequiredConsents(): Array<{ type: any; title: string; description: string; required: boolean }> {
    return [
      {
        type: 'DATA_PROCESSING',
        title: 'Data Processing',
        description: 'We process your personal data to provide our services, including matching you with suitable labour/employers and facilitating bookings.',
        required: true
      },
      {
        type: 'MARKETING_COMMUNICATIONS',
        title: 'Marketing Communications',
        description: 'We may send you promotional messages about our services, special offers, and relevant updates via SMS, email, or push notifications.',
        required: false
      },
      {
        type: 'ANALYTICS_TRACKING',
        title: 'Analytics Tracking',
        description: 'We use analytics tools to understand how you use our app and improve our services. This includes anonymous usage data.',
        required: false
      },
      {
        type: 'LOCATION_SHARING',
        title: 'Location Sharing',
        description: 'We use your location to find nearby labour/employers and provide location-based services. You can control location access in your device settings.',
        required: false
      },
      {
        type: 'EMAIL_NOTIFICATIONS',
        title: 'Email Notifications',
        description: 'We may send you important updates about your bookings, payments, and account activity via email.',
        required: false
      },
      {
        type: 'SMS_NOTIFICATIONS',
        title: 'SMS Notifications',
        description: 'We may send you important updates about your bookings, payments, and account activity via SMS.',
        required: false
      }
    ]
  }
}

// Data Subject Rights (GDPR Articles 15-21)
export class DataSubjectRights {
  /**
   * Export user data (Right of Access - Article 15)
   */
  static async exportUserData(userId: string, requestId?: string): Promise<any> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        labourProfile: true,
        employerProfile: true,
        sentBookings: {
          include: {
            labour: { select: { id: true, name: true, mobile: true } },
            city: { select: { name: true, state: true } },
            payments: true,
            reviews: true
          }
        },
        receivedBookings: {
          include: {
            employer: { select: { id: true, name: true, mobile: true } },
            city: { select: { name: true, state: true } },
            payments: true,
            reviews: true
          }
        },
        givenReviews: true,
        receivedReviews: true,
        notifications: true,
        payments: true,
        consents: true,
        dataProcessingRecords: true,
        deletionRequests: true
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Decrypt sensitive data for export
    const userData = {
      personalInformation: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      profile: user.labourProfile || user.employerProfile,
      bookings: {
        sent: user.sentBookings,
        received: user.receivedBookings
      },
      reviews: {
        given: user.givenReviews,
        received: user.receivedReviews
      },
      notifications: user.notifications,
      payments: user.payments,
      consents: user.consents,
      dataProcessingRecords: user.dataProcessingRecords,
      deletionRequests: user.deletionRequests
    }

    // Log data export
    await logDataAccess('export', 'user_data', userId, userId, null, requestId)

    return userData
  }

  /**
   * Create data deletion request (Right to Erasure - Article 17)
   */
  static async requestDeletion(
    userId: string,
    reason: string,
    verificationToken?: string
  ): Promise<string> {
    // Create deletion request
    const deletionRequest = await db.dataDeletionRequest.create({
      data: {
        userId,
        reason,
        verificationToken: verificationToken || randomBytes(32).toString('hex')
      }
    })

    // Log deletion request
    await logDataAccess('delete', 'deletion_request', deletionRequest.id, userId, { reason })

    return deletionRequest.verificationToken!
  }

  /**
   * Process data deletion request
   */
  static async processDeletionRequest(
    requestId: string,
    adminId: string,
    approved: boolean,
    adminNotes?: string
  ): Promise<void> {
    const deletionRequest = await db.dataDeletionRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    })

    if (!deletionRequest) {
      throw new Error('Deletion request not found')
    }

    if (approved) {
      await this.performDataDeletion(deletionRequest.userId)
      
      await db.dataDeletionRequest.update({
        where: { id: requestId },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
          processedBy: adminId,
          adminNotes
        }
      })
    } else {
      await db.dataDeletionRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          processedAt: new Date(),
          processedBy: adminId,
          adminNotes
        }
      })
    }
  }

  /**
   * Perform actual data deletion (anonymization)
   */
  private static async performDataDeletion(userId: string): Promise<void> {
    // Anonymize user data instead of hard delete for audit purposes
    const anonymizedData = {
      name: 'Deleted User',
      email: `deleted_${Date.now()}@deleted.com`,
      mobile: `0000000000`,
      avatar: null,
      isBlocked: true
    }

    // Update user with anonymized data
    await db.user.update({
      where: { id: userId },
      data: anonymizedData
    })

    // Delete or anonymize related data
    await db.labourProfile.deleteMany({ where: { userId } })
    await db.employerProfile.deleteMany({ where: { userId } })
    await db.userConsent.deleteMany({ where: { userId } })
    await db.dataProcessingRecord.deleteMany({ where: { userId } })

    // Log the deletion
    await logDataAccess('delete', 'user_data', userId, userId)
  }

  /**
   * Get data processing records (Right to be Informed - Articles 13-14)
   */
  static async getDataProcessingRecords(userId: string): Promise<any[]> {
    return await db.dataProcessingRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  }

  /**
   * Create data processing record
   */
  static async createDataProcessingRecord(
    userId: string,
    purpose: string,
    legalBasis: string,
    dataCategories: string[],
    recipient?: string,
    retentionPeriod: string = '365 days'
  ): Promise<void> {
    await db.dataProcessingRecord.create({
      data: {
        userId,
        purpose,
        legalBasis,
        dataCategories: JSON.stringify(dataCategories),
        recipient,
        retentionPeriod
      }
    })
  }
}

// Privacy Policy Management
export class PrivacyManager {
  /**
   * Get current privacy policy
   */
  static async getPrivacyPolicy(): Promise<any> {
    // In a real implementation, this would come from a CMS or database
    return {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      sections: [
        {
          title: 'Data Collection',
          content: 'We collect personal information you provide directly to us, such as when you create an account, use our services, or contact us.'
        },
        {
          title: 'Data Usage',
          content: 'We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.'
        },
        {
          title: 'Data Sharing',
          content: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.'
        },
        {
          title: 'Data Security',
          content: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.'
        },
        {
          title: 'Your Rights',
          content: 'You have the right to access, update, or delete your personal information, as well as other rights as described in applicable data protection laws.'
        },
        {
          title: 'Contact Us',
          content: 'If you have any questions about this Privacy Policy, please contact us at privacy@labournow.com'
        }
      ]
    }
  }

  /**
   * Generate privacy policy acknowledgment
   */
  static generatePrivacyAcknowledgment(userId: string): string {
    const timestamp = new Date().toISOString()
    const data = `User ${userId} acknowledged privacy policy at ${timestamp}`
    return encrypt(data)
  }

  /**
   * Verify privacy policy acknowledgment
   */
  static verifyPrivacyAcknowledgment(acknowledgment: string): boolean {
    try {
      const decrypted = decrypt(acknowledgment)
      return decrypted.includes('acknowledged privacy policy at')
    } catch {
      return false
    }
  }
}

// Cookie Consent Management
export class CookieConsentManager {
  /**
   * Set cookie consent
   */
  static setCookieConsent(
    userId: string,
    consents: { [key: string]: boolean },
    ipAddress?: string
  ): void {
    // In a real implementation, this would set secure HTTP-only cookies
    const consentData = {
      userId,
      consents,
      timestamp: new Date().toISOString(),
      ipAddress
    }

    // Store consent in database or secure storage
    console.log('Cookie consent set:', maskSensitiveData(JSON.stringify(consentData)))
  }

  /**
   * Get cookie consent
   */
  static getCookieConsent(userId: string): any {
    // In a real implementation, this would read from secure cookies or database
    return {
      necessary: true, // Always required
      analytics: false,
      marketing: false,
      functional: false
    }
  }

  /**
   * Generate cookie consent banner data
   */
  static getCookieConsentBanner(): any {
    return {
      title: 'Cookie Consent',
      message: 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.',
      categories: [
        {
          id: 'necessary',
          name: 'Essential Cookies',
          description: 'These cookies are essential for the website to function and cannot be switched off.',
          required: true
        },
        {
          id: 'analytics',
          name: 'Analytics Cookies',
          description: 'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.',
          required: false
        },
        {
          id: 'marketing',
          name: 'Marketing Cookies',
          description: 'These cookies may be set through our site by our advertising partners to build a profile of your interests.',
          required: false
        },
        {
          id: 'functional',
          name: 'Functional Cookies',
          description: 'These cookies enable the website to provide enhanced functionality and personalization.',
          required: false
        }
      ]
    }
  }
}

export default {
  ConsentManager,
  DataSubjectRights,
  PrivacyManager,
  CookieConsentManager
}