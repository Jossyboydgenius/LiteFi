import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/services/email/email.service';
import { formatCurrency } from '@/lib/formatters';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    console.log('🧪 Testing loan application notification email...');
    
    const testApplicationDetails = {
      applicationId: 'TEST-12345678',
      loanType: 'Salary Earner Cash Loan',
      amount: 500000,
      formattedAmount: formatCurrency(500000),
      duration: 12,
      applicationDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
    };

    const result = await emailService.sendLoanApplicationNotificationEmail(
      email,
      name,
      testApplicationDetails
    );

    if (result) {
      console.log('✅ Test loan application notification email sent successfully');
      return NextResponse.json({
        success: true,
        message: 'Test loan application notification email sent successfully',
        details: testApplicationDetails
      });
    } else {
      console.log('❌ Failed to send test loan application notification email');
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test loan notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}