// Web Share API Integration for LabourNow
export class ShareManager {
  constructor() {
    this.isSupported = this.checkSupport()
    this.fallbackMethods = ['clipboard', 'download', 'email', 'sms']
  }

  checkSupport() {
    return typeof navigator !== 'undefined' && 'share' in navigator
  }

  // Main share function with fallback support
  async share(options) {
    const {
      title = 'LabourNow',
      text,
      url,
      files,
      fallback = true
    } = options

    if (!text && !url) {
      throw new Error('Either text or URL must be provided for sharing')
    }

    // Try native Web Share API first
    if (this.isSupported) {
      try {
        const shareData = { title, text, url }
        if (files && files.length > 0) {
          shareData.files = files
        }

        const result = await navigator.share(shareData)
        console.log('[Share] Content shared successfully:', result)
        return { success: true, method: 'native', result }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.log('[Share] Native share failed, trying fallback:', error.message)
        } else {
          // User cancelled the share
          return { success: false, method: 'native', cancelled: true }
        }
      }
    }

    // Use fallback methods if native share failed or isn't supported
    if (fallback) {
      return await this.shareFallback(options)
    }

    throw new Error('Web Share API not supported and fallback disabled')
  }

  // Fallback sharing methods
  async shareFallback(options) {
    const { title, text, url, files } = options

    // Try different fallback methods in order of preference
    for (const method of this.fallbackMethods) {
      try {
        const result = await this[`shareVia${method.charAt(0).toUpperCase() + method.slice(1)}`](options)
        if (result.success) {
          return { success: true, method, ...result }
        }
      } catch (error) {
        console.log(`[Share] ${method} fallback failed:`, error.message)
        continue
      }
    }

    throw new Error('All sharing methods failed')
  }

  // Share via clipboard
  async shareViaClipboard(options) {
    const { text, url } = options
    const shareText = url ? `${text}\n${url}` : text

    if (!navigator.clipboard) {
      throw new Error('Clipboard API not supported')
    }

    try {
      await navigator.clipboard.writeText(shareText)
      this.showToast('Content copied to clipboard!')
      return { success: true, message: 'Copied to clipboard' }
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareText
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      
      try {
        document.execCommand('copy')
        this.showToast('Content copied to clipboard!')
        return { success: true, message: 'Copied to clipboard' }
      } catch (error) {
        throw new Error('Failed to copy to clipboard')
      } finally {
        document.body.removeChild(textArea)
      }
    }
  }

  // Share via download (create a text file)
  async shareViaDownload(options) {
    const { title, text, url } = options
    const content = url ? `${title}\n\n${text}\n\n${url}` : `${title}\n\n${text}`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const downloadUrl = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(downloadUrl)
    
    this.showToast('Download started!')
    return { success: true, message: 'Download started' }
  }

  // Share via email
  async shareViaEmail(options) {
    const { title, text, url } = options
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(url ? `${text}\n\n${url}` : text)
    
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`
    window.location.href = mailtoUrl
    
    return { success: true, message: 'Email client opened' }
  }

  // Share via SMS
  async shareViaSMS(options) {
    const { text, url } = options
    const message = encodeURIComponent(url ? `${text} ${url}` : text)
    
    if (navigator.userAgent.includes('iPhone')) {
      window.location.href = `sms:&body=${message}`
    } else {
      window.location.href = `sms:?body=${message}`
    }
    
    return { success: true, message: 'SMS app opened' }
  }

  // Share specific LabourNow content types
  async shareLabourProfile(profile) {
    const shareText = `Check out ${profile.name} - ${profile.category} in ${profile.location}\n⭐ ${profile.rating} stars • ${profile.experience} years experience\n💰 ₹${profile.hourlyWage}/hour`
    
    return this.share({
      title: `${profile.name} - ${profile.category}`,
      text: shareText,
      url: `${window.location.origin}/labour/${profile.id}`,
      fallback: true
    })
  }

  async shareJobListing(job) {
    const shareText = `Job Opening: ${job.category} needed in ${job.location}\n📅 ${new Date(job.date).toLocaleDateString()}\n⏰ ${job.duration}\n💰 ₹${job.totalAmount}`
    
    return this.share({
      title: `Job: ${job.category}`,
      text: shareText,
      url: `${window.location.origin}/jobs/${job.id}`,
      fallback: true
    })
  }

  async shareApp() {
    const shareText = 'Download LabourNow - Find skilled workers and jobs instantly!\n📱 Available on Android and iOS\n🔍 Search workers by category and location\n💼 Book reliable labour for your needs'
    
    return this.share({
      title: 'LabourNow - Find Workers & Jobs',
      text: shareText,
      url: window.location.origin,
      fallback: true
    })
  }

  async shareBooking(booking) {
    const statusText = {
      'PENDING': 'Booking Pending',
      'ACCEPTED': 'Booking Confirmed',
      'IN_PROGRESS': 'Work in Progress',
      'COMPLETED': 'Work Completed'
    }
    
    const shareText = `${statusText[booking.status] || 'Booking'}\n👷 ${booking.category}\n📍 ${booking.jobLocation}\n📅 ${new Date(booking.date).toLocaleDateString()}\n💰 ₹${booking.totalAmount}`
    
    return this.share({
      title: `Booking #${booking.bookingNumber}`,
      text: shareText,
      url: `${window.location.origin}/bookings/${booking.id}`,
      fallback: true
    })
  }

  // Share files (images, documents)
  async shareFiles(files, title = 'Shared from LabourNow') {
    if (!files || files.length === 0) {
      throw new Error('No files provided for sharing')
    }

    // Convert File objects to File array if needed
    const fileArray = Array.isArray(files) ? files : [files]
    
    return this.share({
      title,
      text: `Shared ${fileArray.length} file(s) from LabourNow`,
      files: fileArray,
      fallback: true
    })
  }

  // Generate shareable links
  generateShareLink(type, id, params = {}) {
    const baseUrl = window.location.origin
    const queryString = new URLSearchParams(params).toString()
    const url = `${baseUrl}/${type}/${id}${queryString ? '?' + queryString : ''}`
    
    return url
  }

  // Create QR code for sharing
  async generateQRCode(text) {
    try {
      // Use a QR code API or library
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`
      
      // For a more integrated solution, you'd use a QR code library
      return qrCodeUrl
    } catch (error) {
      console.error('[Share] Failed to generate QR code:', error)
      return null
    }
  }

  // Share with QR code
  async shareWithQR(url, title = 'Scan QR Code') {
    const qrCodeUrl = await this.generateQRCode(url)
    
    if (!qrCodeUrl) {
      throw new Error('Failed to generate QR code')
    }

    // Create a modal or overlay to show QR code
    this.showQRCodeModal(qrCodeUrl, title, url)
    
    return { success: true, method: 'qrcode', qrCodeUrl }
  }

  // Show QR code modal
  showQRCodeModal(qrCodeUrl, title, shareUrl) {
    // Create modal overlay
    const modal = document.createElement('div')
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `

    // Create modal content
    const content = document.createElement('div')
    content.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 15px;
      text-align: center;
      max-width: 300px;
      width: 90%;
    `

    content.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #333;">${title}</h3>
      <img src="${qrCodeUrl}" alt="QR Code" style="width: 200px; height: 200px; margin-bottom: 15px;">
      <p style="margin: 0 0 15px 0; color: #666; font-size: 14px; word-break: break-all;">${shareUrl}</p>
      <button id="close-qr-modal" style="
        background: #007bff;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
      ">Close</button>
    `

    modal.appendChild(content)
    document.body.appendChild(modal)

    // Close modal handlers
    const closeModal = () => {
      document.body.removeChild(modal)
    }

    document.getElementById('close-qr-modal').addEventListener('click', closeModal)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal()
      }
    })
  }

  // Show toast notification
  showToast(message, duration = 3000) {
    // Remove existing toast
    const existingToast = document.getElementById('share-toast')
    if (existingToast) {
      document.body.removeChild(existingToast)
    }

    // Create new toast
    const toast = document.createElement('div')
    toast.id = 'share-toast'
    toast.textContent = message
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      font-size: 14px;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `

    document.body.appendChild(toast)

    // Animate in
    setTimeout(() => {
      toast.style.opacity = '1'
    }, 100)

    // Remove after duration
    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast)
        }
      }, 300)
    }, duration)
  }

  // Check if specific sharing method is available
  isMethodAvailable(method) {
    switch (method) {
      case 'native':
        return this.isSupported
      case 'clipboard':
        return typeof navigator !== 'undefined' && 'clipboard' in navigator
      case 'email':
        return typeof window !== 'undefined' && 'location' in window
      case 'sms':
        return typeof window !== 'undefined' && 'location' in window
      case 'download':
        return typeof document !== 'undefined'
      default:
        return false
    }
  }

  // Get available sharing methods
  getAvailableMethods() {
    return this.fallbackMethods.filter(method => this.isMethodAvailable(method))
  }
}

// Export singleton instance
export const shareManager = new ShareManager()

// Export individual methods for easier usage
export const {
  share,
  shareLabourProfile,
  shareJobListing,
  shareApp,
  shareBooking,
  shareFiles,
  generateShareLink,
  shareWithQR
} = shareManager

export default shareManager