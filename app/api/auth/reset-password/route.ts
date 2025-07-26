import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateOTP } from '@/lib/otp';
import { EmailService } from '@/services/email/email.service';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = resetPasswordSchema.parse(body);
    const { email } = validatedData;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'If an account with this email exists, you will receive a password reset email.' },
        { status: 200 } // Return 200 to prevent email enumeration
      );
    }

    // Generate OTP for password reset
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store OTP in database
    await prisma.otpVerification.create({
      data: {
        email: user.email,
        otpCode: otp,
        type: 'PASSWORD_RESET',
        expiresAt,
      },
    });

    // Send password reset email
    const emailService = new EmailService();
    await emailService.sendPasswordResetEmail(user.email, otp);

    return NextResponse.json({
      message: 'If an account with this email exists, you will receive a password reset email.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}