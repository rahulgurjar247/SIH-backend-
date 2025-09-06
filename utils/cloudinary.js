import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} folder - Cloudinary folder path
 * @param {string} publicId - Optional public ID
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadToCloudinary = async (fileBuffer, folder = 'civic-issues', publicId = null) => {
  try {
    const uploadOptions = {
      folder: folder,
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${fileBuffer.toString('base64')}`,
      uploadOptions
    );

    return {
      success: true,
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array} files - Array of file objects with buffer property
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<Array>} Array of upload results
 */
export const uploadMultipleToCloudinary = async (files, folder = 'civic-issues') => {
  const uploadPromises = files.map((file, index) => {
    const publicId = `${folder}/${Date.now()}-${index}`;
    return uploadToCloudinary(file.buffer, folder, publicId);
  });

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple Cloudinary upload error:', error);
    return files.map(() => ({
      success: false,
      error: error.message,
    }));
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result.result,
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get Cloudinary URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} Transformed URL
 */
export const getCloudinaryUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, options);
};

export default cloudinary;
