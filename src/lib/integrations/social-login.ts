// Social Media Login Integration for LabourNow
export class SocialLogin {
  private providers: Map<string, any> = new Map()

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    // Google OAuth Provider
    this.providers.set('google', {
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      scopes: ['openid', 'email', 'profile']
    })

    // Facebook OAuth Provider
    this.providers.set('facebook', {
      clientId: process.env.FACEBOOK_APP_ID || '',
      clientSecret: process.env.FACEBOOK_APP_SECRET || '',
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      userInfoUrl: 'https://graph.facebook.com/me',
      scopes: ['email', 'public_profile']
    })

    // Apple Sign In Provider
    this.providers.set('apple', {
      clientId: process.env.APPLE_CLIENT_ID || '',
      teamId: process.env.APPLE_TEAM_ID || '',
      keyId: process.env.APPLE_KEY_ID || '',
      privateKey: process.env.APPLE_PRIVATE_KEY || '',
      authUrl: 'https://appleid.apple.com/auth/authorize',
      tokenUrl: 'https://appleid.apple.com/auth/token',
      scopes: ['name', 'email']
    })
  }

  // Get authorization URL for social login
  getAuthUrl(provider: string, redirectUri: string, state?: string) {
    const config = this.providers.get(provider)
    if (!config) {
      throw new Error(`Unsupported provider: ${provider}`)
    }

    const authUrl = new URL(config.authUrl)
    
    switch (provider) {
      case 'google':
        authUrl.searchParams.set('client_id', config.clientId)
        authUrl.searchParams.set('redirect_uri', redirectUri)
        authUrl.searchParams.set('response_type', 'code')
        authUrl.searchParams.set('scope', config.scopes.join(' '))
        authUrl.searchParams.set('access_type', 'offline')
        authUrl.searchParams.set('prompt', 'consent')
        break

      case 'facebook':
        authUrl.searchParams.set('client_id', config.clientId)
        authUrl.searchParams.set('redirect_uri', redirectUri)
        authUrl.searchParams.set('response_type', 'code')
        authUrl.searchParams.set('scope', config.scopes.join(','))
        break

      case 'apple':
        authUrl.searchParams.set('client_id', config.clientId)
        authUrl.searchParams.set('redirect_uri', redirectUri)
        authUrl.searchParams.set('response_type', 'code')
        authUrl.searchParams.set('scope', config.scopes.join(' '))
        authUrl.searchParams.set('response_mode', 'query')
        break
    }

    if (state) {
      authUrl.searchParams.set('state', state)
    }

    return authUrl.toString()
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(provider: string, code: string, redirectUri: string) {
    const config = this.providers.get(provider)
    if (!config) {
      throw new Error(`Unsupported provider: ${provider}`)
    }

    try {
      let response: Response
      let tokenData: any

      switch (provider) {
        case 'google':
        response = await fetch(config.tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri
          })
        })
        break

        case 'facebook':
          response = await fetch(config.tokenUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: config.clientId,
              client_secret: config.clientSecret,
              code,
              grant_type: 'authorization_code',
              redirect_uri: redirectUri
            })
          })
          break

        case 'apple':
          response = await fetch(config.tokenUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: config.clientId,
              client_secret: this.generateAppleClientSecret(),
              code,
              grant_type: 'authorization_code',
              redirect_uri: redirectUri
            })
          })
          break

        default:
          throw new Error(`Token exchange not implemented for provider: ${provider}`)
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Token exchange failed: ${response.status} - ${errorData.error?.message || response.statusText}`)
      }

      tokenData = await response.json()
      return tokenData
    } catch (error) {
      console.error(`Token exchange error for ${provider}:`, error)
      throw error
    }
  }

  // Get user information from provider
  async getUserInfo(provider: string, accessToken: string) {
    const config = this.providers.get(provider)
    if (!config) {
      throw new Error(`Unsupported provider: ${provider}`)
    }

    try {
      let response: Response
      let userData: any

      switch (provider) {
        case 'google':
          response = await fetch(config.userInfoUrl, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          })
          break

        case 'facebook':
          response = await fetch(`${config.userInfoUrl}?fields=id,name,email,picture.type(large)`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          })
          break

        case 'apple':
          // Apple doesn't have a separate user info endpoint, user info is in the token
          const tokenParts = accessToken.split('.')
          if (tokenParts.length !== 3) {
            throw new Error('Invalid Apple ID token format')
          }
          
          const payload = JSON.parse(atob(tokenParts[1]))
          userData = {
            id: payload.sub,
            email: payload.email,
            name: payload.name ? `${payload.name.firstName} ${payload.name.lastName}` : null
          }
          return userData

        default:
          throw new Error(`User info not implemented for provider: ${provider}`)
      }

      if (!response.ok) {
        throw new Error(`User info failed: ${response.status}`)
      }

      userData = await response.json()

      // Normalize user data
      return this.normalizeUserData(provider, userData)
    } catch (error) {
      console.error(`User info error for ${provider}:`, error)
      throw error
    }
  }

  // Normalize user data from different providers
  private normalizeUserData(provider: string, userData: any) {
    const normalized: any = {
      provider,
      id: userData.id || userData.sub,
      email: userData.email,
      name: userData.name,
      avatar: null,
      raw: userData
    }

    switch (provider) {
      case 'google':
        normalized.avatar = userData.picture
        normalized.firstName = userData.given_name
        normalized.lastName = userData.family_name
        normalized.verifiedEmail = userData.verified_email
        break

      case 'facebook':
        normalized.avatar = userData.picture?.data?.url
        normalized.firstName = userData.name?.split(' ')[0]
        normalized.lastName = userData.name?.split(' ').slice(1).join(' ')
        normalized.verified = userData.verified
        break

      case 'apple':
        // Apple doesn't provide avatar, user will need to upload one
        normalized.firstName = userData.name?.split(' ')[0]
        normalized.lastName = userData.name?.split(' ').slice(1).join(' ')
        normalized.emailPrivate = userData.email ? userData.email.includes('@privaterelay.appleid.com') : false
        break
    }

    return normalized
  }

  // Refresh access token
  async refreshAccessToken(provider: string, refreshToken: string) {
    const config = this.providers.get(provider)
    if (!config) {
      throw new Error(`Unsupported provider: ${provider}`)
    }

    try {
      let response: Response

      switch (provider) {
        case 'google':
          response = await fetch(config.tokenUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: config.clientId,
              client_secret: config.clientSecret,
              refresh_token: refreshToken,
              grant_type: 'refresh_token'
            })
          })
          break

        case 'facebook':
          response = await fetch(config.tokenUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: refreshToken
            })
          })
          break

        case 'apple':
          // Apple tokens don't expire for 6 months and can't be refreshed
          throw new Error('Apple ID tokens cannot be refreshed')

        default:
          throw new Error(`Token refresh not implemented for provider: ${provider}`)
      }

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Token refresh error for ${provider}:`, error)
      throw error
    }
  }

  // Revoke token
  async revokeToken(provider: string, accessToken: string) {
    const config = this.providers.get(provider)
    if (!config) {
      throw new Error(`Unsupported provider: ${provider}`)
    }

    try {
      let response: Response

      switch (provider) {
        case 'google':
          response = await fetch('https://oauth2.googleapis.com/revoke', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              token: accessToken,
              client_id: config.clientId,
              client_secret: config.clientSecret
            })
          })
          break

        case 'facebook':
          response = await fetch(`https://graph.facebook.com/v18.0/me/permissions?access_token=${accessToken}`, {
            method: 'DELETE'
          })
          break

        default:
          throw new Error(`Token revocation not implemented for provider: ${provider}`)
      }

      return response.ok
    } catch (error) {
      console.error(`Token revocation error for ${provider}:`, error)
      return false
    }
  }

  // Validate state parameter (CSRF protection)
  validateState(state: string, storedState: string): boolean {
    return state === storedState && state.length > 8
  }

  // Generate secure state parameter
  generateState(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Generate Apple client secret
  private generateAppleClientSecret(): string {
    const jwt = require('jsonwebtoken')
    
    const payload = {
      iss: this.providers.get('apple').teamId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (6 * 30 * 24 * 60 * 60), // 6 months
      aud: 'https://appleid.apple.com',
      sub: this.providers.get('apple').clientId
    }

    return jwt.sign(payload, this.providers.get('apple').privateKey, {
      algorithm: 'ES256',
      header: {
        kid: this.providers.get('apple').keyId,
        alg: 'ES256'
      }
    })
  }

  // Handle Apple Sign In on client side
  handleAppleSignIn() {
    if (typeof window !== 'undefined' && (window as any).AppleID) {
      (window as any).AppleID.auth.init({
        clientId: this.providers.get('apple').clientId,
        scope: 'name email',
        redirectURI: process.env.NEXT_PUBLIC_APP_URL + '/auth/apple/callback',
        state: this.generateState(),
        usePopup: true
      })

      return (window as any).AppleID.auth.signIn()
    }
    
    throw new Error('Apple Sign In not available')
  }

  // Get provider-specific configuration
  getProviderConfig(provider: string) {
    const config = this.providers.get(provider)
    if (!config) {
      throw new Error(`Unsupported provider: ${provider}`)
    }

    return {
      name: provider.charAt(0).toUpperCase() + provider.slice(1),
      clientId: config.clientId,
      scopes: config.scopes,
      features: this.getProviderFeatures(provider)
    }
  }

  // Get features available for each provider
  private getProviderFeatures(provider: string) {
    const features = {
      google: ['email', 'profile', 'offline_access', 'refresh_token'],
      facebook: ['email', 'public_profile'],
      apple: ['name', 'email', 'private_email']
    }

    return features[provider] || []
  }

  // Validate provider configuration
  validateProviderConfig(provider: string): { valid: boolean; errors: string[] } {
    const config = this.providers.get(provider)
    const errors: string[] = []

    if (!config) {
      errors.push(`Provider ${provider} is not supported`)
      return { valid: false, errors }
    }

    if (!config.clientId) {
      errors.push(`Client ID is missing for ${provider}`)
    }

    if (provider !== 'apple' && !config.clientSecret) {
      errors.push(`Client secret is missing for ${provider}`)
    }

    if (provider === 'apple') {
      if (!config.teamId) errors.push('Team ID is missing for Apple')
      if (!config.keyId) errors.push('Key ID is missing for Apple')
      if (!config.privateKey) errors.push('Private key is missing for Apple')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Get all supported providers
  getSupportedProviders() {
    return Array.from(this.providers.keys()).map(provider => ({
      id: provider,
      name: provider.charAt(0).toUpperCase() + provider.slice(1),
      config: this.getProviderConfig(provider)
    }))
  }
}

// Export singleton instance
export const socialLogin = new SocialLogin()

// Export individual methods for easier usage
export const {
  getAuthUrl,
  exchangeCodeForTokens,
  getUserInfo,
  refreshAccessToken,
  revokeToken,
  validateState,
  generateState,
  handleAppleSignIn,
  getProviderConfig,
  getSupportedProviders
} = socialLogin

export default socialLogin