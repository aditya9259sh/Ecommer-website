const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getUserAddresses,
  getUserOrdersSummary,
  updateUserPreferences,
  deleteUserAccount
} = require('../controllers/userController');

const { protect } = require('../middleware/auth');

// All user routes require authentication
router.use(protect);

// Profile management
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.put('/change-password', changePassword);
router.delete('/account', deleteUserAccount);

// Address management
router.get('/addresses', getUserAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);
router.put('/addresses/:addressId/default', setDefaultAddress);

// User data
router.get('/orders-summary', getUserOrdersSummary);
router.put('/preferences', updateUserPreferences);

module.exports = router;
