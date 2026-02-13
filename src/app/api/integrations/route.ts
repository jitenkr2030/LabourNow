import { NextRequest, NextResponse } from 'next/server'
import { integrationManager } from '@/lib/integrations/integration-manager'

// GET /api/integrations - Get all integration statuses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const integrationId = searchParams.get('id')

    if (integrationId) {
      // Get specific integration status
      const status = integrationManager.getIntegrationStatus(integrationId)
      return NextResponse.json({
        success: true,
        integration: status
      })
    } else {
      // Get all integration statuses
      const statuses = integrationManager.getAllIntegrationStatus()
      return NextResponse.json({
        success: true,
        integrations: statuses
      })
    }
  } catch (error) {
    console.error('Get integration status error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get integration status' },
      { status: 500 }
    )
  }
}

// POST /api/integrations/test - Test an integration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { integrationId, config } = body

    if (!integrationId) {
      return NextResponse.json(
        { success: false, message: 'Integration ID is required' },
        { status: 400 }
      )
    }

    const result = await integrationManager.testIntegration(integrationId, config)
    
    return NextResponse.json({
      success: true,
      result
    })
  } catch (error) {
    console.error('Test integration error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to test integration' },
      { status: 500 }
    )
  }
}

// PUT /api/integrations/configure - Configure an integration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { integrationId, config } = body

    if (!integrationId || !config) {
      return NextResponse.json(
        { success: false, message: 'Integration ID and config are required' },
        { status: 400 }
      )
    }

    const result = await integrationManager.configureIntegration(integrationId, config)
    
    return NextResponse.json({
      success: true,
      result
    })
  } catch (error) {
    console.error('Configure integration error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to configure integration' },
      { status: 500 }
    )
  }
}

// GET /api/integrations/health - Get health status of all integrations
export async function HEALTH() {
  try {
    const healthStatus = await integrationManager.performHealthCheck()
    
    return NextResponse.json({
      success: true,
      health: healthStatus
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to perform health check' },
      { status: 500 }
    )
  }
}