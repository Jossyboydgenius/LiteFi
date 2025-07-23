import { v2 as cloudinary } from 'cloudinary';
import { nanoid } from 'nanoid';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dxbizi45p',
  api_key: process.env.CLOUDINARY_API_KEY || '576182982358129',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'i6smsA5wOP2KoPg_fNqOBOvBkOU',
});

export interface CloudinaryUploadResult {
  fileName: string;
  filePath: string;
  publicUrl: string;
  fileSize: number;
  cloudinaryPublicId: string;
}

/**
 * Upload a file to Cloudinary
 * @param file - File buffer
 * @param originalName - Original file name
 * @param mimeType - File MIME type
 * @param folder - Optional folder path
 * @returns Upload result with file details
 */
export async function uploadToCloudinary(
  file: Buffer,
  originalName: string,
  mimeType: string,
  folder?: string
): Promise<CloudinaryUploadResult> {
  try {
    // Generate unique filename
    const fileExtension = originalName.split('.').pop();
    const uniqueId = nanoid(10);
    const fileName = `${uniqueId}.${fileExtension}`;
    
    // Organize files in folders similar to GCS structure
    let cloudinaryFolder: string;
    
    if (folder === 'temp') {
      cloudinaryFolder = 'litefi/temp';
    } else if (folder === 'documents' || folder === 'profiles' || folder === 'investments') {
      cloudinaryFolder = `litefi/${folder}`;
    } else if (folder) {
      cloudinaryFolder = `litefi/documents/${folder}`;
    } else {
      cloudinaryFolder = 'litefi/documents/general';
    }
    
    // Determine resource type based on MIME type
    const isImage = mimeType.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';
    
    console.log(`Uploading file to Cloudinary: ${fileName}`);
    console.log(`Folder: ${cloudinaryFolder}`);
    console.log(`Resource type: ${resourceType}`);
    console.log(`File size: ${file.length} bytes`);
    console.log(`MIME type: ${mimeType}`);
    
    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: cloudinaryFolder,
          public_id: uniqueId,
          resource_type: resourceType,
          use_filename: false,
          unique_filename: true,
          overwrite: false,
          // For documents, preserve original format
          format: isImage ? undefined : fileExtension,
        },
        (error: any, result: any) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      
      uploadStream.end(file);
    });
    
    console.log(`File uploaded successfully to Cloudinary: ${uploadResult.public_id}`);
    console.log(`Cloudinary URL: ${uploadResult.secure_url}`);
    
    return {
      fileName: originalName,
      filePath: `${cloudinaryFolder}/${uniqueId}`,
      publicUrl: uploadResult.secure_url,
      fileSize: file.length,
      cloudinaryPublicId: uploadResult.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload file to Cloudinary: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Delete a file from Cloudinary
 * @param publicId - Cloudinary public ID
 * @param resourceType - Resource type ('image' or 'raw')
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'raw' = 'raw'
): Promise<void> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    
    if (result.result === 'ok') {
      console.log(`File ${publicId} deleted successfully from Cloudinary`);
    } else {
      console.warn(`Failed to delete file ${publicId} from Cloudinary:`, result);
    }
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw new Error(`Failed to delete file from Cloudinary: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Move a file from one folder to another in Cloudinary
 * @param sourcePublicId - Source public ID
 * @param targetFolder - Target folder
 * @param resourceType - Resource type ('image' or 'raw')
 */
export async function moveFileInCloudinary(
  sourcePublicId: string,
  targetFolder: string,
  resourceType: 'image' | 'raw' = 'raw'
): Promise<string> {
  try {
    // Extract the filename from the source public ID
    const filename = sourcePublicId.split('/').pop();
    const newPublicId = `${targetFolder}/${filename}`;
    
    // Rename (move) the file
    const result = await cloudinary.uploader.rename(sourcePublicId, newPublicId, {
      resource_type: resourceType,
    });
    
    console.log(`File moved from ${sourcePublicId} to ${newPublicId}`);
    return result.public_id;
  } catch (error) {
    console.error('Error moving file in Cloudinary:', error);
    throw new Error(`Failed to move file in Cloudinary: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export default cloudinary;