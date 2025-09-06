import { deleteFromCloudinary } from './cloudinary.js';

/**
 * Delete images from Cloudinary when an issue is deleted
 * @param {Array} images - Array of image objects with publicId
 * @returns {Promise<Object>} Cleanup result
 */
export const cleanupIssueImages = async (images) => {
  if (!images || images.length === 0) {
    return { success: true, deleted: 0, errors: [] };
  }

  const deletePromises = images
    .filter(img => img.publicId) // Only delete images with publicId
    .map(img => deleteFromCloudinary(img.publicId));

  try {
    const results = await Promise.all(deletePromises);
    const successful = results.filter(result => result.success).length;
    const errors = results.filter(result => !result.success);

    console.log(`🗑️ Cleaned up ${successful} images from Cloudinary`);
    
    return {
      success: errors.length === 0,
      deleted: successful,
      errors: errors.map(err => err.error)
    };
  } catch (error) {
    console.error('❌ Error cleaning up images:', error);
    return {
      success: false,
      deleted: 0,
      errors: [error.message]
    };
  }
};

/**
 * Delete a single image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteSingleImage = async (publicId) => {
  if (!publicId) {
    return { success: true, message: 'No publicId provided' };
  }

  try {
    const result = await deleteFromCloudinary(publicId);
    return result;
  } catch (error) {
    console.error('❌ Error deleting single image:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
