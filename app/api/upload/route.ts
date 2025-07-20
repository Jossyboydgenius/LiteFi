import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/jwt';
import { uploadFile } from '@/lib/storage';
import { z } from 'zod';

const uploadSchema = z.object({
  applicationId: z.string(),
  documentType: z.enum([
    'GOVERNMENT_ID',
    'UTILITY_BILL',
    'WORK_ID',
    'CAC_CERTIFICATE',
    'CAC_2_7',
    'SELFIE'
  ]),
});

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const applicationId = formData.get('applicationId') as string;
    const documentType = formData.get('documentType') as string;
    const isOptional = formData.get('isOptional') === 'true';

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // If file upload is optional and no file provided, return success
    if (!file && isOptional) {
      return NextResponse.json({
        success: true,
        message: 'File upload skipped (optional)',
        document: null,
      });
    }

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate form data
    const validatedData = uploadSchema.parse({
      applicationId,
      documentType,
    });

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images, PDF, and Word documents are allowed' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Google Cloud Storage
    const uploadResult = await uploadFile(buffer, file.name, file.type);

    // Find the loan application by applicationId to get the actual id
    const loanApplication = await prisma.loanApplication.findUnique({
      where: { applicationId: validatedData.applicationId },
    });

    if (!loanApplication) {
      return NextResponse.json(
        { error: 'Loan application not found' },
        { status: 404 }
      );
    }

    // Save document record to database
    const document = await prisma.document.create({
      data: {
        applicationId: loanApplication.id,
        documentType: validatedData.documentType,
        fileName: file.name,
        filePath: uploadResult.filePath,
        fileSize: file.size,
        mimeType: file.type,
      },
    });

    return NextResponse.json({
      success: true,
      document,
      message: 'File uploaded successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Fetch user's documents
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    const whereClause: any = {};
    if (applicationId) {
      whereClause.applicationId = applicationId;
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error('Fetch documents error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}