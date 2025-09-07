import express from 'express';
import {
  getLocationsByType,
  getLocationHierarchy,
  getLocationContainingPoint,
  getLocationById,
  getAllLocations
} from '../controllers/locations/locationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/type/:type', getLocationsByType);
router.get('/hierarchy', getLocationHierarchy);
router.get('/containing', getLocationContainingPoint);
router.get('/:id', getLocationById);

// Protected routes (Admin only)
router.get('/', protect, getAllLocations);

export default router;
