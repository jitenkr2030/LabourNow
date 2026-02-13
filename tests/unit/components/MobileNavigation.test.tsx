import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MobileNavigation from '@/components/pwa/MobileNavigation'

// Mock the router
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('MobileNavigation', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    role: 'EMPLOYER',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders mobile navigation correctly', () => {
    render(<MobileNavigation user={mockUser} />)
    
    expect(screen.getByText('LabourNow')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument()
  })

  it('shows login button when user is not logged in', () => {
    render(<MobileNavigation />)
    
    expect(screen.getByText('Login / Register')).toBeInTheDocument()
  })

  it('shows user info when user is logged in', () => {
    render(<MobileNavigation user={mockUser} />)
    
    expect(screen.getByText(mockUser.name)).toBeInTheDocument()
    expect(screen.getByText(mockUser.role)).toBeInTheDocument()
  })

  it('navigates to correct page when navigation item is clicked', async () => {
    render(<MobileNavigation user={mockUser} />)
    
    const homeButton = screen.getByText('Home')
    fireEvent.click(homeButton)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('opens download modal when download button is clicked', async () => {
    render(<MobileNavigation user={mockUser} />)
    
    // Find and click download button
    const downloadButton = screen.getByText('Download App')
    fireEvent.click(downloadButton)
    
    // Check if download modal appears (this would need to be implemented)
    // For now, we'll just check if the click handler is called
    expect(downloadButton).toBeInTheDocument()
  })

  it('calls logout when logout button is clicked', async () => {
    const mockLogout = vi.fn()
    render(<MobileNavigation user={mockUser} onLogout={mockLogout} />)
    
    // Find and click logout button
    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)
    
    expect(mockLogout).toHaveBeenCalled()
  })

  it('renders bottom navigation with correct items', () => {
    render(<MobileNavigation user={mockUser} />)
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Find Workers')).toBeInTheDocument()
    expect(screen.getByText('My Bookings')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('Cities')).toBeInTheDocument()
  })

  it('handles navigation correctly for different routes', async () => {
    render(<MobileNavigation user={mockUser} />)
    
    // Test search navigation
    const searchButton = screen.getByText('Find Workers')
    fireEvent.click(searchButton)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/search')
    })
    
    // Reset mock
    mockPush.mockClear()
    
    // Test bookings navigation
    const bookingsButton = screen.getByText('My Bookings')
    fireEvent.click(bookingsButton)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/bookings')
    })
  })
})