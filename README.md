# LabourNow - On-Demand Labour Booking Platform

<div align="center">

![LabourNow Logo](https://img.shields.io/badge/LabourNow-FF6B35?style=for-the-badge&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.1.3-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6.19.2-2D3748?style=for-the-badge&logo=prisma)

**🇮🇳 India's Trusted On-Demand Labour Booking Platform**

Connect with skilled workers instantly. Book helpers, masons, electricians, and more at just ₹99 per worker.

[Live Demo](#) • [Report Bug](https://github.com/jitenkr2030/LabourNow/issues) • [Request Feature](https://github.com/jitenkr2030/LabourNow/issues)

</div>

## 📋 Table of Contents

- [About](#-about)
- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [🏗️ Project Structure](#️-project-structure)
- [🔧 Configuration](#-configuration)
- [📱 User Roles](#-user-roles)
- [💰 Pricing Model](#-pricing-model)
- [🛠️ Technology Stack](#️-technology-stack)
- [📊 Database Schema](#-database-schema)
- [🔐 API Endpoints](#-api-endpoints)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🌟 About

LabourNow is a comprehensive on-demand labour booking platform designed specifically for the Indian market. It bridges the gap between employers/contractors and skilled workers, providing a seamless, transparent, and efficient way to book labour services.

### 🎯 Mission

To revolutionize the informal labour sector in India by providing:
- **Instant Access** to verified skilled workers
- **Transparent Pricing** with no hidden charges
- **Trust & Safety** through verification and ratings
- **Digital Empowerment** for workers and employers

## ✨ Features

### 👥 **For Employers/Contractors**
- 🔍 **Smart Search**: Find workers by category, location, and availability
- 📅 **Instant Booking**: Book workers in minutes with real-time confirmation
- 💳 **Simple Pricing**: Fixed ₹99 per worker per booking (half/full day)
- 📍 **Location-Based**: Get workers within your preferred radius
- ⭐ **Verified Workers**: All workers are background-checked and rated
- 📊 **Analytics Dashboard**: Track bookings, spending, and worker performance
- 📱 **Mobile-Friendly**: Book workers from any device

### 🧑‍🏭 **For Workers**
- 🔔 **Job Alerts**: Receive instant notifications for new jobs
- ✅ **Flexible Availability**: Control when you're available for work
- 💰 **Earnings Tracker**: Monitor daily, weekly, and monthly earnings
- ⭐ **Build Reputation**: Earn ratings and increase visibility
- 📞 **Direct Contact**: Connect with employers after booking confirmation
- 🏆 **Featured Worker**: Boost your profile for more job opportunities

### 🛠️ **Platform Features**
- 🔐 **Secure Authentication**: Mobile number + OTP verification
- 🌍 **Multi-Language Support**: Hindi, English, and regional languages
- 📞 **Call Masking**: Protect privacy with masked phone numbers
- 💬 **In-App Chat**: Communicate seamlessly within the platform
- 🧾 **GST Invoices**: Automatic invoice generation for all bookings
- 📊 **Real-Time Tracking**: Monitor job status and worker location
- 🏆 **Rating System**: Transparent feedback mechanism

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Bun or npm/yarn
- Git

### One-Click Setup

```bash
# Clone the repository
git clone https://github.com/jitenkr2030/LabourNow.git
cd LabourNow

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env

# Initialize database
bun run db:push

# Start development server
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/jitenkr2030/LabourNow.git
cd LabourNow
```

### 2. Install Dependencies

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install

# Or using yarn
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./db/custom.db"

# JWT Secret (generate a strong secret)
JWT_SECRET="your-super-secret-jwt-key-here"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# SMS Service (for production)
SMS_API_KEY="your-sms-api-key"
SMS_SENDER_ID="LABOUR"

# Payment Gateway (for production)
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"

# Google Maps API (for location services)
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Firebase (for notifications)
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_PRIVATE_KEY="your-firebase-private-key"
FIREBASE_CLIENT_EMAIL="your-firebase-client-email"
```

### 4. Database Setup

```bash
# Generate Prisma client
bun run db:generate

# Push schema to database
bun run db:push

# (Optional) Run migrations
bun run db:migrate
```

### 5. Start Development Server

```bash
# Development mode
bun run dev

# Production build
bun run build
bun run start
```

## 🏗️ Project Structure

```
LabourNow/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   └── logo.svg               # Application logo
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── bookings/      # Booking management
│   │   │   └── labour/        # Worker search
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   ├── employer/          # Employer dashboard
│   │   ├── labour/            # Worker dashboard
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── db.ts              # Database client
│   │   └── utils.ts           # Utility functions
│   └── hooks/                 # Custom React hooks
├── .env.example               # Environment template
├── package.json               # Dependencies
├── tailwind.config.ts         # Tailwind configuration
├── next.config.ts             # Next.js configuration
└── README.md                  # This file
```

## 🔧 Configuration

### Database Configuration

The platform uses **SQLite** for development with **Prisma ORM**. For production, you can easily switch to **PostgreSQL** or **MySQL**:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"  // or "mysql"
  url      = env("DATABASE_URL")
}
```

### Authentication Configuration

- **Development**: OTP is logged to console (check dev logs)
- **Production**: Integrate with SMS services like:
  - Twilio
  - MSG91
  - Firebase Phone Auth

### Payment Configuration

Currently uses mock payment. To enable real payments:

1. Create Razorpay account
2. Add credentials to `.env`
3. Update payment API endpoints

## 📱 User Roles

### 🏢 **Employer/Contractor**
- **Registration**: Mobile number + business details
- **Features**: Search workers, book labour, track jobs, make payments
- **Dashboard**: Analytics, booking history, worker management

### 👷 **Labour/Worker**
- **Registration**: Mobile number + skills + verification
- **Features**: Receive jobs, manage availability, track earnings
- **Dashboard**: Job requests, earnings, profile management

### 👨‍💼 **Admin**
- **Access**: Full platform management
- **Features**: User management, booking oversight, analytics
- **Tools**: Fraud detection, pricing control, support

## 💰 Pricing Model

### Simple & Transparent

```
₹99 × Number of Workers × Booking
```

- **Duration**: Half day (4 hours) or Full day (8 hours) - Same price!
- **Includes**: GST invoice, worker verification, platform support
- **No Hidden Charges**: What you see is what you pay
- **Worker Commission**: ₹0 - Workers keep 100% of their earnings

### Example Scenarios

| Workers | Duration | Total Cost |
|---------|----------|------------|
| 1       | Half Day | ₹99        |
| 2       | Full Day | ₹198       |
| 5       | Half Day | ₹495       |

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui (Radix UI based)
- **Icons**: Lucide React
- **State Management**: React Hooks + Zustand

### **Backend**
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: Prisma ORM
- **Authentication**: JWT + Mobile OTP
- **Validation**: Zod Schema Validation

### **Database**
- **Development**: SQLite
- **Production Ready**: PostgreSQL, MySQL
- **ORM**: Prisma
- **Migrations**: Prisma Migrate

### **Infrastructure**
- **Deployment**: Vercel, Railway, or any Node.js host
- **Environment**: Docker support
- **Monitoring**: Built-in error handling
- **Performance**: Optimized for mobile and desktop

## 📊 Database Schema

### Core Models

```mermaid
erDiagram
    User ||--o{ LabourProfile : has
    User ||--o{ EmployerProfile : has
    User ||--o{ Booking : sends
    User ||--o{ Booking : receives
    User ||--o{ Review : gives
    User ||--o{ Review : receives
    User ||--o{ Payment : makes
    User ||--o{ Notification : receives
    
    Booking ||--o{ Payment : has
    Booking ||--o{ Review : has
    
    User {
        string id PK
        string mobile UK
        string name
        string email UK
        enum role
        boolean isVerified
        boolean isBlocked
        datetime createdAt
        datetime updatedAt
    }
    
    LabourProfile {
        string id PK
        string userId UK
        enum category
        int experience
        int hourlyWage
        string location
        float latitude
        float longitude
        boolean isAvailable
        float rating
        int totalJobs
        enum verificationBadge
    }
    
    Booking {
        string id PK
        string bookingNumber UK
        string employerId FK
        string labourId FK
        enum category
        string jobLocation
        datetime date
        enum duration
        int labourCount
        int totalAmount
        enum status
        enum paymentStatus
    }
```

## 🔐 API Endpoints

### Authentication
```http
POST /api/auth/send-otp    # Send OTP to mobile
POST /api/auth/verify-otp   # Verify OTP and login
```

### Labour Management
```http
GET  /api/labour/search     # Search workers with filters
GET  /api/labour/:id        # Get worker profile
PUT  /api/labour/profile    # Update worker profile
```

### Booking Management
```http
GET    /api/bookings        # Get user bookings
POST   /api/bookings        # Create new booking
PUT    /api/bookings/:id    # Update booking status
DELETE /api/bookings/:id    # Cancel booking
```

### Payments
```http
POST /api/payments/create   # Create payment
POST /api/payments/verify   # Verify payment
GET  /api/payments/:id      # Get payment details
```

### Notifications
```http
GET    /api/notifications   # Get user notifications
PUT    /api/notifications/:id/read  # Mark as read
POST   /api/notifications/send       # Send notification
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with coverage
bun test:coverage
```

### Test Structure

```
tests/
├── unit/                    # Unit tests
├── integration/             # API integration tests
├── e2e/                     # End-to-end tests
└── fixtures/                # Test data
```

### Testing Commands

```bash
# Database testing
bun run db:test:push

# Linting
bun run lint

# Type checking
bun run type-check
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   bun i -g vercel
   
   # Deploy
   vercel
   ```

2. **Environment Variables**
   - Add all `.env` variables to Vercel dashboard
   - Configure production database URL

3. **Custom Domain**
   - Add custom domain in Vercel dashboard
   - Configure SSL certificates

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN bun install
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "start"]
```

```bash
# Build and run
docker build -t labournow .
docker run -p 3000:3000 labournow
```

### Railway

1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

### Environment Setup

**Production Environment Variables:**
```env
NODE_ENV="production"
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="production-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
```

## 🤝 Contributing

We love contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Guidelines

- Follow **TypeScript** best practices
- Use **ESLint** configuration
- Write **tests** for new features
- Update **documentation** as needed
- Follow **Conventional Commits**

### Bug Reports

Please use the [issue tracker](https://github.com/jitenkr2030/LabourNow/issues) to report bugs. Include:

- **Environment**: OS, browser, Node.js version
- **Steps to reproduce**: Detailed reproduction steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 LabourNow

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing framework
- **Prisma** - For the excellent ORM
- **shadcn/ui** - For the beautiful components
- **Tailwind CSS** - For the utility-first CSS framework
- **Indian Labour Community** - For inspiring this solution

## 📞 Contact

- **Website**: [labournow.in](https://labournow.in)
- **Email**: support@labournow.in
- **Phone**: 1800-123-4567
- **Support**: 24/7 customer support

---

<div align="center">

**⭐ Star this repository if it helped you!**

Made with ❤️ for India's hardworking labour community

[Back to Top](#labournow---on-demand-labour-booking-platform)

</div>