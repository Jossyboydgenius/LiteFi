# LiteFi Platform Documentation

## Overview

LiteFi is a comprehensive loan management platform that provides both customer-facing loan applications and administrative tools for loan processing. The platform supports multiple loan types with automated ID generation, document management, and approval workflows.

## Platform Architecture

### Frontend Components
- **Customer Dashboard** (`/app/dashboard/page.tsx`) - User interface for loan applications and status tracking
- **Admin Console** (`/app/console/page.tsx`) - Administrative interface for loan review and approval
- **Loan Application Forms** (`/app/loan-application/`) - Type-specific application forms

### Backend API
- **Loan Applications API** (`/app/api/loan-applications/`) - Handles loan creation and management
- **Admin API** (`/app/api/admin/`) - Administrative functions including approval/rejection
- **Document Management** (`/app/api/documents/`) - File upload and retrieval

## Loan Types Supported

### 1. Salary Cash Loans
- **Target**: Salaried employees seeking cash loans
- **Application ID Prefix**: `LA-` (Legacy) / `SL-` (New)
- **Loan ID Prefix**: `LN-SL-`
- **Requirements**: Employment verification, salary slips, bank statements

### 2. Salary Car Loans
- **Target**: Salaried employees seeking vehicle financing
- **Application ID Prefix**: `SCR-`
- **Loan ID Prefix**: `LN-SCR-`
- **Requirements**: Employment verification, vehicle details, down payment proof

### 3. Business Cash Loans
- **Target**: Business owners seeking working capital
- **Application ID Prefix**: `BC-`
- **Loan ID Prefix**: `LN-BC-`
- **Requirements**: CAC documents, business bank statements, financial records

### 4. Business Car Loans
- **Target**: Business owners seeking commercial vehicle financing
- **Application ID Prefix**: `BCR-`
- **Loan ID Prefix**: `LN-BCR-`
- **Requirements**: CAC documents, vehicle details, business financials

## ID Generation System

### Application ID Generation

Application IDs are generated when a loan application is first created:

```typescript
// Example from /app/api/loan-applications/salary-car/route.ts
const applicationId = `SCR-${nanoid(8).toUpperCase()}`;
```

**Format**: `[TYPE_PREFIX]-[8_CHARACTER_NANOID]`
- Uses uppercase NanoID for uniqueness
- Generated immediately upon application submission
- Used for tracking throughout the application process

### Loan ID Generation (Enhanced System)

Loan IDs are generated only when an application is **approved**. The enhanced system includes type-specific prefixes:

```typescript
// From /app/api/admin/loan-applications/[id]/approve/route.ts
const getLoanTypePrefix = (loanType: string): string => {
  const typeMap: { [key: string]: string } = {
    'salary-cash': 'SL',
    'salary-car': 'SCR', 
    'business-cash': 'BC',
    'business-car': 'BCR'
  };
  return typeMap[loanType] || 'GEN';
};

const typePrefix = getLoanTypePrefix(application.loanType);
const loanId = `LN-${typePrefix}-${nanoid(10).toUpperCase()}`;
```

**Enhanced Format**: `LN-[TYPE_PREFIX]-[10_CHARACTER_NANOID]`

#### Type Prefix Mapping:
- **SL**: Salary Cash loans (`LN-SL-WGMTZYHV1R`)
- **SCR**: Salary Car loans (`LN-SCR-ABCD123456`)
- **BC**: Business Cash loans (`LN-BC-EFGH789012`)
- **BCR**: Business Car loans (`LN-BCR-IJKL345678`)
- **GEN**: Generic fallback for unknown types

### ID Display Logic

Both dashboards implement intelligent ID display:

```typescript
// Dashboard and Console display logic
{loan.loanId || (loan.status === 'APPROVED' ? 'Generating...' : 'N/A')}
```

- **Shows Loan ID**: When available (approved applications)
- **Shows "Generating..."**: For approved applications without loan ID yet
- **Shows "N/A"**: For pending/rejected applications

## Document Management System

### Document Types

The platform handles various document types with intelligent formatting:

```typescript
const formatDocumentType = (type: string) => {
  return type
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
```

#### Supported Document Types:
- **UTILITY_BILL** → "Utility Bill"
- **GOVERNMENT_ID** → "Government Id"
- **WORK_ID** → "Work Id"
- **CAC_DOCUMENTS** → "Cac Documents"
- **CAC_CERTIFICATE** → "Cac Certificate"
- **BANK_STATEMENT** → "Bank Statement"
- **SALARY_SLIP** → "Salary Slip"
- **SELFIE** → "Selfie"

### Document Display

The console dashboard displays document types in a user-friendly format:
- Converts underscore-separated values to title case
- Falls back to filename-based inference if document type is missing
- Provides generic "Document X" naming as final fallback

## Application Workflow

### 1. Application Submission
```
User fills form → Application created with ID → Documents uploaded → Status: PENDING
```

### 2. Admin Review
```
Admin views application → Reviews documents → Makes decision
```

### 3. Approval Process
```
Approve → Loan ID generated → Status: APPROVED → User notified
```

### 4. Rejection Process
```
Reject → Reason provided → Status: REJECTED → User notified
```

## Database Schema

### Loan Applications Table
```sql
CREATE TABLE loan_applications (
  id VARCHAR PRIMARY KEY,           -- Application ID
  loan_id VARCHAR UNIQUE,          -- Generated on approval
  user_id VARCHAR NOT NULL,
  loan_type VARCHAR NOT NULL,
  loan_amount DECIMAL NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED'),
  approved_amount DECIMAL,
  rejection_reason TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by VARCHAR
);
```

## API Endpoints

### Customer Endpoints
- `POST /api/loan-applications/[type]` - Submit loan application
- `GET /api/loan-applications/user/[userId]` - Get user's applications
- `POST /api/documents/upload` - Upload documents

### Admin Endpoints
- `GET /api/admin/loan-applications` - List all applications
- `POST /api/admin/loan-applications/[id]/approve` - Approve application
- `POST /api/admin/loan-applications/[id]/reject` - Reject application
- `GET /api/documents/[id]` - Download documents

## Security Features

### Authentication
- JWT-based authentication
- Role-based access control (User/Admin)
- Session management

### Data Protection
- Encrypted document storage
- Secure file upload with validation
- PII data handling compliance

### API Security
- Request validation
- Rate limiting
- CORS configuration
- Input sanitization

## Mobile Responsiveness

### Dashboard Features
- **Desktop/Tablet**: Full table view with all columns
- **Mobile**: Card-based layout showing essential information
- **Responsive breakpoints**: Tailwind CSS classes for different screen sizes

```typescript
// Mobile-responsive table implementation
<div className="md:hidden space-y-4">
  {/* Mobile card view */}
</div>
<div className="hidden md:block">
  {/* Desktop table view */}
</div>
```

## Performance Optimizations

### Frontend
- Component lazy loading
- Image optimization with Next.js
- Efficient state management
- Skeleton loading states

### Backend
- Database query optimization
- File upload streaming
- Caching strategies
- Pagination implementation

## Deployment Configuration

### Environment Variables
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

### Build Configuration
- Next.js 15.2.4 with Turbopack
- TypeScript configuration
- Tailwind CSS setup
- Prisma ORM integration

## Monitoring and Analytics

### Application Metrics
- Loan application volume
- Approval/rejection rates
- Processing times
- User engagement metrics

### Error Handling
- Comprehensive error logging
- User-friendly error messages
- Fallback UI components
- Toast notifications for user feedback

## Future Enhancements

### Planned Features
1. **Automated Credit Scoring**: ML-based risk assessment
2. **Real-time Notifications**: WebSocket implementation
3. **Advanced Analytics**: Dashboard with charts and insights
4. **Mobile App**: React Native implementation
5. **Integration APIs**: Third-party service connections

### Scalability Considerations
- Microservices architecture migration
- Database sharding strategies
- CDN implementation for document storage
- Load balancing configuration

## Support and Maintenance

### Code Quality
- TypeScript for type safety
- ESLint and Prettier configuration
- Component testing with Jest
- End-to-end testing with Playwright

### Documentation
- API documentation with OpenAPI
- Component documentation with Storybook
- Database schema documentation
- Deployment guides

This documentation provides a comprehensive overview of the LiteFi platform, covering all major components, workflows, and technical implementations. The enhanced loan ID generation system ensures proper categorization and tracking of different loan types while maintaining backward compatibility with existing applications.