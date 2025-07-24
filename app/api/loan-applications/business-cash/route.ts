import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/jwt';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const businessCashLoanSchema = z.object({
  loanAmount: z.number().positive('Loan amount must be positive'),
  tenure: z.number().positive('Tenure must be positive'),
  
  // Personal Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional(),
  email: z.string().email('Valid email is required'),
  phoneNumber: z.string().min(11, 'Phone number must be exactly 11 digits').max(11, 'Phone number must be exactly 11 digits'),
  bvn: z.string().min(11, 'BVN must be exactly 11 digits').max(11, 'BVN must be exactly 11 digits'),
  nin: z.string().min(11, 'NIN must be exactly 11 digits').max(11, 'NIN must be exactly 11 digits').optional(),
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
  
  // Next of Kin
  nokFirstName: z.string().min(1, 'Next of kin first name is required'),
  nokLastName: z.string().min(1, 'Next of kin last name is required'),
  nokMiddleName: z.string().optional(),
  nokRelationship: z.string().min(1, 'Relationship is required'),
  nokPhone: z.string().min(11, 'Next of kin phone must be exactly 11 digits').max(11, 'Next of kin phone must be exactly 11 digits'),
  nokEmail: z.string().email('Valid next of kin email is required'),
  
  // Financial Information
  bankName: z.string().min(1, 'Bank name is required'),
  accountName: z.string().min(1, 'Account name is required'),
  accountNumber: z.string().min(10, 'Account number must be exactly 10 digits').max(10, 'Account number must be exactly 10 digits'),
});

// POST - Create business cash loan application
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
    const validatedData = businessCashLoanSchema.parse(body);

    // Generate unique application ID
    const applicationId = `BC-${nanoid(8).toUpperCase()}`;

    // Create loan application
    const loanApplication = await prisma.loanApplication.create({
      data: {
        // Loan details
        loanAmount: validatedData.loanAmount,
        tenure: validatedData.tenure,
        loanType: 'BUSINESS_CASH',
        userId: user.userId,
        applicationId,
        
        // Personal Information
        // Note: firstName and lastName are stored in the User model, not in LoanApplication
        middleName: validatedData.middleName,
        phoneNumber: validatedData.phoneNumber,
        bvn: validatedData.bvn,
        nin: validatedData.nin,
        addressNumber: validatedData.addressNumber,
        streetName: validatedData.streetName,
        nearestBusStop: validatedData.nearestBusStop,
        state: validatedData.state,
        localGovernment: validatedData.localGovernment,
        maritalStatus: validatedData.maritalStatus,
        homeOwnership: validatedData.homeOwnership,
        yearsInAddress: validatedData.yearsInAddress,
        educationLevel: validatedData.educationLevel,
        
        // Business Information
        businessName: validatedData.businessName,
        businessDescription: validatedData.businessDescription,
        industry: validatedData.industry,
        businessAddress: validatedData.businessAddress,
        workEmail: validatedData.workEmail,
        
        // Next of Kin
        nokFirstName: validatedData.nokFirstName,
        nokLastName: validatedData.nokLastName,
        nokMiddleName: validatedData.nokMiddleName,
        nokRelationship: validatedData.nokRelationship,
        nokPhone: validatedData.nokPhone,
        nokEmail: validatedData.nokEmail,
        
        // Financial Information
        bankName: validatedData.bankName,
        accountName: validatedData.accountName,
        accountNumber: validatedData.accountNumber,
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
        notes: 'Business cash loan application created',
        metadata: {
          loanType: 'BUSINESS_CASH',
          loanAmount: validatedData.loanAmount,
          businessInfo: {
            name: validatedData.businessName,
            description: validatedData.businessDescription,
            industry: validatedData.industry,
            address: validatedData.businessAddress,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      loanApplication,
      message: 'Business cash loan application submitted successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create business cash loan application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Fetch user's business cash loan applications
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
        loanType: 'BUSINESS_CASH'
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
    console.error('Fetch business cash loan applications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}