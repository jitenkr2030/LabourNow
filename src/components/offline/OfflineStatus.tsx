'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  Cloud, 
  CloudOff,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  MessageSquare,
  Calendar,
  Settings
} from 'lucide-react'

interface OfflineStatusProps {
  className?: string
}

interface OfflineData {
  profiles: number
  bookings: number
  messages: number
  cities: number
}

interface SyncQueueItem {
  id: string
  type: string
  description: string
  timestamp: Date
  status: 'pending' | 'syncing' | 'completed' | 'failed'
}

export function OfflineStatus({ className = '' }: OfflineStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [offlineData, setOfflineData] = useState<OfflineData>({
    profiles: 0,
    bookings: 0,
    messages: 0,
    cities: 0
  })
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      checkOfflineData()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    const handleNetworkChange = (event: CustomEvent) => {
      setIsOnline(event.detail.isOnline)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('networkchange', handleNetworkChange as EventListener)

    // Initial data check
    checkOfflineData()
    checkSyncQueue()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('networkchange', handleNetworkChange as EventListener)
    }
  }, [])

  const checkOfflineData = async () => {
    try {
      // In a real implementation, this would query IndexedDB
      const mockData: OfflineData = {
        profiles: Math.floor(Math.random() * 50) + 10,
        bookings: Math.floor(Math.random() * 20) + 5,
        messages: Math.floor(Math.random() * 100) + 20,
        cities: Math.floor(Math.random() * 10) + 5
      }
      setOfflineData(mockData)
    } catch (error) {
      console.error('Failed to check offline data:', error)
    }
  }

  const checkSyncQueue = async () => {
    try {
      // In a real implementation, this would check the sync queue
      const mockQueue: SyncQueueItem[] = [
        {
          id: '1',
          type: 'booking',
          description: 'Create booking for Mason work',
          timestamp: new Date(Date.now() - 300000),
          status: 'pending'
        },
        {
          id: '2',
          type: 'message',
          description: 'Send message to contractor',
          timestamp: new Date(Date.now() - 600000),
          status: 'pending'
        }
      ]
      setSyncQueue(mockQueue)
    } catch (error) {
      console.error('Failed to check sync queue:', error)
    }
  }

  const handleSync = async () => {
    if (!isOnline || isSyncing) return

    setIsSyncing(true)
    
    try {
      // Simulate sync process
      for (let i = 0; i < syncQueue.length; i++) {
        const item = syncQueue[i]
        setSyncQueue(prev => prev.map(s => 
          s.id === item.id ? { ...s, status: 'syncing' } : s
        ))
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setSyncQueue(prev => prev.map(s => 
          s.id === item.id ? { ...s, status: 'completed' } : s
        ))
      }
      
      setLastSyncTime(new Date())
      setSyncQueue([])
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncQueue(prev => prev.map(s => 
        s.status === 'syncing' ? { ...s, status: 'failed' } : s
      ))
    } finally {
      setIsSyncing(false)
    }
  }

  const getStatusColor = () => {
    if (isOnline) return 'text-green-600'
    return 'text-red-600'
  }

  const getStatusIcon = () => {
    if (isOnline) return <Wifi className="h-5 w-5" />
    return <WifiOff className="h-5 w-5" />
  }

  const getStatusText = () => {
    if (isOnline) return 'Online'
    return 'Offline Mode'
  }

  const getSyncProgress = () => {
    if (syncQueue.length === 0) return 100
    const completed = syncQueue.filter(item => item.status === 'completed').length
    return (completed / syncQueue.length) * 100
  }

  if (!showDetails) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Card className="shadow-lg border-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={getStatusColor()}>
                {getStatusIcon()}
              </div>
              <div>
                <p className="font-medium text-sm">{getStatusText()}</p>
                {!isOnline && (
                  <p className="text-xs text-gray-500">
                    {offlineData.profiles} profiles cached
                  </p>
                )}
              </div>
              {!isOnline && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDetails(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {syncQueue.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Syncing {syncQueue.length} items</span>
                  <span>{Math.round(getSyncProgress())}%</span>
                </div>
                <Progress value={getSyncProgress()} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 ${className}`}>
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Offline Status</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDetails(false)}
            >
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 overflow-y-auto">
          {/* Connection Status */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={getStatusColor()}>
              {getStatusIcon()}
            </div>
            <div className="flex-1">
              <p className="font-medium">{getStatusText()}</p>
              <p className="text-sm text-gray-600">
                {isOnline 
                  ? 'All features available' 
                  : 'Limited functionality - using cached data'
                }
              </p>
            </div>
            {isOnline && syncQueue.length > 0 && (
              <Button
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Cloud className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>

          {/* Offline Data */}
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Database className="h-4 w-4" />
              Cached Data
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">{offlineData.profiles}</p>
                  <p className="text-xs text-gray-600">Profiles</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                <Calendar className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">{offlineData.bookings}</p>
                  <p className="text-xs text-gray-600">Bookings</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                <MessageSquare className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">{offlineData.messages}</p>
                  <p className="text-xs text-gray-600">Messages</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                <Cloud className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">{offlineData.cities}</p>
                  <p className="text-xs text-gray-600">Cities</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sync Queue */}
          {syncQueue.length > 0 && (
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Sync ({syncQueue.length})
              </h3>
              <div className="space-y-2">
                {syncQueue.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                  >
                    <div className="flex-shrink-0">
                      {item.status === 'pending' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                      {item.status === 'syncing' && <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />}
                      {item.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {item.status === 'failed' && <CloudOff className="h-4 w-4 text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.description}</p>
                      <p className="text-xs text-gray-500">
                        {item.type} • {formatRelativeTime(item.timestamp)}
                      </p>
                    </div>
                    <Badge variant={
                      item.status === 'completed' ? 'default' :
                      item.status === 'syncing' ? 'secondary' :
                      item.status === 'failed' ? 'destructive' : 'outline'
                    }>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
              
              {isOnline && (
                <Button
                  className="w-full mt-3"
                  onClick={handleSync}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Cloud className="h-4 w-4 mr-2" />
                      Sync Now
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Last Sync */}
          {lastSyncTime && (
            <div className="text-center text-sm text-gray-600">
              <p>Last sync: {lastSyncTime.toLocaleTimeString()}</p>
            </div>
          )}

          {/* Offline Tips */}
          {!isOnline && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-1">Offline Tips</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• View cached profiles and bookings</li>
                <li>• Messages will be sent when connection restores</li>
                <li>• New bookings will be saved locally</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export default OfflineStatus