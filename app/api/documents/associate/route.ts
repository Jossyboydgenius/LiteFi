import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/jwt';
import { z } from 'zod';

const associateSchema = z.object({
  applicationId: z.string(),
  documentType: z.enum([
    'GOVERNMENT_ID',
    'UTILITY_BILL', 
    'WORK_ID',
    'CAC_CERTIFICATE',
    'CAC_DOCUMENTS',
    'SELFIE',
    'OTHER'
  ]),
  cloudinaryUrl: z.string().url(),
  cloudinaryPublicId: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string()
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

    // Check if document already exists for this application and document type
    const existingDocument = await prisma.document.findFirst({
      where: {
        applicationId: loanApplication.id,
        documentType: validatedData.documentType,
      },
    });

    let document;
    if (existingDocument) {
      // Update existing document
      document = await prisma.document.update({
        where: { id: existingDocument.id },
        data: {
          fileName: validatedData.fileName,
          filePath: validatedData.cloudinaryUrl,
          fileSize: validatedData.fileSize,
          mimeType: validatedData.mimeType,
          cloudinaryPublicId: validatedData.cloudinaryPublicId,
        },
      });
    } else {
      // Create new document record
      document = await prisma.document.create({
        data: {
          applicationId: loanApplication.id,
          documentType: validatedData.documentType,
          fileName: validatedData.fileName,
          filePath: validatedData.cloudinaryUrl,
          fileSize: validatedData.fileSize,
          mimeType: validatedData.mimeType,
          cloudinaryPublicId: validatedData.cloudinaryPublicId,
        },
      });
    }

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: 'Internal server error', message: `Failed to associate document: ${errorMessage}` },
      { status: 500 }
    );
  }
}