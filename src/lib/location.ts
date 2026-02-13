import { useState, useEffect } from 'react'

export interface Location {
  latitude: number
  longitude: number
  address?: string
  city?: string
  state?: string
  pincode?: string
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const [location, setLocation] = useState<Location | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    setLoading(true)
    setError(null)

    const defaultOptions: GeolocationOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
        setLoading(false)
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location access.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
          default:
            errorMessage = 'An unknown error occurred.'
            break
        }
        
        setError(errorMessage)
        setLoading(false)
      },
      defaultOptions
    )
  }

  const watchLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    const defaultOptions: GeolocationOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location access.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
          default:
            errorMessage = 'An unknown error occurred.'
            break
        }
        
        setError(errorMessage)
      },
      defaultOptions
    )
  }

  return {
    location,
    error,
    loading,
    getCurrentLocation,
    watchLocation
  }
}

export function useReverseGeolocation() {
  const [address, setAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reverseGeocode = async (latitude: number, longitude: number) => {
    setLoading(true)
    setError(null)

    try {
      // Use Nominatim (OpenStreetMap) for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'LabourNow/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch address')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      const formattedAddress = formatAddress(data.address)
      setAddress(formattedAddress)
    } catch (error) {
      setError('Failed to get address from coordinates')
      console.error('Reverse geocoding error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address: any): string => {
    const parts: string[] = []
    
    if (address.house_number) {
      parts.push(address.house_number)
    }
    
    if (address.road) {
      parts.push(address.road)
    }
    
    if (address.suburb) {
      parts.push(address.suburb)
    }
    
    if (address.city || address.town || address.village) {
      parts.push(address.city || address.town || address.village)
    }
    
    if (address.state) {
      parts.push(address.state)
    }
    
    if (address.postcode) {
      parts.push(address.postcode)
    }
    
    if (address.country) {
      parts.push(address.country)
    }

    return parts.join(', ')
  }

  return {
    address,
    loading,
    error,
    reverseGeocode
  }
}

export function useGeocoding() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const geocode = async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Use Nominatim (OpenStreetMap) for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=in`,
        {
          headers: {
            'User-Agent': 'LabourNow/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch locations')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      const formattedResults = data.map((item: any) => ({
        id: item.place_id,
        displayName: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        address: item.address,
        importance: item.importance,
        type: item.type
      }))

      setResults(formattedResults)
    } catch (error) {
      setError('Failed to search locations')
      console.error('Geocoding error:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    results,
    loading,
    error,
    geocode
  }
}

export function calculateDistance(
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(point2.latitude - point1.latitude)
  const dLon = toRadians(point2.longitude - point1.longitude)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
    Math.cos(toRadians(point2.latitude)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export function isPointInRadius(
  center: { latitude: number; longitude: number },
  point: { latitude: number; longitude: number },
  radiusKm: number
): boolean {
  const distance = calculateDistance(center, point)
  return distance <= radiusKm
}

export function getBoundsFromRadius(
  center: { latitude: number; longitude: number },
  radiusKm: number
) {
  // Approximate conversion: 1 degree latitude ≈ 111 km
  const latitudeDelta = radiusKm / 111
  const longitudeDelta = radiusKm / (111 * Math.cos(toRadians(center.latitude)))
  
  return {
    north: center.latitude + latitudeDelta,
    south: center.latitude - latitudeDelta,
    east: center.longitude + longitudeDelta,
    west: center.longitude - longitudeDelta
  }
}

export function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
}

export function parseCoordinates(coordinates: string): { latitude: number; longitude: number } | null {
  const parts = coordinates.split(',').map(s => s.trim())
  
  if (parts.length !== 2) {
    return null
  }
  
  const latitude = parseFloat(parts[0])
  const longitude = parseFloat(parts[1])
  
  if (isNaN(latitude) || isNaN(longitude)) {
    return null
  }
  
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null
  }
  
  return { latitude, longitude }
}

export async function getDistanceMatrix(
  origins: { latitude: number; longitude: number }[],
  destinations: { latitude: number; longitude: number }[]
): Promise<number[][]> {
  // This would typically use Google Distance Matrix API
  // For now, we'll calculate straight-line distances
  const matrix: number[][] = []
  
  for (const origin of origins) {
    const row: number[] = []
    for (const destination of destinations) {
      const distance = calculateDistance(origin, destination)
      row.push(distance)
    }
    matrix.push(row)
  }
  
  return matrix
}