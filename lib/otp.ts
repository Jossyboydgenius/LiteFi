import { authenticator } from 'otplib';

/**
 * Generate a 6-digit OTP code using otplib with time-based approach
 */
export function generateOTP(): string {
  // Use a consistent secret for time-based OTP generation
  // In production, this should be stored securely per user
  const secret = process.env.OTP_SECRET || 'LITEFI_DEFAULT_SECRET_KEY_FOR_OTP';
  
  // Configure authenticator for 6-digit codes with 5-minute window
  authenticator.options = {
    digits: 6,
    step: 300, // 5 minutes
    window: 1
  };
  
  // Generate time-based OTP
  const otp = authenticator.generate(secret);
  return otp;
}

/**
 * Verify OTP code using otplib
 * @param token - The OTP token to verify
 * @param secret - Optional secret, uses default if not provided
 */
export function verifyOTP(token: string, secret?: string): boolean {
  const otpSecret = secret || process.env.OTP_SECRET || 'LITEFI_DEFAULT_SECRET_KEY_FOR_OTP';
  
  authenticator.options = {
    digits: 6,
    step: 300, // 5 minutes
    window: 1
  };
  
  return authenticator.verify({ token, secret: otpSecret });
}

/**
 * Generate a simple 6-digit numeric OTP
 */
export function generateSimpleOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Check if OTP is expired
 * @param expiresAt - Expiration timestamp
 */
export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}