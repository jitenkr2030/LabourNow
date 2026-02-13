'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Download, Smartphone, Monitor, Zap, Shield, Star } from 'lucide-react'

interface PWAInstallPromptProps {
  className?: string
}

export function PWAInstallPrompt({ className = '' }: PWAInstallPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches
      
      setIsInstalled(isStandalone || isInWebAppiOS || isInWebAppChrome)
    }

    // Check if user has dismissed the prompt
    const wasDismissed = localStorage.getItem('pwa-install-dismissed')
    if (wasDismissed) {
      const dismissedTime = parseInt(wasDismissed)
      const oneWeek = 7 * 24 * 60 * 60 * 1000
      if (Date.now() - dismissedTime < oneWeek) {
        setDismissed(true)
      } else {
        localStorage.removeItem('pwa-install-dismissed')
      }
    }

    checkInstalled()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show prompt after a delay if not dismissed and not installed
      if (!dismissed && !isInstalled) {
        setTimeout(() => {
          setShowPrompt(true)
        }, 3000) // Show after 3 seconds
      }
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      console.log('PWA installed successfully')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [dismissed, isInstalled])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('Error during PWA installation:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  const handleLater = () => {
    setShowPrompt(false)
    // Show again in 1 day
    setTimeout(() => {
      if (!isInstalled && !dismissed) {
        setShowPrompt(true)
      }
    }, 24 * 60 * 60 * 1000)
  }

  // Don't show if already installed, dismissed, or no prompt available
  if (isInstalled || dismissed || !showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 ${className}`}>
      <Card className="shadow-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* App Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1">
                Install LabourNow App
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Get the full experience with offline access, push notifications, and quick app launch.
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Zap className="h-3 w-3 text-yellow-500" />
                  <span>Lightning fast</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Shield className="h-3 w-3 text-green-500" />
                  <span>Secure & private</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Download className="h-3 w-3 text-blue-500" />
                  <span>Works offline</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Star className="h-3 w-3 text-orange-500" />
                  <span>No ads</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Install
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLater}
                  size="sm"
                >
                  Later
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// PWA Install Banner for desktop
export function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const checkInstalled = () => {
      setIsInstalled(window.matchMedia('(display-mode: standalone)').matches)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      if (!isInstalled) {
        setShowBanner(true)
      }
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowBanner(false)
      setDeferredPrompt(null)
    }

    checkInstalled()
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      setShowBanner(false)
    } catch (error) {
      console.error('Error during PWA installation:', error)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
  }

  if (!showBanner || isInstalled || !deferredPrompt) {
    return null
  }

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="h-5 w-5" />
            <span className="text-sm font-medium">
              Install LabourNow for the best experience
            </span>
            <div className="hidden md:flex items-center gap-4 text-xs">
              <span>✓ Offline access</span>
              <span>✓ Faster loading</span>
              <span>✓ Push notifications</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleInstall}
              variant="secondary"
              size="sm"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Install App
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// PWA Install Instructions for iOS
export function PWAInstallInstructions() {
  const [showInstructions, setShowInstructions] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(isIOSDevice)

    // Show instructions for iOS users after 10 seconds
    if (isIOSDevice) {
      setTimeout(() => {
        const hasSeenInstructions = localStorage.getItem('pwa-ios-instructions')
        if (!hasSeenInstructions) {
          setShowInstructions(true)
        }
      }, 10000)
    }
  }, [])

  const handleDismiss = () => {
    setShowInstructions(false)
    localStorage.setItem('pwa-ios-instructions', 'true')
  }

  if (!isIOS || !showInstructions) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Install LabourNow on iOS</h3>
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              To install LabourNow on your iOS device:
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <p className="text-sm">
                  Tap the <strong>Share</strong> button 
                  <span className="inline-block ml-1">
                    <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                    </svg>
                  </span>
                  at the bottom of the screen
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <p className="text-sm">
                  Scroll down and tap <strong>"Add to Home Screen"</strong>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <p className="text-sm">
                  Tap <strong>"Add"</strong> to install LabourNow on your home screen
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Why install?</strong> Get offline access, faster loading, and a native app experience!
              </p>
            </div>

            <Button onClick={handleDismiss} className="w-full">
              Got it, thanks!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PWAInstallPrompt