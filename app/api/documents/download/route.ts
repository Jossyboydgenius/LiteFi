import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, checkRole } from '@/lib/jwt';
import { prisma } from '@/lib/db';
import { getSignedUrl } from '@/lib/storage';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can download documents from console
    if (!checkRole(user, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Find the document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        application: {
          include: {
            user: true
          }
        }
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    try {
      // Check if using Cloudinary or local storage
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        // For Cloudinary, get signed URL
        const signedUrl = await getSignedUrl(document.filePath);
        
        // Redirect to the signed URL for download
        return NextResponse.redirect(signedUrl);
      } else {
        // For local storage, serve the file directly
        const filePath = path.join(process.cwd(), 'public', document.filePath);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
          return NextResponse.json(
            { error: 'File not found on server' },
            { status: 404 }
          );
        }

        // Read the file
        const fileBuffer = fs.readFileSync(filePath);
        
        // Set appropriate headers for download
        const headers = new Headers();
        headers.set('Content-Type', document.mimeType || 'application/octet-stream');
        headers.set('Content-Disposition', `attachment; filename="${document.fileName}"`);
        headers.set('Content-Length', fileBuffer.length.toString());
        
        return new NextResponse(fileBuffer, {
          status: 200,
          headers
        });
      }
    } catch (storageError) {
      console.error('Storage error:', storageError);
      return NextResponse.json(
        { error: 'Failed to retrieve file from storage' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}