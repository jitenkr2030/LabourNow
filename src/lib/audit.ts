import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { maskSensitiveData } from '@/lib/encryption'
import { randomBytes } from 'crypto'

// Audit log entry interface
interface AuditLogEntry {
  userId?: string
  action: string
  resource?: string
  resourceId?: string
  ipAddress?: string
  userAgent?: string
  metadata?: any
  oldValues?: any
  newValues?: any
  severity?: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  success?: boolean
  errorMessage?: string
  sessionId?: string
  requestId?: string
}

// Request context interface
interface RequestContext {
  userId?: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  requestId?: string
}

// In-memory request context store (in production, use proper context management)
const requestContextStore = new Map<string, RequestContext>()

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return randomBytes(16).toString('hex')
}

/**
 * Set request context for audit logging
 */
export function setRequestContext(requestId: string, context: RequestContext): void {
  requestContextStore.set(requestId, context)
}

/**
 * Get request context for audit logging
 */
export function getRequestContext(requestId: string): RequestContext | undefined {
  return requestContextStore.get(requestId)
}

/**
 * Clear request context
 */
export function clearRequestContext(requestId: string): void {
  requestContextStore.delete(requestId)
}

/**
 * Extract request information from NextRequest
 */
export function extractRequestInfo(request: NextRequest): {
  ipAddress: string
  userAgent: string
} {
  const ipAddress = request.ip || 
    request.headers.get('x-forwarded-for') || 
    request.headers.get('x-real-ip') || 
    'unknown'
  
  const userAgent = request.headers.get('user-agent') || 'unknown'

  return { ipAddress, userAgent }
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    // Mask sensitive data in metadata and values
    const sanitizedEntry = {
      ...entry,
      metadata: entry.metadata ? maskSensitiveData(JSON.stringify(entry.metadata)) : undefined,
      oldValues: entry.oldValues ? maskSensitiveData(JSON.stringify(entry.oldValues)) : undefined,
      newValues: entry.newValues ? maskSensitiveData(JSON.stringify(entry.newValues)) : undefined
    }

    await db.auditLog.create({
      data: sanitizedEntry
    })

    // Also log to console for immediate visibility
    const logLevel = sanitizedEntry.severity?.toLowerCase() || 'info'
    const logMessage = `[AUDIT] ${sanitizedEntry.action}` +
      (sanitizedEntry.resource ? ` on ${sanitizedEntry.resource}` : '') +
      (sanitizedEntry.resourceId ? `:${sanitizedEntry.resourceId}` : '') +
      (sanitizedEntry.userId ? ` by user:${sanitizedEntry.userId}` : '') +
      (sanitizedEntry.ipAddress ? ` from ${sanitizedEntry.ipAddress}` : '') +
      (!sanitizedEntry.success ? ` - FAILED: ${sanitizedEntry.errorMessage}` : '')

    console.log(logMessage)

  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw error to avoid breaking the main flow
  }
}

/**
 * Log user authentication events
 */
export async function logAuthEvent(
  action: 'login' | 'logout' | 'login_failed' | 'register' | 'password_reset',
  userId?: string,
  mobile?: string,
  success: boolean = true,
  errorMessage?: string,
  requestId?: string
): Promise<void> {
  const context = requestId ? getRequestContext(requestId) : undefined

  await createAuditLog({
    userId,
    action: `auth.${action}`,
    resource: 'user',
    resourceId: userId,
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
    sessionId: context?.sessionId,
    requestId,
    metadata: mobile ? { mobile: maskSensitiveData(mobile) } : undefined,
    success,
    errorMessage,
    severity: success ? 'INFO' : 'WARNING'
  })
}

/**
 * Log admin actions
 */
export async function logAdminAction(
  action: string,
  adminId: string,
  targetUserId?: string,
  resource?: string,
  resourceId?: string,
  oldValues?: any,
  newValues?: any,
  reason?: string,
  requestId?: string
): Promise<void> {
  const context = requestId ? getRequestContext(requestId) : undefined

  await createAuditLog({
    userId: adminId,
    action: `admin.${action}`,
    resource,
    resourceId,
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
    sessionId: context?.sessionId,
    requestId,
    metadata: reason ? { reason } : undefined,
    oldValues,
    newValues,
    severity: 'WARNING' // Admin actions are always at least warning level
  })
}

/**
 * Log booking events
 */
export async function logBookingEvent(
  action: 'create' | 'update' | 'cancel' | 'complete' | 'accept' | 'reject',
  bookingId: string,
  userId: string,
  oldValues?: any,
  newValues?: any,
  errorMessage?: string,
  requestId?: string
): Promise<void> {
  const context = requestId ? getRequestContext(requestId) : undefined

  await createAuditLog({
    userId,
    action: `booking.${action}`,
    resource: 'booking',
    resourceId: bookingId,
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
    sessionId: context?.sessionId,
    requestId,
    oldValues,
    newValues,
    errorMessage,
    success: !errorMessage,
    severity: errorMessage ? 'ERROR' : 'INFO'
  })
}

/**
 * Log payment events
 */
export async function logPaymentEvent(
  action: 'create' | 'success' | 'failed' | 'refund',
  paymentId: string,
  userId: string,
  amount?: number,
  paymentMethod?: string,
  errorMessage?: string,
  requestId?: string
): Promise<void> {
  const context = requestId ? getRequestContext(requestId) : undefined

  await createAuditLog({
    userId,
    action: `payment.${action}`,
    resource: 'payment',
    resourceId: paymentId,
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
    sessionId: context?.sessionId,
    requestId,
    metadata: amount && paymentMethod ? { amount, paymentMethod } : undefined,
    errorMessage,
    success: !errorMessage,
    severity: action === 'failed' ? 'ERROR' : 'INFO'
  })
}

/**
 * Log data access events (for GDPR compliance)
 */
export async function logDataAccess(
  action: 'read' | 'export' | 'delete',
  resourceType: string,
  resourceId: string,
  userId: string,
  requestData?: any,
  requestId?: string
): Promise<void> {
  const context = requestId ? getRequestContext(requestId) : undefined

  await createAuditLog({
    userId,
    action: `data.${action}`,
    resource: resourceType,
    resourceId,
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
    sessionId: context?.sessionId,
    requestId,
    metadata: requestData,
    severity: action === 'delete' ? 'WARNING' : 'INFO'
  })
}

/**
 * Log security events
 */
export async function logSecurityEvent(
  action: 'suspicious_login' | 'rate_limit_exceeded' | 'invalid_token' | 'csrf_attempt' | 'unauthorized_access',
  userId?: string,
  ipAddress?: string,
  userAgent?: string,
  details?: any,
  requestId?: string
): Promise<void> {
  const context = requestId ? getRequestContext(requestId) : undefined

  await createAuditLog({
    userId,
    action: `security.${action}`,
    resource: 'security',
    ipAddress: ipAddress || context?.ipAddress,
    userAgent: userAgent || context?.userAgent,
    sessionId: context?.sessionId,
    requestId,
    metadata: details,
    severity: 'WARNING'
  })
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  page: number = 1,
  limit: number = 50,
  action?: string
): Promise<{ logs: any[], total: number }> {
  const skip = (page - 1) * limit
  const where: any = { userId }
  if (action) {
    where.action = { contains: action }
  }

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        action: true,
        resource: true,
        resourceId: true,
        severity: true,
        success: true,
        errorMessage: true,
        metadata: true,
        createdAt: true
      }
    }),
    db.auditLog.count({ where })
  ])

  return { logs, total }
}

/**
 * Get admin audit logs
 */
export async function getAdminAuditLogs(
  page: number = 1,
  limit: number = 100,
  userId?: string,
  action?: string,
  severity?: string,
  startDate?: Date,
  endDate?: Date
): Promise<{ logs: any[], total: number }> {
  const skip = (page - 1) * limit
  const where: any = {}

  if (userId) where.userId = userId
  if (action) where.action = { contains: action }
  if (severity) where.severity = severity as any
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = startDate
    if (endDate) where.createdAt.lte = endDate
  }

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            mobile: true,
            role: true
          }
        }
      }
    }),
    db.auditLog.count({ where })
  ])

  return { logs, total }
}

/**
 * Cleanup old audit logs (retention policy)
 */
export async function cleanupOldAuditLogs(daysToKeep: number = 365): Promise<number> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  const result = await db.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate
      }
    }
  })

  return result.count
}

// Express/Next.js middleware for automatic audit logging
export function auditMiddleware(request: NextRequest, requestId: string) {
  const { ipAddress, userAgent } = extractRequestInfo(request)
  
  setRequestContext(requestId, {
    ipAddress,
    userAgent,
    requestId
  })

  // Log the request
  createAuditLog({
    action: 'http.request',
    resource: 'api',
    resourceId: request.url,
    ipAddress,
    userAgent,
    requestId,
    metadata: {
      method: request.method,
      url: request.url,
      userAgent
    },
    severity: 'DEBUG'
  })
}

export default {
  createAuditLog,
  logAuthEvent,
  logAdminAction,
  logBookingEvent,
  logPaymentEvent,
  logDataAccess,
  logSecurityEvent,
  getUserAuditLogs,
  getAdminAuditLogs,
  cleanupOldAuditLogs,
  generateRequestId,
  setRequestContext,
  getRequestContext,
  clearRequestContext,
  extractRequestInfo,
  auditMiddleware
}