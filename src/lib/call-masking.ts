/**
 * Call masking utility for LabourNow
 * Protects user privacy while enabling communication
 */

export interface CallMaskingOptions {
  showFullNumber?: boolean
  maskAllNumbers?: boolean
  allowUnmaskForBookedUsers?: boolean
  maskingPattern?: string
}

export class CallMasking {
  private static readonly DEFAULT_MASKING_PATTERN = 'XXX-XX-XX'
  private static readonly INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/

  /**
   * Mask a mobile number for privacy
   */
  static maskMobileNumber(mobile: string, options: CallMaskingOptions = {}): string {
    // Clean the mobile number
    const cleanMobile = mobile.replace(/\D/g, '')
    
    // Validate Indian mobile number
    if (!CallMasking.INDIAN_MOBILE_PATTERN.test(cleanMobile)) {
      return mobile // Return original if not a valid Indian mobile
    }

    // If showFullNumber is true, return as is
    if (options.showFullNumber) {
      return CallMasking.formatIndianMobile(cleanMobile)
    }

    // Apply masking
    const maskingPattern = options.maskingPattern || CallMasking.DEFAULT_MASKING_PATTERN
    const maskedNumber = CallMasking.applyMask(cleanMobile, maskingPattern)

    return CallMasking.formatIndianMobile(maskedNumber)
  }

  /**
   * Unmask a mobile number (for authorized users)
   */
  static unmaskMobileNumber(mobile: string, userRole: string, hasActiveBooking: boolean = false): string {
    // Only allow unmasking for employers with active bookings or admins
    if ((userRole === 'EMPLOYER' && hasActiveBooking) || userRole === 'ADMIN') {
      const cleanMobile = mobile.replace(/\D/g, '')
      return CallMasking.formatIndianMobile(cleanMobile)
    }

    return CallMasking.maskMobileNumber(mobile)
  }

  /**
   * Generate a temporary masked number for call initiation
   */
  static generateTemporaryMask(mobile: string, expiryMinutes: number = 30): {
    maskedNumber: string
    unmaskToken: string
    expiresAt: Date
  } {
    const cleanMobile = mobile.replace(/\D/g, '')
    const maskedNumber = CallMasking.maskMobileNumber(cleanMobile)
    
    // Generate a simple token (in production, use JWT)
    const unmaskToken = Buffer.from(`${cleanMobile}:${Date.now()}:${expiryMinutes}`).toString('base64')
    
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000)

    return {
      maskedNumber: CallMasking.formatIndianMobile(maskedNumber),
      unmaskToken,
      expiresAt
    }
  }

  /**
   * Validate and unmask using temporary token
   */
  static validateAndUnmaskToken(unmaskToken: string): {
    isValid: boolean
    mobileNumber?: string
    expired?: boolean
  } {
    try {
      const decoded = Buffer.from(unmaskToken, 'base64').toString('utf-8')
      const [mobile, timestamp, expiryMinutes] = decoded.split(':')
      
      const createdAt = new Date(parseInt(timestamp))
      const expiresAt = new Date(createdAt.getTime() + parseInt(expiryMinutes) * 60 * 1000)
      
      if (Date.now() > expiresAt.getTime()) {
        return { isValid: false, expired: true }
      }

      if (!CallMasking.INDIAN_MOBILE_PATTERN.test(mobile)) {
        return { isValid: false }
      }

      return {
        isValid: true,
        mobileNumber: CallMasking.formatIndianMobile(mobile)
      }
    } catch (error) {
      return { isValid: false }
    }
  }

  /**
   * Format Indian mobile number with proper spacing
   */
  static formatIndianMobile(mobile: string): string {
    const cleanMobile = mobile.replace(/\D/g, '')
    
    if (cleanMobile.length !== 10) {
      return cleanMobile
    }

    // Format as +91-XXXXX-XXXX
    const formatted = `+91-${cleanMobile.slice(0, 4)}${cleanMobile.slice(4, 5)}${cleanMobile.slice(5)}`
    return formatted
  }

  /**
   * Create a click-to-call link with masked number
   */
  static createClickToCallLink(mobile: string, options: CallMaskingOptions = {}): {
    href: string
    displayNumber: string
    onClick: () => void
  } {
    const maskedNumber = CallMasking.maskMobileNumber(mobile, options)
    
    // For actual calling, we'd need to implement a call forwarding service
    // For now, we'll use tel: with the masked number (this won't actually work)
    // In production, this would integrate with a call masking service
    
    return {
      href: `tel:${maskedNumber.replace(/[^0-9]/g, '')}`,
      displayNumber: maskedNumber,
      onClick: () => {
        // In production, this would:
        // 1. Generate a temporary unmask token
        // 2. Redirect to call masking service
        // 3. Service would unmask and connect the call
        console.log('Initiating call with masking service')
        
        // For demo purposes, we'll just show the masked number
        alert(`Call would be connected through masking service\nMasked: ${maskedNumber}`)
      }
    }
  }

  /**
   * Generate a shareable contact link
   */
  static generateShareableLink(mobile: string, userName: string, options: CallMaskingOptions = {}): {
    shareLink: string
    displayNumber: string
    qrData: any
  } {
    const maskedNumber = CallMasking.maskMobileNumber(mobile, options)
    
    // Create a shareable link that doesn't expose the full number
    const shareData = {
      type: 'contact',
      name: userName,
      contact: maskedNumber,
      platform: 'labournow',
      timestamp: Date.now()
    }

    // In production, this would be encrypted and stored temporarily
    const shareToken = Buffer.from(JSON.stringify(shareData)).toString('base64')
    const shareLink = `${process.env.NEXTAUTH_URL}/contact/${shareToken}`

    return {
      shareLink,
      displayNumber: maskedNumber,
      qrData: {
        type: 'contact',
        name: userName,
        contact: maskedNumber
      }
    }
  }

  /**
   * Validate if a number can be called (has active booking)
   */
  static canCallNumber(mobile: string, userRole: string, hasActiveBooking: boolean): {
    canCall: boolean
    reason?: string
    requiresUnmasking: boolean
  } {
    const cleanMobile = mobile.replace(/\D/g, '')
    
    if (!CallMasking.INDIAN_MOBILE_PATTERN.test(cleanMobile)) {
      return { canCall: false, reason: 'Invalid mobile number', requiresUnmasking: false }
    }

    if (userRole === 'ADMIN') {
      return { canCall: true, requiresUnmasking: false }
    }

    if (userRole === 'EMPLOYER' && hasActiveBooking) {
      return { canCall: true, requiresUnmasking: false }
    }

    if (userRole === 'EMPLOYER' && !hasActiveBooking) {
      return { 
        canCall: true, 
        requiresUnmasking: true, 
        reason: 'Requires active booking to unmask number' 
      }
    }

    return { canCall: false, reason: 'Unauthorized to call this number', requiresUnmasking: false }
  }

  /**
   * Apply masking pattern to mobile number
   */
  static applyMask(mobile: string, pattern: string): string {
    const patternParts = pattern.split('-')
    let result = ''
    let patternIndex = 0
    let mobileIndex = 0

    for (const part of patternParts) {
      if (part === 'XXX') {
        // Replace X's with actual digits
        const digitsNeeded = Math.min(3, mobile.length - mobileIndex)
        result += mobile.slice(mobileIndex, mobileIndex + digitsNeeded)
        mobileIndex += digitsNeeded
        patternIndex += 3
      } else if (part === 'XX') {
        // Replace X's with actual digits
        const digitsNeeded = Math.min(2, mobile.length - mobileIndex)
        result += mobile.slice(mobileIndex, mobileIndex + digitsNeeded)
        mobileIndex += digitsNeeded
        patternIndex += 2
      } else {
        // Keep the pattern character
        result += part
        patternIndex += part.length
      }
    }

    // If we still have remaining digits, append them
    if (mobileIndex < mobile.length) {
      result += mobile.slice(mobileIndex)
    }

    return result
  }

  /**
   * Check if a number is masked
   */
  static isMasked(mobile: string): boolean {
    return mobile.includes('X') || mobile.includes('XXX')
  }

  /**
   * Get call analytics (for admin dashboard)
   */
  static getCallAnalytics(calls: Array<{
    id: string
    callerId: string
    receiverId: string
    timestamp: Date
    duration: number
    wasMasked: boolean
    bookingId?: string
  }>) {
    const totalCalls = calls.length
    const maskedCalls = calls.filter(call => call.wasMasked).length
    const averageDuration = calls.reduce((sum, call) => sum + call.duration, 0) / totalCalls
    
    const callsByHour = calls.reduce((acc, call) => {
      const hour = call.timestamp.getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    return {
      totalCalls,
      maskedCalls,
      unmaskedCalls: totalCalls - maskedCalls,
      maskingPercentage: totalCalls > 0 ? (maskedCalls / totalCalls) * 100 : 0,
      averageDuration: Math.round(averageDuration),
      peakHour: Object.keys(callsByHour).reduce((a, b) => 
        callsByHour[Number(a)] > callsByHour[Number(b)] ? a : b
      ),
      callsByHour
    }
  }
}