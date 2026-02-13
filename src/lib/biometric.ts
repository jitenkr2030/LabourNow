// Biometric Authentication System for LabourNow
export class BiometricAuth {
  constructor() {
    this.isSupported = this.checkSupport()
    this.credentials = new Map()
  }

  checkSupport() {
    return (
      typeof window !== 'undefined' &&
      'credentials' in navigator &&
      'PublicKeyCredential' in window &&
      typeof PublicKeyCredential === 'function'
    )
  }

  // Check if biometric authentication is available
  async isBiometricAvailable() {
    if (!this.isSupported) {
      return {
        available: false,
        reason: 'WebAuthn not supported in this browser'
      }
    }

    try {
      // Check if platform authenticator is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      
      return {
        available,
        reason: available ? 'Biometric authentication available' : 'No biometric hardware found'
      }
    } catch (error) {
      return {
        available: false,
        reason: `Error checking biometric availability: ${error.message}`
      }
    }
  }

  // Register biometric credentials for a user
  async registerBiometric(userId, userName, userMobile) {
    if (!this.isSupported) {
      throw new Error('Biometric authentication not supported')
    }

    try {
      // Create credential options
      const createCredentialOptions = {
        publicKey: {
          challenge: this.generateChallenge(),
          rp: {
            name: 'LabourNow',
            id: window.location.hostname
          },
          user: {
            id: new TextEncoder().encode(userId),
            name: userName,
            displayName: `${userName} (${userMobile})`
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },  // ES256
            { alg: -257, type: 'public-key' } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            requireResidentKey: false
          },
          timeout: 60000,
          attestation: 'direct'
        }
      }

      // Create credential
      const credential = await navigator.credentials.create(createCredentialOptions)
      
      if (!credential) {
        throw new Error('Failed to create biometric credential')
      }

      // Store credential info
      const credentialInfo = {
        id: credential.id,
        type: credential.type,
        response: {
          clientDataJSON: arrayBufferToBase64(credential.response.clientDataJSON),
          attestationObject: arrayBufferToBase64(credential.response.attestationObject)
        },
        userId,
        createdAt: new Date().toISOString()
      }

      // Save to server
      await this.saveBiometricCredential(credentialInfo)
      
      // Cache locally
      this.credentials.set(userId, credentialInfo)

      console.log('[BiometricAuth] Registration successful')
      return {
        success: true,
        credentialId: credential.id
      }

    } catch (error) {
      console.error('[BiometricAuth] Registration failed:', error)
      throw new Error(`Biometric registration failed: ${error.message}`)
    }
  }

  // Authenticate using biometrics
  async authenticate(userId, reason = 'Authenticate to access LabourNow') {
    if (!this.isSupported) {
      throw new Error('Biometric authentication not supported')
    }

    try {
      // Get stored credentials for user
      let credentialIds = []
      
      // Try to get from server first
      try {
        const response = await fetch(`/api/auth/biometric/credentials/${userId}`)
        if (response.ok) {
          const serverCredentials = await response.json()
          credentialIds = serverCredentials.map(cred => ({
            id: base64ToArrayBuffer(cred.credentialId),
            type: 'public-key',
            transports: ['internal', 'ble', 'nfc', 'usb']
          }))
        }
      } catch (error) {
        console.log('[BiometricAuth] Could not fetch server credentials')
      }

      // If no server credentials, try local cache
      if (credentialIds.length === 0) {
        const localCredential = this.credentials.get(userId)
        if (localCredential) {
          credentialIds = [{
            id: base64ToArrayBuffer(localCredential.id),
            type: 'public-key',
            transports: ['internal']
          }]
        }
      }

      if (credentialIds.length === 0) {
        throw new Error('No biometric credentials found for this user')
      }

      // Create authentication options
      const getCredentialOptions = {
        publicKey: {
          challenge: this.generateChallenge(),
          allowCredentials: credentialIds,
          userVerification: 'required',
          timeout: 60000
        }
      }

      // Get credential
      const assertion = await navigator.credentials.get(getCredentialOptions)
      
      if (!assertion) {
        throw new Error('Biometric authentication failed')
      }

      // Verify assertion with server
      const verificationResult = await this.verifyBiometricAssertion(userId, {
        id: assertion.id,
        rawId: arrayBufferToBase64(assertion.rawId),
        response: {
          authenticatorData: arrayBufferToBase64(assertion.response.authenticatorData),
          clientDataJSON: arrayBufferToBase64(assertion.response.clientDataJSON),
          signature: arrayBufferToBase64(assertion.response.signature),
          userHandle: assertion.response.userHandle ? 
            arrayBufferToBase64(assertion.response.userHandle) : null
        },
        type: assertion.type
      })

      if (!verificationResult.valid) {
        throw new Error('Biometric verification failed')
      }

      console.log('[BiometricAuth] Authentication successful')
      return {
        success: true,
        userId,
        token: verificationResult.token,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error('[BiometricAuth] Authentication failed:', error)
      
      // Handle specific error types
      if (error.name === 'NotAllowedError') {
        throw new Error('Biometric authentication was cancelled')
      } else if (error.name === 'InvalidStateError') {
        throw new Error('Biometric authentication is already in progress')
      } else if (error.name === 'SecurityError') {
        throw new Error('Biometric authentication failed security check')
      } else {
        throw new Error(`Biometric authentication failed: ${error.message}`)
      }
    }
  }

  // Save biometric credential to server
  async saveBiometricCredential(credentialInfo) {
    try {
      const response = await fetch('/api/auth/biometric/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentialInfo)
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('[BiometricAuth] Failed to save credential to server:', error)
      throw error
    }
  }

  // Verify biometric assertion with server
  async verifyBiometricAssertion(userId, assertion) {
    try {
      const response = await fetch('/api/auth/biometric/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          assertion
        })
      })

      if (!response.ok) {
        throw new Error(`Verification failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('[BiometricAuth] Failed to verify assertion:', error)
      throw error
    }
  }

  // Remove biometric credentials
  async removeBiometricCredentials(userId) {
    try {
      // Remove from server
      await fetch(`/api/auth/biometric/credentials/${userId}`, {
        method: 'DELETE'
      })

      // Remove from local cache
      this.credentials.delete(userId)

      console.log('[BiometricAuth] Credentials removed successfully')
      return { success: true }
    } catch (error) {
      console.error('[BiometricAuth] Failed to remove credentials:', error)
      throw error
    }
  }

  // Check if user has biometric credentials
  async hasBiometricCredentials(userId) {
    try {
      const response = await fetch(`/api/auth/biometric/credentials/${userId}`)
      return response.ok
    } catch (error) {
      return false
    }
  }

  // Generate random challenge
  generateChallenge() {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return array
  }

  // Get biometric type (fingerprint, face ID, etc.)
  async getBiometricType() {
    if (!this.isSupported) {
      return null
    }

    try {
      // This is a simplified way to detect biometric type
      // In a real implementation, you'd analyze the authenticator data
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      
      if (available) {
        // Try to determine the type based on user agent
        const userAgent = navigator.userAgent.toLowerCase()
        
        if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
          return 'face_id' // iOS devices typically use Face ID or Touch ID
        } else if (userAgent.includes('android')) {
          return 'fingerprint' // Most Android devices use fingerprint
        } else {
          return 'biometric' // Generic biometric
        }
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  // Enable/disable biometric authentication
  async toggleBiometricAuth(userId, enabled) {
    try {
      const response = await fetch('/api/auth/biometric/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, enabled })
      })

      if (!response.ok) {
        throw new Error(`Failed to toggle biometric auth: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('[BiometricAuth] Failed to toggle biometric auth:', error)
      throw error
    }
  }

  // Get biometric settings for user
  async getBiometricSettings(userId) {
    try {
      const response = await fetch(`/api/auth/biometric/settings/${userId}`)
      if (response.ok) {
        return await response.json()
      }
      return { enabled: false, registered: false }
    } catch (error) {
      return { enabled: false, registered: false }
    }
  }
}

// Utility functions
function arrayBufferToBase64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

// Export singleton instance
export const biometricAuth = new BiometricAuth()

// Export individual methods for easier usage
export const {
  isBiometricAvailable,
  registerBiometric,
  authenticate,
  removeBiometricCredentials,
  hasBiometricCredentials,
  getBiometricType,
  toggleBiometricAuth,
  getBiometricSettings
} = biometricAuth

export default biometricAuth