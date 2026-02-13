import { z } from 'zod'

// Common validation patterns
const mobileRegex = /^[6-9]\d{9}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const nameRegex = /^[a-zA-Z\s]{2,50}$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
const pincodeRegex = /^\d{6}$/
const priceRegex = /^\d+$/
const ratingRegex = /^[1-5]$/

// Sanitization functions
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '')
}

export const sanitizeNumber = (input: string): number => {
  const num = parseInt(input.replace(/\D/g, ''))
  return isNaN(num) ? 0 : num
}

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}

// Auth validation schemas
export const sendOTPSchema = z.object({
  mobile: z.string()
    .regex(mobileRegex, 'Invalid Indian mobile number')
    .transform(sanitizeString),
  role: z.enum(['LABOUR', 'EMPLOYER'], {
    errorMap: () => ({ message: 'Role must be either LABOUR or EMPLOYER' })
  })
})

export const verifyOTPSchema = z.object({
  mobile: z.string()
    .regex(mobileRegex, 'Invalid Indian mobile number')
    .transform(sanitizeString),
  otp: z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
  userId: z.string()
    .min(1, 'User ID is required')
    .max(100, 'User ID is too long')
    .transform(sanitizeString)
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string()
    .min(1, 'Refresh token is required')
    .max(1000, 'Invalid refresh token format')
})

// User profile validation schemas
export const labourProfileSchema = z.object({
  cityId: z.string()
    .min(1, 'City is required')
    .transform(sanitizeString),
  category: z.enum([
    'HELPER', 'MASON', 'PAINTER', 'ELECTRICIAN', 'PLUMBER', 'LOADER',
    'AGRICULTURE_WORKER', 'CARPENTER', 'WELDER', 'MECHANIC', 'CLEANER',
    'SECURITY', 'AC_TECHNICIAN', 'REFRIGERATION_TECHNICIAN', 'SOLAR_PANEL_INSTALLER',
    'NETWORK_TECHNICIAN', 'APPLIANCE_REPAIR', 'PEST_CONTROL', 'WATER_PURIFIER_TECHNICIAN',
    'EVENT_STAFF', 'DECORATOR', 'CATERER', 'WAITER_STAFF', 'CLEANING_STAFF',
    'SECURITY_EVENT', 'SOUND_SYSTEM_TECHNICIAN', 'PHOTOGRAPHER', 'VIDEOGRAPHER',
    'DJ_MUSICIAN', 'FOREMAN', 'SITE_SUPERVISOR', 'CONSTRUCTION_LABORER',
    'CONCRETE_SPECIALIST', 'TILING_SPECIALIST', 'WATERPROOFING_SPECIALIST',
    'SCAFFOLDER', 'DEMOLITION_WORKER', 'HEAVY_MACHINE_OPERATOR', 'FARM_WORKER',
    'TRACTOR_DRIVER', 'IRRIGATION_SPECIALIST', 'CROP_HARVESTER', 'PESTICIDE_APPLICATOR',
    'DAIRY_WORKER', 'POULTRY_WORKER', 'HORTICULTURIST', 'MAID', 'COOK',
    'DRIVER', 'BABYSITTER', 'ELDERLY_CARE', 'TUTOR', 'GARDENER',
    'PET_CARE', 'LAUNDRY_SERVICE', 'DELIVERY_PERSON', 'WAREHOUSE_WORKER',
    'PACKER', 'LOADER_UNLOADER', 'TRUCK_DRIVER', 'COURIER', 'BIKE_MESSENGER',
    'COMPUTER_TECHNICIAN', 'PRINTER_TECHNICIAN', 'CCTV_INSTALLER', 'WEBSITE_DEVELOPER',
    'GRAPHIC_DESIGNER', 'DATA_ENTRY_OPERATOR', 'BEAUTICIAN', 'HAIR_STYLIST',
    'MASSAGE_THERAPIST', 'FITNESS_TRAINER', 'YOGA_INSTRUCTOR', 'TAILOR',
    'SHOE_REPAIR', 'KEY_MAKER', 'AUTOMOBILE_MECHANIC', 'BIKE_MECHANIC', 'CAR_WASH'
  ], {
    errorMap: () => ({ message: 'Please select a valid category' })
  }),
  experience: z.number()
    .int('Experience must be a whole number')
    .min(0, 'Experience cannot be negative')
    .max(50, 'Experience cannot exceed 50 years'),
  hourlyWage: z.number()
    .int('Hourly wage must be a whole number')
    .min(50, 'Minimum hourly wage is ₹50')
    .max(5000, 'Maximum hourly wage is ₹5000'),
  bio: z.string()
    .max(500, 'Bio cannot exceed 500 characters')
    .transform(sanitizeString)
    .optional(),
  location: z.string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location cannot exceed 200 characters')
    .transform(sanitizeString),
  latitude: z.number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .optional(),
  longitude: z.number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude')
    .optional(),
  workRadius: z.number()
    .int('Work radius must be a whole number')
    .min(1, 'Work radius must be at least 1 km')
    .max(100, 'Work radius cannot exceed 100 km')
    .default(10),
  languages: z.array(z.string()
    .min(1, 'Language cannot be empty')
    .max(50, 'Language name too long')
    .transform(sanitizeString))
    .min(1, 'At least one language is required')
    .max(5, 'Cannot select more than 5 languages')
    .optional(),
  workPreferences: z.object({
    flexibleHours: z.boolean().default(false),
    weekendsAvailable: z.boolean().default(false),
    nightShiftAvailable: z.boolean().default(false),
    emergencyWork: z.boolean().default(false),
    fullTimePreferred: z.boolean().default(false)
  }).optional()
})

export const employerProfileSchema = z.object({
  cityId: z.string()
    .min(1, 'City is required')
    .transform(sanitizeString),
  businessType: z.string()
    .min(2, 'Business type is required')
    .max(100, 'Business type cannot exceed 100 characters')
    .transform(sanitizeString),
  businessName: z.string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name cannot exceed 100 characters')
    .transform(sanitizeString)
    .optional(),
  location: z.string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location cannot exceed 200 characters')
    .transform(sanitizeString),
  latitude: z.number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .optional(),
  longitude: z.number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude')
    .optional(),
  gstNumber: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number format')
    .optional()
    .or(z.literal('')),
  bio: z.string()
    .max(500, 'Bio cannot exceed 500 characters')
    .transform(sanitizeString)
    .optional()
})

// Booking validation schemas
export const createBookingSchema = z.object({
  labourId: z.string()
    .min(1, 'Labour ID is required')
    .transform(sanitizeString),
  cityId: z.string()
    .min(1, 'City is required')
    .transform(sanitizeString),
  category: z.enum([
    'HELPER', 'MASON', 'PAINTER', 'ELECTRICIAN', 'PLUMBER', 'LOADER',
    'AGRICULTURE_WORKER', 'CARPENTER', 'WELDER', 'MECHANIC', 'CLEANER',
    'SECURITY', 'AC_TECHNICIAN', 'REFRIGERATION_TECHNICIAN', 'SOLAR_PANEL_INSTALLER',
    'NETWORK_TECHNICIAN', 'APPLIANCE_REPAIR', 'PEST_CONTROL', 'WATER_PURIFIER_TECHNICIAN',
    'EVENT_STAFF', 'DECORATOR', 'CATERER', 'WAITER_STAFF', 'CLEANING_STAFF',
    'SECURITY_EVENT', 'SOUND_SYSTEM_TECHNICIAN', 'PHOTOGRAPHER', 'VIDEOGRAPHER',
    'DJ_MUSICIAN', 'FOREMAN', 'SITE_SUPERVISOR', 'CONSTRUCTION_LABORER',
    'CONCRETE_SPECIALIST', 'TILING_SPECIALIST', 'WATERPROOFING_SPECIALIST',
    'SCAFFOLDER', 'DEMOLITION_WORKER', 'HEAVY_MACHINE_OPERATOR', 'FARM_WORKER',
    'TRACTOR_DRIVER', 'IRRIGATION_SPECIALIST', 'CROP_HARVESTER', 'PESTICIDE_APPLICATOR',
    'DAIRY_WORKER', 'POULTRY_WORKER', 'HORTICULTURIST', 'MAID', 'COOK',
    'DRIVER', 'BABYSITTER', 'ELDERLY_CARE', 'TUTOR', 'GARDENER',
    'PET_CARE', 'LAUNDRY_SERVICE', 'DELIVERY_PERSON', 'WAREHOUSE_WORKER',
    'PACKER', 'LOADER_UNLOADER', 'TRUCK_DRIVER', 'COURIER', 'BIKE_MESSENGER',
    'COMPUTER_TECHNICIAN', 'PRINTER_TECHNICIAN', 'CCTV_INSTALLER', 'WEBSITE_DEVELOPER',
    'GRAPHIC_DESIGNER', 'DATA_ENTRY_OPERATOR', 'BEAUTICIAN', 'HAIR_STYLIST',
    'MASSAGE_THERAPIST', 'FITNESS_TRAINER', 'YOGA_INSTRUCTOR', 'TAILOR',
    'SHOE_REPAIR', 'KEY_MAKER', 'AUTOMOBILE_MECHANIC', 'BIKE_MECHANIC', 'CAR_WASH'
  ]),
  jobLocation: z.string()
    .min(5, 'Job location must be at least 5 characters')
    .max(500, 'Job location cannot exceed 500 characters')
    .transform(sanitizeString),
  latitude: z.number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .optional(),
  longitude: z.number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude')
    .optional(),
  date: z.string()
    .datetime('Invalid date format')
    .transform(val => new Date(val)),
  duration: z.enum(['HALF_DAY', 'FULL_DAY'], {
    errorMap: () => ({ message: 'Duration must be either HALF_DAY or FULL_DAY' })
  }),
  labourCount: z.number()
    .int('Labour count must be a whole number')
    .min(1, 'At least 1 labour is required')
    .max(20, 'Cannot book more than 20 labourers at once'),
  specialRequests: z.string()
    .max(1000, 'Special requests cannot exceed 1000 characters')
    .transform(sanitizeString)
    .optional(),
  transportNeeded: z.boolean().default(false),
  transportOption: z.string()
    .max(100, 'Transport option too long')
    .transform(sanitizeString)
    .optional()
})

// Review validation schema
export const createReviewSchema = z.object({
  bookingId: z.string()
    .min(1, 'Booking ID is required')
    .transform(sanitizeString),
  rating: z.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  comment: z.string()
    .min(10, 'Review comment must be at least 10 characters')
    .max(1000, 'Review comment cannot exceed 1000 characters')
    .transform(sanitizeString)
    .optional()
})

// Chat message validation schema
export const sendMessageSchema = z.object({
  bookingId: z.string()
    .min(1, 'Booking ID is required')
    .transform(sanitizeString),
  receiverId: z.string()
    .min(1, 'Receiver ID is required')
    .transform(sanitizeString),
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message cannot exceed 2000 characters')
    .transform(sanitizeString),
  messageType: z.enum(['TEXT', 'IMAGE', 'FILE']).default('TEXT')
})

// Search and filter validation schemas
export const searchLabourSchema = z.object({
  cityId: z.string()
    .min(1, 'City is required')
    .transform(sanitizeString),
  category: z.string()
    .min(1, 'Category is required')
    .transform(sanitizeString)
    .optional(),
  latitude: z.number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .optional(),
  longitude: z.number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude')
    .optional(),
  radius: z.number()
    .int('Search radius must be a whole number')
    .min(1, 'Search radius must be at least 1 km')
    .max(100, 'Search radius cannot exceed 100 km')
    .default(10),
  minWage: z.number()
    .int('Minimum wage must be a whole number')
    .min(0, 'Minimum wage cannot be negative')
    .max(10000, 'Maximum wage filter is ₹10000')
    .optional(),
  maxWage: z.number()
    .int('Maximum wage must be a whole number')
    .min(0, 'Maximum wage cannot be negative')
    .max(10000, 'Maximum wage filter is ₹10000')
    .optional(),
  minRating: z.number()
    .int('Minimum rating must be a whole number')
    .min(1, 'Minimum rating is 1')
    .max(5, 'Maximum rating is 5')
    .optional(),
  availableOnly: z.boolean().default(true)
})

// Admin validation schemas
export const adminActionSchema = z.object({
  action: z.enum(['block_user', 'unblock_user', 'verify_user', 'delete_user', 'update_role'], {
    errorMap: () => ({ message: 'Invalid admin action' })
  }),
  userId: z.string()
    .min(1, 'User ID is required')
    .max(100, 'Invalid user ID format')
    .transform(sanitizeString),
  reason: z.string()
    .max(500, 'Reason cannot exceed 500 characters')
    .transform(sanitizeString)
    .optional(),
  newRole: z.enum(['LABOUR', 'EMPLOYER', 'ADMIN'])
    .optional()
})

// Pagination validation schema
export const paginationSchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(Number)
    .refine(n => n >= 1, 'Page must be at least 1')
    .default('1'),
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .refine(n => n >= 1 && n <= 100, 'Limit must be between 1 and 100')
    .default('10')
})

// Error response helper
export const createValidationError = (errors: any[]) => ({
  success: false,
  message: 'Validation failed',
  errors: errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }))
})

// Input sanitization middleware
export const sanitizeInput = (data: any): any => {
  if (typeof data === 'string') {
    return sanitizeString(data)
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeInput(item))
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return data
}