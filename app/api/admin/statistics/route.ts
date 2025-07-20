import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest, checkRole } from '@/lib/jwt';

// GET - Fetch loan application statistics (Admin only)
export async function GET(request: NextRequest) {
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

    // Get statistics
    const [totalApplications, pendingApplications, approvedApplications, rejectedApplications, totalApprovedAmount] = await Promise.all([
      // Total applications
      prisma.loanApplication.count(),
      
      // Pending applications
      prisma.loanApplication.count({
        where: { status: 'PENDING' }
      }),
      
      // Approved applications
      prisma.loanApplication.count({
        where: { status: 'APPROVED' }
      }),
      
      // Rejected applications
      prisma.loanApplication.count({
        where: { status: 'REJECTED' }
      }),
      
      // Total approved amount
      prisma.loanApplication.aggregate({
        where: { status: 'APPROVED' },
        _sum: {
          approvedAmount: true
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      statistics: {
        totalApplications,
        pending: pendingApplications,
        approved: approvedApplications,
        rejected: rejectedApplications,
        totalApprovedAmount: totalApprovedAmount._sum.approvedAmount || 0
      }
    });
  } catch (error) {
    console.error('Fetch statistics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}