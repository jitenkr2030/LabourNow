'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Calendar } from '@/components/ui/calendar'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Award,
  Target,
  Activity,
  Users,
  FileText,
  Settings
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface LabourDashboardProps {
  userId: string
  labourProfile: any
  onEditProfile?: () => void
}

export default function LabourDashboard({ userId, labourProfile, onEditProfile }: LabourDashboardProps) {
  const [earningsData, setEarningsData] = useState<any[]>([])
  const [jobStats, setJobStats] = useState<any>(null)
  const [upcomingJobs, setUpcomingJobs] = useState<any[]>([])
  const [skillVerifications, setSkillVerifications] = useState<any[]>([])
  const [availability, setAvailability] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    fetchDashboardData()
  }, [userId])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch earnings data
      const earningsResponse = await fetch(`/api/labour/earnings/${userId}`)
      const earnings = await earningsResponse.json()
      if (earnings.success) {
        setEarningsData(earnings.data)
      }

      // Fetch job statistics
      const statsResponse = await fetch(`/api/labour/stats/${userId}`)
      const stats = await statsResponse.json()
      if (stats.success) {
        setJobStats(stats.data)
      }

      // Fetch upcoming jobs
      const jobsResponse = await fetch(`/api/labour/upcoming-jobs/${userId}`)
      const jobs = await jobsResponse.json()
      if (jobs.success) {
        setUpcomingJobs(jobs.data)
      }

      // Fetch skill verifications
      const skillsResponse = await fetch(`/api/labour/skills/${userId}`)
      const skills = await skillsResponse.json()
      if (skills.success) {
        setSkillVerifications(skills.data)
      }

      // Fetch availability
      const availabilityResponse = await fetch(`/api/labour/availability/${userId}`)
      const availData = await availabilityResponse.json()
      if (availData.success) {
        setAvailability(availData.data)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getEarningsColor = (value: number) => {
    return value >= 0 ? '#22c55e' : '#ef4444'
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(jobStats?.totalEarnings || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className={jobStats?.earningsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {jobStats?.earningsGrowth >= 0 ? '+' : ''}{jobStats?.earningsGrowth}%
              </span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobStats?.totalJobs || 0}</div>
            <p className="text-xs text-muted-foreground">
              {jobStats?.thisMonthJobs || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobStats?.successRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {jobStats?.onTimeCompletion || 0}% on-time completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{labourProfile?.rating || 0}</div>
            <p className="text-xs text-muted-foreground">
              {jobStats?.totalReviews || 0} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="earnings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Earnings Tab */}
        <TabsContent value="earnings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
                <CardDescription>Your monthly earnings trend</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Earnings']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="earnings" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      dot={{ fill: '#f97316' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Earnings Breakdown</CardTitle>
                <CardDescription>By job category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={jobStats?.earningsByCategory || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(jobStats?.earningsByCategory || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Earnings']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Earnings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Earnings</CardTitle>
              <CardDescription>Your latest completed jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobStats?.recentEarnings?.slice(0, 5).map((earning: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">{earning.jobType}</p>
                        <p className="text-sm text-muted-foreground">{earning.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(earning.amount)}</p>
                      <p className="text-sm text-muted-foreground">{earning.duration}</p>
                    </div>
                  </div>
                )) || <p className="text-center text-muted-foreground py-8">No recent earnings</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Job Statistics</CardTitle>
                <CardDescription>Your performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <span className="text-sm">{jobStats?.completionRate || 0}%</span>
                </div>
                <Progress value={jobStats?.completionRate || 0} className="w-full" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">On-Time Delivery</span>
                  <span className="text-sm">{jobStats?.onTimeCompletion || 0}%</span>
                </div>
                <Progress value={jobStats?.onTimeCompletion || 0} className="w-full" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Customer Satisfaction</span>
                  <span className="text-sm">{jobStats?.satisfactionScore || 0}%</span>
                </div>
                <Progress value={jobStats?.satisfactionScore || 0} className="w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Categories</CardTitle>
                <CardDescription>Jobs by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={jobStats?.jobsByCategory || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Jobs</CardTitle>
              <CardDescription>Your scheduled work</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {upcomingJobs.map((job: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CalendarDays className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{job.jobType}</p>
                          <p className="text-sm text-muted-foreground">{job.location}</p>
                          <p className="text-xs text-muted-foreground">{job.date} • {job.time}</p>
                        </div>
                      </div>
                      <Badge variant={job.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                        {job.status}
                      </Badge>
                    </div>
                  )) || <p className="text-center text-muted-foreground py-8">No upcoming jobs</p>}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Availability Calendar</CardTitle>
                <CardDescription>Manage your work schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  required
                  modifiers={{
                    available: availability.map((day: any) => new Date(day.date)),
                  }}
                  modifiersStyles={{
                    available: { backgroundColor: '#22c55e', color: 'white' },
                    unavailable: { backgroundColor: '#ef4444', color: 'white' },
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Availability</CardTitle>
                <CardDescription>Set your availability for the week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{day}</span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="h-8">
                        Full Day
                      </Button>
                      <Button size="sm" variant="outline" className="h-8">
                        Half Day
                      </Button>
                      <Button size="sm" variant="outline" className="h-8">
                        Unavailable
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Availability Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Availability Preferences</CardTitle>
              <CardDescription>Default availability settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Work Radius</label>
                <p className="text-sm text-muted-foreground">Maximum distance you're willing to travel</p>
                <div className="flex items-center space-x-2 mt-1">
                  <input 
                    type="range" 
                    min="1" 
                    max="50" 
                    defaultValue={labourProfile?.workRadius || 10}
                    className="flex-1"
                  />
                  <span className="text-sm w-12">{labourProfile?.workRadius || 10} km</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Preferred Work Hours</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Button size="sm" variant="outline">Morning (6AM-12PM)</Button>
                  <Button size="sm" variant="outline">Afternoon (12PM-6PM)</Button>
                  <Button size="sm" variant="outline">Evening (6PM-12AM)</Button>
                  <Button size="sm" variant="outline">Night (12AM-6AM)</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skill Verifications</CardTitle>
              <CardDescription>Your verified skills and certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillVerifications.map((skill: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium">{skill.name}</p>
                        <p className="text-sm text-muted-foreground">{skill.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={skill.verified ? 'default' : 'secondary'}>
                        {skill.verified ? 'Verified' : 'Pending'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {skill.verifiedDate ? `Verified on ${skill.verifiedDate}` : 'Submitted for verification'}
                      </p>
                    </div>
                  </div>
                )) || <p className="text-center text-muted-foreground py-8">No skill verifications yet</p>}
              </div>
              
              <div className="mt-6">
                <Button className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Add New Skill Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Your work performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={jobStats?.performanceTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="rating" stroke="#8884d8" strokeWidth={2} name="Rating" />
                    <Line type="monotone" dataKey="jobs" stroke="#82ca9d" strokeWidth={2} name="Jobs" />
                    <Line type="monotone" dataKey="earnings" stroke="#ffc658" strokeWidth={2} name="Earnings" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Avg. Job Value</span>
                  <span className="text-sm font-bold">{formatCurrency(jobStats?.avgJobValue || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Peak Month</span>
                  <span className="text-sm font-bold">{jobStats?.peakMonth || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Repeat Clients</span>
                  <span className="text-sm font-bold">{jobStats?.repeatClients || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="text-sm font-bold">{jobStats?.avgResponseTime || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest work activities</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {jobStats?.recentActivity?.map((activity: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Activity className="w-4 h-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                  )) || <p className="text-center text-muted-foreground py-8">No recent activity</p>}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}