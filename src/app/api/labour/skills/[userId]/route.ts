import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/labour/skills/[userId] - Get labour skill verifications
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params
    
    // Mock skill verification data
    const skillVerifications = [
      {
        id: '1',
        name: 'Plumbing Certification',
        description: 'Certified plumber with 5+ years experience',
        verified: true,
        verifiedDate: '2024-01-15',
        certificateUrl: '/certificates/plumbing-cert.pdf',
        issuingAuthority: 'Indian Plumbing Association',
        expiryDate: '2025-01-15'
      },
      {
        id: '2',
        name: 'Safety Training',
        description: 'Workplace safety and first aid certified',
        verified: true,
        verifiedDate: '2024-02-20',
        certificateUrl: '/certificates/safety-cert.pdf',
        issuingAuthority: 'National Safety Council',
        expiryDate: '2025-02-20'
      },
      {
        id: '3',
        name: 'Advanced Pipe Fitting',
        description: 'Specialized training in industrial pipe fitting',
        verified: false,
        verifiedDate: null,
        certificateUrl: '/certificates/pipe-fitting.pdf',
        issuingAuthority: 'Technical Training Institute',
        expiryDate: null
      }
    ]

    return NextResponse.json({
      success: true,
      data: skillVerifications
    })

  } catch (error) {
    console.error('Error fetching skill verifications:', error)
    return NextResponse.json({ error: 'Failed to fetch skill verifications' }, { status: 500 })
  }
}

// POST /api/labour/skills/[userId] - Add new skill verification
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params
    const body = await request.json()
    
    // Validate required fields
    const { name, description, certificateUrl, issuingAuthority } = body
    
    if (!name || !description || !certificateUrl || !issuingAuthority) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create new skill verification request
    const newSkill = {
      id: Date.now().toString(),
      name,
      description,
      certificateUrl,
      issuingAuthority,
      verified: false,
      verifiedDate: null,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // In a real implementation, you would save this to the database
    // For now, we'll just return the created skill
    
    return NextResponse.json({
      success: true,
      message: 'Skill verification submitted successfully',
      data: newSkill
    })

  } catch (error) {
    console.error('Error creating skill verification:', error)
    return NextResponse.json({ error: 'Failed to create skill verification' }, { status: 500 })
  }
}