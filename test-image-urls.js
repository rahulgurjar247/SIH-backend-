import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Issue from './models/Issue.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Test function to check image URLs in the database
const testImageUrls = async () => {
  try {
    console.log('🔍 Checking image URLs in database...\n');
    
    // Get all issues with images
    const issues = await Issue.find({ 
      images: { $exists: true, $not: { $size: 0 } } 
    }).limit(5);
    
    if (issues.length === 0) {
      console.log('⚠️ No issues with images found in database');
      return;
    }
    
    console.log(`📊 Found ${issues.length} issues with images:\n`);
    
    issues.forEach((issue, index) => {
      console.log(`Issue ${index + 1}: ${issue.title}`);
      console.log(`  ID: ${issue._id}`);
      console.log(`  Images (${issue.images.length}):`);
      
      issue.images.forEach((image, imgIndex) => {
        console.log(`    Image ${imgIndex + 1}:`);
        console.log(`      URL: ${image.url}`);
        console.log(`      Public ID: ${image.publicId || 'N/A'}`);
        console.log(`      Dimensions: ${image.width || 'N/A'}x${image.height || 'N/A'}`);
        console.log(`      Format: ${image.format || 'N/A'}`);
        console.log(`      Size: ${image.bytes ? Math.round(image.bytes / 1024) + 'KB' : 'N/A'}`);
        
        // Check if URL is a valid Cloudinary URL
        const isCloudinaryUrl = image.url.includes('cloudinary.com') || image.url.includes('res.cloudinary.com');
        console.log(`      ✅ Cloudinary URL: ${isCloudinaryUrl ? 'YES' : 'NO'}`);
        
        // Check if URL is HTTPS
        const isHttps = image.url.startsWith('https://');
        console.log(`      🔒 HTTPS URL: ${isHttps ? 'YES' : 'NO'}`);
        
        console.log('');
      });
      
      console.log('---\n');
    });
    
    // Test API response format
    console.log('🧪 Testing API response format...\n');
    
    const sampleIssue = issues[0];
    const issueObj = sampleIssue.toObject();
    
    console.log('Sample API response structure:');
    console.log(JSON.stringify({
      success: true,
      data: {
        _id: issueObj._id,
        title: issueObj.title,
        images: issueObj.images.map(img => ({
          url: img.url,
          publicId: img.publicId,
          width: img.width,
          height: img.height,
          format: img.format,
          bytes: img.bytes
        }))
      }
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing image URLs:', error);
  }
};

// Main test function
const runTest = async () => {
  console.log('🚀 Starting Image URL Test\n');
  
  await connectDB();
  await testImageUrls();
  
  console.log('✅ Image URL test completed!');
  process.exit(0);
};

// Run the test
runTest().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
