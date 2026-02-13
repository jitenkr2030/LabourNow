import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Create sample cities
    const cities = await Promise.all([
      db.city.create({
        data: {
          name: 'Mumbai',
          state: 'Maharashtra',
          latitude: 19.0760,
          longitude: 72.8777,
          primaryLanguage: 'Hindi',
          secondaryLanguages: JSON.stringify(['Marathi', 'English']),
          basePrice: 149,
          priceMultiplier: 1.5,
          supportPhone: '022-12345678',
          supportEmail: 'mumbai@labournow.in',
          transportAvailable: true,
          description: 'Financial capital of India with high demand for skilled labour'
        }
      }),
      db.city.create({
        data: {
          name: 'Delhi',
          state: 'Delhi NCR',
          latitude: 28.7041,
          longitude: 77.1025,
          primaryLanguage: 'Hindi',
          secondaryLanguages: JSON.stringify(['English', 'Punjabi']),
          basePrice: 129,
          priceMultiplier: 1.3,
          supportPhone: '011-12345678',
          supportEmail: 'delhi@labournow.in',
          transportAvailable: true,
          description: 'Capital city with diverse construction and service needs'
        }
      }),
      db.city.create({
        data: {
          name: 'Bangalore',
          state: 'Karnataka',
          latitude: 12.9716,
          longitude: 77.5946,
          primaryLanguage: 'Kannada',
          secondaryLanguages: JSON.stringify(['English', 'Hindi']),
          basePrice: 119,
          priceMultiplier: 1.2,
          supportPhone: '080-12345678',
          supportEmail: 'bangalore@labournow.in',
          transportAvailable: true,
          description: 'IT hub with growing demand for technical and domestic services'
        }
      }),
      db.city.create({
        data: {
          name: 'Chennai',
          state: 'Tamil Nadu',
          latitude: 13.0827,
          longitude: 80.2707,
          primaryLanguage: 'Tamil',
          secondaryLanguages: JSON.stringify(['English', 'Hindi']),
          basePrice: 99,
          priceMultiplier: 1.0,
          supportPhone: '044-12345678',
          supportEmail: 'chennai@labournow.in',
          transportAvailable: true,
          description: 'Coastal city with strong industrial and construction sectors'
        }
      }),
      db.city.create({
        data: {
          name: 'Kolkata',
          state: 'West Bengal',
          latitude: 22.5726,
          longitude: 88.3639,
          primaryLanguage: 'Bengali',
          secondaryLanguages: JSON.stringify(['English', 'Hindi']),
          basePrice: 89,
          priceMultiplier: 0.9,
          supportPhone: '033-12345678',
          supportEmail: 'kolkata@labournow.in',
          transportAvailable: true,
          description: 'Cultural capital with affordable labour rates'
        }
      }),
      db.city.create({
        data: {
          name: 'Pune',
          state: 'Maharashtra',
          latitude: 18.5204,
          longitude: 73.8567,
          primaryLanguage: 'Marathi',
          secondaryLanguages: JSON.stringify(['Hindi', 'English']),
          basePrice: 109,
          priceMultiplier: 1.1,
          supportPhone: '020-12345678',
          supportEmail: 'pune@labournow.in',
          transportAvailable: true,
          description: 'Emerging IT and education hub with balanced growth'
        }
      }),
      db.city.create({
        data: {
          name: 'Hyderabad',
          state: 'Telangana',
          latitude: 17.3850,
          longitude: 78.4867,
          primaryLanguage: 'Telugu',
          secondaryLanguages: JSON.stringify(['English', 'Hindi']),
          basePrice: 99,
          priceMultiplier: 1.0,
          supportPhone: '040-12345678',
          supportEmail: 'hyderabad@labournow.in',
          transportAvailable: true,
          description: 'City of pearls with rapid IT and pharmaceutical growth'
        }
      }),
      db.city.create({
        data: {
          name: 'Ahmedabad',
          state: 'Gujarat',
          latitude: 23.0225,
          longitude: 72.5714,
          primaryLanguage: 'Gujarati',
          secondaryLanguages: JSON.stringify(['Hindi', 'English']),
          basePrice: 89,
          priceMultiplier: 0.9,
          supportPhone: '079-12345678',
          supportEmail: 'ahmedabad@labournow.in',
          transportAvailable: true,
          description: 'Textile and manufacturing hub with entrepreneurial spirit'
        }
      })
    ])

    // Create sample partners for each city
    for (const city of cities) {
      await Promise.all([
        db.partner.create({
          data: {
            cityId: city.id,
            name: `${city.name} Transport Services`,
            type: 'TRANSPORT',
            description: 'Reliable transport for workers and equipment',
            contactPerson: 'Raj Kumar',
            contactPhone: '+91-9876543210',
            contactEmail: `transport${city.name.toLowerCase()}@labournow.in`,
            services: JSON.stringify(['Worker Transport', 'Equipment Delivery', 'Emergency Transport']),
            commissionRate: 0.08
          }
        }),
        db.partner.create({
          data: {
            cityId: city.id,
            name: `${city.name} Equipment Rental`,
            type: 'EQUIPMENT_RENTAL',
            description: 'Construction and event equipment on rent',
            contactPerson: 'Amit Sharma',
            contactPhone: '+91-9876543211',
            contactEmail: `equipment${city.name.toLowerCase()}@labournow.in`,
            services: JSON.stringify(['Construction Tools', 'Event Setup', 'Safety Equipment']),
            commissionRate: 0.10
          }
        }),
        db.partner.create({
          data: {
            cityId: city.id,
            name: `${city.name} Skills Training Center`,
            type: 'TRAINING_CENTER',
            description: 'Vocational training and skill development',
            contactPerson: 'Priya Patel',
            contactPhone: '+91-9876543212',
            contactEmail: `training${city.name.toLowerCase()}@labournow.in`,
            services: JSON.stringify(['Skill Training', 'Certification', 'Placement Assistance']),
            commissionRate: 0.05
          }
        })
      ])

      // Create transport options for each city
      await Promise.all([
        db.transportOption.create({
          data: {
            cityId: city.id,
            name: 'City Auto Rickshaw',
            type: 'AUTO_RICKSHAW',
            description: 'Quick and affordable auto rickshaw service',
            contactInfo: '+91-9876543201',
            pricing: '₹15-25 per km',
            coverage: 'Within city limits'
          }
        }),
        db.transportOption.create({
          data: {
            cityId: city.id,
            name: 'Shared Tempo Service',
            type: 'TEMPO',
            description: 'Shared tempo for group transport',
            contactInfo: '+91-9876543202',
            pricing: '₹500-800 per day',
            coverage: 'City and nearby areas'
          }
        }),
        db.transportOption.create({
          data: {
            cityId: city.id,
            name: 'Bike Taxi Service',
            type: 'BIKE_TAXI',
            description: 'Quick bike taxi for single workers',
            contactInfo: '+91-9876543203',
            pricing: '₹10-15 per km',
            coverage: 'Within 15km radius'
          }
        })
      ])
    }

    return NextResponse.json({
      success: true,
      message: 'Sample data created successfully',
      data: {
        cities: cities.length,
        partners: cities.length * 3,
        transportOptions: cities.length * 3
      }
    })
  } catch (error) {
    console.error('Seed data error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create seed data' },
      { status: 500 }
    )
  }
}