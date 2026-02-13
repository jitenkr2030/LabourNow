'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Settings, 
  TestTube,
  Activity,
  Globe,
  MessageSquare,
  CreditCard,
  Mail,
  Smartphone,
  BarChart3,
  Slack,
  Webhook,
  Info
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  status: 'active' | 'inactive' | 'error' | 'not_found'
  configured: boolean
  features: string[]
  lastTest: string | null
  health: any
}

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  active: boolean
  successCount: number
  failureCount: number
  lastTriggered: string | null
}

export default function IntegrationsDashboard() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState<string | null>(null)
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)

  useEffect(() => {
    fetchIntegrations()
    fetchWebhooks()
  }, [])

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations')
      const data = await response.json()
      setIntegrations(data.integrations || [])
    } catch (error) {
      console.error('Failed to fetch integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWebhooks = async () => {
    try {
      // Mock webhooks data - in real implementation, fetch from API
      const mockWebhooks: Webhook[] = [
        {
          id: 'webhook_1',
          name: 'Booking Notifications',
          url: 'https://api.example.com/bookings',
          events: ['booking.created', 'booking.completed'],
          active: true,
          successCount: 145,
          failureCount: 3,
          lastTriggered: new Date(Date.now() - 1000 * 60 * 5).toISOString()
        },
        {
          id: 'webhook_2',
          name: 'Payment Events',
          url: 'https://api.example.com/payments',
          events: ['payment.completed', 'payment.failed'],
          active: true,
          successCount: 89,
          failureCount: 1,
          lastTriggered: new Date(Date.now() - 1000 * 60 * 15).toISOString()
        }
      ]
      setWebhooks(mockWebhooks)
    } catch (error) {
      console.error('Failed to fetch webhooks:', error)
    }
  }

  const testIntegration = async (integrationId: string) => {
    setTesting(integrationId)
    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId })
      })
      const result = await response.json()
      
      // Show success message
      if (result.success) {
        console.log(`Integration ${integrationId} test passed`)
      } else {
        console.error(`Integration ${integrationId} test failed:`, result.error)
      }
      
      // Refresh integrations
      await fetchIntegrations()
    } catch (error) {
      console.error('Test integration error:', error)
    } finally {
      setTesting(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getIntegrationIcon = (id: string) => {
    const icons = {
      whatsapp: <MessageSquare className="h-5 w-5 text-green-600" />,
      google: <Globe className="h-5 w-5 text-blue-600" />,
      social: <Globe className="h-5 w-5 text-purple-600" />,
      payment: <CreditCard className="h-5 w-5 text-indigo-600" />,
      email: <Mail className="h-5 w-5 text-orange-600" />,
      sms: <Smartphone className="h-5 w-5 text-pink-600" />
    }
    return icons[id] || <Settings className="h-5 w-5 text-gray-600" />
  }

  const getFeatureIcon = (feature: string) => {
    const featureIcons: { [key: string]: React.ReactNode } = {
      messaging: <MessageSquare className="h-3 w-3" />,
      maps: <Globe className="h-3 w-3" />,
      analytics: <BarChart3 className="h-3 w-3" />,
      oauth: <Settings className="h-3 w-3" />,
      payments: <CreditCard className="h-3 w-3" />,
      email: <Mail className="h-3 w-3" />,
      sms: <Smartphone className="h-3 w-3" />
    }
    return featureIcons[feature] || <Info className="h-3 w-3" />
  }

  const getOverallHealth = () => {
    const activeCount = integrations.filter(i => i.status === 'active').length
    const totalCount = integrations.length
    const healthPercentage = totalCount > 0 ? (activeCount / totalCount) * 100 : 0
    
    if (healthPercentage >= 80) return { status: 'Excellent', color: 'text-green-600', progress: 100 }
    if (healthPercentage >= 60) return { status: 'Good', color: 'text-blue-600', progress: healthPercentage }
    if (healthPercentage >= 40) return { status: 'Fair', color: 'text-yellow-600', progress: healthPercentage }
    return { status: 'Poor', color: 'text-red-600', progress: healthPercentage }
  }

  const overallHealth = getOverallHealth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading integrations...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Management</h1>
          <p className="text-gray-600">Manage and monitor all third-party integrations</p>
        </div>
        <Button onClick={fetchIntegrations} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overall Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Status</span>
              <span className={`text-sm font-bold ${overallHealth.color}`}>
                {overallHealth.status}
              </span>
            </div>
            <Progress value={overallHealth.progress} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Active</span>
                <p className="font-bold text-green-600">
                  {integrations.filter(i => i.status === 'active').length}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Inactive</span>
                <p className="font-bold text-gray-600">
                  {integrations.filter(i => i.status === 'inactive').length}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Errors</span>
                <p className="font-bold text-red-600">
                  {integrations.filter(i => i.status === 'error').length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getIntegrationIcon(integration.id)}
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(integration.status)}
                      <Badge className={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {integration.features.slice(0, 3).map((feature) => (
                      <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                        {getFeatureIcon(feature)}
                        <span className="text-xs">{feature}</span>
                      </Badge>
                    ))}
                    {integration.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{integration.features.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {integration.lastTest ? (
                      <p>Last tested: {new Date(integration.lastTest).toLocaleString()}</p>
                    ) : (
                      <p>Not tested yet</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => testIntegration(integration.id)}
                      disabled={testing === integration.id}
                      className="flex-1"
                    >
                      {testing === integration.id ? (
                        <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <TestTube className="h-3 w-3 mr-1" />
                      )}
                      Test
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedIntegration(integration.id)}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Webhooks</h2>
            <Button>
              <Webhook className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </div>

          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{webhook.name}</CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        {webhook.url}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={webhook.active ? 'default' : 'secondary'}>
                        {webhook.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Events:</p>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Success</span>
                        <p className="font-bold text-green-600">{webhook.successCount}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Failed</span>
                        <p className="font-bold text-red-600">{webhook.failureCount}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Triggered</span>
                        <p className="text-xs">
                          {webhook.lastTriggered ? 
                            new Date(webhook.lastTriggered).toLocaleString() : 
                            'Never'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-sm text-green-600">+12% from last week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">98.5%</p>
                <p className="text-sm text-green-600">+2.1% improvement</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">245ms</p>
                <p className="text-sm text-green-600">-15ms faster</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">1.5%</p>
                <p className="text-sm text-red-600">+0.3% increase</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Integration Usage</CardTitle>
              <CardDescription>Event distribution across integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {integrations.slice(0, 5).map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getIntegrationIcon(integration.id)}
                      <span className="text-sm font-medium">{integration.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.random() * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {Math.floor(Math.random() * 500 + 100)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}