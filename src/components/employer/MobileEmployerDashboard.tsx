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

export default function MobileEmployerDashboard() {
  const [labourProfiles, setLabourProfiles] = useState<LabourProfile[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('search')
  const [searchFilters, setSearchFilters] = useState({
    category: '',
    location: '',
    availableToday: false
  })
  const [selectedLabour, setSelectedLabour] = useState<LabourProfile | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showFilterSheet, setShowFilterSheet] = useState(false)

  useEffect(() => {
    searchLabour()
    fetchBookings()
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

  const categoryLabels: { [key: string]: string } = {
    HELPER: 'Helper',
    MASON: 'Mason',
    PAINTER: 'Painter',
    ELECTRICIAN: 'Electrician',
    PLUMBER: 'Plumber',
    LOADER: 'Loader',
    AGRICULTURE_WORKER: 'Agriculture'
  }

  const pendingJobs = bookings.filter(job => job.status === 'PENDING')
  const activeJobs = bookings.filter(job => ['ACCEPTED', 'IN_PROGRESS'].includes(job.status))
  const completedJobs = bookings.filter(job => job.status === 'COMPLETED')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Sheet open={showFilterSheet} onOpenChange={setShowFilterSheet}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="text-lg">Menu</SheetTitle>
                  </div>
                </SheetHeader>
                
                <div className="p-4">
                  <nav className="space-y-2">
                    <button
                      onClick={() => setActiveTab('search')}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors ${activeTab === 'search' ? 'bg-orange-50 text-orange-600' : ''}`}
                    >
                      <Search className="w-5 h-5" />
                      <span className="text-sm font-medium">Find Workers</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors ${activeTab === 'bookings' ? 'bg-orange-50 text-orange-600' : ''}`}
                    >
                      <Calendar className="w-5 h-5" />
                      <span className="text-sm font-medium">My Bookings</span>
                      {pendingJobs.length > 0 && (
                        <Badge variant="destructive" className="ml-auto text-xs">
                          {pendingJobs.length}
                        </Badge>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors ${activeTab === 'analytics' ? 'bg-orange-50 text-orange-600' : ''}`}
                    >
                      <BarChart3 className="w-5 h-5" />
                      <span className="text-sm font-medium">Analytics</span>
                    </button>
                  </nav>
                  
                  <div className="mt-6 pt-6 border-t">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      Support
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Bell className="w-4 h-4 mr-2" />
                      Notifications
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Employer</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Content */}
      <main className="pb-20">
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="px-4 py-4 space-y-4">
            {/* Search Bar */}
            <Card>
              <CardContent className="p-3">
                <div className="flex space-x-2">
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
                
                <div className="flex space-x-2 mt-2">
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
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2">
              <Card className="text-center p-3">
                <div className="text-lg font-bold text-orange-500">{labourProfiles.length}</div>
                <p className="text-xs text-gray-600">Workers</p>
              </Card>
              <Card className="text-center p-3">
                <div className="text-lg font-bold text-blue-500">{pendingJobs.length}</div>
                <p className="text-xs text-gray-600">Pending</p>
              </Card>
              <Card className="text-center p-3">
                <div className="text-lg font-bold text-green-500">{completedJobs.length}</div>
                <p className="text-xs text-gray-600">Completed</p>
              </Card>
            </div>

            {/* Search Results */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-2 text-gray-600 text-sm">Searching...</p>
              </div>
            ) : labourProfiles.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No workers found</h3>
                  <p className="text-gray-600 text-sm mb-4">Try adjusting your filters</p>
                  <Button size="sm" onClick={searchLabour}>
                    Refresh
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {labourProfiles.map((labour) => (
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
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="px-4 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">My Bookings</h2>
              <Button size="sm" onClick={fetchBookings}>
                Refresh
              </Button>
            </div>

            {bookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-600 text-sm mb-4">Book your first worker</p>
                  <Button size="sm" onClick={() => setActiveTab('search')}>
                    Find Workers
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-sm">#{booking.bookingNumber}</h4>
                          <p className="text-xs text-gray-600">
                            {categoryLabels[booking.category]} • {booking.labourCount} workers
                          </p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          <div className="flex items-center">
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 text-xs">{booking.status}</span>
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>
                          <span className="text-gray-600">Date:</span>
                          <p className="font-medium">
                            {new Date(booking.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Location:</span>
                          <p className="font-medium truncate">{booking.jobLocation}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Amount:</span>
                          <p className="font-medium">₹{booking.totalAmount}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Worker:</span>
                          <p className="font-medium">{booking.labour.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {booking.status === 'ACCEPTED' && (
                          <Button size="sm" variant="outline" className="flex-1">
                            <Phone className="w-3 h-3 mr-1" />
                            Contact
                          </Button>
                        )}
                        {booking.status === 'COMPLETED' && (
                          <Button size="sm" className="flex-1">
                            Rate Worker
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="px-4 py-4 space-y-4">
            <h2 className="text-lg font-bold mb-4">Analytics</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-orange-500">{bookings.length}</div>
                <p className="text-xs text-gray-600">Total Bookings</p>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-green-500">
                  ₹{bookings.reduce((sum, b) => sum + b.totalAmount, 0)}
                </div>
                <p className="text-xs text-gray-600">Total Spent</p>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-blue-500">
                  {activeJobs.length}
                </div>
                <p className="text-xs text-gray-600">Active Jobs</p>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-gray-500">
                  {completedJobs.length}
                </div>
                <p className="text-xs text-gray-600">Completed</p>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-40">
        <div className="grid grid-cols-4 gap-1 p-2">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
              activeTab === 'search' ? 'text-orange-600' : 'text-gray-600'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs mt-1">Search</span>
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors relative ${
              activeTab === 'bookings' ? 'text-orange-600' : 'text-gray-600'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs mt-1">Bookings</span>
            {pendingJobs.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
              activeTab === 'analytics' ? 'text-orange-600' : 'text-gray-600'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs mt-1">Analytics</span>
          </button>
          <button
            className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-gray-600 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">Home</span>
          </button>
        </div>
      </nav>

      {/* Filter Sheet */}
      <Sheet open={showFilterSheet} onOpenChange={setShowFilterSheet}>
        <SheetContent side="bottom" className="h-[60vh]">
          <SheetHeader>
            <SheetTitle>Filter Workers</SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-4">
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
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
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
              <Label htmlFor="availableToday" className="text-sm">Available today only</Label>
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

      {/* Booking Form Modal */}
      {showBookingForm && selectedLabour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg">Book {selectedLabour.name}</CardTitle>
              <CardDescription>
                {categoryLabels[selectedLabour.category]} • {selectedLabour.experience} years • ⭐ {selectedLabour.rating}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jobLocation">Job Location *</Label>
                <Input
                  id="jobLocation"
                  placeholder="Enter complete work address"
                  className="text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="date">Work Date *</Label>
                <Input
                  id="date"
                  type="date"
                  className="text-sm"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <Label htmlFor="duration">Duration *</Label>
                <Select>
                  <SelectTrigger className="text-sm">
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
                  className="text-sm"
                />
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-orange-500">₹99</span>
                </div>
              </div>
            </CardContent>
            
            <div className="flex space-x-3 p-6 pt-0">
              <Button variant="outline" onClick={() => setShowBookingForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => {
                  // Handle booking logic here
                  setShowBookingForm(false)
                  setSelectedLabour(null)
                }}
              >
                Book Now
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}