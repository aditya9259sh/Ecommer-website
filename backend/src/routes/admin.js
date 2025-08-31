const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getSystemAnalytics,
  getAdminNotifications,
  updateSystemSettings
} = require('../controllers/adminController');

const { protect, admin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

// Dashboard and analytics
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getSystemAnalytics);
router.get('/notifications', getAdminNotifications);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// System settings
router.put('/settings', updateSystemSettings);

module.exports = router;
