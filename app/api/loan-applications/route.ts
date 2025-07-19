import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/jwt';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const loanApplicationSchema = z.object({
  loanType: z.enum(['BUSINESS_CASH', 'SALARY_CASH', 'BUSINESS_CAR', 'SALARY_CAR']),
  loanAmount: z.number().positive('Amount must be positive'),
  
  // Personal Information
  phoneNumber: z.string().optional(),
  bvn: z.string().optional(),
  nin: z.string().optional(),
  addressNumber: z.string().optional(),
  streetName: z.string().optional(),
  nearestBusStop: z.string().optional(),
  state: z.string().optional(),
  localGovernment: z.string().optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']).optional(),
  homeOwnership: z.enum(['OWNED', 'RENTED', 'FAMILY']).optional(),
  yearsInAddress: z.number().optional(),
  educationLevel: z.string().optional(),
  
  // Employment Information
  employerName: z.string().optional(),
  employerAddress: z.string().optional(),
  jobTitle: z.string().optional(),
  workEmail: z.string().optional(),
  employmentStartDate: z.string().transform((str) => str ? new Date(str) : undefined).optional(),
  salaryPaymentDate: z.string().optional(),
  netSalary: z.number().positive().optional(),
  
  // Business Information (optional)
  businessName: z.string().optional(),
  businessDescription: z.string().optional(),
  industry: z.string().optional(),
  businessAddress: z.string().optional(),
  
  // Vehicle Information (optional)
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.number().optional(),
  vehicleAmount: z.number().positive().optional(),
  
  // Next of Kin
  nokFirstName: z.string().optional(),
  nokLastName: z.string().optional(),
  nokMiddleName: z.string().optional(),
  nokRelationship: z.string().optional(),
  nokPhone: z.string().optional(),
  nokEmail: z.string().optional(),
  
  // Financial Information
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
});

// GET - Fetch user's loan applications
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const loanApplications = await prisma.loanApplication.findMany({
      where: { userId: user.userId },
      include: {
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      loanApplications,
    });
  } catch (error) {
    console.error('Fetch loan applications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new loan application
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = loanApplicationSchema.parse(body);

    // Generate unique application ID
    const applicationId = `LA-${nanoid(8).toUpperCase()}`;

    // Create loan application
    const loanApplication = await prisma.loanApplication.create({
      data: {
        ...validatedData,
        userId: user.userId,
        applicationId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      loanApplication,
      message: 'Loan application submitted successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create loan application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}