import { Storage } from '@google-cloud/storage'
import { nanoid } from 'nanoid'

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
})

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!)

export interface UploadResult {
  fileName: string
  filePath: string
  publicUrl: string
  fileSize: number
}

/**
 * Upload a file to Google Cloud Storage
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
    // Generate unique filename
    const fileExtension = originalName.split('.').pop()
    const uniqueId = nanoid(10)
    const fileName = `${uniqueId}.${fileExtension}`
    const filePath = folder ? `${folder}/${fileName}` : fileName
    
    // Create file reference
    const fileRef = bucket.file(filePath)
    
    // Upload file
    const stream = fileRef.createWriteStream({
      metadata: {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000', // 1 year cache
      },
      public: true, // Make file publicly accessible
    })
    
    return new Promise((resolve, reject) => {
      stream.on('error', (error: Error) => {
        console.error('Upload error:', error)
        reject(new Error(`Upload failed: ${error.message}`))
      })
      
      stream.on('finish', async () => {
        try {
          // Make file public
          await fileRef.makePublic()
          
          const publicUrl = `${process.env.CDN_BASE_URL}/${process.env.GCS_BUCKET_NAME}/${filePath}`
          
          resolve({
            fileName,
            filePath,
            publicUrl,
            fileSize: file.length,
          })
        } catch (error) {
          reject(error)
        }
      })
      
      stream.end(file)
    })
  } catch (error) {
    console.error('Storage upload error:', error)
    throw new Error(`Failed to upload file: ${error}`)
  }
}

/**
 * Delete a file from Google Cloud Storage
 * @param filePath - Path to the file in storage
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const fileRef = bucket.file(filePath)
    await fileRef.delete()
    console.log(`File ${filePath} deleted successfully`)
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
    const fileRef = bucket.file(filePath)
    const [signedUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresIn,
    })
    return signedUrl
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
    const fileRef = bucket.file(filePath)
    const [exists] = await fileRef.exists()
    return exists
  } catch (error) {
    console.error('File exists check error:', error)
    return false
  }
}