import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const searchSchema = z.object({
  category: z.string().optional(),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().default(10), // km
  availableToday: z.boolean().default(false),
  minRating: z.number().min(0).max(5).default(0),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10)
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = {
      category: searchParams.get('category') || undefined,
      location: searchParams.get('location') || undefined,
      latitude: searchParams.get('latitude') ? parseFloat(searchParams.get('latitude')!) : undefined,
      longitude: searchParams.get('longitude') ? parseFloat(searchParams.get('longitude')!) : undefined,
      radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : 10,
      availableToday: searchParams.get('availableToday') === 'true',
      minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : 0,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10
    }

    const validatedParams = searchSchema.parse(params)
    const { page, limit, ...searchFilters } = validatedParams
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      user: {
        isBlocked: false,
        isVerified: true
      },
      isAvailable: true,
      rating: {
        gte: validatedParams.minRating
      }
    }

    if (searchFilters.category) {
      where.category = searchFilters.category.toUpperCase()
    }

    if (searchFilters.location) {
      where.location = {
        contains: searchFilters.location,
        mode: 'insensitive'
      }
    }

    // For available today filter, we'd need to check existing bookings
    // This is a simplified version - in production, you'd check against booking schedules
    if (searchFilters.availableToday) {
      // Add logic to check if worker has bookings today
    }

    // Get labour profiles
    const labourProfiles = await db.labourProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            mobile: true,
            avatar: true,
            isVerified: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: [
        { rating: 'desc' },
        { totalJobs: 'desc' }
      ]
    })

    // Filter by distance if coordinates provided
    let filteredProfiles = labourProfiles
    if (searchFilters.latitude && searchFilters.longitude) {
      filteredProfiles = labourProfiles.filter(profile => {
        if (!profile.latitude || !profile.longitude) return false
        
        const distance = calculateDistance(
          searchFilters.latitude!,
          searchFilters.longitude!,
          profile.latitude,
          profile.longitude
        )
        
        return distance <= searchFilters.radius
      })
    }

    // Get total count for pagination
    const totalCount = await db.labourProfile.count({ where })

    // Format response
    const formattedProfiles = filteredProfiles.map(profile => ({
      id: profile.id,
      userId: profile.user.id,
      name: profile.user.name,
      category: profile.category,
      experience: profile.experience,
      hourlyWage: profile.hourlyWage,
      rating: profile.rating,
      totalJobs: profile.totalJobs,
      location: profile.location,
      bio: profile.bio,
      avatar: profile.user.avatar,
      isVerified: profile.user.isVerified,
      verificationBadge: profile.verificationBadge,
      languages: profile.languages ? JSON.parse(profile.languages) : [],
      distance: searchFilters.latitude && searchFilters.longitude && profile.latitude && profile.longitude
        ? calculateDistance(
            searchFilters.latitude,
            searchFilters.longitude,
            profile.latitude,
            profile.longitude
          )
        : null
    }))

    return NextResponse.json({
      success: true,
      data: formattedProfiles,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Labour search error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to search labour' },
      { status: 500 }
    )
  }
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c
  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}