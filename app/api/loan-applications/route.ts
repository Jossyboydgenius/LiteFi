import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/jwt';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { emailService } from '@/services/email/email.service';
import { formatCurrency } from '@/lib/formatters';

const loanApplicationSchema = z.object({
  loanType: z.enum(['BUSINESS_CASH', 'SALARY_CASH', 'BUSINESS_CAR', 'SALARY_CAR']),
  loanAmount: z.number().positive('Amount must be positive'),
  tenure: z.number().positive('Tenure must be positive'),
  
  // Personal Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional(),
  phoneNumber: z.string().min(11, 'Phone number must be exactly 11 digits').max(11, 'Phone number must be exactly 11 digits'),
  email: z.string().email('Valid email is required'),
  bvn: z.string().min(11, 'BVN must be exactly 11 digits').max(11, 'BVN must be exactly 11 digits'),
  nin: z.string().min(11, 'NIN must be exactly 11 digits').max(11, 'NIN must be exactly 11 digits'),
  addressNo: z.string().min(1, 'Address number is required'),
  streetName: z.string().min(1, 'Street name is required'),
  nearestBusStop: z.string().min(1, 'Nearest bus stop is required'),
  state: z.string().min(1, 'State is required'),
  localGovernment: z.string().min(1, 'Local government is required'),
  homeOwnership: z.enum(['OWNED', 'RENTED', 'FAMILY']),
  yearsInCurrentAddress: z.string().min(1, 'Years in current address is required'),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']),
  highestEducation: z.string().min(1, 'Education level is required'),
  
  // Employment Information (for salary earners)
  employerName: z.string().optional(),
  employerAddress: z.string().optional(),
  jobTitle: z.string().optional(),
  workEmail: z.string().optional(),
  employmentStartDate: z.string().optional(),
  salaryPaymentDate: z.string().optional(),
  netSalary: z.number().positive().optional(),
  
  // Business Information (for business owners)
  businessName: z.string().optional(),
  businessDescription: z.string().optional(),
  industry: z.string().optional(),
  businessAddress: z.string().optional(),
  
  // Vehicle Information (for car loans)
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.number().optional(),
  vehicleAmount: z.number().positive().optional(),
  
  // Next of Kin
  kinFirstName: z.string().min(1, 'Next of kin first name is required'),
  kinLastName: z.string().min(1, 'Next of kin last name is required'),
  kinMiddleName: z.string().optional(),
  kinRelationship: z.string().min(1, 'Relationship is required'),
  kinPhoneNumber: z.string().min(11, 'Next of kin phone must be exactly 11 digits').max(11, 'Next of kin phone must be exactly 11 digits'),
  kinEmail: z.string().email('Valid next of kin email is required'),
  
  // Bank Details
  bankName: z.string().min(1, 'Bank name is required'),
  accountName: z.string().min(1, 'Account name is required'),
  accountNumber: z.string().min(10, 'Account number must be exactly 10 digits').max(10, 'Account number must be exactly 10 digits'),
});

// GET - Fetch user's loan applications
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
      where: { userId: user.userId },
      include: {
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      applications: loanApplications,
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
    const user = await getUserFromRequest(request);
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

    // Map frontend field names to database field names
    const mappedData = {
      loanType: validatedData.loanType,
      loanAmount: validatedData.loanAmount,
      tenure: validatedData.tenure,
      
      // Personal Information
      middleName: validatedData.middleName,
      phoneNumber: validatedData.phoneNumber,
      bvn: validatedData.bvn,
      nin: validatedData.nin,
      addressNumber: validatedData.addressNo,
      streetName: validatedData.streetName,
      nearestBusStop: validatedData.nearestBusStop,
      state: validatedData.state,
      localGovernment: validatedData.localGovernment,
      homeOwnership: validatedData.homeOwnership,
      yearsInAddress: parseInt(validatedData.yearsInCurrentAddress || '0'),
      maritalStatus: validatedData.maritalStatus,
      educationLevel: validatedData.highestEducation,
      
      // Employment Information
      employerName: validatedData.employerName,
      employerAddress: validatedData.employerAddress,
      jobTitle: validatedData.jobTitle,
      workEmail: validatedData.workEmail,
      employmentStartDate: validatedData.employmentStartDate ? new Date(validatedData.employmentStartDate) : undefined,
      salaryPaymentDate: validatedData.salaryPaymentDate,
      netSalary: validatedData.netSalary,
      
      // Business Information
      businessName: validatedData.businessName,
      businessDescription: validatedData.businessDescription,
      industry: validatedData.industry,
      businessAddress: validatedData.businessAddress,
      
      // Vehicle Information
      vehicleMake: validatedData.vehicleMake,
      vehicleModel: validatedData.vehicleModel,
      vehicleYear: validatedData.vehicleYear,
      vehicleAmount: validatedData.vehicleAmount,
      
      // Next of Kin
      nokFirstName: validatedData.kinFirstName,
      nokLastName: validatedData.kinLastName,
      nokMiddleName: validatedData.kinMiddleName,
      nokRelationship: validatedData.kinRelationship,
      nokPhone: validatedData.kinPhoneNumber,
      nokEmail: validatedData.kinEmail,
      
      // Bank Details
      bankName: validatedData.bankName,
      accountName: validatedData.accountName,
      accountNumber: validatedData.accountNumber,
      
      // System fields
      userId: user.userId,
      applicationId,
    };

    // Create loan application
    const loanApplication = await prisma.loanApplication.create({
      data: mappedData,
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

    // Send loan application notification email
    try {
      // Helper function to get loan type display name
      const getLoanTypeDisplayName = (loanType: string) => {
        switch (loanType) {
          case 'SALARY_CASH':
            return 'Salary Earner Cash Loan';
          case 'SALARY_CAR':
            return 'Salary Earner Car Loan';
          case 'BUSINESS_CASH':
            return 'Business Cash Loan';
          case 'BUSINESS_CAR':
            return 'Business Car Loan';
          default:
            return 'Loan';
        }
      };

      const loanAmount = Number(loanApplication.loanAmount) || 0;
      
      console.log(`📧 Sending LOAN_APPLICATION_NOTIFICATION email to ${loanApplication.user.email}`);
      console.log('📋 Application details:', {
        applicationId: loanApplication.applicationId,
        loanType: getLoanTypeDisplayName(loanApplication.loanType),
        formattedAmount: formatCurrency(loanAmount),
        duration: loanApplication.tenure || 0,
        applicationDate: loanApplication.createdAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      });
      
      await emailService.sendLoanApplicationNotificationEmail(
        loanApplication.user.email,
        loanApplication.user.firstName,
        {
          applicationId: loanApplication.applicationId,
          loanType: getLoanTypeDisplayName(loanApplication.loanType),
          amount: loanAmount,
          formattedAmount: formatCurrency(loanAmount),
          duration: loanApplication.tenure || 0,
          applicationDate: loanApplication.createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
        }
      );
      console.log(`✅ Loan application notification email sent to ${loanApplication.user.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send loan application notification email:', emailError);
      // Don't fail the application creation if email fails
    }

    return NextResponse.json({
      success: true,
      applicationId: loanApplication.applicationId,
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