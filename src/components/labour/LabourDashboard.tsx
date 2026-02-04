'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { 
  Calendar, 
  Clock, 
  IndianRupee, 
  Star, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Users,
  TrendingUp,
  Phone,
  MessageSquare
} from 'lucide-react'

interface Job {
  id: string
  bookingNumber: string
  category: string
  jobLocation: string
  date: string
  duration: string
  labourCount: number
  totalAmount: number
  status: string
  employer: {
    name: string
    mobile: string
  }
}

export default function LabourDashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isAvailable, setIsAvailable] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/bookings')
      const data = await response.json()
      
      if (data.success) {
        setJobs(data.data)
      }
    } catch (error) {
      console.error('Fetch jobs error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateAvailability = async (available: boolean) => {
    setIsAvailable(available)
    // In a real app, this would update the database
    console.log('Availability updated:', available)
  }

  const handleJobAction = async (jobId: string, action: 'accept' | 'reject') => {
    try {
      // In a real app, this would call the API to update job status
      console.log(`${action} job:`, jobId)
      
      // Update local state
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: action === 'accept' ? 'ACCEPTED' : 'REJECTED' }
          : job
      ))
      
      alert(`Job ${action}ed successfully!`)
    } catch (error) {
      console.error('Job action error:', error)
      alert(`Failed to ${action} job`)
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

  const pendingJobs = jobs.filter(job => job.status === 'PENDING')
  const activeJobs = jobs.filter(job => ['ACCEPTED', 'IN_PROGRESS'].includes(job.status))
  const completedJobs = jobs.filter(job => job.status === 'COMPLETED')
  const totalEarnings = completedJobs.reduce((sum, job) => sum + job.totalAmount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Worker Dashboard</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Available for work:</span>
                <Switch 
                  checked={isAvailable}
                  onCheckedChange={updateAvailability}
                />
                <Badge className={isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                  {isAvailable ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                Support
              </Button>
              <Button onClick={() => window.location.reload()}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Pending Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{pendingJobs.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Active Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{activeJobs.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{completedJobs.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <IndianRupee className="w-4 h-4 mr-2" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">₹{totalEarnings}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending Jobs ({pendingJobs.length})</TabsTrigger>
            <TabsTrigger value="active">Active Jobs ({activeJobs.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedJobs.length})</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
          </TabsList>

          {/* Pending Jobs */}
          <TabsContent value="pending" className="space-y-6">
            {pendingJobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending jobs</h3>
                  <p className="text-gray-600">New job requests will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingJobs.map((job) => (
                  <Card key={job.id} className="border-l-4 border-l-orange-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Job #{job.bookingNumber}</CardTitle>
                          <CardDescription>
                            {job.category} • {job.duration.replace('_', ' ')}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(job.status)}>
                          {getStatusIcon(job.status)}
                          <span className="ml-1">{job.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{job.jobLocation}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{new Date(job.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Users className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{job.employer.name}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <IndianRupee className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="font-medium">₹{job.totalAmount}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 pt-4 border-t">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-500 hover:bg-green-600"
                          onClick={() => handleJobAction(job.id, 'accept')}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept Job
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleJobAction(job.id, 'reject')}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Active Jobs */}
          <TabsContent value="active" className="space-y-6">
            {activeJobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active jobs</h3>
                  <p className="text-gray-600">Accepted jobs will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeJobs.map((job) => (
                  <Card key={job.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Job #{job.bookingNumber}</CardTitle>
                          <CardDescription>
                            {job.category} • {job.duration.replace('_', ' ')}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(job.status)}>
                          {getStatusIcon(job.status)}
                          <span className="ml-1">{job.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{job.jobLocation}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{new Date(job.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Users className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{job.employer.name}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <IndianRupee className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="font-medium">₹{job.totalAmount}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 pt-4 border-t">
                        <Button size="sm" className="flex-1">
                          <Phone className="w-4 h-4 mr-2" />
                          Contact Employer
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Send Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Completed Jobs */}
          <TabsContent value="completed" className="space-y-6">
            {completedJobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No completed jobs</h3>
                  <p className="text-gray-600">Completed jobs will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedJobs.map((job) => (
                  <Card key={job.id} className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Job #{job.bookingNumber}</CardTitle>
                          <CardDescription>
                            {job.category} • {job.duration.replace('_', ' ')}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(job.status)}>
                          {getStatusIcon(job.status)}
                          <span className="ml-1">{job.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{job.jobLocation}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{new Date(job.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Users className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{job.employer.name}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <IndianRupee className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="font-medium">₹{job.totalAmount}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 pt-4 border-t">
                        <Button size="sm" variant="outline">
                          <Star className="w-4 h-4 mr-2" />
                          View Rating
                        </Button>
                        <Button size="sm" variant="outline">
                          Download Receipt
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>
                  Manage your work profile and availability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Work Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">Painter</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Experience:</span>
                        <span className="font-medium">5 years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hourly Wage:</span>
                        <span className="font-medium">₹500/hour</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Jobs:</span>
                        <span className="font-medium">{completedJobs.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-medium flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          4.8
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-4">Availability Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Available Today:</span>
                        <Switch checked={isAvailable} onCheckedChange={updateAvailability} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Work Radius:</span>
                        <span className="font-medium">10 km</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Preferred Hours:</span>
                        <span className="font-medium">9 AM - 6 PM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Languages:</span>
                        <span className="font-medium">Hindi, English</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button>Edit Profile</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}