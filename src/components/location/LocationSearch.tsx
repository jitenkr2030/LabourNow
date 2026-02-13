'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MapPin, 
  Search, 
  Navigation, 
  LocateFixed,
  Loader2,
  X
} from 'lucide-react'
import { useGeocoding, useGeolocation, calculateDistance } from '@/lib/location'

interface LocationSearchProps {
  onLocationSelect?: (location: {
    latitude: number
    longitude: number
    address: string
    city: string
    state: string
  }) => void
  onRadiusChange?: (radius: number) => void
  defaultRadius?: number
  placeholder?: string
  className?: string
}

export default function LocationSearch({ 
  onLocationSelect, 
  onRadiusChange, 
  defaultRadius = 5,
  placeholder = "Search for area, city, or pincode",
  className = ""
}: LocationSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<any>(null)
  const [radius, setRadius] = useState(defaultRadius)
  const [showRadiusSlider, setShowRadiusSlider] = useState(false)
  
  const { results, loading, error, geocode } = useGeocoding()
  const { location: currentLocation, getCurrentLocation, loading: locationLoading } = useGeolocation()

  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        geocode(searchTerm)
      }, 300)
      
      return () => clearTimeout(timeoutId)
    } else {
      setSuggestions([])
    }
  }, [searchTerm, geocode])

  useEffect(() => {
    if (results.length > 0) {
      setSuggestions(results)
    }
  }, [results])

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location)
    setSearchTerm(location.displayName)
    setSuggestions([])
    
    if (onLocationSelect) {
      onLocationSelect({
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.displayName,
        city: location.address?.city || location.address?.town || '',
        state: location.address?.state || ''
      })
    }
  }

  const handleUseCurrentLocation = () => {
    getCurrentLocation()
  }

  useEffect(() => {
    if (currentLocation) {
      const locationData = {
        id: 'current-location',
        displayName: 'Current Location',
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: 'Current Location',
        type: 'current'
      }
      
      setUserLocation(locationData)
      handleLocationSelect(locationData)
    }
  }, [currentLocation])

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius)
    if (onRadiusChange) {
      onRadiusChange(newRadius)
    }
  }

  const clearSelection = () => {
    setSelectedLocation(null)
    setSearchTerm('')
    setSuggestions([])
    setUserLocation(null)
  }

  const getDistanceFromUser = (location: any): string | null => {
    if (!userLocation) return null
    
    const distance = calculateDistance(
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      { latitude: location.latitude, longitude: location.longitude }
    )
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    } else {
      return `${Math.round(distance)}km`
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {/* Current Location Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleUseCurrentLocation}
          disabled={locationLoading}
          className="w-full mt-2"
        >
          {locationLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <LocateFixed className="w-4 h-4 mr-2" />
          )}
          Use Current Location
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <Card className="absolute z-50 w-full bg-white shadow-lg border">
          <ScrollArea className="max-h-60">
            <div className="p-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  onClick={() => handleLocationSelect(suggestion)}
                  className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {suggestion.displayName}
                        </p>
                        {suggestion.address?.city && (
                          <p className="text-xs text-gray-500">
                            {suggestion.address.city}, {suggestion.address?.state}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getDistanceFromUser(suggestion) && (
                      <Badge variant="secondary" className="text-xs">
                        {getDistanceFromUser(suggestion)}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {suggestion.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Selected Location */}
      {selectedLocation && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedLocation.displayName}
                  </p>
                  <p className="text-xs text-gray-600">
                    {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Radius Slider */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Search Radius</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRadiusSlider(!showRadiusSlider)}
            >
              {radius} km
            </Button>
          </div>
        </CardHeader>
        
        {showRadiusSlider && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="50"
                value={radius}
                onChange={(e) => handleRadiusChange(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 km</span>
                <span>25 km</span>
                <span>50 km</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Quick Location Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const mumbaiLocation = {
              id: 'mumbai',
              displayName: 'Mumbai, Maharashtra',
              latitude: 19.0760,
              longitude: 72.8777,
              address: { city: 'Mumbai', state: 'Maharashtra' },
              type: 'city'
            }
            handleLocationSelect(mumbaiLocation)
          }}
        >
          <MapPin className="w-4 h-4 mr-1" />
          Mumbai
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const delhiLocation = {
              id: 'delhi',
              displayName: 'Delhi, NCT',
              latitude: 28.6139,
              longitude: 77.2090,
              address: { city: 'Delhi', state: 'Delhi' },
              type: 'city'
            }
            handleLocationSelect(delhiLocation)
          }}
        >
          <MapPin className="w-4 h-4 mr-1" />
          Delhi
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const bangaloreLocation = {
              id: 'bangalore',
              displayName: 'Bangalore, Karnataka',
              latitude: 12.9716,
              longitude: 77.5946,
              address: { city: 'Bangalore', state: 'Karnataka' },
              type: 'city'
            }
            handleLocationSelect(bangaloreLocation)
          }}
        >
          <MapPin className="w-4 h-4 mr-1" />
          Bangalore
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const chennaiLocation = {
              id: 'chennai',
              displayName: 'Chennai, Tamil Nadu',
              latitude: 13.0827,
              longitude: 80.2707,
              address: { city: 'Chennai', state: 'Tamil Nadu' },
              type: 'city'
            }
            handleLocationSelect(chennaiLocation)
          }}
        >
          <MapPin className="w-4 h-4 mr-1" />
          Chennai
        </Button>
      </div>
    </div>
  )
}