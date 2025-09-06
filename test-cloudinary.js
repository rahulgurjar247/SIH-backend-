import dotenv from 'dotenv';
import { uploadToCloudinary } from './utils/cloudinary.js';

// Load environment variables
dotenv.config();

// Test Cloudinary configuration
const testCloudinaryConfig = () => {
  console.log('🔧 Testing Cloudinary Configuration...');
  
  const requiredEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY', 
    'CLOUDINARY_API_SECRET'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.log('\n📝 Please add these to your .env file:');
    console.log('CLOUDINARY_CLOUD_NAME=your_cloud_name');
    console.log('CLOUDINARY_API_KEY=your_api_key');
    console.log('CLOUDINARY_API_SECRET=your_api_secret');
    return false;
  }
  
  console.log('✅ All Cloudinary environment variables are set');
  console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY.substring(0, 8)}...`);
  console.log(`   API Secret: ${process.env.CLOUDINARY_API_SECRET.substring(0, 8)}...`);
  
  return true;
};

// Test upload with a simple image buffer (1x1 pixel PNG)
const testUpload = async () => {
  console.log('\n📤 Testing Cloudinary upload...');
  
  // Create a minimal 1x1 pixel PNG buffer for testing
  const testImageBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // bit depth, color type, etc.
    0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
  ]);
  
  try {
    const result = await uploadToCloudinary(testImageBuffer, 'test-uploads', 'test-image');
    
    if (result.success) {
      console.log('✅ Upload successful!');
      console.log(`   URL: ${result.secure_url}`);
      console.log(`   Public ID: ${result.public_id}`);
      console.log(`   Dimensions: ${result.width}x${result.height}`);
      console.log(`   Format: ${result.format}`);
      console.log(`   Size: ${result.bytes} bytes`);
    } else {
      console.error('❌ Upload failed:', result.error);
    }
    
    return result.success;
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    return false;
  }
};

// Main test function
const runTest = async () => {
  console.log('🚀 Starting Cloudinary Integration Test\n');
  
  // Test configuration
  const configOk = testCloudinaryConfig();
  if (!configOk) {
    process.exit(1);
  }
  
  // Test upload
  const uploadOk = await testUpload();
  
  if (uploadOk) {
    console.log('\n🎉 Cloudinary integration test passed!');
    console.log('✅ Your backend is ready to upload images to Cloudinary');
  } else {
    console.log('\n❌ Cloudinary integration test failed!');
    console.log('Please check your Cloudinary credentials and try again');
    process.exit(1);
  }
};

// Run the test
runTest().catch(error => {
  console.error('❌ Test failed with error:', error);
  process.exit(1);
});
