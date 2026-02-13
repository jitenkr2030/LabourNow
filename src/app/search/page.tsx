'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Users, 
  Calendar,
  Filter,
  IndianRupee,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Menu,
  Bell,
  Home,
  BarChart3,
  LogOut
} from 'lucide-react'
import MobileNavigation from '@/components/pwa/MobileNavigation'
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt'

interface LabourProfile {
  id: string
  userId: string
  name: string
  category: string
  experience: number
  hourlyWage: number
  rating: number
  totalJobs: number
  location: string
  bio: string
  avatar?: string
  isVerified: boolean
  verificationBadge: string
  languages: string[]
  distance?: number
}

export default function SearchPage() {
  const [labourProfiles, setLabourProfiles] = useState<LabourProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [searchFilters, setSearchFilters] = useState({
    category: '',
    location: '',
    availableToday: false
  })
  const [selectedLabour, setSelectedLabour] = useState<LabourProfile | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showFilterSheet, setShowFilterSheet] = useState(false)
  const [user, setUser] = useState<any>(null)

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
    searchLabour()
  }, [])

  const searchLabour = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchFilters.category) params.append('category', searchFilters.category)
      if (searchFilters.location) params.append('location', searchFilters.location)
      if (searchFilters.availableToday) params.append('availableToday', 'true')

      const response = await fetch(`/api/labour/search?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setLabourProfiles(data.data)
      }
    } catch (error) {
      console.error('Search error:', error)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700'
      case 'ACCEPTED': return 'bg-green-100 text-green-700'
      case 'REJECTED': return 'bg-red-100 text-red-700'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700'
      case 'COMPLETED': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const categoryLabels: { [key: string]: string } = {
    HELPER: 'Helper',
    MASON: 'Mason',
    PAINTER: 'Painter',
    ELECTRICIAN: 'Electrician',
    PLUMBER: 'Plumber',
    LOADER: 'Loader',
    AGRICULTURE_WORKER: 'Agriculture'
  }

  // Mock data for demonstration
  const mockLabourProfiles: LabourProfile[] = [
    {
      id: '1',
      userId: 'user1',
      name: 'Raj Kumar',
      category: 'HELPER',
      experience: 5,
      hourlyWage: 150,
      rating: 4.5,
      totalJobs: 120,
      location: 'Mumbai',
      bio: 'Experienced helper with 5 years of experience in construction and household work.',
      isVerified: true,
      verificationBadge: 'Verified',
      languages: ['Hindi', 'Marathi', 'English'],
      distance: 2.5
    },
    {
      id: '2',
      userId: 'user2',
      name: 'Amit Sharma',
      category: 'MASON',
      experience: 8,
      hourlyWage: 200,
      rating: 4.8,
      totalJobs: 200,
      location: 'Delhi',
      bio: 'Skilled mason with expertise in brickwork and plastering.',
      isVerified: true,
      verificationBadge: 'Verified',
      languages: ['Hindi', 'Punjabi', 'English'],
      distance: 5.0
    }
  ]

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
        {/* Search Header */}
        <div className="bg-white border-b sticky top-0 z-30">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Find Workers</h1>
            
            {/* Search Bar */}
            <div className="flex space-x-2 mb-3">
              <div className="flex-1">
                <Input
                  placeholder="Search location or category..."
                  value={searchFilters.location || searchFilters.category}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="text-sm"
                />
              </div>
              <Button size="sm" onClick={searchLabour}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilterSheet(true)}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filters
              </Button>
              <Button
                variant={searchFilters.availableToday ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchFilters(prev => ({ ...prev, availableToday: !prev.availableToday }))}
              >
                Available Today
              </Button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="px-4 py-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-2 text-gray-600 text-sm">Searching...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(labourProfiles.length > 0 ? labourProfiles : mockLabourProfiles).map((labour) => (
                <Card key={labour.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={labour.avatar} />
                          <AvatarFallback>
                            {labour.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{labour.name}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {categoryLabels[labour.category] || labour.category}
                            </Badge>
                            {labour.isVerified && (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                ✓ Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium">{labour.rating}</span>
                        </div>
                        <p className="text-xs text-gray-500">({labour.totalJobs} jobs)</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{labour.location}</span>
                        {labour.distance && (
                          <span className="ml-2 text-orange-600 font-medium">
                            {labour.distance} km
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{labour.experience} years experience</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <IndianRupee className="w-4 h-4 mr-1" />
                        <span>{labour.hourlyWage}/hour</span>
                      </div>
                      
                      {labour.bio && (
                        <p className="text-gray-600 line-clamp-2">
                          {labour.bio}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 mt-3">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs"
                        onClick={() => {
                          setSelectedLabour(labour)
                          setShowBookingForm(true)
                        }}
                      >
                        Book Now
                      </Button>
                      <Button size="sm" variant="outline" className="p-2">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Filter Sheet */}
      <Sheet open={showFilterSheet} onOpenChange={setShowFilterSheet}>
        <SheetContent side="bottom" className="h-[60vh]">
          <SheetHeader>
            <SheetTitle>Filter Workers</SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={searchFilters.category} onValueChange={(value) => 
                setSearchFilters(prev => ({ ...prev, category: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="HELPER">Helper</SelectItem>
                  <SelectItem value="MASON">Mason</SelectItem>
                  <SelectItem value="PAINTER">Painter</SelectItem>
                  <SelectItem value="ELECTRICIAN">Electrician</SelectItem>
                  <SelectItem value="PLUMBER">Plumber</SelectItem>
                  <SelectItem value="LOADER">Loader</SelectItem>
                  <SelectItem value="AGRICULTURE_WORKER">Agriculture</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                placeholder="Enter location"
                value={searchFilters.location}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="availableToday"
                checked={searchFilters.availableToday}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, availableToday: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="availableToday" className="text-sm">Available today only</label>
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowFilterSheet(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                searchLabour()
                setShowFilterSheet(false)
              }}>
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  )
}