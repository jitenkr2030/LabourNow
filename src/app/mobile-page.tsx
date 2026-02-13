'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import AuthModal from '@/components/auth/AuthModal'
import EmployerDashboard from '@/components/employer/EnhancedEmployerDashboard'
import LabourDashboard from '@/components/labour/LabourDashboard'
import MobileNavigation from '@/components/pwa/MobileNavigation'
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt'
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
  MessageSquare,
  Car,
  Home as HomeIcon,
  Building,
  Globe,
  ChevronDown,
  Smartphone,
  Download,
  Menu
} from 'lucide-react'

export default function MobileOptimizedHome() {
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
  const [isMobile, setIsMobile] = useState(false)
  const [showCitySheet, setShowCitySheet] = useState(false)
  const [selectedCity, setSelectedCity] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  const handleDownloadClick = (platform: 'ios' | 'android') => {
    // Create download modal for direct download
    const downloadModal = document.createElement('div')
    downloadModal.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1rem;">
        <div style="background: white; padding: 2rem; border-radius: 0.5rem; max-width: 400px; width: 100%; margin: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3 style="margin: 0; font-size: 1.25rem; font-weight: bold;">Download LabourNow</h3>
            <button onclick="this.closest('div').parentElement.remove();" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;">×</button>
          </div>
          <p style="margin: 0 0 1.5rem 0; color: #666; text-align: center;">Choose your preferred installation method:</p>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <button onclick="downloadApp('pwa'); this.closest('div').parentElement.remove();" style="padding: 0.75rem; background: #ff6b35; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-weight: 500;">
              📱 Install as Web App (PWA)
            </button>
            <div style="display: flex; gap: 0.75rem;">
              <button onclick="downloadApp('android'); this.closest('div').parentElement.remove();" style="flex: 1; padding: 0.75rem; background: #4CAF50; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-weight: 500;">
                🤖 Android APK
              </button>
              <button onclick="downloadApp('ios'); this.closest('div').parentElement.remove();" style="flex: 1; padding: 0.75rem; background: #007AFF; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-weight: 500;">
                🍎 iOS IPA
              </button>
            </div>
          </div>
          <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 0.75rem; color: #666; text-align: center;">
              ✅ Works offline • Fast loading • Full screen<br>
              ✅ No app store required • Direct download<br>
              ✅ Always updated • No permissions needed
            </p>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(downloadModal)
    
    // Add downloadApp function to global scope
    const downloadApp = (platform: 'pwa' | 'android' | 'ios') => {
      if (platform === 'pwa') {
        // Show PWA installation instructions
        alert('To install LabourNow as PWA:\n\nFor Android/Chrome:\n1. Click the install icon (⚡) in the address bar\n2. Click "Install" to add to home screen\n\nFor iOS:\n1. Tap the Share button\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm')
      } else {
        // Direct download
        const fileName = platform === 'android' ? 'labournow.apk' : 'labournow.ipa'
        
        // Show download started message
        const message = document.createElement('div')
        message.innerHTML = `
          <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #10b981; color: white; padding: 1rem 1.5rem; border-radius: 0.5rem; z-index: 10000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
              <svg style="width: 20px; height: 20px; margin-right: 0.5rem;" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586V7a1 1 0 012 0v5.586l2.293-2.293a1 1 0 011.414 1.414z" clip-rule="evenodd"/>
              </svg>
              <span style="font-weight: bold;">Download Started!</span>
            </div>
            <p style="margin: 0; font-size: 0.875rem;">LabourNow ${platform === 'android' ? 'APK' : 'IPA'} is downloading...</p>
          </div>
        `
        document.body.appendChild(message)
        
        // Remove message after 3 seconds
        setTimeout(() => {
          if (document.body.contains(message)) {
            document.body.removeChild(message)
          }
        }, 3000)
        
        // Create download link
        const link = document.createElement('a')
        link.href = `/downloads/${fileName}`
        link.download = fileName
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
    
    (window as any).downloadApp = downloadApp
  }

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
    { icon: Users, name: 'Event Staff', color: 'bg-pink-100 text-pink-700' },
    { icon: Car, name: 'Driver', color: 'bg-gray-100 text-gray-700' },
    { icon: HomeIcon, name: 'Maid/Cook', color: 'bg-lime-100 text-lime-700' },
    { icon: Shield, name: 'Security', color: 'bg-indigo-100 text-indigo-700' }
  ]

  const cities = [
    { name: 'Mumbai', price: '₹149', factor: '×1.5', specialty: 'Financial Hub' },
    { name: 'Delhi', price: '₹129', factor: '×1.3', specialty: 'Capital City' },
    { name: 'Bangalore', price: '₹119', factor: '×1.2', specialty: 'IT Hub' },
    { name: 'Chennai', price: '₹99', factor: 'Standard', specialty: 'Coastal City' },
    { name: 'Kolkata', price: '₹89', factor: '×0.9', specialty: 'Cultural Capital' },
    { name: 'Pune', price: '₹109', factor: '×1.1', specialty: 'Education Hub' },
    { name: 'Hyderabad', price: '₹99', factor: 'Standard', specialty: 'Tech City' },
    { name: 'Ahmedabad', price: '₹89', factor: '×0.9', specialty: 'Textile Hub' }
  ]

  const features = [
    {
      title: 'Instant Booking',
      description: 'Book workers in minutes',
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      title: 'Verified Workers',
      description: 'All workers are verified',
      icon: Shield,
      color: 'text-green-600'
    },
    {
      title: 'Fair Pricing',
      description: '₹99 per worker',
      icon: IndianRupee,
      color: 'text-orange-600'
    },
    {
      title: 'Mobile App',
      description: 'Download our app',
      icon: Smartphone,
      color: 'text-purple-600'
    }
  ]

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Navigation */}
        <MobileNavigation 
          user={user} 
          onLogout={handleLogout}
          onLoginClick={() => setShowAuthModal(true)}
        />

        {/* Main Content - Mobile Optimized */}
        <main className="pb-20 md:pb-0">
          {/* Hero Section - Mobile */}
          <section className="bg-gradient-to-b from-orange-500 to-orange-600 text-white px-4 py-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-3">LabourNow</h1>
              <p className="text-sm opacity-90 mb-6">Book skilled workers instantly</p>
              
              {/* Role Selection - Mobile */}
              <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'employer' | 'labour')} className="w-full max-w-xs mx-auto mb-6">
                <TabsList className="grid w-full grid-cols-2 h-10">
                  <TabsTrigger value="employer" className="text-xs">Employer</TabsTrigger>
                  <TabsTrigger value="labour" className="text-xs">Worker</TabsTrigger>
                </TabsList>
              </Tabs>

              <Button 
                size="lg" 
                className="w-full bg-white text-orange-600 font-semibold"
                onClick={() => setShowAuthModal(true)}
              >
                {selectedRole === 'employer' ? 'Find Workers' : 'Find Jobs'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              
              <div className="flex items-center justify-center space-x-4 text-xs mt-4">
                <span className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </span>
                <span className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Instant
                </span>
                <span className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Fair Price
                </span>
              </div>
            </div>
          </section>

          {/* Categories - Mobile Grid */}
          <section className="px-4 py-6 bg-white">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Popular Services</h2>
              <p className="text-sm text-gray-600">Choose from our top categories</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              {labourCategories.slice(0, 9).map((category, index) => {
                const Icon = category.icon
                return (
                  <Card key={index} className="text-center hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-3">
                      <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center mx-auto mb-2`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-medium">{category.name}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            
            <div className="text-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => {
                  // Navigate to categories page
                  window.location.href = '/search'
                }}
              >
                View All 60+ Categories
              </Button>
            </div>
          </section>

          {/* Cities - Mobile */}
          <section className="px-4 py-6 bg-gray-50">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Available Cities</h2>
              <p className="text-sm text-gray-600">Local pricing and support</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {cities.slice(0, 6).map((city, index) => (
                <Card key={index} className="text-center hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Building className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-sm font-medium mb-1">{city.name}</h3>
                    <p className="text-xs text-gray-600 mb-1">{city.specialty}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">{city.price}</span>
                      <Badge variant="outline" className="text-xs">{city.factor}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Sheet open={showCitySheet} onOpenChange={setShowCitySheet}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => {
                    // Navigate to cities page
                    window.location.href = '/cities'
                  }}
                >
                  View All Cities
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader>
                  <SheetTitle>All Cities</SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-2 gap-3 p-4 overflow-y-auto">
                  {cities.map((city, index) => (
                    <Card key={index} className="text-center">
                      <CardContent className="p-3">
                        <h3 className="text-sm font-medium">{city.name}</h3>
                        <p className="text-xs text-gray-600">{city.price}</p>
                        <Badge variant="outline" className="text-xs mt-1">{city.factor}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </section>

          {/* Features - Mobile */}
          <section className="px-4 py-6 bg-white">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Why LabourNow?</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card key={index} className="text-center">
                    <CardContent className="p-4">
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${feature.color}`} />
                      <h3 className="text-sm font-semibold mb-1">{feature.title}</h3>
                      <p className="text-xs text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          {/* CTA - Mobile */}
          <section className="px-4 py-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-3">Get Started Now</h2>
              <p className="text-sm opacity-90 mb-6">Join thousands using LabourNow</p>
              
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full bg-white text-orange-600 font-semibold"
                  onClick={() => setShowAuthModal(true)}
                >
                  <Users className="mr-2 w-4 h-4" />
                  Register as Employer
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full border-white text-white hover:bg-white hover:text-orange-600 font-semibold"
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

          {/* App Download Banner - Mobile */}
          <section className="px-4 py-6 bg-gray-900 text-white">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-bold mb-2">Download Our App</h2>
              <p className="text-sm opacity-90 mb-4">Get the full mobile experience</p>
              
              <div className="flex justify-center space-x-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white text-white hover:bg-white hover:text-gray-900"
                  onClick={() => handleDownloadClick('ios')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  iOS Download
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white text-white hover:bg-white hover:text-gray-900"
                  onClick={() => handleDownloadClick('android')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Android Download
                </Button>
              </div>
              
              <div className="mt-4 flex justify-center space-x-6 text-xs opacity-75">
                <div className="text-center">
                  <CheckCircle className="w-4 h-4 mx-auto mb-1" />
                  <p>Works Offline</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="w-4 h-4 mx-auto mb-1" />
                  <p>Fast Loading</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="w-4 h-4 mx-auto mb-1" />
                  <p>Full Screen</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />

        {/* Auth Modal */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    )
  }

  // Desktop version (existing code)
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Desktop Header */}
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

      {/* Desktop Hero Section */}
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

      {/* Rest of the desktop content (existing code) */}
      {/* ... existing desktop sections ... */}
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}