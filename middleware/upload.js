import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create date-based subdirectories
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const datePath = path.join(uploadDir, year.toString(), month, day);
    
    if (!fs.existsSync(datePath)) {
      fs.mkdirSync(datePath, { recursive: true });
    }
    
    cb(null, datePath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5 // Maximum 5 files
  },
  fileFilter: fileFilter
});

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field in file upload.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// Get file URL for frontend access
export const getFileUrl = (filePath) => {
  if (!filePath) return null;
  
  // Convert relative path to URL
  const relativePath = path.relative('./uploads', filePath);
  return `/uploads/${relativePath.replace(/\\/g, '/')}`;
};

// Delete file from filesystem
export const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      resolve();
      return;
    }
    
    fs.unlink(filePath, (error) => {
      if (error) {
        if (error.code === 'ENOENT') {
          // File doesn't exist, consider it deleted
          resolve();
        } else {
          reject(error);
        }
      } else {
        resolve();
      }
    });
  });
};


// Clean up old files (older than 30 days)
export const cleanupOldFiles = async (daysToKeep = 30) => {
  try {
    const uploadsDir = './uploads';
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const cleanupDirectory = (dirPath) => {
      if (!fs.existsSync(dirPath)) return;
      
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          // Check if directory name is a date (YYYY/MM/DD format)
          if (/^\d{4}$/.test(item)) {
            // Year directory
            const yearItems = fs.readdirSync(itemPath);
            yearItems.forEach(monthItem => {
              const monthPath = path.join(itemPath, monthItem);
              if (/^\d{2}$/.test(monthItem)) {
                // Month directory
                const monthStats = fs.statSync(monthPath);
                if (monthStats.birthtime < cutoffDate) {
                  fs.rmSync(monthPath, { recursive: true, force: true });
                  console.log(`Cleaned up old month directory: ${monthPath}`);
                }
              }
            });
            
            // Remove year directory if empty
            if (fs.readdirSync(itemPath).length === 0) {
              fs.rmdirSync(itemPath);
            }
          } else if (/^\d{2}$/.test(item)) {
            // Month directory (direct)
            const monthStats = fs.statSync(itemPath);
            if (monthStats.birthtime < cutoffDate) {
              fs.rmSync(itemPath, { recursive: true, force: true });
              console.log(`Cleaned up old month directory: ${itemPath}`);
            }
          }
        }
      });
    };
    
    cleanupDirectory(uploadsDir);
    console.log('File cleanup completed');
  } catch (error) {
    console.error('File cleanup error:', error);
  }
};

// Schedule cleanup to run daily
export const scheduleCleanup = () => {
  // Run cleanup every day at 2 AM
  const now = new Date();
  const nextRun = new Date(now);
  nextRun.setHours(2, 0, 0, 0);
  
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }
  
  const timeUntilNextRun = nextRun.getTime() - now.getTime();
  
  setTimeout(() => {
    cleanupOldFiles();
    // Schedule next run
    setInterval(cleanupOldFiles, 24 * 60 * 60 * 1000);
  }, timeUntilNextRun);
  
  console.log(`File cleanup scheduled for ${nextRun.toISOString()}`);
};

export { upload };
