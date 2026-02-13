import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { ConsentManager } from '@/lib/gdpr'
import { logDataAccess } from '@/lib/audit'

const consentSchema = z.object({
  consents: z.record(z.boolean()),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
})

// GET /api/consent - Get user consents
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's current consents
    const userConsents = await ConsentManager.getUserConsents(userId)
    
    // Get available consent types
    const requiredConsents = ConsentManager.getRequiredConsents()

    // Map user consents to consent types
    const consentStatus = requiredConsents.map(consent => ({
      ...consent,
      granted: userConsents.find(uc => uc.consentType === consent.type)?.granted || false,
      grantedAt: userConsents.find(uc => uc.consentType === consent.type)?.grantedAt,
      revokedAt: userConsents.find(uc => uc.consentType === consent.type)?.revokedAt
    }))

    return NextResponse.json({
      success: true,
      consents: consentStatus
    })

  } catch (error) {
    console.error('Get consents error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch consents' },
      { status: 500 }
    )
  }
}

// POST /api/consent - Update user consents
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { consents, ipAddress, userAgent } = consentSchema.parse(body)

    const requiredConsents = ConsentManager.getRequiredConsents()
    const results = []

    // Process each consent
    for (const consent of requiredConsents) {
      const consentType = consent.type
      const granted = consents[consentType] || false

      // Check if required consent is being denied
      if (consent.required && !granted) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Required consent "${consent.title}" cannot be denied` 
          },
          { status: 400 }
        )
      }

      // Record the consent
      await ConsentManager.recordConsent(
        userId,
        consentType,
        granted,
        ipAddress,
        userAgent
      )

      results.push({
        type: consentType,
        title: consent.title,
        granted
      })
    }

    // Log consent update
    await logDataAccess(
      'consent_update',
      'user_consents',
      userId,
      userId,
      { consents: results, ipAddress }
    )

    return NextResponse.json({
      success: true,
      message: 'Consents updated successfully',
      results
    })

  } catch (error) {
    console.error('Update consents error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update consents' },
      { status: 500 }
    )
  }
}