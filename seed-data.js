import { db } from './src/lib/db.js'

const cities = [
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
]

async function seedData() {
  try {
    console.log('Seeding cities...')
    
    for (const cityData of cities) {
      const city = await db.city.create({
        data: cityData
      })
      console.log(`Created city: ${city.name}`)
      
      // Create partners for each city
      await db.partner.create({
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
      })
      
      await db.transportOption.create({
        data: {
          cityId: city.id,
          name: 'City Auto Rickshaw',
          type: 'AUTO_RICKSHAW',
          description: 'Quick and affordable auto rickshaw service',
          contactInfo: '+91-9876543201',
          pricing: '₹15-25 per km',
          coverage: 'Within city limits'
        }
      })
    }
    
    console.log('Seed data created successfully!')
  } catch (error) {
    console.error('Error seeding data:', error)
  } finally {
    await db.$disconnect()
  }
}

seedData()