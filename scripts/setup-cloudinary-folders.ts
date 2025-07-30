import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Configure Cloudinary with new production credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Create folder structure in Cloudinary by uploading placeholder files
 * Cloudinary creates folders when files are uploaded to them
 */
async function createCloudinaryFolders() {
  console.log('Setting up Cloudinary folder structure...');
  console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
  
  const folders = [
    'litefi/temp',
    'litefi/documents',
    'litefi/profiles'
  ];

  // Create a simple placeholder text content
  const placeholderContent = 'This is a placeholder file to create the folder structure';
  const buffer = Buffer.from(placeholderContent, 'utf-8');

  try {
    for (const folder of folders) {
      console.log(`Creating folder: ${folder}`);
      
      try {
        // Upload a placeholder file to create the folder
        const result = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: folder,
              public_id: 'placeholder',
              resource_type: 'raw',
              use_filename: false,
              unique_filename: false,
              overwrite: true,
            },
            (error: any, result: any) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          
          uploadStream.end(buffer);
        });
        
        console.log(`✅ Folder created: ${folder}`);
        console.log(`   Placeholder file URL: ${result.secure_url}`);
        
        // Optional: Delete the placeholder file after folder creation
        // await cloudinary.uploader.destroy(result.public_id, { resource_type: 'raw' });
        // console.log(`   Placeholder file deleted`);
        
      } catch (error) {
        console.error(`❌ Failed to create folder ${folder}:`, error);
      }
    }
    
    console.log('\n🎉 Cloudinary folder structure setup completed!');
    console.log('\nFolders created:');
    folders.forEach(folder => console.log(`  - ${folder}`));
    
  } catch (error) {
    console.error('Error setting up Cloudinary folders:', error);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  createCloudinaryFolders()
    .then(() => {
      console.log('\nSetup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

export { createCloudinaryFolders };