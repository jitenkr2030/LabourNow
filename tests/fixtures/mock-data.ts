// Mock user data
export const mockUsers = {
  employer: {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    mobile: '9876543210',
    role: 'EMPLOYER',
    isVerified: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  labour: {
    id: '2',
    name: 'Raj Kumar',
    email: 'raj@example.com',
    mobile: '9876543211',
    role: 'LABOUR',
    isVerified: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  admin: {
    id: '3',
    name: 'Admin User',
    email: 'admin@example.com',
    mobile: '9876543212',
    role: 'ADMIN',
    isVerified: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
}

// Mock labour profiles
export const mockLabourProfiles = [
  {
    id: '1',
    userId: '2',
    name: 'Raj Kumar',
    category: 'PLUMBER',
    experience: 5,
    hourlyWage: 200,
    location: 'Mumbai',
    latitude: 19.0760,
    longitude: 72.8777,
    isAvailable: true,
    rating: 4.5,
    totalJobs: 120,
    verificationBadge: 'VERIFIED',
    bio: 'Experienced plumber with 5 years of expertise in residential and commercial plumbing.',
    languages: ['Hindi', 'English', 'Marathi'],
    skills: ['Pipe Fitting', 'Leak Detection', 'Installation', 'Maintenance'],
    avatar: '/avatars/raj-kumar.jpg',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    userId: '4',
    name: 'Amit Sharma',
    category: 'ELECTRICIAN',
    experience: 8,
    hourlyWage: 250,
    location: 'Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    isAvailable: true,
    rating: 4.8,
    totalJobs: 200,
    verificationBadge: 'VERIFIED',
    bio: 'Certified electrician specializing in residential, commercial, and industrial electrical work.',
    languages: ['Hindi', 'English', 'Punjabi'],
    skills: ['Wiring', 'Installation', 'Maintenance', 'Repair', 'Safety Inspection'],
    avatar: '/avatars/amit-sharma.jpg',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '3',
    userId: '5',
    name: 'Suresh Patel',
    category: 'MASON',
    experience: 10,
    hourlyWage: 180,
    location: 'Bangalore',
    latitude: 12.9716,
    longitude: 77.5946,
    isAvailable: false,
    rating: 4.2,
    totalJobs: 150,
    verificationBadge: 'VERIFIED',
    bio: 'Skilled mason with expertise in brickwork, plastering, and construction.',
    languages: ['Hindi', 'English', 'Kannada'],
    skills: ['Brick Laying', 'Plastering', 'Construction', 'Renovation'],
    avatar: '/avatars/suresh-patel.jpg',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
]

// Mock bookings
export const mockBookings = [
  {
    id: '1',
    bookingNumber: 'LB000001',
    employerId: '1',
    labourId: '1',
    category: 'PLUMBER',
    jobLocation: 'Mumbai, Andheri West, Plot 123',
    date: '2024-01-20T09:00:00Z',
    duration: 'FULL_DAY',
    labourCount: 2,
    totalAmount: 398,
    status: 'ACCEPTED',
    paymentStatus: 'PAID',
    specialRequests: 'Need to fix bathroom and kitchen sink',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    bookingNumber: 'LB000002',
    employerId: '1',
    labourId: '2',
    category: 'ELECTRICIAN',
    jobLocation: 'Delhi, Connaught Place, Building 456',
    date: '2024-01-21T14:00:00Z',
    duration: 'HALF_DAY',
    labourCount: 1,
    totalAmount: 125,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    specialRequests: 'Install new electrical points in office',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z'
  }
]

// Mock categories
export const mockCategories = [
  {
    key: 'HELPER',
    name: 'Helper',
    description: 'General helper for various tasks',
    icon: 'Users',
    color: 'bg-blue-100 text-blue-600',
    group: 'General'
  },
  {
    key: 'MASON',
    name: 'Mason',
    description: 'Skilled mason for construction work',
    icon: 'Hammer',
    color: 'bg-orange-100 text-orange-600',
    group: 'Construction'
  },
  {
    key: 'ELECTRICIAN',
    name: 'Electrician',
    description: 'Certified electrician for electrical work',
    icon: 'Zap',
    color: 'bg-yellow-100 text-yellow-600',
    group: 'Professional'
  },
  {
    key: 'PLUMBER',
    name: 'Plumber',
    description: 'Experienced plumber for plumbing work',
    icon: 'Wrench',
    color: 'bg-cyan-100 text-cyan-600',
    group: 'Professional'
  },
  {
    key: 'PAINTER',
    name: 'Painter',
    description: 'Professional painter for painting work',
    icon: 'PaintBucket',
    color: 'bg-purple-100 text-purple-600',
    group: 'Professional'
  }
]

// Mock cities
export const mockCities = [
  {
    id: '1',
    name: 'Mumbai',
    state: 'Maharashtra',
    basePrice: 149,
    priceMultiplier: 1.5,
    supportPhone: '+91-22-12345678',
    transportAvailable: true,
    latitude: 19.0760,
    longitude: 72.8777,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Delhi',
    state: 'Delhi',
    basePrice: 129,
    priceMultiplier: 1.3,
    supportPhone: '+91-11-12345678',
    transportAvailable: true,
    latitude: 28.6139,
    longitude: 77.2090,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '3',
    name: 'Bangalore',
    state: 'Karnataka',
    basePrice: 119,
    priceMultiplier: 1.2,
    supportPhone: '+91-80-12345678',
    transportAvailable: true,
    latitude: 12.9716,
    longitude: 77.5946,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
]

// Mock API responses
export const mockApiResponses = {
  sendOTP: {
    success: true,
    message: 'OTP sent successfully',
    otp: '123456' // Only for testing
  },
  verifyOTP: {
    success: true,
    data: {
      token: 'mock-jwt-token',
      user: mockUsers.employer
    }
  },
  searchLabour: {
    success: true,
    data: mockLabourProfiles,
    pagination: {
      page: 1,
      limit: 10,
      total: 3,
      totalPages: 1
    }
  },
  createBooking: {
    success: true,
    data: mockBookings[0]
  },
  getBookings: {
    success: true,
    data: mockBookings,
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1
    }
  }
}

// Mock environment variables
export const mockEnv = {
  DATABASE_URL: 'file:./db/test.db',
  JWT_SECRET: 'test-secret-key',
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: 'test-nextauth-secret',
  SMS_API_KEY: 'test-sms-key',
  RAZORPAY_KEY_ID: 'test-razorpay-key',
  RAZORPAY_KEY_SECRET: 'test-razorpay-secret',
  GOOGLE_MAPS_API_KEY: 'test-google-maps-key',
  FIREBASE_PROJECT_ID: 'test-firebase-project'
}

// Test utilities
export const createMockResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
  headers: new Headers({
    'Content-Type': 'application/json'
  })
})

// Note: createMockFetch should be used in test files only
// export const createMockFetch = (responses: any[]) => {
//   let callCount = 0
//   return vi.fn().mockImplementation(() => {
//     const response = responses[callCount] || responses[responses.length - 1]
//     callCount++
//     return Promise.resolve(response)
//   })
// }

// Note: Test helpers should be used in test files only
// export const waitForElement = (page: Page, selector: string, timeout = 5000) => {
//   return page.waitForSelector(selector, { timeout })
// }

// export const fillForm = async (page: Page, formData: Record<string, string>) => {
//   for (const [selector, value] of Object.entries(formData)) {
//     await page.fill(selector, value)
//   }
// }

// export const clickButton = async (page: Page, text: string) => {
//   await page.click(`button:has-text("${text}")`)
// }

// export const takeScreenshot = async (page: Page, name: string) => {
//   await page.screenshot({ path: `tests/screenshots/${name}.png` })
// }