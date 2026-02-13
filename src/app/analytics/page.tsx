'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  IndianRupee, 
  Star,
  Menu,
  Bell,
  Home,
  LogOut,
  Clock,
  CheckCircle
} from 'lucide-react'
import MobileNavigation from '@/components/pwa/MobileNavigation'
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt'

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

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
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/'
  }

  const handleLoginClick = () => {
    window.location.href = '/'
  }

  // Mock analytics data
  const analyticsData = {
    totalBookings: 156,
    totalRevenue: 45678,
    activeWorkers: 89,
    averageRating: 4.6,
    monthlyGrowth: 23.5,
    topCategories: [
      { name: 'Helper', count: 45, percentage: 28.8 },
      { name: 'Mason', count: 38, percentage: 24.4 },
      { name: 'Painter', count: 32, percentage: 20.5 },
      { name: 'Electrician', count: 25, percentage: 16.0 },
      { name: 'Plumber', count: 16, percentage: 10.3 }
    ],
    recentActivity: [
      { id: 1, type: 'booking', description: 'New booking #LB123', time: '2 mins ago', status: 'success' },
      { id: 2, type: 'rating', description: '5-star rating received', time: '15 mins ago', status: 'success' },
      { id: 3, type: 'booking', description: 'Booking #LB122 completed', time: '1 hour ago', status: 'success' },
      { id: 4, type: 'payment', description: 'Payment of ₹298 received', time: '2 hours ago', status: 'success' }
    ]
  }

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
            <h1 className="text-xl font-bold text-gray-900 mb-4">Analytics</h1>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">+23.5%</span>
                </div>
                <div className="text-2xl font-bold">{analyticsData.totalBookings}</div>
                <p className="text-xs opacity-90">Total Bookings</p>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <IndianRupee className="w-5 h-5" />
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">+15.2%</span>
                </div>
                <div className="text-2xl font-bold">₹{analyticsData.totalRevenue.toLocaleString()}</div>
                <p className="text-xs opacity-90">Total Revenue</p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5" />
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">+8.1%</span>
                </div>
                <div className="text-2xl font-bold">{analyticsData.activeWorkers}</div>
                <p className="text-xs opacity-90">Active Workers</p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Star className="w-5 h-5" />
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">+0.3</span>
                </div>
                <div className="text-2xl font-bold">{analyticsData.averageRating}</div>
                <p className="text-xs opacity-90">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Content */}
        <div className="px-4 py-4 space-y-4">
          {/* Top Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Categories</CardTitle>
              <CardDescription>Most booked service categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-orange-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{category.name}</p>
                        <p className="text-xs text-gray-500">{category.count} bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{category.percentage}%</p>
                      <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                        <div 
                          className="h-2 bg-orange-500 rounded-full" 
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest updates from your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b last:border-b-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.status === 'success' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {activity.type === 'booking' && <Calendar className="w-4 h-4 text-green-600" />}
                      {activity.type === 'rating' && <Star className="w-4 h-4 text-yellow-600" />}
                      {activity.type === 'payment' && <IndianRupee className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Monthly Growth</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">+{analyticsData.monthlyGrowth}%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Avg. Response Time</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">2.5 mins</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Completion Rate</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">94.2%</span>
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