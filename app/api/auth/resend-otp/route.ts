import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateOTP } from '@/lib/otp';
import { emailService } from '@/services/email/email.service';
import { z } from 'zod';

const resendOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
  type: z.enum(['email', 'password_reset'], { message: 'Invalid OTP type' }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = resendOtpSchema.parse(body);
    const { email, type } = validatedData;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate new OTP
    const otp = generateOTP();
    
    // Determine OTP type for database
    const otpType = type === 'email' ? 'EMAIL_VERIFICATION' : 'PASSWORD_RESET';
    
    // Invalidate any existing unused OTPs for this email and type
    await prisma.otpVerification.updateMany({
      where: {
        email: user.email,
        type: otpType,
        used: false,
      },
      data: {
        used: true, // Mark as used to invalidate
      },
    });
    
    // Store new OTP in database
    await prisma.otpVerification.create({
      data: {
        email: user.email,
        otpCode: otp,
        type: otpType,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
      },
    });
    
    // Send appropriate email based on type
    let emailSent = false;
    
    if (type === 'email') {
      emailSent = await emailService.sendVerificationEmail(
        user.email,
        otp
      );
    } else if (type === 'password_reset') {
      emailSent = await emailService.sendPasswordResetEmail(
        user.email,
        otp
      );
    }

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${email}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}