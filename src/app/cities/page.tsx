'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  MapPin, 
  Building, 
  Users, 
  Phone, 
  Star,
  Menu,
  Bell,
  Home,
  LogOut,
  Search,
  Globe
} from 'lucide-react'
import MobileNavigation from '@/components/pwa/MobileNavigation'
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt'

interface City {
  id: string
  name: string
  state: string
  basePrice: number
  priceMultiplier: number
  supportPhone: string
  transportAvailable: boolean
  _count: {
    labourProfiles: number
    employerProfiles: number
    bookings: number
  }
}

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Check if user is logged in
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
        } catch (error) {
          console.error('Failed to parse user data:', error)
        }
      }
    }
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cities')
      const data = await response.json()
      
      if (data.success) {
        setCities(data.data)
      }
    } catch (error) {
      console.error('Fetch cities error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/'
  }

  const handleLoginClick = () => {
    window.location.href = '/'
  }

  // Mock cities data for demonstration
  const mockCities: City[] = [
    {
      id: '1',
      name: 'Mumbai',
      state: 'Maharashtra',
      basePrice: 149,
      priceMultiplier: 1.5,
      supportPhone: '+91-22-12345678',
      transportAvailable: true,
      _count: {
        labourProfiles: 1250,
        employerProfiles: 890,
        bookings: 15600
      }
    },
    {
      id: '2',
      name: 'Delhi',
      state: 'Delhi',
      basePrice: 129,
      priceMultiplier: 1.3,
      supportPhone: '+91-11-12345678',
      transportAvailable: true,
      _count: {
        labourProfiles: 980,
        employerProfiles: 720,
        bookings: 12400
      }
    },
    {
      id: '3',
      name: 'Bangalore',
      state: 'Karnataka',
      basePrice: 119,
      priceMultiplier: 1.2,
      supportPhone: '+91-80-12345678',
      transportAvailable: true,
      _count: {
        labourProfiles: 890,
        employerProfiles: 650,
        bookings: 10200
      }
    },
    {
      id: '4',
      name: 'Chennai',
      state: 'Tamil Nadu',
      basePrice: 99,
      priceMultiplier: 1.0,
      supportPhone: '+91-44-12345678',
      transportAvailable: true,
      _count: {
        labourProfiles: 750,
        employerProfiles: 580,
        bookings: 8900
      }
    },
    {
      id: '5',
      name: 'Kolkata',
      state: 'West Bengal',
      basePrice: 89,
      priceMultiplier: 0.9,
      supportPhone: '+91-33-12345678',
      transportAvailable: true,
      _count: {
        labourProfiles: 620,
        employerProfiles: 450,
        bookings: 7200
      }
    },
    {
      id: '6',
      name: 'Pune',
      state: 'Maharashtra',
      basePrice: 109,
      priceMultiplier: 1.1,
      supportPhone: '+91-20-12345678',
      transportAvailable: true,
      _count: {
        labourProfiles: 580,
        employerProfiles: 420,
        bookings: 6800
      }
    },
    {
      id: '7',
      name: 'Hyderabad',
      state: 'Telangana',
      basePrice: 99,
      priceMultiplier: 1.0,
      supportPhone: '+91-40-12345678',
      transportAvailable: true,
      _count: {
        labourProfiles: 520,
        employerProfiles: 380,
        bookings: 5900
      }
    },
    {
      id: '8',
      name: 'Ahmedabad',
      state: 'Gujarat',
      basePrice: 89,
      priceMultiplier: 0.9,
      supportPhone: '+91-79-12345678',
      transportAvailable: true,
      _count: {
        labourProfiles: 480,
        employerProfiles: 350,
        bookings: 5200
      }
    }
  ]

  const filteredCities = (cities.length > 0 ? cities : mockCities).filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.state.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <MobileNavigation 
        user={user} 
        onLogout={handleLogout}
        onLoginClick={handleLoginClick}
      />

      {/* Main Content - Mobile Optimized */}
      <main className="pb-20 md:pb-0">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Available Cities</h1>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Cities Grid */}
        <div className="px-4 py-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-2 text-gray-600 text-sm">Loading cities...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCities.map((city) => (
                <Card key={city.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Building className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{city.name}</CardTitle>
                          <CardDescription className="text-xs">{city.state}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {city.priceMultiplier > 1 ? `×${city.priceMultiplier}` : 'Standard'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Pricing */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Base Price</span>
                      <span className="text-sm font-bold text-orange-600">₹{city.basePrice}</span>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-blue-600">{city._count.labourProfiles}</p>
                        <p className="text-xs text-gray-600">Workers</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600">{city._count.employerProfiles}</p>
                        <p className="text-xs text-gray-600">Employers</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-purple-600">{city._count.bookings}</p>
                        <p className="text-xs text-gray-600">Bookings</p>
                      </div>
                    </div>
                    
                    {/* Features */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <span className="text-xs">{city.supportPhone}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="w-4 h-4 mr-2" />
                        <span className="text-xs">
                          Transport {city.transportAvailable ? 'Available' : 'Not Available'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs"
                        onClick={() => {
                          // Navigate to search with this city
                          window.location.href = `/search?city=${city.name}`
                        }}
                      >
                        <Users className="w-3 h-3 mr-1" />
                        Find Workers
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          // Call support
                          window.location.href = `tel:${city.supportPhone}`
                        }}
                      >
                        <Phone className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="px-4 py-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platform Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-500">{filteredCities.length}</p>
                  <p className="text-sm text-gray-600">Active Cities</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">
                    {filteredCities.reduce((sum, city) => sum + city._count.labourProfiles, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Workers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">
                    {filteredCities.reduce((sum, city) => sum + city._count.employerProfiles, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Employers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-500">
                    {filteredCities.reduce((sum, city) => sum + city._count.bookings, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  )
}