import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { generateToken } from '@/lib/jwt';
import { generateOTP } from '@/lib/otp';
import { emailService } from '@/services/email/email.service';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = loginSchema.parse(body);
    const { email, password } = validatedData;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // Generate OTP for email verification
      const otp = generateOTP();
      
      // Store OTP in database (delete any existing OTP first)
      await prisma.otpVerification.deleteMany({
        where: {
          email: user.email,
          type: 'EMAIL_VERIFICATION'
        }
      });
      
      await prisma.otpVerification.create({
        data: {
          email: user.email,
          otpCode: otp,
          type: 'EMAIL_VERIFICATION',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        },
      });
      
      // Send verification email with OTP
      try {
        await emailService.sendVerificationEmail(
          user.email, 
          otp
        );
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Continue with the response even if email fails
      }
      
      return NextResponse.json(
        { 
          error: 'Email verification required', 
          message: 'Please verify your email before logging in. Check your inbox for the verification code.',
          requiresVerification: true 
        },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user data (excluding password)
    const { passwordHash: _, ...userWithoutPassword } = user;

    // Create response with auth cookie
    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
    });

    // Set auth token as HttpOnly cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}