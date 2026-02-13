import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import useMobile from '@/hooks/use-mobile'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('useMobile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns false for desktop viewport by default', () => {
    const { result } = renderHook(() => useMobile())
    
    expect(result.current.isMobile).toBe(false)
  })

  it('returns true for mobile viewport', () => {
    // Mock mobile viewport
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(max-width: 768px)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { result } = renderHook(() => useMobile())
    
    expect(result.current.isMobile).toBe(true)
  })

  it('updates when window is resized', () => {
    const { result } = renderHook(() => useMobile())
    
    // Initially desktop
    expect(result.current.isMobile).toBe(false)
    
    // Simulate resize to mobile
    act(() => {
      window.innerWidth = 500
      window.dispatchEvent(new Event('resize'))
    })
    
    expect(result.current.isMobile).toBe(true)
  })

  it('provides window dimensions', () => {
    const { result } = renderHook(() => useMobile())
    
    expect(result.current.windowSize.width).toBeGreaterThan(0)
    expect(result.current.windowSize.height).toBeGreaterThan(0)
  })

  it('adds event listener on mount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    
    renderHook(() => useMobile())
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    
    addEventListenerSpy.mockRestore()
  })

  it('removes event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    
    const { unmount } = renderHook(() => useMobile())
    
    unmount()
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    
    removeEventListenerSpy.mockRestore()
  })

  it('handles multiple resize events correctly', () => {
    const { result } = renderHook(() => useMobile())
    
    // Simulate multiple resizes
    act(() => {
      window.innerWidth = 800
      window.dispatchEvent(new Event('resize'))
    })
    
    expect(result.current.isMobile).toBe(false)
    
    act(() => {
      window.innerWidth = 600
      window.dispatchEvent(new Event('resize'))
    })
    
    expect(result.current.isMobile).toBe(true)
    
    act(() => {
      window.innerWidth = 1200
      window.dispatchEvent(new Event('resize'))
    })
    
    expect(result.current.isMobile).toBe(false)
  })
})