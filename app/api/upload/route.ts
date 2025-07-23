import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/jwt';
import { uploadFile } from '@/lib/storage';
import { z } from 'zod';

// File type validation function
function validateFileType(mimeType: string, documentType: string): { valid: boolean; message: string } {
  const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  // For selfie, only allow images
  if (documentType === 'SELFIE') {
    if (imageTypes.includes(mimeType)) {
      return { valid: true, message: '' };
    }
    return { valid: false, message: 'Selfie must be an image file (JPEG, PNG, WebP)' };
  }
  
  // For other documents, allow both images and document types
  const allAllowedTypes = [...imageTypes, ...documentTypes];
  if (allAllowedTypes.includes(mimeType)) {
    return { valid: true, message: '' };
  }
  
  return { 
    valid: false, 
    message: 'Invalid file type. Please upload images (JPEG, PNG, WebP) or documents (PDF, DOC, DOCX)' 
  };
}

const uploadSchema = z.object({
  applicationId: z.string().optional(),
  documentType: z.enum([
    'GOVERNMENT_ID',
    'UTILITY_BILL',
    'WORK_ID',
    'CAC_CERTIFICATE',
    'CAC_DOCUMENTS',
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

    // For temporary uploads without application ID
    if (!applicationId) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size must be less than 10MB' },
          { status: 400 }
        );
      }

      // Validate file type based on document type
      const isValidFileType = validateFileType(file.type, documentType);
      if (!isValidFileType.valid) {
        return NextResponse.json(
          { error: isValidFileType.message },
          { status: 400 }
        );
      }

      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Upload to Cloudinary in temp folder
      // This will use the temp/ folder structure we've implemented
      const uploadResult = await uploadFile(buffer, file.name, file.type, 'temp');
      console.log(`Temporary file uploaded to: ${uploadResult.filePath}`);

      return NextResponse.json({
        success: true,
        tempFile: {
          fileName: file.name,
          filePath: uploadResult.filePath,
          fileSize: file.size,
          mimeType: file.type,
          documentType
        },
        message: 'File uploaded temporarily',
      }, { status: 201 });
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

    // Validate file type based on document type
    const isValidFileType = validateFileType(file.type, documentType);
    if (!isValidFileType.valid) {
      return NextResponse.json(
        { error: isValidFileType.message },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary with appropriate folder structure
    // Map document type to appropriate folder
    let folder: string;
    
    // Use the document type to determine the appropriate folder
    switch (documentType) {
      case 'SELFIE':
        folder = 'profiles';
        break;
      case 'GOVERNMENT_ID':
      case 'UTILITY_BILL':
      case 'WORK_ID':
        folder = 'documents';
        break;
      case 'CAC_CERTIFICATE':
      case 'CAC_DOCUMENTS':
        folder = 'documents/business';
        break;
      default:
        folder = 'documents/general';
    }
    
    const uploadResult = await uploadFile(buffer, file.name, file.type, folder);
    console.log(`Permanent file uploaded to: ${uploadResult.filePath}`);

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
    
    // Add more detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorString = error instanceof Error ? error.toString() : String(error);
    
    // Check for specific error types to provide better user feedback
    if (errorString.includes('ENOENT') || errorString.includes('mkdir') || errorString.includes('no such file or directory')) {
      return NextResponse.json(
        { error: 'Internal server error', message: 'Failed to upload file: Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }
    
    if (errorString.includes('Cloudinary') || errorString.includes('upload service')) {
      return NextResponse.json(
        { error: 'Internal server error', message: 'Failed to upload file: Upload service is temporarily unavailable. Please try again later.' },
        { status: 500 }
      );
    }
    
    // Check if it's a storage-related error
    if (errorString.includes('storage')) {
      return NextResponse.json(
        { error: 'Internal server error', message: 'Failed to upload file: Storage error. Please try again or contact support.' },
        { status: 500 }
      );
    }
    
    // Check if it's a database-related error
    if (errorString.includes('prisma') || errorString.includes('database')) {
      return NextResponse.json(
        { error: 'Internal server error', message: 'Failed to upload file: Database error. Please try again.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', message: `Failed to upload file: ${errorMessage}` },
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