'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Shield, Users, CheckCircle, XCircle, Trash2, Crown, Search, Filter, Square } from 'lucide-react'

interface User {
  id: string
  name: string
  mobile: string
  email?: string
  role: 'LABOUR' | 'EMPLOYER' | 'ADMIN'
  isVerified: boolean
  isBlocked: boolean
  createdAt: string
  labourProfile?: {
    category: string
    rating: number
    totalJobs: number
    verificationBadge: string
  }
  employerProfile?: {
    businessName?: string
    businessType: string
    totalBookings: number
  }
}

interface AdminStats {
  totalUsers: number
  totalLabour: number
  totalEmployers: number
  totalAdmins: number
  verifiedUsers: number
  blockedUsers: number
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalLabour: 0,
    totalEmployers: 0,
    totalAdmins: 0,
    verifiedUsers: 0,
    blockedUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionReason, setActionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (roleFilter !== 'all') params.append('role', roleFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()

      if (data.success) {
        setUsers(data.users)
        setTotalPages(data.pagination.pages)
        
        // Calculate stats
        const newStats: AdminStats = {
          totalUsers: data.pagination.total,
          totalLabour: data.users.filter((u: User) => u.role === 'LABOUR').length,
          totalEmployers: data.users.filter((u: User) => u.role === 'EMPLOYER').length,
          totalAdmins: data.users.filter((u: User) => u.role === 'ADMIN').length,
          verifiedUsers: data.users.filter((u: User) => u.isVerified).length,
          blockedUsers: data.users.filter((u: User) => u.isBlocked).length
        }
        setStats(newStats)
      } else {
        toast.error('Failed to fetch users')
      }
    } catch (error) {
      toast.error('Error fetching users')
    } finally {
      setLoading(false)
    }
  }

  const performAdminAction = async (action: string, userId: string, reason?: string) => {
    try {
      setActionLoading(true)
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          userId,
          reason
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(`Action ${action.replace('_', ' ')} completed successfully`)
        fetchUsers()
        setSelectedUser(null)
        setActionReason('')
      } else {
        toast.error(data.message || 'Action failed')
      }
    } catch (error) {
      toast.error('Error performing action')
    } finally {
      setActionLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, roleFilter, statusFilter])

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'EMPLOYER': return 'bg-blue-100 text-blue-800'
      case 'LABOUR': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (user: User) => {
    if (user.isBlocked) return 'bg-red-100 text-red-800'
    if (user.isVerified) return 'bg-green-100 text-green-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getStatusText = (user: User) => {
    if (user.isBlocked) return 'Blocked'
    if (user.isVerified) return 'Verified'
    return 'Pending'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.verifiedUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
              <Square className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.blockedUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Crown className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.totalAdmins}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, mobile, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="LABOUR">Labour</SelectItem>
                  <SelectItem value="EMPLOYER">Employer</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users Management</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Profile</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.mobile}</div>
                            {user.email && (
                              <div className="text-xs text-gray-400">{user.email}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(user)}>
                            {getStatusText(user)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.labourProfile ? (
                            <div className="text-sm">
                              <div className="font-medium">{user.labourProfile.category}</div>
                              <div className="text-gray-500">
                                ⭐ {user.labourProfile.rating} • {user.labourProfile.totalJobs} jobs
                              </div>
                            </div>
                          ) : user.employerProfile ? (
                            <div className="text-sm">
                              <div className="font-medium">{user.employerProfile.businessName || user.employerProfile.businessType}</div>
                              <div className="text-gray-500">
                                {user.employerProfile.totalBookings} bookings
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">No profile</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!user.isBlocked && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedUser(user)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Square className="h-4 w-4" />
                              </Button>
                            )}
                            {user.isBlocked && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => performAdminAction('unblock_user', user.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {!user.isVerified && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => performAdminAction('verify_user', user.id)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedUser(user)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Actions</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-600">{selectedUser.mobile}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getRoleBadgeColor(selectedUser.role)}>
                      {selectedUser.role}
                    </Badge>
                    <Badge className={getStatusBadgeColor(selectedUser)}>
                      {getStatusText(selectedUser)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label htmlFor="reason">Reason (optional)</Label>
                  <Textarea
                    id="reason"
                    placeholder="Enter reason for this action..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  {!selectedUser.isBlocked && (
                    <Button
                      variant="destructive"
                      onClick={() => performAdminAction('block_user', selectedUser.id, actionReason)}
                      disabled={actionLoading}
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Block User
                    </Button>
                  )}
                  
                  {selectedUser.isBlocked && (
                    <Button
                      variant="outline"
                      onClick={() => performAdminAction('unblock_user', selectedUser.id)}
                      disabled={actionLoading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Unblock User
                    </Button>
                  )}
                  
                  {!selectedUser.isVerified && (
                    <Button
                      variant="outline"
                      onClick={() => performAdminAction('verify_user', selectedUser.id)}
                      disabled={actionLoading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify User
                    </Button>
                  )}
                  
                  <Button
                    variant="destructive"
                    onClick={() => performAdminAction('delete_user', selectedUser.id, actionReason)}
                    disabled={actionLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete User
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}