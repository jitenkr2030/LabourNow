'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  MessageSquare, 
  Phone, 
  Video,
  MoreVertical,
  Circle
} from 'lucide-react'
import ChatWindow from './ChatWindow'

interface Chat {
  id: string
  bookingId: string
  participant: {
    id: string
    name: string
    avatar?: string
    role: string
    mobile: string
  }
  lastMessage: {
    content: string
    timestamp: Date
    senderId: string
    read: boolean
  }
  unreadCount: number
  isActive: boolean
}

interface ChatListProps {
  currentUser: any
  onChatSelect?: (chat: Chat) => void
}

export default function ChatList({ currentUser, onChatSelect }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [showChatWindow, setShowChatWindow] = useState(false)

  useEffect(() => {
    fetchChats()
    // Set up WebSocket or polling for real-time updates
    const interval = setInterval(fetchChats, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chat/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setChats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error)
    }
  }

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat)
    setShowChatWindow(true)
    onChatSelect?.(chat)
  }

  const handleCall = (type: 'voice' | 'video') => {
    if (selectedChat) {
      // Implement call functionality
      const maskedNumber = maskPhoneNumber(selectedChat.participant.mobile)
      window.open(`tel:${maskedNumber}`)
    }
  }

  const maskPhoneNumber = (mobile: string): string => {
    if (mobile.length !== 10) return mobile
    return `${mobile.slice(0, 3)}XXXX${mobile.slice(-2)}`
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}d ago`
    } else if (hours > 0) {
      return `${hours}h ago`
    } else {
      return 'Just now'
    }
  }

  const filteredChats = chats.filter(chat =>
    chat.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const unreadCount = chats.reduce((total, chat) => total + chat.unreadCount, 0)

  return (
    <div className="flex h-[600px] w-full max-w-md">
      {!showChatWindow ? (
        <Card className="flex flex-col h-full">
          {/* Chat List Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Messages</h2>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Chat List */}
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              {filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No messages yet
                  </h3>
                  <p className="text-sm text-gray-500">
                    Start a conversation to see messages here
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => handleChatSelect(chat)}
                      className="flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={chat.participant.avatar} />
                          <AvatarFallback>
                            {chat.participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {chat.isActive && (
                          <Circle className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {chat.participant.name}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatTime(chat.lastMessage.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">
                            {chat.lastMessage.senderId === currentUser.id ? (
                              <>You: {chat.lastMessage.content}</>
                            ) : (
                              chat.lastMessage.content
                            )}
                          </p>
                          {chat.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        selectedChat && (
          <ChatWindow
            bookingId={selectedChat.bookingId}
            currentUser={currentUser}
            otherUser={selectedChat.participant}
            onClose={() => {
              setShowChatWindow(false)
              setSelectedChat(null)
            }}
            onCall={handleCall}
          />
        )
      )}
    </div>
  )
}