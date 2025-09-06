# Cloudinary Integration Setup

This backend now uses Cloudinary for image storage instead of local file storage.

## Environment Variables

Add these to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Getting Cloudinary Credentials

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to your Dashboard
3. Copy the Cloud Name, API Key, and API Secret from the dashboard

## Testing the Integration

Run the test script to verify your Cloudinary setup:

```bash
npm run test:cloudinary
```

This will:
- Check if all environment variables are set
- Test uploading a small test image to Cloudinary
- Verify the upload was successful

## What Changed

### New Files
- `utils/cloudinary.js` - Cloudinary configuration and upload utilities
- `middleware/cloudinaryUpload.js` - Multer + Cloudinary upload middleware
- `utils/imageCleanup.js` - Image deletion utilities
- `test-cloudinary.js` - Test script for Cloudinary integration

### Updated Files
- `controllers/issues/createIssueController.js` - Now uses Cloudinary results
- `routes/issues.js` - Uses new Cloudinary upload middleware
- `models/Issue.js` - Added Cloudinary metadata fields
- `package.json` - Added test script

### How It Works

1. **File Upload**: Multer stores files in memory as buffers
2. **Cloudinary Upload**: Files are uploaded to Cloudinary with automatic optimization
3. **Database Storage**: Cloudinary URLs and metadata are stored in MongoDB
4. **Image Cleanup**: When issues are deleted, images are also removed from Cloudinary

### Benefits

- ✅ Images stored in the cloud (not local server)
- ✅ Automatic image optimization and format conversion
- ✅ CDN delivery for faster loading
- ✅ Automatic cleanup when issues are deleted
- ✅ Better scalability and reliability

## Troubleshooting

### Common Issues

1. **"Missing environment variables"**
   - Make sure all three Cloudinary variables are set in your `.env` file

2. **"Upload failed"**
   - Check your Cloudinary credentials
   - Verify your Cloudinary account is active
   - Check if you have upload permissions

3. **"Invalid credentials"**
   - Double-check your API key and secret
   - Make sure there are no extra spaces in your `.env` file

### Testing Your Setup

```bash
# Test Cloudinary configuration
npm run test:cloudinary

# Start the server
npm run dev
```

The server will now upload all images to Cloudinary instead of the local `uploads` folder.
