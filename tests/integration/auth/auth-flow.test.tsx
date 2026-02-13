import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthModal from '@/components/auth/AuthModal'

// Mock fetch
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('OTP Flow', () => {
    it('sends OTP when mobile number is submitted', async () => {
      // Mock successful OTP send
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'OTP sent successfully'
        })
      })

      render(<AuthModal isOpen={true} onClose={() => {}} />)

      // Enter mobile number
      const mobileInput = screen.getByPlaceholderText(/enter mobile number/i)
      await userEvent.type(mobileInput, '9876543210')

      // Click send OTP
      const sendButton = screen.getByRole('button', { name: /send otp/i })
      await userEvent.click(sendButton)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/auth/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobile: '9876543210'
          })
        })
      })

      // Check if OTP input appears
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter otp/i)).toBeInTheDocument()
      })
    })

    it('verifies OTP and logs in user', async () => {
      // Mock successful OTP verification
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            token: 'mock-jwt-token',
            user: {
              id: '1',
              name: 'Test User',
              mobile: '9876543210',
              role: 'EMPLOYER'
            }
          }
        })
      })

      render(<AuthModal isOpen={true} onClose={() => {}} />)

      // Simulate OTP sent
      const mobileInput = screen.getByPlaceholderText(/enter mobile number/i)
      await userEvent.type(mobileInput, '9876543210')

      const sendButton = screen.getByRole('button', { name: /send otp/i })
      await userEvent.click(sendButton)

      // Wait for OTP input
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter otp/i)).toBeInTheDocument()
      })

      // Enter OTP
      const otpInput = screen.getByPlaceholderText(/enter otp/i)
      await userEvent.type(otpInput, '123456')

      // Click verify OTP
      const verifyButton = screen.getByRole('button', { name: /verify otp/i })
      await userEvent.click(verifyButton)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/auth/verify-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobile: '9876543210',
            otp: '123456'
          })
        })
      })

      // Check if token is stored
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify({
        id: '1',
        name: 'Test User',
        mobile: '9876543210',
        role: 'EMPLOYER'
      }))
    })

    it('handles OTP verification failure', async () => {
      // Mock failed OTP verification
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          message: 'Invalid OTP'
        })
      })

      render(<AuthModal isOpen={true} onClose={() => {}} />)

      // Simulate OTP sent and enter invalid OTP
      const mobileInput = screen.getByPlaceholderText(/enter mobile number/i)
      await userEvent.type(mobileInput, '9876543210')

      const sendButton = screen.getByRole('button', { name: /send otp/i })
      await userEvent.click(sendButton)

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter otp/i)).toBeInTheDocument()
      })

      const otpInput = screen.getByPlaceholderText(/enter otp/i)
      await userEvent.type(otpInput, '999999')

      const verifyButton = screen.getByRole('button', { name: /verify otp/i })
      await userEvent.click(verifyButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid otp/i)).toBeInTheDocument()
      })

      // Check that token is not stored
      expect(localStorageMock.setItem).not.toHaveBeenCalledWith('token', expect.any(String))
    })
  })

  describe('Role Selection', () => {
    it('allows user to select employer role', async () => {
      render(<AuthModal isOpen={true} onClose={() => {}} />)

      // Click on employer tab
      const employerTab = screen.getByRole('tab', { name: /employer/i })
      await userEvent.click(employerTab)

      // Check if employer-specific content is shown
      expect(screen.getByText(/find workers/i)).toBeInTheDocument()
    })

    it('allows user to select labour role', async () => {
      render(<AuthModal isOpen={true} onClose={() => {}} />)

      // Click on labour tab
      const labourTab = screen.getByRole('tab', { name: /labour/i })
      await userEvent.click(labourTab)

      // Check if labour-specific content is shown
      expect(screen.getByText(/find jobs/i)).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      // Mock network error
      ;(fetch as any).mockRejectedValueOnce(new Error('Network error'))

      render(<AuthModal isOpen={true} onClose={() => {}} />)

      const mobileInput = screen.getByPlaceholderText(/enter mobile number/i)
      await userEvent.type(mobileInput, '9876543210')

      const sendButton = screen.getByRole('button', { name: /send otp/i })
      await userEvent.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })

    it('validates mobile number format', async () => {
      render(<AuthModal isOpen={true} onClose={() => {}} />)

      const mobileInput = screen.getByPlaceholderText(/enter mobile number/i)
      await userEvent.type(mobileInput, '123') // Invalid number

      const sendButton = screen.getByRole('button', { name: /send otp/i })
      await userEvent.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid mobile number/i)).toBeInTheDocument()
      })
    })
  })
})