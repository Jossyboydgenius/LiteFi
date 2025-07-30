import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/jwt';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { emailService } from '@/services/email/email.service';
import { formatCurrency } from '@/lib/formatters';

const salaryCashLoanSchema = z.object({
  loanAmount: z.number().positive('Loan amount must be positive'),
  
  // Personal Information
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
  
  // Employment Information
  employerName: z.string().min(1, 'Employer name is required'),
  employerAddress: z.string().min(1, 'Employer address is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  workEmail: z.string().email('Valid work email is required'),
  employmentStartDate: z.string().transform((str) => new Date(str)),
  salaryPaymentDate: z.string().min(1, 'Salary payment date is required'),
  netSalary: z.number().positive('Net salary must be positive'),
  
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

// POST - Create salary cash loan application
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
    const validatedData = salaryCashLoanSchema.parse(body);

    // Generate unique application ID
    const applicationId = `SC-${nanoid(8).toUpperCase()}`;

    // Create loan application
    const loanApplication = await prisma.loanApplication.create({
      data: {
        ...validatedData,
        loanType: 'SALARY_CASH',
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
        notes: 'Salary cash loan application created',
        metadata: {
          loanType: 'SALARY_CASH',
          loanAmount: validatedData.loanAmount,
        },
      },
    });

    // Send loan application notification email
    try {
      const loanAmount = Number(validatedData.loanAmount) || 0;
      
      await emailService.sendLoanApplicationNotificationEmail(
        loanApplication.user.email,
        loanApplication.user.firstName,
        {
          applicationId: loanApplication.applicationId,
          loanType: 'Salary Earner Cash Loan',
          amount: loanAmount,
          formattedAmount: formatCurrency(loanAmount),
          duration: 12, // Default duration for salary cash loans
          applicationDate: loanApplication.createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
        }
      );
      console.log(`✅ Loan application notification email sent to ${loanApplication.user.email}`);
    } catch (emailError) {
      console.error('Failed to send loan application notification email:', emailError);
      // Don't fail the application if email fails
    }

    return NextResponse.json({
      success: true,
      loanApplication,
      message: 'Salary cash loan application submitted successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create salary cash loan application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Fetch user's salary cash loan applications
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
        loanType: 'SALARY_CASH'
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
    console.error('Fetch salary cash loan applications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}