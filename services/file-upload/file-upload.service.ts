import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
import { Storage } from '@google-cloud/storage';

export interface FileUploadOptions {
  subDirectory?: string; // e.g., 'documents', 'profiles', 'investments'
  fileName?: string; // Custom filename (optional)
  generateCdnUrl?: boolean; // Whether to generate CDN URL
  makePublic?: boolean; // Whether to make the file publicly accessible (default: false for security)
}

export interface FileUploadResult {
  fileName: string;
  filePath: string;
  fileUrl?: string;
  mimeType: string;
  size: number;
}

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly isProduction: boolean;
  private uploadDir: string; // Not readonly so we can use fallback if original path fails
  private readonly cdnBaseUrl: string;
  private readonly useGoogleCloudStorage: boolean;
  private readonly storage: Storage;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.isProduction = configService.get('NODE_ENV') === 'production';

    // Check if Google Cloud Storage should be used
    this.useGoogleCloudStorage = !!this.configService.get('GCS_BUCKET_NAME');
    this.bucketName = this.configService.get('GCS_BUCKET_NAME') || '';

    // Initialize Google Cloud Storage if configured
    if (this.useGoogleCloudStorage) {
      try {
        const projectId = this.configService.get('GCP_PROJECT_ID');
        const keyFilename = this.configService.get('GCP_KEY_FILE');

        this.storage = new Storage({
          projectId,
          ...(keyFilename && { keyFilename }), // Only set keyFilename if provided
        });

        this.logger.log(
          `Google Cloud Storage initialized with bucket: ${this.bucketName}`,
        );
      } catch (error) {
        this.logger.error('Failed to initialize Google Cloud Storage:', error);
        this.useGoogleCloudStorage = false;
      }
    }

    // Check if we're on Render platform - Render sets this env var automatically
    const isRenderPlatform = !!process.env.RENDER;

    // Get upload path from config with safe fallbacks for different environments
    let configuredUploadPath = this.configService.get('UPLOAD_PATH');

    // If we're on Render and the path looks like a cPanel path, ignore it
    if (
      isRenderPlatform &&
      configuredUploadPath &&
      configuredUploadPath.includes('/home/litefi/public_html')
    ) {
      this.logger.warn(
        'Detected cPanel path on Render platform. Using default Render-friendly path instead.',
      );
      configuredUploadPath = null; // Reset to use the default
    }

    // Set upload directory with proper fallbacks (for local development or fallback)
    this.uploadDir =
      configuredUploadPath ||
      (this.isProduction
        ? join(process.cwd(), 'public', 'uploads') // Use a relative path within app directory on Render
        : join(process.cwd(), 'uploads'));

    this.cdnBaseUrl =
      this.configService.get('CDN_BASE_URL') ||
      'https://storage.googleapis.com';

    this.logger.log(
      `File upload strategy: ${
        this.useGoogleCloudStorage ? 'Google Cloud Storage' : 'Local Storage'
      }`,
    );
    if (!this.useGoogleCloudStorage) {
      this.logger.log(`Using upload directory: ${this.uploadDir}`);

      // Ensure upload directory exists only if using local storage
      this.ensureDirectoryExists(this.uploadDir);
    }
  }

  /**
   * Upload a file to Google Cloud Storage or local storage
   */
  async uploadFile(
    file: Express.Multer.File,
    options: FileUploadOptions = {},
  ): Promise<FileUploadResult> {
    if (this.useGoogleCloudStorage) {
      return this.uploadToGoogleCloudStorage(file, options);
    } else {
      return this.uploadToLocalStorage(file, options);
    }
  }

  /**
   * Upload file to Google Cloud Storage
   */
  private async uploadToGoogleCloudStorage(
    file: Express.Multer.File,
    options: FileUploadOptions,
  ): Promise<FileUploadResult> {
    try {
      const {
        subDirectory = 'general',
        fileName,
        generateCdnUrl = true,
        makePublic = false, // Default to private for security
      } = options;

      // Generate unique filename if not provided
      const uniqueFileName =
        fileName || this.generateUniqueFileName(file.originalname);

      // Create file path with subdirectory
      const filePath = subDirectory
        ? `${subDirectory}/${uniqueFileName}`
        : uniqueFileName;

      this.logger.log(`Uploading file to GCS: ${filePath}`);

      // Get bucket reference
      const bucket = this.storage.bucket(this.bucketName);
      const gcsFile = bucket.file(filePath);

      // Upload file buffer to Google Cloud Storage
      await gcsFile.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname,
            uploadedAt: new Date().toISOString(),
          },
        },
        public: makePublic, // Use makePublic flag for security control
      });

      this.logger.log(`File uploaded successfully to GCS: ${filePath}`);

      // Generate URL based on access type
      let fileUrl: string | undefined;
      if (generateCdnUrl) {
        if (makePublic) {
          // Public URL for publicly accessible files
          fileUrl = `https://storage.googleapis.com/${this.bucketName}/${filePath}`;
        } else {
          // For private files, we'll generate signed URLs when needed
          // For now, return the path so we can generate signed URLs later
          fileUrl = `gs://${this.bucketName}/${filePath}`;
        }
      }

      return {
        fileName: uniqueFileName,
        filePath,
        fileUrl,
        mimeType: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file to GCS: ${error.message}`);
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Upload file to local storage (fallback)
   */
  private uploadToLocalStorage(
    file: Express.Multer.File,
    options: FileUploadOptions,
  ): Promise<FileUploadResult> {
    try {
      const {
        subDirectory = 'general',
        fileName,
        generateCdnUrl = true,
      } = options;

      // Create subdirectory if needed
      const dirPath = join(this.uploadDir, subDirectory);
      this.ensureDirectoryExists(dirPath);

      // Generate unique filename if not provided
      const uniqueFileName =
        fileName || this.generateUniqueFileName(file.originalname);

      // Full path to save the file
      const fullFilePath = join(dirPath, uniqueFileName);

      // Note: For local storage, Multer should handle the actual file saving
      // This method is primarily for generating the response

      // Generate file URL if requested
      const fileUrl = generateCdnUrl
        ? `${this.cdnBaseUrl}/uploads/${subDirectory}/${uniqueFileName}`
        : undefined;

      return Promise.resolve({
        fileName: uniqueFileName,
        filePath: fullFilePath,
        fileUrl,
        mimeType: file.mimetype,
        size: file.size,
      });
    } catch (error) {
      this.logger.error(`Local file upload error: ${error.message}`);
      return Promise.reject(
        new BadRequestException(`File upload failed: ${error.message}`),
      );
    }
  }

  /**
   * Generate a unique filename
   */
  private generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = extname(originalName);
    return `${timestamp}-${randomString}${ext}`;
  }

  /**
   * Ensure directory exists, create if not
   * Uses fallback directories if permission issues occur
   */
  private ensureDirectoryExists(dirPath: string): void {
    if (!existsSync(dirPath)) {
      try {
        mkdirSync(dirPath, { recursive: true });
        this.logger.log(`Created directory: ${dirPath}`);
      } catch (error) {
        // Check if it's a permission error or path issue
        if (error.code === 'EACCES' || error.code === 'EPERM') {
          this.logger.warn(
            `Permission denied creating directory ${dirPath}. Attempting fallback to application-relative path.`,
          );

          // Try to use a fallback directory
          try {
            // Create an app-relative path as fallback
            const fallbackPath = join(process.cwd(), 'uploads');
            mkdirSync(fallbackPath, { recursive: true });

            // Update the upload directory to use this fallback path
            this.uploadDir = fallbackPath;
            this.logger.log(`Using fallback upload directory: ${fallbackPath}`);

            return; // Successfully created fallback directory
          } catch (fallbackError) {
            this.logger.error(
              `Failed to create fallback directory: ${fallbackError.message}`,
            );
            throw new Error(
              `Cannot create upload directory or fallback. File uploads will not work: ${error.message}`,
            );
          }
        }

        this.logger.error(
          `Failed to create directory ${dirPath}: ${error.message}`,
        );
        throw error;
      }
    }
  }

  /**
   * Generate a signed URL for accessing a private file
   */
  async generateSignedUrl(
    filePath: string,
    expirationMinutes: number = 60,
  ): Promise<string> {
    if (!this.useGoogleCloudStorage) {
      throw new BadRequestException(
        'Signed URLs are only available with Google Cloud Storage',
      );
    }

    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(filePath);

      // Generate a signed URL that expires in the specified minutes
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expirationMinutes * 60 * 1000, // Convert minutes to milliseconds
      });

      return signedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${error.message}`);
      throw new BadRequestException(
        `Failed to generate access URL: ${error.message}`,
      );
    }
  }
}
