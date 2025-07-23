import { uploadToCloudinary, deleteFromCloudinary, moveFileInCloudinary, CloudinaryUploadResult } from './cloudinary'
import { nanoid } from 'nanoid'
import fs from 'fs'
import path from 'path'

// Check if Cloudinary is configured
const hasCloudinaryConfig = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_SECRET
const isDevelopment = process.env.NODE_ENV === 'development'

if (hasCloudinaryConfig) {
  console.log('Initialized Cloudinary for file uploads')
} else {
  console.log('Cloudinary not configured, using local storage fallback')
}

export interface UploadResult {
  fileName: string
  filePath: string
  publicUrl: string
  fileSize: number
}

/**
 * Upload a file to Google Cloud Storage or local storage (fallback)
 * @param file - File buffer
 * @param originalName - Original file name
 * @param mimeType - File MIME type
 * @param folder - Optional folder path
 * @returns Upload result with file details
 */
export async function uploadFile(
  file: Buffer,
  originalName: string,
  mimeType: string,
  folder?: string
): Promise<UploadResult> {
  try {
    console.log(`Uploading file: ${originalName}`);
    console.log(`File size: ${file.length} bytes`);
    console.log(`MIME type: ${mimeType}`);
    console.log(`Using Cloudinary: ${hasCloudinaryConfig ? 'Yes' : 'No (local fallback)'}`);
    
    // Use Cloudinary if configured, otherwise use local storage
    if (hasCloudinaryConfig) {
      try {
        const cloudinaryResult = await uploadToCloudinary(file, originalName, mimeType, folder);
        
        return {
          fileName: cloudinaryResult.fileName,
          filePath: cloudinaryResult.filePath,
          publicUrl: cloudinaryResult.publicUrl,
          fileSize: cloudinaryResult.fileSize,
        };
      } catch (error) {
        console.error('Cloudinary upload failed, falling back to local storage:', error);
        // Fall through to local storage
      }
    }
    
    // Fallback to local storage
    console.log('Using local storage fallback');
    
    // Generate unique filename for local storage
    const fileExtension = originalName.split('.').pop();
    const uniqueId = nanoid(10);
    const fileName = `${uniqueId}.${fileExtension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Use the same folder structure as Cloudinary
    let storagePath: string;
    if (folder === 'temp') {
      storagePath = 'temp';
    } else if (folder === 'documents' || folder === 'profiles' || folder === 'investments') {
      storagePath = folder;
    } else if (folder) {
      storagePath = `documents/${folder}`;
    } else {
      storagePath = 'documents/general';
    }
    
    const folderPath = path.join(uploadsDir, storagePath);
    
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    // Write file to local storage
    const localFilePath = path.join(folderPath, fileName);
    fs.writeFileSync(localFilePath, file);
    
    // Return result for local development
    const filePath = `${storagePath}/${fileName}`;
    const publicUrl = `/uploads/${filePath}`;
    
    console.log(`File uploaded successfully to local storage: ${localFilePath}`);
    console.log(`Public URL: ${publicUrl}`);
    
    return {
      fileName: originalName,
      filePath,
      publicUrl,
      fileSize: file.length,
    };
  } catch (error) {
    console.error('Storage upload error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Delete a file from Cloudinary or local storage
 * @param filePath - Path to the file in storage
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    if (hasCloudinaryConfig) {
      // Extract public ID from file path for Cloudinary
      const publicId = filePath.replace(/^litefi\//, 'litefi/')
      const isImage = filePath.includes('/profiles/') || filePath.includes('/images/')
      await deleteFromCloudinary(publicId, isImage ? 'image' : 'raw')
      console.log(`File ${filePath} deleted successfully from Cloudinary`)
    } else {
      // Delete from local storage
      const localFilePath = path.join(process.cwd(), 'public', 'uploads', filePath)
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath)
        console.log(`File ${filePath} deleted successfully from local storage`)
      }
    }
  } catch (error) {
    console.error('Delete error:', error)
    throw new Error(`Failed to delete file: ${error}`)
  }
}

/**
 * Get a signed URL for temporary file access
 * @param filePath - Path to the file in storage
 * @param expiresIn - Expiration time in milliseconds (default: 1 hour)
 */
export async function getSignedUrl(
  filePath: string,
  expiresIn: number = 3600000 // 1 hour
): Promise<string> {
  try {
    console.log(`Generating signed URL for file: ${filePath}`)
    
    if (hasCloudinaryConfig) {
      // For Cloudinary, files are already publicly accessible
      // We can generate a signed URL if needed, but for now return the public URL
      // Extract public ID from file path
      const publicId = filePath.replace(/^litefi\//, 'litefi/')
      const isImage = filePath.includes('/profiles/') || filePath.includes('/images/')
      const resourceType = isImage ? 'image' : 'raw'
      
      // Generate a simple URL (Cloudinary files are public by default)
      const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'dxbizi45p'}/${resourceType}/upload/${publicId}`
      console.log(`Generated Cloudinary URL: ${cloudinaryUrl}`)
      return cloudinaryUrl
    } else {
      // Return local URL for development
      const localUrl = `/uploads/${filePath}`
      console.log(`Generated local URL: ${localUrl}`)
      return localUrl
    }
  } catch (error) {
    console.error('Signed URL error:', error)
    throw new Error(`Failed to generate signed URL: ${error}`)
  }
}

/**
 * Check if a file exists in storage
 * @param filePath - Path to the file in storage
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    console.log(`Checking if file exists: ${filePath}`)
    
    if (hasCloudinaryConfig) {
      // For Cloudinary, we can check by making a HEAD request to the URL
      const publicId = filePath.replace(/^litefi\//, 'litefi/')
      const isImage = filePath.includes('/profiles/') || filePath.includes('/images/')
      const resourceType = isImage ? 'image' : 'raw'
      
      try {
        const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'dxbizi45p'}/${resourceType}/upload/${publicId}`
        const response = await fetch(cloudinaryUrl, { method: 'HEAD' })
        const exists = response.ok
        console.log(`Cloudinary file check result for ${filePath}: ${exists ? 'exists' : 'does not exist'}`)
        return exists
      } catch (fetchError) {
        console.log(`Cloudinary file check failed for ${filePath}: does not exist`)
        return false
      }
    } else {
      // Check local storage
      const localFilePath = path.join(process.cwd(), 'public', 'uploads', filePath)
      const exists = fs.existsSync(localFilePath)
      console.log(`Local file check result for ${localFilePath}: ${exists ? 'exists' : 'does not exist'}`)
      return exists
    }
  } catch (error) {
    console.error('File exists check error:', error)
    return false
  }
}

/**
 * Move a file from one location to another in storage
 * @param sourcePath - Source path of the file
 * @param destinationPath - Destination path for the file
 * @returns Boolean indicating success
 */
export async function moveFile(sourcePath: string, destinationPath: string): Promise<boolean> {
  try {
    console.log(`Moving file from ${sourcePath} to ${destinationPath}`);
    console.log(`Using Cloudinary: ${hasCloudinaryConfig ? 'Yes' : 'No (local fallback)'}`); 
    
    if (hasCloudinaryConfig) {
      // For Cloudinary, we use the rename/move functionality
      const sourcePublicId = sourcePath.replace(/^litefi\//, 'litefi/')
      const destinationFolder = destinationPath.substring(0, destinationPath.lastIndexOf('/'))
      const isImage = sourcePath.includes('/profiles/') || sourcePath.includes('/images/')
      const resourceType = isImage ? 'image' : 'raw'
      
      try {
        const newPublicId = await moveFileInCloudinary(sourcePublicId, destinationFolder, resourceType)
        console.log(`File moved from ${sourcePath} to ${destinationPath} in Cloudinary`);
        return true;
      } catch (moveError) {
        console.error('Error moving file in Cloudinary:', moveError);
        return false;
      }
    } else {
      // For local storage
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      const sourceFilePath = path.join(uploadsDir, sourcePath);
      const destinationFilePath = path.join(uploadsDir, destinationPath);
      
      console.log(`Local source path: ${sourceFilePath}`);
      console.log(`Local destination path: ${destinationFilePath}`);
      
      // Check if source file exists
      if (!fs.existsSync(sourceFilePath)) {
        console.error(`Source file ${sourceFilePath} does not exist in local storage`);
        return false;
      }
      
      // Create destination directory if it doesn't exist
      const destinationDir = path.dirname(destinationFilePath);
      if (!fs.existsSync(destinationDir)) {
        try {
          fs.mkdirSync(destinationDir, { recursive: true });
          console.log(`Created destination directory: ${destinationDir}`);
        } catch (mkdirError) {
          console.error('Error creating destination directory:', mkdirError);
          if (mkdirError instanceof Error) {
            console.error('Mkdir error message:', mkdirError.message);
            console.error('Mkdir error stack:', mkdirError.stack);
          }
          throw mkdirError;
        }
      }
      
      // Copy file to destination
      try {
        fs.copyFileSync(sourceFilePath, destinationFilePath);
        console.log(`File copied from ${sourceFilePath} to ${destinationFilePath} in local storage`);
      } catch (copyError) {
        console.error('Error copying file in local storage:', copyError);
        if (copyError instanceof Error) {
          console.error('Copy error message:', copyError.message);
          console.error('Copy error stack:', copyError.stack);
        }
        throw copyError;
      }
      
      // Delete source file
      try {
        fs.unlinkSync(sourceFilePath);
        console.log(`Source file ${sourceFilePath} deleted from local storage`);
      } catch (deleteError) {
        console.error('Error deleting source file in local storage:', deleteError);
        if (deleteError instanceof Error) {
          console.error('Delete error message:', deleteError.message);
          console.error('Delete error stack:', deleteError.stack);
        }
        // Continue even if delete fails - the copy was successful
        console.warn('Continuing despite delete failure - file was copied successfully');
      }
      
      return true;
    }
  } catch (error) {
    console.error('Move file error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
}