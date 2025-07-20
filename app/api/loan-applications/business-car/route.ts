import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/jwt';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const businessCarLoanSchema = z.object({
  loanAmount: z.number().positive('Loan amount must be positive'),
  tenure: z.number().positive('Tenure must be positive'),
  
  // Personal Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional(),
  email: z.string().email('Valid email is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  bvn: z.string().min(1, 'BVN is required'),
  nin: z.string().optional(),
  addressNumber: z.string().min(1, 'Address number is required'),
  streetName: z.string().min(1, 'Street name is required'),
  nearestBusStop: z.string().optional(),
  state: z.string().min(1, 'State is required'),
  localGovernment: z.string().min(1, 'Local government is required'),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']),
  homeOwnership: z.enum(['OWNED', 'RENTED', 'FAMILY']),
  yearsInAddress: z.number().positive('Years in address must be positive'),
  educationLevel: z.string().min(1, 'Education level is required'),
  
  // Business Information (required for business loans)
  businessName: z.string().min(1, 'Business name is required'),
  businessDescription: z.string().min(1, 'Business description is required'),
  industry: z.string().min(1, 'Industry is required'),
  businessAddress: z.string().min(1, 'Business address is required'),
  workEmail: z.string().email('Valid work email is required'),
  
  // Vehicle Information (required for car loans)
  vehicleMake: z.string().min(1, 'Vehicle make is required'),
  vehicleModel: z.string().min(1, 'Vehicle model is required'),
  vehicleYear: z.number().min(1990, 'Vehicle year must be 1990 or later').max(new Date().getFullYear() + 1, 'Vehicle year cannot be in the future'),
  vehicleAmount: z.number().positive('Vehicle amount must be positive'),
  
  // Next of Kin
  nokFirstName: z.string().min(1, 'Next of kin first name is required'),
  nokLastName: z.string().min(1, 'Next of kin last name is required'),
  nokMiddleName: z.string().optional(),
  nokRelationship: z.string().min(1, 'Relationship is required'),
  nokPhone: z.string().min(1, 'Next of kin phone is required'),
  nokEmail: z.string().email('Valid next of kin email is required'),
  
  // Financial Information
  bankName: z.string().min(1, 'Bank name is required'),
  accountName: z.string().min(1, 'Account name is required'),
  accountNumber: z.string().min(10, 'Valid account number is required'),
});

// POST - Create business car loan application
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = businessCarLoanSchema.parse(body);

    // Validate that loan amount doesn't exceed vehicle amount
    if (validatedData.loanAmount > validatedData.vehicleAmount) {
      return NextResponse.json(
        { error: 'Loan amount cannot exceed vehicle amount' },
        { status: 400 }
      );
    }

    // Generate unique application ID
    const applicationId = `BCR-${nanoid(8).toUpperCase()}`;

    // Create loan application
    const loanApplication = await prisma.loanApplication.create({
      data: {
        ...validatedData,
        loanType: 'BUSINESS_CAR',
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

    // Log the creation action
    await prisma.loanApplicationLog.create({
      data: {
        loanApplicationId: loanApplication.id,
        action: 'CREATED',
        performedBy: user.userId,
        notes: 'Business car loan application created',
        metadata: {
          loanType: 'BUSINESS_CAR',
          loanAmount: validatedData.loanAmount,
          businessInfo: {
            name: validatedData.businessName,
            description: validatedData.businessDescription,
            industry: validatedData.industry,
            address: validatedData.businessAddress,
          },
          vehicleInfo: {
            make: validatedData.vehicleMake,
            model: validatedData.vehicleModel,
            year: validatedData.vehicleYear,
            amount: validatedData.vehicleAmount,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      loanApplication,
      message: 'Business car loan application submitted successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create business car loan application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Fetch user's business car loan applications
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const loanApplications = await prisma.loanApplication.findMany({
      where: { 
        userId: user.userId,
        loanType: 'BUSINESS_CAR'
      },
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
    console.error('Fetch business car loan applications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}