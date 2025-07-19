# 🚀 LiteFi Fullstack Next.js Development Guide

## 📋 Project Overview

LiteFi is a comprehensive loan application platform built with Next.js 15, featuring a complete authentication system, loan application workflow, and admin dashboard. This guide outlines the implementation strategy for converting the current frontend-only application into a fullstack solution using Next.js API routes and Google Cloud Platform (GCP) services.

## 🏗️ Current Architecture

### Frontend Stack
- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives
- **Authentication**: Placeholder implementation (ready for backend integration)

### Current Features
- ✅ Landing page with loan calculator
- ✅ User authentication flow (login/signup/password reset)
- ✅ Four loan application types
- ✅ Admin dashboard with application management
- ✅ Role-based routing (admin vs user)
- ✅ Document upload simulation
- ✅ Application status tracking

## 🎯 Fullstack Implementation Strategy

### Phase 1: Backend Infrastructure Setup

#### 1.1 Database Schema Design

**Users Table**
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Loan Applications Table**
```sql
CREATE TABLE loan_applications (
  id VARCHAR(36) PRIMARY KEY,
  application_id VARCHAR(10) UNIQUE NOT NULL, -- NanoID
  loan_id VARCHAR(10) NULL, -- Generated on approval
  user_id VARCHAR(36) NOT NULL,
  loan_type ENUM('salary-cash', 'business-cash', 'salary-car', 'business-car') NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'disbursed') DEFAULT 'pending',
  
  -- Loan Details
  loan_amount DECIMAL(15,2),
  tenure INT,
  vehicle_make VARCHAR(100),
  vehicle_model VARCHAR(100),
  vehicle_year INT,
  vehicle_amount DECIMAL(15,2),
  
  -- Personal Information
  middle_name VARCHAR(100),
  phone_number VARCHAR(20),
  bvn VARCHAR(11),
  nin VARCHAR(11),
  address_number VARCHAR(10),
  street_name VARCHAR(200),
  nearest_bus_stop VARCHAR(200),
  state VARCHAR(100),
  local_government VARCHAR(100),
  home_ownership ENUM('owned', 'rented', 'family'),
  years_in_address INT,
  marital_status ENUM('single', 'married', 'divorced', 'widowed'),
  education_level VARCHAR(100),
  
  -- Employment/Business Info
  employer_name VARCHAR(200),
  employer_address TEXT,
  job_title VARCHAR(100),
  work_email VARCHAR(255),
  employment_start_date DATE,
  salary_payment_date VARCHAR(50),
  net_salary DECIMAL(15,2),
  business_name VARCHAR(200),
  business_description TEXT,
  industry VARCHAR(100),
  business_address TEXT,
  
  -- Next of Kin
  nok_first_name VARCHAR(100),
  nok_last_name VARCHAR(100),
  nok_middle_name VARCHAR(100),
  nok_relationship VARCHAR(50),
  nok_phone VARCHAR(20),
  nok_email VARCHAR(255),
  
  -- Bank Details
  bank_name VARCHAR(100),
  account_name VARCHAR(200),
  account_number VARCHAR(20),
  
  -- Status Management
  approved_by VARCHAR(36) NULL,
  rejected_by VARCHAR(36) NULL,
  rejection_reason TEXT NULL,
  approved_at TIMESTAMP NULL,
  rejected_at TIMESTAMP NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  FOREIGN KEY (rejected_by) REFERENCES users(id)
);
```

**Documents Table**
```sql
CREATE TABLE documents (
  id VARCHAR(36) PRIMARY KEY,
  application_id VARCHAR(36) NOT NULL,
  document_type ENUM('government_id', 'utility_bill', 'work_id', 'cac_certificate', 'cac_2_7', 'selfie') NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (application_id) REFERENCES loan_applications(id)
);
```

**OTP Verification Table**
```sql
CREATE TABLE otp_verifications (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  type ENUM('email_verification', 'password_reset') NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.2 GCP Services Setup

**Required GCP Services:**
1. **Cloud SQL (MySQL/PostgreSQL)** - Primary database
2. **Cloud Storage** - Document file storage
3. **Cloud Functions** - Email service integration
4. **Identity and Access Management (IAM)** - Service account management
5. **Cloud Monitoring** - Application monitoring

**Environment Variables (.env.local):**
```env
# Database
DATABASE_URL="mysql://username:password@host:port/database"

# GCP
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
GOOGLE_CLOUD_STORAGE_BUCKET="litefi-documents"
GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"

# Authentication
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"

# Email Service
SENDGRID_API_KEY="your-sendgrid-key"
FROM_EMAIL="noreply@litefi.ng"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Phase 2: API Routes Implementation

#### 2.1 Authentication APIs

**File Structure:**
```
app/api/
├── auth/
│   ├── login/route.ts
│   ├── register/route.ts
│   ├── verify-email/route.ts
│   ├── resend-otp/route.ts
│   ├── request-password-reset/route.ts
│   └── confirm-password-reset/route.ts
├── applications/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── [id]/approve/route.ts
├── documents/
│   ├── upload/route.ts
│   └── [id]/route.ts
└── admin/
    ├── applications/route.ts
    └── statistics/route.ts
```

#### 2.2 Required Dependencies

**Add to package.json:**
```json
{
  "dependencies": {
    "@google-cloud/storage": "^7.7.0",
    "@sendgrid/mail": "^8.1.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "mysql2": "^3.6.5",
    "prisma": "^5.7.1",
    "@prisma/client": "^5.7.1",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.33.1"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/multer": "^1.4.11"
  }
}
```

### Phase 3: Database Integration

#### 3.1 Prisma Setup

**Install Prisma:**
```bash
npm install prisma @prisma/client
npx prisma init
```

**Prisma Schema (prisma/schema.prisma):**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String   @map("password_hash")
  firstName     String   @map("first_name")
  lastName      String   @map("last_name")
  role          Role     @default(USER)
  emailVerified Boolean  @default(false) @map("email_verified")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  applications  LoanApplication[]
  approvedApps  LoanApplication[] @relation("ApprovedBy")
  rejectedApps  LoanApplication[] @relation("RejectedBy")
  
  @@map("users")
}

enum Role {
  USER  @map("user")
  ADMIN @map("admin")
}

model LoanApplication {
  id            String      @id @default(cuid())
  applicationId String      @unique @map("application_id")
  loanId        String?     @map("loan_id")
  userId        String      @map("user_id")
  loanType      LoanType    @map("loan_type")
  status        AppStatus   @default(PENDING)
  
  // ... other fields as per schema above
  
  user          User        @relation(fields: [userId], references: [id])
  approvedBy    User?       @relation("ApprovedBy", fields: [approvedById], references: [id])
  rejectedBy    User?       @relation("RejectedBy", fields: [rejectedById], references: [id])
  documents     Document[]
  
  @@map("loan_applications")
}

// ... other models
```

#### 3.2 Database Utilities

**lib/db.ts:**
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Phase 4: File Upload & Storage

#### 4.1 Google Cloud Storage Integration

**lib/storage.ts:**
```typescript
import { Storage } from '@google-cloud/storage'

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
})

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET!)

export async function uploadFile(
  file: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const blob = bucket.file(fileName)
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: mimeType,
    },
  })

  return new Promise((resolve, reject) => {
    blobStream.on('error', reject)
    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      resolve(publicUrl)
    })
    blobStream.end(file)
  })
}
```

### Phase 5: Email Service Integration

#### 5.1 SendGrid Setup

**lib/email.ts:**
```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendOTPEmail(email: string, otp: string, type: 'verification' | 'reset') {
  const msg = {
    to: email,
    from: process.env.FROM_EMAIL!,
    subject: type === 'verification' ? 'Verify Your Email' : 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>LiteFi ${type === 'verification' ? 'Email Verification' : 'Password Reset'}</h2>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
  }

  await sgMail.send(msg)
}
```

### Phase 6: Implementation Roadmap

#### Week 1: Database & Authentication
- [ ] Set up GCP Cloud SQL instance
- [ ] Configure Prisma with database schema
- [ ] Implement authentication API routes
- [ ] Add JWT token management
- [ ] Set up email service with SendGrid

#### Week 2: Loan Application APIs
- [ ] Create loan application submission endpoints
- [ ] Implement file upload with GCP Storage
- [ ] Add application status management
- [ ] Create admin approval/rejection workflows

#### Week 3: Frontend Integration
- [ ] Replace placeholder API calls with real endpoints
- [ ] Add proper error handling and loading states
- [ ] Implement file upload components
- [ ] Add real-time status updates

#### Week 4: Testing & Deployment
- [ ] Add comprehensive API testing
- [ ] Set up monitoring and logging
- [ ] Deploy to production environment
- [ ] Performance optimization

### Phase 7: Security Considerations

#### 7.1 Authentication Security
- JWT token rotation
- Rate limiting on auth endpoints
- Password strength validation
- Account lockout after failed attempts

#### 7.2 Data Protection
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- File upload restrictions
- HTTPS enforcement

#### 7.3 Privacy Compliance
- Data encryption at rest
- Secure file storage
- GDPR compliance measures
- Audit logging

### Phase 8: Monitoring & Analytics

#### 8.1 Application Monitoring
- GCP Cloud Monitoring integration
- Error tracking and alerting
- Performance metrics
- Database query optimization

#### 8.2 Business Analytics
- Application conversion rates
- User engagement metrics
- Loan approval statistics
- Revenue tracking

## 🚀 Getting Started

### Prerequisites
1. GCP account with billing enabled
2. SendGrid account for email services
3. Node.js 18+ installed
4. Git repository access

### Quick Start Commands

```bash
# Install new dependencies
npm install @google-cloud/storage @sendgrid/mail bcryptjs jsonwebtoken mysql2 prisma @prisma/client

# Set up Prisma
npx prisma init
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

### Environment Setup
1. Copy `.env.example` to `.env.local`
2. Configure GCP service account
3. Set up Cloud SQL database
4. Configure SendGrid API key
5. Update database connection string

## 📚 Additional Resources

- [Next.js API Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Google Cloud Storage Node.js Client](https://cloud.google.com/storage/docs/reference/libraries#client-libraries-install-nodejs)
- [SendGrid Node.js Documentation](https://docs.sendgrid.com/for-developers/sending-email/node-js)

## 🤝 Contributing

This guide will be updated as the implementation progresses. Each phase should be completed with proper testing and documentation before moving to the next phase.

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Status**: Implementation Ready