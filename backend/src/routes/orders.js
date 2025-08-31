const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderTracking,
  getAllOrders
} = require('../controllers/orderController');

const { protect, admin } = require('../middleware/auth');

// User routes (authenticated)
router.use(protect);

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.get('/:id/tracking', getOrderTracking);

// Admin routes
router.get('/admin/all', admin, getAllOrders);
router.put('/:id/status', admin, updateOrderStatus);

module.exports = router;
