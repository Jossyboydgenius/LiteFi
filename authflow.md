# LiteFi Authentication Flow Documentation

## Overview
This document outlines the complete authentication flow for the LiteFi application, including user registration, email verification, login, and password reset functionality.

## Authentication Flow Components

### 1. User Registration (`/signup`)

#### Process:
1. **Form Validation**: User fills out registration form with:
   - First Name
   - Last Name
   - Email
   - Password (with strength validation)
   - Confirm Password
   - Country (defaults to Nigeria)
   - Optional referral code
   - Terms and conditions agreement

2. **Registration API Call**: 
   - Endpoint: `POST /api/auth/register`
   - Creates user account with `emailVerified: false`
   - Generates and sends email verification OTP
   - Returns user data and triggers email verification flow

3. **Email Verification Modal**:
   - Displays immediately after successful registration
   - Shows 6-digit OTP input field
   - Includes resend OTP functionality with 60-second countdown
   - Allows email change option

4. **Email Verification**:
   - Endpoint: `POST /api/auth/verify-email`
   - Validates OTP and marks email as verified
   - On success: redirects to login page with success message
   - On failure: displays error message

#### Key Features:
- Real-time password strength validation
- Form field validation with error states
- Automatic token cleanup on page load
- Session storage for email persistence
- Rate limiting on OTP resend (60-second countdown)

### 2. User Login (`/login`)

#### Process:
1. **Form Validation**: User enters email and password
2. **Login API Call**:
   - Endpoint: `POST /api/auth/login`
   - Validates credentials
   - Returns JWT token on success
   - Handles various error scenarios

3. **Error Handling**:
   - **Email not verified**: Shows verification message, stores email in session
   - **Phone not verified**: Shows phone verification message
   - **Password not set**: Redirects to password creation
   - **Invalid credentials**: Shows error message
   - **Account not found**: Suggests signup

4. **Success Flow**:
   - Stores JWT token in localStorage
   - Redirects to dashboard
   - Sets up authentication state

#### Key Features:
- Comprehensive error handling
- Automatic redirect prevention for incomplete registrations
- Session storage for verification flows
- Password visibility toggle
- Form validation with real-time feedback

### 3. Email Verification Modal

#### Features:
- **OTP Input**: 6-digit verification code
- **Rate Limiting**: 60-second countdown on resend button
- **Actions**:
  - Verify Email: Validates OTP
  - Resend Code: Requests new OTP (with countdown)
  - Change Email: Returns to registration form

#### Technical Implementation:
- React hooks for state management
- useEffect for countdown timer
- Proper cleanup of timers
- Loading states for all actions

### 4. Password Reset Flow (`/reset-password`)

#### Process:
1. **Request Reset**:
   - User enters email address
   - Endpoint: `POST /api/auth/reset-password`
   - Generates and sends password reset OTP
   - Shows verification modal

2. **OTP Verification**:
   - User enters 6-digit code
   - Stores OTP in session storage
   - Redirects to password creation page

3. **New Password Creation** (`/reset-password/create-new-password`):
   - User sets new password
   - Password strength validation
   - Endpoint: `POST /api/auth/reset-password/confirm`
   - Validates OTP and updates password
   - Redirects to login on success

#### Key Features:
- Email enumeration protection
- 15-minute OTP expiration
- Password strength validation
- Session-based flow state management
- Automatic cleanup of sensitive data

### 5. OTP Management

#### Types:
- `EMAIL_VERIFICATION`: For email verification during registration
- `PASSWORD_RESET`: For password reset flow

#### Features:
- 6-digit numeric codes
- 15-minute expiration
- Database storage with user association
- Email delivery via EmailService
- Rate limiting to prevent spam

### 6. API Endpoints

#### Authentication Endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/resend-otp` - Resend OTP codes
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/reset-password/confirm` - Confirm password reset

#### Request/Response Formats:
All endpoints use JSON format with consistent error handling and response structures.

### 7. Security Features

#### Password Security:
- Minimum 8 characters
- Strength validation (uppercase, lowercase, numbers, special characters)
- bcrypt hashing with salt rounds
- Real-time strength meter

#### OTP Security:
- Cryptographically secure random generation
- Time-based expiration (15 minutes)
- Single-use validation
- Rate limiting on generation

#### Session Management:
- JWT tokens for authentication
- Automatic token cleanup
- Session storage for temporary data
- Secure token storage in localStorage

#### Email Security:
- Email enumeration protection
- Template-based email sending
- Secure OTP delivery
- Professional email templates

### 8. User Experience Features

#### Form Validation:
- Real-time validation feedback
- Field-level error states
- Form submission prevention for invalid data
- Loading states during API calls

#### Navigation:
- Automatic redirects based on auth state
- Breadcrumb navigation for multi-step flows
- Back navigation options
- Clear call-to-action buttons

#### Error Handling:
- User-friendly error messages
- Toast notifications for feedback
- Graceful degradation for network issues
- Retry mechanisms for failed operations

### 9. State Management

#### Local State:
- Form data and validation states
- UI states (loading, modals, etc.)
- Temporary flow data

#### Session Storage:
- Email addresses for verification flows
- OTP codes for password reset
- Temporary authentication data

#### Local Storage:
- JWT authentication tokens
- User ID for authenticated sessions
- Persistent user preferences

### 10. Error Scenarios and Handling

#### Registration Errors:
- Email already exists
- Invalid email format
- Weak password
- Network connectivity issues
- Server errors

#### Login Errors:
- Invalid credentials
- Unverified email
- Unverified phone
- Account not found
- Server unavailable

#### Verification Errors:
- Invalid OTP
- Expired OTP
- Too many attempts
- Network issues

#### Recovery Strategies:
- Clear error messaging
- Retry mechanisms
- Alternative flow options
- Support contact information

## Technical Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **Email**: Custom EmailService with templates
- **Validation**: Zod schema validation
- **UI**: Tailwind CSS, shadcn/ui components
- **State**: React hooks, Context API

## Security Considerations

1. **Password Security**: Strong validation, secure hashing
2. **OTP Security**: Time-limited, single-use codes
3. **Token Security**: JWT with proper expiration
4. **Email Security**: Template-based, enumeration protection
5. **Input Validation**: Server-side validation with Zod
6. **Rate Limiting**: OTP generation and resend limits
7. **Session Security**: Proper cleanup and management

## Future Enhancements

1. **Two-Factor Authentication**: SMS or authenticator app
2. **Social Login**: Google, Facebook, Apple integration
3. **Biometric Authentication**: Fingerprint, Face ID
4. **Advanced Security**: Device fingerprinting, IP tracking
5. **Account Recovery**: Security questions, backup codes
6. **Audit Logging**: Authentication event tracking