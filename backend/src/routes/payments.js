const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  createCheckoutSession,
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  getPaymentHistory,
  refundPayment
} = require('../controllers/paymentController');

const { protect, admin } = require('../middleware/auth');

// All payment routes require authentication
router.use(protect);

// Payment processing
router.post('/create-intent', createPaymentIntent);
router.post('/create-checkout-session', createCheckoutSession);

// Payment methods management
router.get('/methods', getPaymentMethods);
router.post('/methods', addPaymentMethod);
router.delete('/methods/:methodId', removePaymentMethod);
router.put('/methods/:methodId/default', setDefaultPaymentMethod);

// Payment history
router.get('/history', getPaymentHistory);

// Admin only
router.post('/:paymentIntentId/refund', admin, refundPayment);

module.exports = router;
