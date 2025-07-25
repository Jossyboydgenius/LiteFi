import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest, checkRole } from '@/lib/jwt';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const approveSchema = z.object({
  approvedAmount: z.number().positive('Approved amount must be positive'),
  interestRate: z.number().min(0).max(100, 'Interest rate must be between 0 and 100'),
  approvedTenure: z.number().positive('Approved tenure must be positive'),
  notes: z.string().optional(),
});

// POST - Approve loan application (Admin only)
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!checkRole(user, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = approveSchema.parse(body);

    // Check if loan application exists
    const loanApplication = await prisma.loanApplication.findUnique({
      where: { id: params.id },
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

    if (!loanApplication) {
      return NextResponse.json(
        { error: 'Loan application not found' },
        { status: 404 }
      );
    }

    if (loanApplication.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Loan application is not pending' },
        { status: 400 }
      );
    }

    // Generate unique loan ID with type prefix
    const getLoanTypePrefix = (loanType: string) => {
      switch (loanType) {
        case 'SALARY_CASH':
          return 'SL';
        case 'SALARY_CAR':
          return 'SC';
        case 'BUSINESS_CASH':
          return 'BC';
        case 'BUSINESS_CAR':
          return 'BCR';
        default:
          return 'LN';
      }
    };
    
    const typePrefix = getLoanTypePrefix(loanApplication.loanType);
    const loanId = `LN-${typePrefix}-${nanoid(8).toUpperCase()}`;

    // Update loan application status to approved
    const updatedLoanApplication = await prisma.loanApplication.update({
      where: { id: params.id },
      data: {
        status: 'APPROVED',
        approvedAmount: validatedData.approvedAmount,
        interestRate: validatedData.interestRate,
        approvedTenure: validatedData.approvedTenure,
        reviewedAt: new Date(),
        reviewedBy: user.userId,
        notes: validatedData.notes,
        loanId,
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

    // Log the approval action
    await prisma.loanApplicationLog.create({
      data: {
        loanApplicationId: params.id,
        action: 'APPROVED',
        performedBy: user.userId,
        notes: validatedData.notes || 'Loan application approved',
        metadata: {
          approvedAmount: validatedData.approvedAmount,
          interestRate: validatedData.interestRate,
          approvedTenure: validatedData.approvedTenure,
          loanId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      loanApplication: updatedLoanApplication,
      message: 'Loan application approved successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Approve loan application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}