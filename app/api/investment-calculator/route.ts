import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const investmentCalculationSchema = z.object({
  investmentAmount: z.number().positive('Investment amount must be positive'),
  interestRatePerMonth: z.number().positive('Interest rate must be positive').max(100, 'Interest rate cannot exceed 100%'),
  tenureMonths: z.number().positive('Tenure must be positive').int('Tenure must be a whole number'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = investmentCalculationSchema.parse(body);
    
    const { investmentAmount, interestRatePerMonth, tenureMonths } = validatedData;
    
    // Calculate investment returns based on the provided formula
    // Total Interest Amount = Total Interest Percentage * Investment Amount
    // A = Investment Amount, B = Interest Rate Per month, C = Tenure (Months)
    // Total Interest = A * B * C = D
    const totalInterest = investmentAmount * (interestRatePerMonth / 100) * tenureMonths;
    
    // Withholding Tax (10%) = D * 10% = E
    const withholdingTax = totalInterest * 0.10;
    
    // Actual Payout = D - E = F
    const actualPayout = totalInterest - withholdingTax;
    
    // Total amount (principal + actual payout)
    const totalAmount = investmentAmount + actualPayout;
    
    return NextResponse.json({
      success: true,
      calculation: {
        principalAmount: investmentAmount,
        interestRatePerMonth,
        tenureMonths,
        totalInterest,
        withholdingTax,
        actualPayout,
        totalAmount,
        // Formatted versions for display
        formattedPrincipal: investmentAmount.toLocaleString(),
        formattedTotalInterest: totalInterest.toLocaleString(),
        formattedWithholdingTax: withholdingTax.toLocaleString(),
        formattedActualPayout: actualPayout.toLocaleString(),
        formattedTotalAmount: totalAmount.toLocaleString(),
      },
    }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Investment calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}