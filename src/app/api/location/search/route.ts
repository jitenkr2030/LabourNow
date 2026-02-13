import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const locationSearchSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(1).max(50),
  category: z.nativeEnum(require('@prisma/client').LabourCategory).optional(),
  availableToday: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20)
})

// POST /api/location/search - Search workers by location and radius
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = locationSearchSchema.parse(body)

    const { latitude, longitude, radius, category, availableToday, page, limit } = validatedData

    // Calculate bounds for the search
    const bounds = getBoundsFromRadius(latitude, longitude, radius)

    // Get workers within the radius
    const workers = await prisma.labourProfile.findMany({
      where: {
        latitude: {
          gte: bounds.south,
          lte: bounds.north
        },
        longitude: {
          gte: bounds.west,
          lte: bounds.east
        },
        isAvailable: availableToday ? true : undefined,
        category: category ? category : undefined,
        user: {
          isVerified: true,
          isBlocked: false
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            mobile: true,
            role: true,
            labourProfile: {
              select: {
                avatar: true
              }
            },
            employerProfile: {
              select: {
                avatar: true
              }
            }
          }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { totalJobs: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    })

    // Calculate actual distance for each worker
    const workersWithDistance = workers.map(worker => {
      const distance = calculateDistance(
        { latitude, longitude },
        { latitude: worker.latitude || 0, longitude: worker.longitude || 0 }
      )

      return {
        ...worker,
        distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
      }
    })

    // Filter by exact radius (since we used a bounding box approximation)
    const workersWithinRadius = workersWithDistance.filter(worker => worker.distance <= radius)

    // Get total count for pagination
    const totalCount = workersWithinRadius.length

    return NextResponse.json({
      success: true,
      data: workersWithinRadius,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      search: {
        latitude,
        longitude,
        radius,
        category,
        availableToday
      }
    })

  } catch (error) {
    console.error('Error searching workers by location:', error)
    return NextResponse.json({ error: 'Failed to search workers' }, { status: 500 })
  }
}

// GET /api/location/cities - Get cities with workers
export async function GET(request: NextRequest) {
  try {
    const cities = await prisma.labourProfile.groupBy({
      by: ['location'],
      where: {
        user: {
          isVerified: true,
          isBlocked: false
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    const citiesWithCount = await Promise.all(
      cities.map(async (city) => {
        const workers = await prisma.labourProfile.findMany({
          where: {
            location: city.location,
            user: {
              isVerified: true,
              isBlocked: false
            }
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                mobile: true,
                role: true,
                labourProfile: {
                  select: {
                    avatar: true
                  }
                },
                employerProfile: {
                  select: {
                    avatar: true
                  }
                }
              }
            }
          },
          take: 5,
          orderBy: [
            { rating: 'desc' },
            { totalJobs: 'desc' }
          ]
        })

        return {
          name: city.location,
          workerCount: city._count.id,
          workers: workers.map(worker => ({
            id: worker.id,
            name: worker.user.name,
            mobile: worker.user.mobile,
            role: worker.user.role,
            avatar: worker.user.labourProfile?.avatar || worker.user.employerProfile?.avatar,
            category: worker.category,
            experience: worker.experience,
            hourlyWage: worker.hourlyWage,
            rating: worker.rating,
            totalJobs: worker.totalJobs
          }))
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: citiesWithCount
    })

  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 })
  }
}

// Helper functions
function calculateDistance(
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(point2.latitude - point1.latitude)
  const dLon = toRadians(point2.longitude - point1.longitude)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
    Math.cos(toRadians(point2.latitude)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

function getBoundsFromRadius(
  centerLatitude: number,
  centerLongitude: number,
  radiusKm: number
) {
  // Approximate conversion: 1 degree latitude ≈ 111 km
  const latitudeDelta = radiusKm / 111
  const longitudeDelta = radiusKm / (111 * Math.cos(toRadians(centerLatitude)))
  
  return {
    north: centerLatitude + latitudeDelta,
    south: centerLatitude - latitudeDelta,
    east: centerLongitude + longitudeDelta,
    west: centerLongitude - longitudeDelta
  }
}