'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Phone, ArrowRight, CheckCircle, Users, Hammer } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: (user: any) => void
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [step, setStep] = useState<'role' | 'mobile' | 'otp'>('role')
  const [selectedRole, setSelectedRole] = useState<'LABOUR' | 'EMPLOYER'>('EMPLOYER')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState('')

  if (!isOpen) return null

  const sendOTP = async () => {
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      alert('Please enter a valid mobile number')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, role: selectedRole })
      })

      const data = await response.json()
      if (data.success) {
        setUserId(data.userId)
        setStep('otp')
        alert(`OTP sent to ${mobile}. For demo, check console logs.`)
      } else {
        alert('Failed to send OTP: ' + data.message)
      }
    } catch (error) {
      alert('Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp, userId })
      })

      const data = await response.json()
      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onAuthSuccess(data.user)
        onClose()
        alert('Login successful!')
      } else {
        alert('Failed to verify OTP: ' + data.message)
      }
    } catch (error) {
      alert('Failed to verify OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setStep('role')
    setSelectedRole('EMPLOYER')
    setMobile('')
    setOtp('')
    setUserId('')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            {selectedRole === 'EMPLOYER' ? (
              <Users className="w-6 h-6 text-white" />
            ) : (
              <Hammer className="w-6 h-6 text-white" />
            )}
          </div>
          <CardTitle>Welcome to LabourNow</CardTitle>
          <CardDescription>
            {step === 'role' && 'Select your role to continue'}
            {step === 'mobile' && `Login as ${selectedRole === 'EMPLOYER' ? 'Employer' : 'Worker'}`}
            {step === 'otp' && 'Enter the verification code'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 'role' && (
            <div className="space-y-4">
              <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'LABOUR' | 'EMPLOYER')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="EMPLOYER">Employer</TabsTrigger>
                  <TabsTrigger value="LABOUR">Worker</TabsTrigger>
                </TabsList>
                
                <TabsContent value="EMPLOYER" className="space-y-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-medium">Hire Workers</h3>
                    <p className="text-sm text-gray-600">Find and book skilled labour for your projects</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="LABOUR" className="space-y-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Hammer className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-medium">Find Jobs</h3>
                    <p className="text-sm text-gray-600">Get work opportunities and earn money</p>
                  </div>
                </TabsContent>
              </Tabs>
              
              <Button 
                onClick={() => setStep('mobile')} 
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                Continue as {selectedRole === 'EMPLOYER' ? 'Employer' : 'Worker'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 'mobile' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="9876543210"
                    className="pl-10"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  We'll send a 6-digit verification code
                </p>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={reset} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={sendOTP} 
                  disabled={isLoading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </Button>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  className="text-center text-lg tracking-widest"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Sent to {mobile}
                </p>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setStep('mobile')} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={verifyOTP} 
                  disabled={isLoading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Login'}
                </Button>
              </div>

              <Button 
                variant="ghost" 
                onClick={sendOTP} 
                disabled={isLoading}
                className="w-full text-sm"
              >
                Resend OTP
              </Button>
            </div>
          )}
        </CardContent>

        <div className="border-t p-4">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Secure Login
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              OTP Verification
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              No Password Required
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}