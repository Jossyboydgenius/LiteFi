import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/jwt';
import { Storage } from '@google-cloud/storage';
import { z } from 'zod';

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);

const associateSchema = z.object({
  applicationId: z.string(),
  tempFilePath: z.string(),
  documentType: z.enum([
    'GOVERNMENT_ID',
    'UTILITY_BILL',
    'WORK_ID',
    'CAC_CERTIFICATE',
    'CAC_DOCUMENTS',
    'SELFIE'
  ]),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
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

    const body = await request.json();
    const validatedData = associateSchema.parse(body);

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

    // Move file from temp folder to permanent location
    const tempFile = bucket.file(validatedData.tempFilePath);
    const permanentPath = validatedData.tempFilePath.replace('temp/', `applications/${validatedData.applicationId}/`);
    const permanentFile = bucket.file(permanentPath);

    // Copy file to permanent location
    await tempFile.copy(permanentFile);
    
    // Delete temporary file
    await tempFile.delete();

    // Save document record to database
    const document = await prisma.document.create({
      data: {
        applicationId: loanApplication.id,
        documentType: validatedData.documentType,
        fileName: validatedData.fileName,
        filePath: permanentPath,
        fileSize: validatedData.fileSize,
        mimeType: validatedData.mimeType,
      },
    });

    return NextResponse.json({
      success: true,
      document,
      message: 'Document associated successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Associate document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}