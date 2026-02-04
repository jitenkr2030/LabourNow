import { NextResponse } from 'next/server'

// Expanded service categories with descriptions and icons
const SERVICE_CATEGORIES = {
  // Original Categories
  HELPER: {
    name: 'General Helper',
    description: 'General assistance for various tasks',
    icon: 'Users',
    group: 'General',
    color: 'bg-blue-100 text-blue-700'
  },
  MASON: {
    name: 'Mason',
    description: 'Construction and bricklaying work',
    icon: 'Hammer',
    group: 'Construction',
    color: 'bg-orange-100 text-orange-700'
  },
  PAINTER: {
    name: 'Painter',
    description: 'Painting and decoration services',
    icon: 'PaintBucket',
    group: 'Construction',
    color: 'bg-purple-100 text-purple-700'
  },
  ELECTRICIAN: {
    name: 'Electrician',
    description: 'Electrical installation and repair',
    icon: 'Zap',
    group: 'Professional',
    color: 'bg-yellow-100 text-yellow-700'
  },
  PLUMBER: {
    name: 'Plumber',
    description: 'Plumbing installation and repair',
    icon: 'Wrench',
    group: 'Professional',
    color: 'bg-cyan-100 text-cyan-700'
  },
  LOADER: {
    name: 'Loader',
    description: 'Loading and unloading services',
    icon: 'Truck',
    group: 'Logistics',
    color: 'bg-green-100 text-green-700'
  },
  AGRICULTURE_WORKER: {
    name: 'Agriculture Worker',
    description: 'Farming and agricultural work',
    icon: 'Sprout',
    group: 'Agriculture',
    color: 'bg-emerald-100 text-emerald-700'
  },
  CARPENTER: {
    name: 'Carpenter',
    description: 'Woodwork and furniture making',
    icon: 'Hammer',
    group: 'Construction',
    color: 'bg-amber-100 text-amber-700'
  },
  WELDER: {
    name: 'Welder',
    description: 'Welding and metalwork',
    icon: 'Zap',
    group: 'Professional',
    color: 'bg-red-100 text-red-700'
  },
  MECHANIC: {
    name: 'Mechanic',
    description: 'Vehicle and machinery repair',
    icon: 'Wrench',
    group: 'Professional',
    color: 'bg-slate-100 text-slate-700'
  },
  CLEANER: {
    name: 'Cleaner',
    description: 'Cleaning and maintenance services',
    icon: 'Users',
    group: 'Domestic',
    color: 'bg-lime-100 text-lime-700'
  },
  SECURITY: {
    name: 'Security',
    description: 'Security and guard services',
    icon: 'Shield',
    group: 'Security',
    color: 'bg-indigo-100 text-indigo-700'
  },

  // Professional Services
  AC_TECHNICIAN: {
    name: 'AC Technician',
    description: 'Air conditioning installation and repair',
    icon: 'Wind',
    group: 'Professional',
    color: 'bg-sky-100 text-sky-700'
  },
  REFRIGERATION_TECHNICIAN: {
    name: 'Refrigeration Technician',
    description: 'Refrigeration and cooling systems',
    icon: 'Snowflake',
    group: 'Professional',
    color: 'bg-blue-100 text-blue-700'
  },
  SOLAR_PANEL_INSTALLER: {
    name: 'Solar Panel Installer',
    description: 'Solar panel installation and maintenance',
    icon: 'Sun',
    group: 'Professional',
    color: 'bg-yellow-100 text-yellow-700'
  },
  NETWORK_TECHNICIAN: {
    name: 'Network Technician',
    description: 'Network setup and troubleshooting',
    icon: 'Wifi',
    group: 'IT & Digital',
    color: 'bg-purple-100 text-purple-700'
  },
  APPLIANCE_REPAIR: {
    name: 'Appliance Repair',
    description: 'Home appliance repair services',
    icon: 'Wrench',
    group: 'Professional',
    color: 'bg-gray-100 text-gray-700'
  },
  PEST_CONTROL: {
    name: 'Pest Control',
    description: 'Pest control and fumigation services',
    icon: 'Bug',
    group: 'Professional',
    color: 'bg-green-100 text-green-700'
  },
  WATER_PURIFIER_TECHNICIAN: {
    name: 'Water Purifier Technician',
    description: 'Water purifier installation and repair',
    icon: 'Droplets',
    group: 'Professional',
    color: 'bg-cyan-100 text-cyan-700'
  },

  // Event Services
  EVENT_STAFF: {
    name: 'Event Staff',
    description: 'General event support staff',
    icon: 'Users',
    group: 'Event',
    color: 'bg-pink-100 text-pink-700'
  },
  DECORATOR: {
    name: 'Decorator',
    description: 'Event and venue decoration',
    icon: 'Palette',
    group: 'Event',
    color: 'bg-purple-100 text-purple-700'
  },
  CATERER: {
    name: 'Caterer',
    description: 'Food catering services',
    icon: 'Utensils',
    group: 'Event',
    color: 'bg-orange-100 text-orange-700'
  },
  WAITER_STAFF: {
    name: 'Waiter Staff',
    description: 'Waiter and serving staff',
    icon: 'Users',
    group: 'Event',
    color: 'bg-blue-100 text-blue-700'
  },
  CLEANING_STAFF: {
    name: 'Cleaning Staff',
    description: 'Event cleaning services',
    icon: 'Users',
    group: 'Event',
    color: 'bg-green-100 text-green-700'
  },
  SECURITY_EVENT: {
    name: 'Event Security',
    description: 'Event security personnel',
    icon: 'Shield',
    group: 'Event',
    color: 'bg-red-100 text-red-700'
  },
  SOUND_SYSTEM_TECHNICIAN: {
    name: 'Sound System Technician',
    description: 'Audio and sound system setup',
    icon: 'Volume2',
    group: 'Event',
    color: 'bg-indigo-100 text-indigo-700'
  },
  PHOTOGRAPHER: {
    name: 'Photographer',
    description: 'Photography services',
    icon: 'Camera',
    group: 'Event',
    color: 'bg-pink-100 text-pink-700'
  },
  VIDEOGRAPHER: {
    name: 'Videographer',
    description: 'Video recording and editing',
    icon: 'Video',
    group: 'Event',
    color: 'bg-purple-100 text-purple-700'
  },
  DJ_MUSICIAN: {
    name: 'DJ/Musician',
    description: 'Music and entertainment services',
    icon: 'Music',
    group: 'Event',
    color: 'bg-yellow-100 text-yellow-700'
  },

  // Construction Services
  FOREMAN: {
    name: 'Foreman',
    description: 'Construction site supervision',
    icon: 'HardHat',
    group: 'Construction',
    color: 'bg-orange-100 text-orange-700'
  },
  SITE_SUPERVISOR: {
    name: 'Site Supervisor',
    description: 'Construction site management',
    icon: 'Clipboard',
    group: 'Construction',
    color: 'bg-red-100 text-red-700'
  },
  CONSTRUCTION_LABORER: {
    name: 'Construction Laborer',
    description: 'General construction work',
    icon: 'Users',
    group: 'Construction',
    color: 'bg-amber-100 text-amber-700'
  },
  CONCRETE_SPECIALIST: {
    name: 'Concrete Specialist',
    description: 'Concrete mixing and pouring',
    icon: 'Hammer',
    group: 'Construction',
    color: 'bg-gray-100 text-gray-700'
  },
  TILING_SPECIALIST: {
    name: 'Tiling Specialist',
    description: 'Tile installation and repair',
    icon: 'Square',
    group: 'Construction',
    color: 'bg-blue-100 text-blue-700'
  },
  WATERPROOFING_SPECIALIST: {
    name: 'Waterproofing Specialist',
    description: 'Waterproofing and damp proofing',
    icon: 'Droplets',
    group: 'Construction',
    color: 'bg-cyan-100 text-cyan-700'
  },
  SCAFFOLDER: {
    name: 'Scaffolder',
    description: 'Scaffolding erection and dismantling',
    icon: 'Triangle',
    group: 'Construction',
    color: 'bg-yellow-100 text-yellow-700'
  },
  DEMOLITION_WORKER: {
    name: 'Demolition Worker',
    description: 'Demolition and site clearance',
    icon: 'Hammer',
    group: 'Construction',
    color: 'bg-red-100 text-red-700'
  },
  HEAVY_MACHINE_OPERATOR: {
    name: 'Heavy Machine Operator',
    description: 'Heavy machinery operation',
    icon: 'Tractor',
    group: 'Construction',
    color: 'bg-green-100 text-green-700'
  },

  // Agricultural Services
  FARM_WORKER: {
    name: 'Farm Worker',
    description: 'General farm work and cultivation',
    icon: 'Sprout',
    group: 'Agriculture',
    color: 'bg-green-100 text-green-700'
  },
  TRACTOR_DRIVER: {
    name: 'Tractor Driver',
    description: 'Tractor and farm equipment operation',
    icon: 'Tractor',
    group: 'Agriculture',
    color: 'bg-amber-100 text-amber-700'
  },
  IRRIGATION_SPECIALIST: {
    name: 'Irrigation Specialist',
    description: 'Irrigation system installation and maintenance',
    icon: 'Droplets',
    group: 'Agriculture',
    color: 'bg-blue-100 text-blue-700'
  },
  CROP_HARVESTER: {
    name: 'Crop Harvester',
    description: 'Crop harvesting and processing',
    icon: 'Wheat',
    group: 'Agriculture',
    color: 'bg-yellow-100 text-yellow-700'
  },
  PESTICIDE_APPLICATOR: {
    name: 'Pesticide Applicator',
    description: 'Pesticide and fertilizer application',
    icon: 'Bug',
    group: 'Agriculture',
    color: 'bg-green-100 text-green-700'
  },
  DAIRY_WORKER: {
    name: 'Dairy Worker',
    description: 'Dairy farm operations',
    icon: 'Milk',
    group: 'Agriculture',
    color: 'bg-blue-100 text-blue-700'
  },
  POULTRY_WORKER: {
    name: 'Poultry Worker',
    description: 'Poultry farm management',
    icon: 'Egg',
    group: 'Agriculture',
    color: 'bg-orange-100 text-orange-700'
  },
  HORTICULTURIST: {
    name: 'Horticulturist',
    description: 'Gardening and plant care',
    icon: 'Flower',
    group: 'Agriculture',
    color: 'bg-pink-100 text-pink-700'
  },

  // Domestic Services
  MAID: {
    name: 'Maid',
    description: 'House cleaning and maintenance',
    icon: 'Users',
    group: 'Domestic',
    color: 'bg-blue-100 text-blue-700'
  },
  COOK: {
    name: 'Cook',
    description: 'Cooking and kitchen services',
    icon: 'ChefHat',
    group: 'Domestic',
    color: 'bg-orange-100 text-orange-700'
  },
  DRIVER: {
    name: 'Driver',
    description: 'Personal and commercial driving',
    icon: 'Car',
    group: 'Domestic',
    color: 'bg-gray-100 text-gray-700'
  },
  BABYSITTER: {
    name: 'Babysitter',
    description: 'Childcare services',
    icon: 'Baby',
    group: 'Domestic',
    color: 'bg-pink-100 text-pink-700'
  },
  ELDERLY_CARE: {
    name: 'Elderly Care',
    description: 'Elderly care and assistance',
    icon: 'Heart',
    group: 'Domestic',
    color: 'bg-red-100 text-red-700'
  },
  TUTOR: {
    name: 'Tutor',
    description: 'Private tutoring and education',
    icon: 'BookOpen',
    group: 'Domestic',
    color: 'bg-purple-100 text-purple-700'
  },
  GARDENER: {
    name: 'Gardener',
    description: 'Garden maintenance and landscaping',
    icon: 'Trees',
    group: 'Domestic',
    color: 'bg-green-100 text-green-700'
  },
  PET_CARE: {
    name: 'Pet Care',
    description: 'Pet sitting and grooming',
    icon: 'PawPrint',
    group: 'Domestic',
    color: 'bg-amber-100 text-amber-700'
  },
  LAUNDRY_SERVICE: {
    name: 'Laundry Service',
    description: 'Washing and ironing services',
    icon: 'Shirt',
    group: 'Domestic',
    color: 'bg-blue-100 text-blue-700'
  },

  // Logistics & Transport
  DELIVERY_PERSON: {
    name: 'Delivery Person',
    description: 'Package and document delivery',
    icon: 'Truck',
    group: 'Logistics',
    color: 'bg-green-100 text-green-700'
  },
  WAREHOUSE_WORKER: {
    name: 'Warehouse Worker',
    description: 'Warehouse operations and management',
    icon: 'Package',
    group: 'Logistics',
    color: 'bg-orange-100 text-orange-700'
  },
  PACKER: {
    name: 'Packer',
    description: 'Packing and packaging services',
    icon: 'Package',
    group: 'Logistics',
    color: 'bg-blue-100 text-blue-700'
  },
  LOADER_UNLOADER: {
    name: 'Loader/Unloader',
    description: 'Loading and unloading services',
    icon: 'Truck',
    group: 'Logistics',
    color: 'bg-gray-100 text-gray-700'
  },
  TRUCK_DRIVER: {
    name: 'Truck Driver',
    description: 'Truck and heavy vehicle driving',
    icon: 'Truck',
    group: 'Logistics',
    color: 'bg-red-100 text-red-700'
  },
  COURIER: {
    name: 'Courier',
    description: 'Courier and messenger services',
    icon: 'Bike',
    group: 'Logistics',
    color: 'bg-yellow-100 text-yellow-700'
  },
  BIKE_MESSENGER: {
    name: 'Bike Messenger',
    description: 'Bike delivery services',
    icon: 'Bike',
    group: 'Logistics',
    color: 'bg-green-100 text-green-700'
  },

  // IT & Digital Services
  COMPUTER_TECHNICIAN: {
    name: 'Computer Technician',
    description: 'Computer repair and maintenance',
    icon: 'Monitor',
    group: 'IT & Digital',
    color: 'bg-blue-100 text-blue-700'
  },
  PRINTER_TECHNICIAN: {
    name: 'Printer Technician',
    description: 'Printer repair and maintenance',
    icon: 'Printer',
    group: 'IT & Digital',
    color: 'bg-gray-100 text-gray-700'
  },
  CCTV_INSTALLER: {
    name: 'CCTV Installer',
    description: 'CCTV installation and maintenance',
    icon: 'Camera',
    group: 'IT & Digital',
    color: 'bg-red-100 text-red-700'
  },
  WEBSITE_DEVELOPER: {
    name: 'Website Developer',
    description: 'Website development and design',
    icon: 'Code',
    group: 'IT & Digital',
    color: 'bg-purple-100 text-purple-700'
  },
  GRAPHIC_DESIGNER: {
    name: 'Graphic Designer',
    description: 'Graphic design and creative services',
    icon: 'Palette',
    group: 'IT & Digital',
    color: 'bg-pink-100 text-pink-700'
  },
  DATA_ENTRY_OPERATOR: {
    name: 'Data Entry Operator',
    description: 'Data entry and typing services',
    icon: 'Keyboard',
    group: 'IT & Digital',
    color: 'bg-green-100 text-green-700'
  },

  // Beauty & Wellness
  BEAUTICIAN: {
    name: 'Beautician',
    description: 'Beauty and grooming services',
    icon: 'Sparkles',
    group: 'Beauty & Wellness',
    color: 'bg-pink-100 text-pink-700'
  },
  HAIR_STYLIST: {
    name: 'Hair Stylist',
    description: 'Hair cutting and styling',
    icon: 'Scissors',
    group: 'Beauty & Wellness',
    color: 'bg-purple-100 text-purple-700'
  },
  MASSAGE_THERAPIST: {
    name: 'Massage Therapist',
    description: 'Massage and therapy services',
    icon: 'Heart',
    group: 'Beauty & Wellness',
    color: 'bg-red-100 text-red-700'
  },
  FITNESS_TRAINER: {
    name: 'Fitness Trainer',
    description: 'Personal fitness training',
    icon: 'Dumbbell',
    group: 'Beauty & Wellness',
    color: 'bg-green-100 text-green-700'
  },
  YOGA_INSTRUCTOR: {
    name: 'Yoga Instructor',
    description: 'Yoga instruction and classes',
    icon: 'Person',
    group: 'Beauty & Wellness',
    color: 'bg-blue-100 text-blue-700'
  },

  // Other Services
  TAILOR: {
    name: 'Tailor',
    description: 'Tailoring and clothing alteration',
    icon: 'Scissors',
    group: 'Other',
    color: 'bg-purple-100 text-purple-700'
  },
  SHOE_REPAIR: {
    name: 'Shoe Repair',
    description: 'Shoe repair and polishing',
    icon: 'Boot',
    group: 'Other',
    color: 'bg-amber-100 text-amber-700'
  },
  KEY_MAKER: {
    name: 'Key Maker',
    description: 'Key making and lock services',
    icon: 'Key',
    group: 'Other',
    color: 'bg-yellow-100 text-yellow-700'
  },
  AUTOMOBILE_MECHANIC: {
    name: 'Automobile Mechanic',
    description: 'Car and vehicle repair',
    icon: 'Wrench',
    group: 'Other',
    color: 'bg-red-100 text-red-700'
  },
  BIKE_MECHANIC: {
    name: 'Bike Mechanic',
    description: 'Bicycle and motorcycle repair',
    icon: 'Bike',
    group: 'Other',
    color: 'bg-green-100 text-green-700'
  },
  CAR_WASH: {
    name: 'Car Wash',
    description: 'Car washing and detailing',
    icon: 'Car',
    group: 'Other',
    color: 'bg-blue-100 text-blue-700'
  }
}

export async function GET() {
  try {
    // Group categories by their group
    const groupedCategories = Object.entries(SERVICE_CATEGORIES).reduce((acc, [key, value]) => {
      const group = value.group
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push({
        key,
        ...value
      })
      return acc
    }, {} as Record<string, any[]>)

    return NextResponse.json({
      success: true,
      data: {
        categories: SERVICE_CATEGORIES,
        groupedCategories,
        groups: Object.keys(groupedCategories)
      }
    })
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}