import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest, checkRole } from '@/lib/jwt';
import { z } from 'zod';

const rejectSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
  notes: z.string().optional(),
});

// POST - Reject loan application
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
    const validatedData = rejectSchema.parse(body);
    const applicationId = params.id;

    // Find the loan application
    const loanApplication = await prisma.loanApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!loanApplication) {
      return NextResponse.json(
        { error: 'Loan application not found' },
        { status: 404 }
      );
    }

    if (loanApplication.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending applications can be rejected' },
        { status: 400 }
      );
    }

    // Update loan application status to rejected
    const updatedApplication = await prisma.loanApplication.update({
      where: { id: applicationId },
      data: {
        status: 'REJECTED',
        rejectionReason: validatedData.reason,
        reviewedAt: new Date(),
        reviewedBy: user.userId,
        notes: validatedData.notes,
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

    // Log the rejection action
    await prisma.loanApplicationLog.create({
      data: {
        loanApplicationId: applicationId,
        action: 'REJECTED',
        performedBy: user.userId,
        notes: validatedData.notes,
        metadata: {
          reason: validatedData.reason,
        },
      },
    });

    return NextResponse.json({
      success: true,
      loanApplication: updatedApplication,
      message: 'Loan application rejected successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Reject loan application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}