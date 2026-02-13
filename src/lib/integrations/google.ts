// Google Services Integration for LabourNow
export class GoogleServices {
  private mapsApiKey: string
  private analyticsId: string
  private oauthClientId: string
  private oauthClientSecret: string

  constructor() {
    this.mapsApiKey = process.env.GOOGLE_MAPS_API_KEY || ''
    this.analyticsId = process.env.GOOGLE_ANALYTICS_ID || ''
    this.oauthClientId = process.env.GOOGLE_OAUTH_CLIENT_ID || ''
    this.oauthClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET || ''
  }

  // Google Maps Integration
  async geocodeAddress(address: string) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.mapsApiKey}`
      )
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status !== 'OK' || data.results.length === 0) {
        throw new Error('No results found for address')
      }

      const result = data.results[0]
      return {
        address: result.formatted_address,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        placeId: result.place_id,
        components: result.address_components
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      throw error
    }
  }

  async reverseGeocode(latitude: number, longitude: number) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.mapsApiKey}`
      )
      
      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status !== 'OK' || data.results.length === 0) {
        throw new Error('No results found for coordinates')
      }

      const result = data.results[0]
      return {
        address: result.formatted_address,
        placeId: result.placeId,
        components: result.address_components
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      throw error
    }
  }

  async searchPlaces(query: string, location?: { lat: number; lng: number }, radius = 5000) {
    try {
      let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${this.mapsApiKey}`
      
      if (location) {
        url += `&location=${location.lat},${location.lng}&radius=${radius}`
      }

      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Place search failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status !== 'OK') {
        throw new Error(`Place search error: ${data.status}`)
      }

      return data.results.map(place => ({
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        location: place.geometry.location,
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        types: place.types,
        photos: place.photos?.map((photo: any) => ({
          photoReference: photo.photo_reference,
          width: photo.width,
          height: photo.height
        })) || []
      }))
    } catch (error) {
      console.error('Place search error:', error)
      throw error
    }
  }

  async getPlaceDetails(placeId: string) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${this.mapsApiKey}&fields=name,formatted_address,geometry,rating,reviews,photos,opening_hours,price_level,types`
      )
      
      if (!response.ok) {
        throw new Error(`Place details failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status !== 'OK') {
        throw new Error(`Place details error: ${data.status}`)
      }

      const result = data.result
      return {
        placeId: result.place_id,
        name: result.name,
        address: result.formatted_address,
        location: result.geometry.location,
        rating: result.rating,
        userRatingsTotal: result.user_ratings_total,
        reviews: result.reviews || [],
        photos: result.photos?.map((photo: any) => ({
          photoReference: photo.photo_reference,
          width: photo.width,
          height: photo.height
        })) || [],
        openingHours: result.opening_hours,
        priceLevel: result.price_level,
        types: result.types
      }
    } catch (error) {
      console.error('Place details error:', error)
      throw error
    }
  }

  async getDirections(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }, mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving') {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=${mode}&key=${this.mapsApiKey}`
      )
      
      if (!response.ok) {
        throw new Error(`Directions failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status !== 'OK') {
        throw new Error(`Directions error: ${data.status}`)
      }

      const route = data.routes[0]
      const leg = route.legs[0]

      return {
        distance: leg.distance,
        duration: leg.duration,
        steps: leg.steps.map((step: any) => ({
          instruction: step.html_instructions,
          distance: step.distance,
          duration: step.duration,
          startLocation: step.start_location,
          endLocation: step.end_location
        })),
        polyline: route.overview_polyline,
        bounds: route.bounds
      }
    } catch (error) {
      console.error('Directions error:', error)
      throw error
    }
  }

  async getStaticMap(center: { lat: number; lng: number }, zoom = 15, size = '600x400', markers?: any[]) {
    let url = `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=${zoom}&size=${size}&key=${this.mapsApiKey}`
    
    if (markers && markers.length > 0) {
      const markerParams = markers.map(marker => {
        const color = marker.color || 'red'
        const label = marker.label || ''
        const pos = `${marker.lat},${marker.lng}`
        return `${color}${label ? `${label}` : ''}${pos}`
      }).join('&')
      url += `&markers=${markerParams}`
    }

    return url
  }

  // Google Analytics Integration
  trackPageView(page: string, title?: string) {
    if (typeof gtag !== 'undefined') {
      gtag('config', this.analyticsId, {
        page_title: title || page,
        page_location: window.location.href
      })
      gtag('event', 'page_view', {
        page_title: title || page,
        page_location: window.location.href
      })
    }
  }

  trackEvent(eventName: string, parameters?: Record<string, any>) {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        custom_parameter_1: parameters?.category,
        custom_parameter_2: parameters?.label,
        custom_parameter_3: parameters?.value,
        ...parameters
      })
    }
  }

  trackUser(userId: string, properties?: Record<string, any>) {
    if (typeof gtag !== 'undefined') {
      gtag('config', this.analyticsId, {
        user_id: userId,
        custom_map: properties
      })
      gtag('event', 'login', {
        method: 'google',
        user_id: userId
      })
    }
  }

  trackConversion(conversionId: string, value?: number, currency?: string) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'conversion', {
        send_to: `${this.analyticsId}/${conversionId}`,
        value: value,
        currency: currency || 'INR'
      })
    }
  }

  // Google OAuth Integration
  async getAuthUrl(redirectUri: string, scopes: string[] = ['openid', 'email', 'profile']) {
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    
    authUrl.searchParams.set('client_id', this.oauthClientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', scopes.join(' '))
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')

    return authUrl.toString()
  }

  async exchangeCodeForTokens(code: string, redirectUri: string) {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.oauthClientId,
          client_secret: this.oauthClientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri
        })
      })

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Token exchange error:', error)
      throw error
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.oauthClientId,
          client_secret: this.oauthClientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Token refresh error:', error)
      throw error
    }
  }

  async getUserInfo(accessToken: string) {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`User info failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('User info error:', error)
      throw error
    }
  }

  // Google Drive Integration (for file storage)
  async uploadFile(file: File, accessToken: string, folderId?: string) {
    try {
      const metadata = {
        name: file.name,
        mimeType: file.type,
        ...(folderId && { parents: [folderId] })
      }

      // Create multipart form data
      const form = new FormData()
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
      form.append('file', file)

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: form
      })

      if (!response.ok) {
        throw new Error(`File upload failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('File upload error:', error)
      throw error
    }
  }

  async createFolder(name: string, accessToken: string, parentFolderId?: string) {
    try {
      const metadata = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentFolderId && { parents: [parentFolderId] })
      }

      const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      })

      if (!response.ok) {
        throw new Error(`Folder creation failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Folder creation error:', error)
      throw error
    }
  }

  // Google Calendar Integration
  async createEvent(eventData: any, accessToken: string, calendarId: string = 'primary') {
    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      })

      if (!response.ok) {
        throw new Error(`Event creation failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Event creation error:', error)
      throw error
    }
  }

  // Initialize Google services
  initializeGoogleServices() {
    // Load Google Maps script
    this.loadGoogleMaps()
    
    // Initialize Google Analytics
    this.initializeGoogleAnalytics()
  }

  private loadGoogleMaps() {
    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.mapsApiKey}&libraries=places`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }

  private initializeGoogleAnalytics() {
    if (typeof window !== 'undefined' && !window.gtag) {
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.analyticsId}`
      script.async = true
      document.head.appendChild(script)

      script.onload = () => {
        window.dataLayer = window.dataLayer || []
        window.gtag = function() {
          window.dataLayer.push(arguments)
        }
        window.gtag('js', new Date())
        window.gtag('config', this.analyticsId)
      }
    }
  }
}

// Export singleton instance
export const googleServices = new GoogleServices()

// Export individual methods for easier usage
export const {
  geocodeAddress,
  reverseGeocode,
  searchPlaces,
  getPlaceDetails,
  getDirections,
  getStaticMap,
  trackPageView,
  trackEvent,
  trackUser,
  trackConversion,
  getAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  getUserInfo,
  uploadFile,
  createFolder,
  createEvent,
  initializeGoogleServices
} = googleServices

export default googleServices