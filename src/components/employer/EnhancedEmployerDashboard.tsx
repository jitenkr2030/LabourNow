'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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
  ChevronDown,
  Building,
  Globe,
  Truck,
  Car
} from 'lucide-react'

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
  city?: string
}

interface Booking {
  id: string
  bookingNumber: string
  category: string
  jobLocation: string
  date: string
  duration: string
  labourCount: number
  totalAmount: number
  status: string
  paymentStatus: string
  labour: {
    name: string
    mobile: string
    labourProfile: any
  }
}

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

interface CategoryData {
  key: string
  name: string
  description: string
  icon: string
  group: string
  color: string
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

export default function EnhancedEmployerDashboard() {
  const [labourProfiles, setLabourProfiles] = useState<LabourProfile[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [categories, setCategories] = useState<Record<string, CategoryData>>({})
  const [groupedCategories, setGroupedCategories] = useState<Record<string, CategoryData[]>>({})

  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState('')
  const [searchFilters, setSearchFilters] = useState({
    category: '',
    location: '',
    availableToday: false,
    cityId: ''
  })
  const [selectedLabour, setSelectedLabour] = useState<LabourProfile | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [expandedCategoryGroups, setExpandedCategoryGroups] = useState<string[]>(['Professional', 'Construction'])

  useEffect(() => {
    fetchCities()
    fetchCategories()
    searchLabour()
    fetchBookings()
  }, [])

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/cities')
      const data = await response.json()
      if (data.success) {
        setCities(data.data)
        if (data.data.length > 0) {
          setSelectedCity(data.data[0].id)
          setSearchFilters(prev => ({ ...prev, cityId: data.data[0].id }))
        }
      }
    } catch (error) {
      console.error('Fetch cities error:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data.categories)
        setGroupedCategories(data.data.groupedCategories)
      }
    } catch (error) {
      console.error('Fetch categories error:', error)
    }
  }

  const searchLabour = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchFilters.category) params.append('category', searchFilters.category)
      if (searchFilters.location) params.append('location', searchFilters.location)
      if (searchFilters.cityId) params.append('cityId', searchFilters.cityId)
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

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      const data = await response.json()
      
      if (data.success) {
        setBookings(data.data)
      }
    } catch (error) {
      console.error('Fetch bookings error:', error)
    }
  }

  const createBooking = async (bookingData: any) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bookingData)
      })
      
      const data = await response.json()
      if (data.success) {
        setShowBookingForm(false)
        setSelectedLabour(null)
        fetchBookings()
        alert('Booking created successfully!')
      } else {
        alert('Failed to create booking: ' + data.message)
      }
    } catch (error) {
      console.error('Create booking error:', error)
      alert('Failed to create booking')
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'ACCEPTED': return <CheckCircle className="w-4 h-4" />
      case 'REJECTED': return <XCircle className="w-4 h-4" />
      case 'IN_PROGRESS': return <AlertCircle className="w-4 h-4" />
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const toggleCategoryGroup = (group: string) => {
    setExpandedCategoryGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group)
        : [...prev, group]
    )
  }

  const selectedCityData = cities.find(city => city.id === selectedCity)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Employer Dashboard</h1>
              {selectedCityData && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedCityData.name}, {selectedCityData.state}</span>
                  <Badge variant="outline">
                    ₹{selectedCityData.basePrice} base price
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                {selectedCityData?.supportPhone || 'Support'}
              </Button>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                My Bookings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="search">Find Workers</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="cities">Cities</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Search Workers Tab */}
          <TabsContent value="search" className="space-y-6">
            {/* Search Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Search Workers
                </CardTitle>
                <CardDescription>
                  Find skilled workers based on your requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Select value={selectedCity} onValueChange={(value) => {
                      setSelectedCity(value)
                      setSearchFilters(prev => ({ ...prev, cityId: value }))
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city.id} value={city.id}>
                            <div className="flex items-center">
                              <Building className="w-4 h-4 mr-2" />
                              {city.name}, {city.state}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={searchFilters.category} onValueChange={(value) => 
                      setSearchFilters(prev => ({ ...prev, category: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {Object.entries(categories).map(([key, category]) => (
                          <SelectItem key={key} value={key}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Enter location"
                      value={searchFilters.location}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex items-end space-x-2">
                    <Button onClick={searchLabour} className="flex-1">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categories Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Service Categories</CardTitle>
                <CardDescription>
                  Browse workers by service category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(groupedCategories).map(([group, groupCategories]) => (
                    <Collapsible
                      key={group}
                      open={expandedCategoryGroups.includes(group)}
                      onOpenChange={() => toggleCategoryGroup(group)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                              {group === 'Professional' && <Users className="w-4 h-4 text-orange-600" />}
                              {group === 'Construction' && <Building className="w-4 h-4 text-orange-600" />}
                              {group === 'Event' && <Calendar className="w-4 h-4 text-orange-600" />}
                              {group === 'Domestic' && <Users className="w-4 h-4 text-orange-600" />}
                              {group === 'Agriculture' && <Globe className="w-4 h-4 text-orange-600" />}
                              {group === 'Logistics' && <Truck className="w-4 h-4 text-orange-600" />}
                              {group === 'IT & Digital' && <Car className="w-4 h-4 text-orange-600" />}
                              {group === 'Beauty & Wellness' && <Users className="w-4 h-4 text-orange-600" />}
                              {group === 'Other' && <Users className="w-4 h-4 text-orange-600" />}
                            </div>
                            <div className="text-left">
                              <h4 className="font-medium">{group}</h4>
                              <p className="text-sm text-gray-500">{groupCategories.length} services</p>
                            </div>
                          </div>
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-2 p-3 bg-gray-50 rounded-lg">
                          {groupCategories.map((category) => (
                            <Button
                              key={category.key}
                              variant="ghost"
                              size="sm"
                              className={`h-auto p-2 flex flex-col items-center justify-center ${searchFilters.category === category.key ? 'bg-orange-100' : ''}`}
                              onClick={() => setSearchFilters(prev => ({ ...prev, category: category.key }))}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 ${category.color}`}>
                                <Users className="w-4 h-4" />
                              </div>
                              <span className="text-xs text-center">{category.name}</span>
                            </Button>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Searching for workers...</p>
                </div>
              ) : labourProfiles.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No workers found</h3>
                  <p className="text-gray-600">Try adjusting your search filters or city</p>
                </div>
              ) : (
                labourProfiles.map((labour) => (
                  <Card key={labour.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={labour.avatar} />
                            <AvatarFallback>
                              {labour.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{labour.name}</CardTitle>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Badge variant="secondary">
                                {categoryLabels[labour.category] || labour.category}
                              </Badge>
                              {labour.isVerified && (
                                <Badge className="bg-green-100 text-green-700">
                                  ✓ Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-sm">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="font-medium">{labour.rating}</span>
                            <span className="text-gray-500 ml-1">({labour.totalJobs})</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {labour.location}
                        {labour.distance && (
                          <span className="ml-2 text-orange-600 font-medium">
                            {labour.distance} km away
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {labour.experience} years experience
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <IndianRupee className="w-4 h-4 mr-1" />
                        {labour.hourlyWage}/hour
                      </div>
                      
                      {labour.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {labour.bio}
                        </p>
                      )}
                      
                      <div className="flex space-x-2 pt-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-orange-500 hover:bg-orange-600"
                          onClick={() => {
                            setSelectedLabour(labour)
                            setShowBookingForm(true)
                          }}
                        >
                          Book Now - ₹{selectedCityData?.basePrice || 99}
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Cities Tab */}
          <TabsContent value="cities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Cities</CardTitle>
                <CardDescription>
                  Select your city to see local workers and pricing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cities.map((city) => (
                    <Card key={city.id} className={`cursor-pointer transition-all ${selectedCity === city.id ? 'ring-2 ring-orange-500' : ''}`}
                          onClick={() => {
                            setSelectedCity(city.id)
                            setSearchFilters(prev => ({ ...prev, cityId: city.id }))
                          }}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{city.name}</CardTitle>
                          <Badge variant="outline">
                            {city.state}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Base Price:</span>
                            <span className="font-medium">₹{city.basePrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Workers:</span>
                            <span className="font-medium">{city._count.labourProfiles}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Active Bookings:</span>
                            <span className="font-medium">{city._count.bookings}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transport:</span>
                            <span className={`font-medium ${city.transportAvailable ? 'text-green-600' : 'text-red-600'}`}>
                              {city.transportAvailable ? 'Available' : 'Not Available'}
                            </span>
                          </div>
                          {city.priceMultiplier !== 1.0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Price Factor:</span>
                              <span className="font-medium">×{city.priceMultiplier}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>
                  Track all your labour bookings and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600 mb-4">Book your first worker to get started</p>
                    <Button onClick={() => setSearchFilters({ category: '', location: '', availableToday: false, cityId: selectedCity })}>
                      Find Workers
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">Booking #{booking.bookingNumber}</h4>
                            <p className="text-sm text-gray-600">
                              {categoryLabels[booking.category] || booking.category} • {booking.labourCount} worker(s)
                            </p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            <div className="flex items-center">
                              {getStatusIcon(booking.status)}
                              <span className="ml-1">{booking.status}</span>
                            </div>
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <p className="font-medium">
                              {new Date(booking.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Location:</span>
                            <p className="font-medium">{booking.jobLocation}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Amount:</span>
                            <p className="font-medium">₹{booking.totalAmount}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback>
                                {booking.labour.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{booking.labour.name}</span>
                          </div>
                          
                          <div className="flex space-x-2">
                            {booking.status === 'ACCEPTED' && (
                              <Button size="sm" variant="outline">
                                <Phone className="w-4 h-4 mr-1" />
                                Contact
                              </Button>
                            )}
                            {booking.status === 'COMPLETED' && (
                              <Button size="sm">
                                Rate Worker
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bookings.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{bookings.reduce((sum, b) => sum + b.totalAmount, 0)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Active Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {bookings.filter(b => ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status)).length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Completed Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {bookings.filter(b => b.status === 'COMPLETED').length}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedLabour && (
        <BookingForm 
          labour={selectedLabour}
          city={selectedCityData}
          onClose={() => {
            setShowBookingForm(false)
            setSelectedLabour(null)
          }}
          onSubmit={createBooking}
        />
      )}
    </div>
  )
}

function BookingForm({ labour, city, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    labourId: labour.userId,
    cityId: city?.id || '',
    category: labour.category,
    jobLocation: '',
    date: '',
    duration: 'HALF_DAY',
    labourCount: 1,
    specialRequests: '',
    transportNeeded: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const basePrice = city?.basePrice || 99
  const priceMultiplier = city?.priceMultiplier || 1.0
  const totalAmount = Math.round(basePrice * priceMultiplier * formData.labourCount)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Book {labour.name}</CardTitle>
          <CardDescription>
            {categoryLabels[labour.category] || labour.category} • {labour.experience} years experience • ⭐ {labour.rating}
          </CardDescription>
          {city && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{city.name}, {city.state}</span>
              {city.priceMultiplier !== 1.0 && (
                <Badge variant="outline">×{city.priceMultiplier} pricing</Badge>
              )}
            </div>
          )}
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="jobLocation">Job Location *</Label>
              <Input
                id="jobLocation"
                placeholder="Enter complete work address"
                value={formData.jobLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, jobLocation: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="date">Work Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="duration">Duration *</Label>
              <Select value={formData.duration} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, duration: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HALF_DAY">Half Day (4 hours)</SelectItem>
                  <SelectItem value="FULL_DAY">Full Day (8 hours)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="labourCount">Number of Workers *</Label>
              <Input
                id="labourCount"
                type="number"
                min="1"
                max="10"
                value={formData.labourCount}
                onChange={(e) => setFormData(prev => ({ ...prev, labourCount: parseInt(e.target.value) }))}
                required
              />
            </div>

            {city?.transportAvailable && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="transportNeeded"
                  checked={formData.transportNeeded}
                  onChange={(e) => setFormData(prev => ({ ...prev, transportNeeded: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="transportNeeded">Need transport arrangement</Label>
              </div>
            )}
            
            <div>
              <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
              <textarea
                id="specialRequests"
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Any specific requirements or instructions..."
                value={formData.specialRequests}
                onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
              />
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Base price per worker:</span>
                <span className="font-medium">₹{basePrice}</span>
              </div>
              {city?.priceMultiplier !== 1.0 && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">City price factor:</span>
                  <span className="font-medium">×{city.priceMultiplier}</span>
                </div>
              )}
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Number of workers:</span>
                <span className="font-medium">{formData.labourCount}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-orange-500">₹{totalAmount}</span>
              </div>
            </div>
          </CardContent>
          
          <div className="flex space-x-3 p-6 pt-0">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600">
              Pay ₹{totalAmount} & Book
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}