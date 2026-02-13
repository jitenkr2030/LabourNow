import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, generateBookingNumber, calculateDistance } from '@/lib/utils'

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('formats currency with Indian Rupee symbol', () => {
      expect(formatCurrency(99)).toBe('₹99')
      expect(formatCurrency(1500)).toBe('₹1,500')
      expect(formatCurrency(100000)).toBe('₹1,00,000')
    })

    it('handles zero and negative values', () => {
      expect(formatCurrency(0)).toBe('₹0')
      expect(formatCurrency(-100)).toBe('-₹100')
    })

    it('handles decimal values', () => {
      expect(formatCurrency(99.99)).toBe('₹99.99')
      expect(formatCurrency(100.5)).toBe('₹100.50')
    })
  })

  describe('formatDate', () => {
    it('formats date in Indian format', () => {
      const date = new Date('2024-01-15')
      expect(formatDate(date)).toBe('15/01/2024')
    })

    it('handles different date formats', () => {
      const date = new Date('2024-12-31')
      expect(formatDate(date)).toBe('31/12/2024')
    })

    it('handles invalid dates', () => {
      const date = new Date('invalid')
      expect(formatDate(date)).toBe('Invalid Date')
    })
  })

  describe('generateBookingNumber', () => {
    it('generates booking number with correct format', () => {
      const bookingNumber = generateBookingNumber()
      expect(bookingNumber).toMatch(/^LB\d{6}$/)
    })

    it('generates unique booking numbers', () => {
      const bookingNumber1 = generateBookingNumber()
      const bookingNumber2 = generateBookingNumber()
      
      expect(bookingNumber1).not.toBe(bookingNumber2)
    })

    it('generates booking numbers with correct length', () => {
      const bookingNumber = generateBookingNumber()
      expect(bookingNumber).toHaveLength(8) // LB + 6 digits
    })
  })

  describe('calculateDistance', () => {
    it('calculates distance between two points', () => {
      const point1 = { lat: 19.0760, lng: 72.8777 } // Mumbai
      const point2 = { lat: 28.6139, lng: 77.2090 } // Delhi
      
      const distance = calculateDistance(point1, point2)
      expect(distance).toBeGreaterThan(1000) // Should be over 1000km
      expect(distance).toBeLessThan(2000) // Should be less than 2000km
    })

    it('returns 0 for same points', () => {
      const point = { lat: 19.0760, lng: 72.8777 }
      
      const distance = calculateDistance(point, point)
      expect(distance).toBe(0)
    })

    it('handles different coordinate formats', () => {
      const point1 = { lat: 0, lng: 0 }
      const point2 = { lat: 1, lng: 1 }
      
      const distance = calculateDistance(point1, point2)
      expect(distance).toBeGreaterThan(0)
    })
  })
})