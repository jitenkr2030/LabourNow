import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'labournow-secret-key'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map()

// Rate limiting configuration
const RATE_LIMITS = {
  '/api/auth/send-otp': { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  '/api/auth/verify-otp': { requests: 10, windowMs: 15 * 60 * 1000 }, // 10 requests per 15 minutes
  '/api/bookings': { requests: 100, windowMs: 60 * 60 * 1000 }, // 100 requests per hour
  '/api/chat': { requests: 200, windowMs: 60 * 60 * 1000 }, // 200 requests per hour
  'default': { requests: 1000, windowMs: 60 * 60 * 1000 } // 1000 requests per hour for other endpoints
}

// CSRF protection - store tokens in memory (in production, use Redis)
const csrfTokens = new Map()

function generateCSRFToken(): string {
  return require('crypto').randomBytes(32).toString('hex')
}

function checkRateLimit(ip: string, endpoint: string): boolean {
  const limit = RATE_LIMITS[endpoint] || RATE_LIMITS.default
  const key = `${ip}:${endpoint}`
  const now = Date.now()
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, resetTime: now + limit.windowMs })
    return true
  }
  
  const record = rateLimitStore.get(key)
  
  if (now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + limit.windowMs })
    return true
  }
  
  if (record.count >= limit.requests) {
    return false
  }
  
  record.count++
  return true
}

function verifyJWT(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

async function getUserById(userId: string) {
  return await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      mobile: true,
      role: true,
      isVerified: true,
      isBlocked: true,
      createdAt: true
    }
  })
}

// Public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  '/api/auth/send-otp',
  '/api/auth/verify-otp',
  '/api/cities',
  '/api/categories',
  '/api/seed',
  '/api/location/search'
]

// Admin-only endpoints
const ADMIN_ENDPOINTS = [
  '/api/admin',
  '/api/users',
  '/api/system'
]

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const ip = (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown'
  const method = request.method

  // Log request for audit trail
  console.log(`[${new Date().toISOString()}] ${method} ${pathname} - IP: ${ip}`)

  // Rate limiting
  if (!checkRateLimit(ip, pathname)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  // CSRF protection for state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrfToken = request.headers.get('x-csrf-token')
    
    if (!csrfToken || !csrfTokens.has(csrfToken) || csrfTokens.get(csrfToken) < Date.now()) {
      // For API requests, check if it's from a browser
      const userAgent = request.headers.get('user-agent') || ''
      if (userAgent.includes('Mozilla')) {
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        )
      }
    }
  }

  // Check if endpoint is public
  const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => pathname.startsWith(endpoint))
  
  if (!isPublicEndpoint) {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const decoded = verifyJWT(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return NextResponse.json(
        { error: 'Account is blocked' },
        { status: 403 }
      )
    }

    // Check admin-only endpoints
    const isAdminEndpoint = ADMIN_ENDPOINTS.some(endpoint => pathname.startsWith(endpoint))
    if (isAdminEndpoint && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Add user info to request headers for downstream use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-role', user.role)
    requestHeaders.set('x-user-mobile', user.mobile)

    // Create response with user context
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    // Generate and set new CSRF token for valid authenticated requests
    if (['GET', 'HEAD'].includes(method)) {
      const newCsrfToken = generateCSRFToken()
      csrfTokens.set(newCsrfToken, Date.now() + 60 * 60 * 1000) // 1 hour expiry
      response.headers.set('x-csrf-token', newCsrfToken)
    }

    return response
  }

  // For public endpoints, generate CSRF token for GET requests
  if (['GET', 'HEAD'].includes(method)) {
    const response = NextResponse.next()
    const csrfToken = generateCSRFToken()
    csrfTokens.set(csrfToken, Date.now() + 60 * 60 * 1000) // 1 hour expiry
    response.headers.set('x-csrf-token', csrfToken)
    return response
  }

  return NextResponse.next()
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/dashboard/:path*'
  ],
}