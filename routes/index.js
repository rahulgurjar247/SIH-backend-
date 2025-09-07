import express from 'express';
import authRoutes from './auth.js';
import issueRoutes from './issues.js';
import adminRoutes from './admin.js';
import notificationRoutes from './notifications.js';
import analyticsRoutes from './analytics.js';
import userRoutes from './users.js';
import departmentRoutes from './departments.js';
import locationRoutes from './locations.js';

const router = express.Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/issues', issueRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/locations', locationRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
