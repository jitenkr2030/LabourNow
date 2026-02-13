'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { 
  Menu, 
  X, 
  Home, 
  Search, 
  Calendar, 
  BarChart3, 
  Phone, 
  User,
  MapPin,
  Bell,
  Settings,
  LogOut,
  Download
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import PWAInstallPrompt from './PWAInstallPrompt'

interface MobileNavigationProps {
  user?: any
  onLogout?: () => void
  onLoginClick?: () => void
}

export default function MobileNavigation({ user, onLogout, onLoginClick }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const navigationItems = [
    {
      icon: Home,
      label: 'Home',
      href: '/',
      badge: null
    },
    {
      icon: Search,
      label: 'Find Workers',
      href: '/search',
      badge: null
    },
    {
      icon: Calendar,
      label: 'My Bookings',
      href: '/bookings',
      badge: user ? 'Active' : null
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      href: '/analytics',
      badge: null
    },
    {
      icon: MapPin,
      label: 'Cities',
      href: '/cities',
      badge: 'New'
    }
  ]

  const handleNavigation = (href: string) => {
    // Close sheet
    setIsOpen(false)
    
    // Navigate using Next.js router
    if (href.startsWith('/')) {
      router.push(href)
    } else {
      // Handle external links
      window.open(href, '_blank')
    }
  }

  const handleDownloadClick = () => {
    // Show download options
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isAndroid = /Android/.test(navigator.userAgent)
    
    if (isIOS) {
      window.open('https://apps.apple.com/app/labournow/id123456789', '_blank')
    } else if (isAndroid) {
      window.open('https://play.google.com/store/apps/details?id=com.labournow', '_blank')
    } else {
      // Show both options for desktop
      const downloadModal = document.createElement('div')
      downloadModal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
          <div style="background: white; padding: 2rem; border-radius: 0.5rem; max-width: 400px; margin: 1rem;">
            <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: bold;">Download LabourNow</h3>
            <p style="margin: 0 0 1.5rem 0; color: #666;">Choose your platform:</p>
            <div style="display: flex; gap: 1rem;">
              <button onclick="window.open('https://play.google.com/store/apps/details?id=com.labournow', '_blank'); document.body.removeChild(this.parentElement.parentElement);" style="flex: 1; padding: 0.75rem; background: #4CAF50; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
                Android
              </button>
              <button onclick="window.open('https://apps.apple.com/app/labournow/id123456789', '_blank'); document.body.removeChild(this.parentElement.parentElement);" style="flex: 1; padding: 0.75rem; background: #007AFF; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
                iOS
              </button>
              <button onclick="document.body.removeChild(this.parentElement.parentElement);" style="flex: 1; padding: 0.75rem; background: #6c757d; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
                Cancel
              </button>
            </div>
          </div>
        </div>
      `
      document.body.appendChild(downloadModal)
    }
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <span>LabourNow</span>
                    </SheetTitle>
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </SheetHeader>
                
                <div className="p-4">
                  {/* User Section */}
                  {user ? (
                    <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{user.name || 'User'}</p>
                          <p className="text-xs text-gray-600">{user.role}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="w-3 h-3 mr-1" />
                          Profile
                        </Button>
                        <Button variant="outline" size="sm" onClick={onLogout}>
                          <LogOut className="w-3 h-3 mr-1" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <Button 
                        onClick={onLoginClick}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Login / Register
                      </Button>
                    </div>
                  )}

                  {/* Navigation Items */}
                  <nav className="space-y-2">
                    {navigationItems.map((item) => (
                      <button
                        key={item.href}
                        onClick={() => handleNavigation(item.href)}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="w-5 h-5 text-gray-600" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </nav>

                  {/* Quick Actions */}
                  <div className="mt-6 pt-6 border-t space-y-2">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Support
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Bell className="w-4 h-4 mr-2" />
                      Notifications
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm" onClick={handleDownloadClick}>
                      <Download className="w-4 h-4 mr-2" />
                      Download App
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">LabourNow</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5" />
            </Button>
            {user ? (
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            ) : (
              <Button size="sm" onClick={onLoginClick} className="bg-orange-500 hover:bg-orange-600 text-white">
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navigationItems.slice(0, 5).map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavigation(item.href)}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-gray-100 transition-colors relative"
            >
              <item.icon className="w-5 h-5 text-gray-600" />
              <span className="text-xs text-gray-600 mt-1">{item.label}</span>
              {item.badge && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </>
  )
}