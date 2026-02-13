'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Phone, 
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Menu,
  Bell,
  Home,
  BarChart3,
  LogOut,
  Star,
  IndianRupee
} from 'lucide-react'
import MobileNavigation from '@/components/pwa/MobileNavigation'
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt'

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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('active')

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
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/bookings')
      const data = await response.json()
      
      if (data.success) {
        setBookings(data.data)
      }
    } catch (error) {
      console.error('Fetch bookings error:', error)
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

  // Mock data for demonstration
  const mockBookings: Booking[] = [
    {
      id: '1',
      bookingNumber: 'LB001',
      category: 'HELPER',
      jobLocation: 'Mumbai, Andheri West',
      date: '2024-01-15',
      duration: 'FULL_DAY',
      labourCount: 2,
      totalAmount: 298,
      status: 'ACCEPTED',
      paymentStatus: 'PAID',
      labour: {
        name: 'Raj Kumar',
        mobile: '+91-9876543210',
        labourProfile: null
      }
    },
    {
      id: '2',
      bookingNumber: 'LB002',
      category: 'MASON',
      jobLocation: 'Delhi, Connaught Place',
      date: '2024-01-16',
      duration: 'HALF_DAY',
      labourCount: 1,
      totalAmount: 129,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      labour: {
        name: 'Amit Sharma',
        mobile: '+91-9876543211',
        labourProfile: null
      }
    }
  ]

  const pendingJobs = bookings.filter(job => job.status === 'PENDING')
  const activeJobs = bookings.filter(job => ['ACCEPTED', 'IN_PROGRESS'].includes(job.status))
  const completedJobs = bookings.filter(job => job.status === 'COMPLETED')

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
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900">My Bookings</h1>
              <Button size="sm" onClick={fetchBookings}>
                Refresh
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-500">{(bookings.length > 0 ? bookings : mockBookings).length}</div>
                <p className="text-xs text-gray-600">Total</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-500">{activeJobs.length}</div>
                <p className="text-xs text-gray-600">Active</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-500">{completedJobs.length}</div>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-9">
                <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Bookings List */}
        <div className="px-4 py-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-2 text-gray-600 text-sm">Loading bookings...</p>
            </div>
          ) : (
            <Tabs value={activeTab} className="w-full">
              <TabsContent value="active" className="mt-0">
                <div className="space-y-3">
                  {(bookings.length > 0 ? bookings : mockBookings)
                    .filter(job => ['ACCEPTED', 'IN_PROGRESS'].includes(job.status))
                    .map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-sm">#{booking.bookingNumber}</h4>
                            <p className="text-sm text-gray-600">
                              {categoryLabels[booking.category] || booking.category} • {booking.labourCount} worker(s)
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
                          {booking.status === 'IN_PROGRESS' && (
                            <Button size="sm" className="flex-1">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pending" className="mt-0">
                <div className="space-y-3">
                  {(bookings.length > 0 ? bookings : mockBookings)
                    .filter(job => job.status === 'PENDING')
                    .map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-sm">#{booking.bookingNumber}</h4>
                            <p className="text-sm text-gray-600">
                              {categoryLabels[booking.category] || booking.category} • {booking.labourCount} worker(s)
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
                          <Button size="sm" variant="outline" className="flex-1">
                            <Phone className="w-3 h-3 mr-1" />
                            Contact
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <XCircle className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-0">
                <div className="space-y-3">
                  {(bookings.length > 0 ? bookings : mockBookings)
                    .filter(job => job.status === 'COMPLETED')
                    .map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-sm">#{booking.bookingNumber}</h4>
                            <p className="text-sm text-gray-600">
                              {categoryLabels[booking.category] || booking.category} • {booking.labourCount} worker(s)
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
                          <Button size="sm" className="flex-1">
                            <Star className="w-3 h-3 mr-1" />
                            Rate Worker
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            Book Again
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  )
}