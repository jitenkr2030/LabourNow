'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users,
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Target,
  Activity,
  FileText,
  Settings,
  Heart,
  Repeat,
  Building,
  UserPlus,
  Filter,
  Search
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'

interface EmployerDashboardProps {
  userId: string
  employerProfile: any
  onManageTeam?: () => void
}

export default function EmployerDashboard({ userId, employerProfile, onManageTeam }: EmployerDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [favoriteWorkers, setFavoriteWorkers] = useState<any[]>([])
  const [recurringBookings, setRecurringBookings] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [budgetData, setBudgetData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [userId])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch analytics data
      const analyticsResponse = await fetch(`/api/employer/analytics/${userId}`)
      const analytics = await analyticsResponse.json()
      if (analytics.success) {
        setAnalyticsData(analytics.data)
      }

      // Fetch bookings
      const bookingsResponse = await fetch(`/api/employer/bookings/${userId}`)
      const bookingsData = await bookingsResponse.json()
      if (bookingsData.success) {
        setBookings(bookingsData.data)
      }

      // Fetch favorite workers
      const favoritesResponse = await fetch(`/api/employer/favorites/${userId}`)
      const favorites = await favoritesResponse.json()
      if (favorites.success) {
        setFavoriteWorkers(favorites.data)
      }

      // Fetch recurring bookings
      const recurringResponse = await fetch(`/api/employer/recurring/${userId}`)
      const recurring = await recurringResponse.json()
      if (recurring.success) {
        setRecurringBookings(recurring.data)
      }

      // Fetch team members
      const teamResponse = await fetch(`/api/employer/team/${userId}`)
      const team = await teamResponse.json()
      if (team.success) {
        setTeamMembers(team.data)
      }

      // Fetch budget data
      const budgetResponse = await fetch(`/api/employer/budget/${userId}`)
      const budget = await budgetResponse.json()
      if (budget.success) {
        setBudgetData(budget.data)
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

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
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData?.totalSpent || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className={analyticsData?.spendingGrowth >= 0 ? 'text-red-600' : 'text-green-600'}>
                {analyticsData?.spendingGrowth >= 0 ? '+' : ''}{analyticsData?.spendingGrowth}%
              </span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData?.thisMonthBookings || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.activeWorkers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {favoriteWorkers.length} favorites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budgetData ? `${Math.round((budgetData.used / budgetData.total) * 100)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(budgetData?.used || 0)} of {formatCurrency(budgetData?.total || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Spending Trend</CardTitle>
                <CardDescription>Your monthly spending pattern</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData?.spendingTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
                    <Area type="monotone" dataKey="amount" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Spending by job category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData?.spendingByCategory || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(analyticsData?.spendingByCategory || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData?.onTimeCompletion || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">On-Time Completion</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analyticsData?.avgRating || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {analyticsData?.repeatBusiness || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Repeat Business</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Recent Bookings</h3>
              <p className="text-sm text-muted-foreground">Manage and track your bookings</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button size="sm">
                <CalendarDays className="w-4 h-4 mr-2" />
                New Booking
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="divide-y">
                  {bookings.map((booking: any, index: number) => (
                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={booking.worker.avatar} />
                            <AvatarFallback>
                              {booking.worker.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{booking.worker.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.category} • {booking.date} • {booking.duration}
                            </p>
                            <p className="text-xs text-muted-foreground">{booking.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={booking.status === 'COMPLETED' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                          <p className="text-sm font-medium mt-1">{formatCurrency(booking.amount)}</p>
                        </div>
                      </div>
                    </div>
                  )) || <div className="text-center py-8 text-muted-foreground">No bookings yet</div>}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recurring Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Recurring Bookings</CardTitle>
              <CardDescription>Your scheduled repeat bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recurringBookings.map((booking: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Repeat className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="font-medium">{booking.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.frequency} • {booking.nextDate}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(booking.amount)}</p>
                      <Badge variant="outline" className="text-xs">
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                )) || <p className="text-center text-muted-foreground py-8">No recurring bookings</p>}
              </div>
              
              <Button className="w-full mt-4" variant="outline">
                <Repeat className="w-4 h-4 mr-2" />
                Create Recurring Booking
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workers Tab */}
        <TabsContent value="workers" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Worker Management</h3>
              <p className="text-sm text-muted-foreground">Your favorite and recently hired workers</p>
            </div>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search workers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {/* Favorite Workers */}
          <Card>
            <CardHeader>
              <CardTitle>Favorite Workers</CardTitle>
              <CardDescription>Workers you've marked as favorites</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteWorkers.map((worker: any, index: number) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar>
                          <AvatarImage src={worker.avatar} />
                          <AvatarFallback>
                            {worker.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{worker.name}</p>
                          <p className="text-sm text-muted-foreground">{worker.category}</p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Heart className="w-4 h-4 text-red-500 fill-current" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{worker.rating}</span>
                        </div>
                        <span className="text-muted-foreground">{worker.experience} yrs</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="font-medium">{formatCurrency(worker.hourlyWage)}/hr</span>
                        <Badge variant="outline" className="text-xs">
                          {worker.totalJobs} jobs
                        </Badge>
                      </div>
                      <Button className="w-full mt-3" size="sm">
                        Book Now
                      </Button>
                    </CardContent>
                  </Card>
                )) || <p className="text-center text-muted-foreground py-8">No favorite workers yet</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget Overview</CardTitle>
                <CardDescription>Track your spending against budget</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Budget Used</span>
                      <span>{formatCurrency(budgetData?.used || 0)}</span>
                    </div>
                    <Progress value={budgetData ? (budgetData.used / budgetData.total) * 100 : 0} className="w-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Budget</p>
                      <p className="font-medium">{formatCurrency(budgetData?.total || 0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining</p>
                      <p className="font-medium">{formatCurrency((budgetData?.total || 0) - (budgetData?.used || 0))}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>Where your money is going</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={budgetData?.spendingByCategory || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
                    <Bar dataKey="amount" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Budget Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Alerts</CardTitle>
              <CardDescription>Notifications about your budget</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {budgetData?.alerts?.map((alert: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        alert.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                    <Badge variant={alert.type === 'warning' ? 'secondary' : 'destructive'}>
                      {alert.severity}
                    </Badge>
                  </div>
                )) || <p className="text-center text-muted-foreground py-8">No budget alerts</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Team Management</h3>
              <p className="text-sm text-muted-foreground">Manage your team members and permissions</p>
            </div>
            <Button onClick={onManageTeam}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>People who can manage bookings on your behalf</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <p className="text-xs text-muted-foreground">Role: {member.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={member.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Joined {member.joinedDate}
                      </p>
                    </div>
                  </div>
                )) || <p className="text-center text-muted-foreground py-8">No team members yet</p>}
              </div>
            </CardContent>
          </Card>

          {/* Team Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Team Analytics</CardTitle>
              <CardDescription>Team performance and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{teamMembers.length}</div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {teamMembers.filter(m => m.status === 'ACTIVE').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analyticsData?.teamBookings || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Team Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}