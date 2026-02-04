'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AuthModal from '@/components/auth/AuthModal'
import EmployerDashboard from '@/components/employer/EmployerDashboard'
import LabourDashboard from '@/components/labour/LabourDashboard'
import { 
  Users, 
  Hammer, 
  PaintBucket, 
  Zap, 
  Wrench, 
  Truck, 
  Sprout, 
  Shield, 
  Star,
  MapPin,
  Clock,
  IndianRupee,
  CheckCircle,
  ArrowRight,
  Phone,
  MessageSquare
} from 'lucide-react'

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<'employer' | 'labour'>('employer')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState<any>(() => {
    // Initialize user state from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      if (token && userData) {
        try {
          return JSON.parse(userData)
        } catch (error) {
          console.error('Failed to parse user data:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
    }
    return null
  })

  const handleAuthSuccess = (userData: any) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // If user is logged in, show appropriate dashboard
  if (user) {
    if (user.role === 'EMPLOYER') {
      return <EmployerDashboard />
    } else if (user.role === 'LABOUR') {
      return <LabourDashboard />
    }
  }

  const labourCategories = [
    { icon: Users, name: 'Helper', color: 'bg-blue-100 text-blue-700' },
    { icon: Hammer, name: 'Mason', color: 'bg-orange-100 text-orange-700' },
    { icon: PaintBucket, name: 'Painter', color: 'bg-purple-100 text-purple-700' },
    { icon: Zap, name: 'Electrician', color: 'bg-yellow-100 text-yellow-700' },
    { icon: Wrench, name: 'Plumber', color: 'bg-cyan-100 text-cyan-700' },
    { icon: Truck, name: 'Loader', color: 'bg-green-100 text-green-700' },
    { icon: Sprout, name: 'Agriculture', color: 'bg-emerald-100 text-emerald-700' },
  ]

  const features = [
    {
      title: 'Instant Booking',
      description: 'Book skilled labour in minutes with our simple platform',
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      title: 'Verified Workers',
      description: 'All workers are verified and rated by real employers',
      icon: Shield,
      color: 'text-green-600'
    },
    {
      title: 'Fair Pricing',
      description: 'Transparent pricing at just ₹99 per worker per booking',
      icon: IndianRupee,
      color: 'text-orange-600'
    },
    {
      title: 'Location Based',
      description: 'Find workers near your location for faster service',
      icon: MapPin,
      color: 'text-purple-600'
    }
  ]

  const howItWorks = [
    { step: '1', title: 'Select Labour Type', description: 'Choose from various skilled labour categories' },
    { step: '2', title: 'Set Location & Time', description: 'Specify work location and preferred date/time' },
    { step: '3', title: 'Book & Pay', description: 'Pay ₹99 per worker and get instant confirmation' },
    { step: '4', title: 'Get Work Done', description: 'Worker arrives and completes the job' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LabourNow</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost">About</Button>
              <Button variant="ghost">Contact</Button>
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Welcome, {user.name}</span>
                  <Button variant="outline" onClick={handleLogout}>Logout</Button>
                </div>
              ) : (
                <Button onClick={() => setShowAuthModal(true)}>Login</Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-orange-100 text-orange-700 hover:bg-orange-100">
            🇮🇳 Made for India
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            On-Demand Labour
            <span className="text-orange-500"> Booking Platform</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with skilled workers instantly. Book helpers, masons, electricians, and more at just ₹99 per worker.
          </p>
          
          {/* Role Selection */}
          <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'employer' | 'labour')} className="max-w-md mx-auto mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="employer">I'm an Employer</TabsTrigger>
              <TabsTrigger value="labour">I'm a Worker</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8"
              onClick={() => setShowAuthModal(true)}
            >
              {selectedRole === 'employer' ? 'Find Workers' : 'Find Jobs'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline">
              <Phone className="mr-2 w-4 h-4" />
              Call for Support
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            ✓ Verified Workers ✓ Instant Booking ✓ Fair Pricing
          </p>
        </div>
      </section>

      {/* Labour Categories */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Skilled Workers</h2>
            <p className="text-gray-600">Choose from various categories of skilled labour</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {labourCategories.map((category, index) => {
              const Icon = category.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium">{category.name}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose LabourNow?</h2>
            <p className="text-gray-600">Simple, reliable, and affordable labour solutions</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Icon className={`w-8 h-8 mx-auto ${feature.color}`} />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600">Book workers in 4 simple steps</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple & Transparent Pricing</h2>
            <p className="text-gray-600">No hidden charges, pay only for what you need</p>
          </div>
          
          <div className="max-w-md mx-auto">
            <Card className="border-2 border-orange-200">
              <CardHeader className="text-center">
                <div className="text-4xl font-bold text-orange-500">₹99</div>
                <CardTitle className="text-xl">Per Worker Per Booking</CardTitle>
                <CardDescription>Half day or full day - same price!</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm">Verified & experienced workers</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm">Instant booking confirmation</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm">Contact details after payment</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm">GST invoice included</span>
                  </li>
                </ul>
                <Button 
                  className="w-full mt-6 bg-orange-500 hover:bg-orange-600"
                  onClick={() => setShowAuthModal(true)}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">10,000+</div>
              <p className="text-gray-600">Verified Workers</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">50,000+</div>
              <p className="text-gray-600">Bookings Completed</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">4.8★</div>
              <p className="text-gray-600">Average Rating</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">24/7</div>
              <p className="text-gray-600">Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of employers and workers using LabourNow
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="bg-white text-orange-500 hover:bg-gray-100"
              onClick={() => {
                setSelectedRole('employer')
                setShowAuthModal(true)
              }}
            >
              <Users className="mr-2 w-4 h-4" />
              Register as Employer
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-orange-500"
              onClick={() => {
                setSelectedRole('labour')
                setShowAuthModal(true)
              }}
            >
              <Hammer className="mr-2 w-4 h-4" />
              Register as Worker
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">LabourNow</span>
              </div>
              <p className="text-gray-400 text-sm">
                India's trusted on-demand labour booking platform
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Post Jobs</li>
                <li>Find Workers</li>
                <li>Pricing</li>
                <li>Support</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Workers</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Register</li>
                <li>Find Jobs</li>
                <li>Earnings</li>
                <li>Benefits</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>1800-123-4567</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span>support@labournow.in</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© 2024 LabourNow. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}