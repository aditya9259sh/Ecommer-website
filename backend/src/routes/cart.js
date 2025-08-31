const express = require('express');
const router = express.Router();
const {
  getUserCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  moveToWishlist
} = require('../controllers/cartController');

const { protect } = require('../middleware/auth');

// All cart routes require authentication
router.use(protect);

router.get('/', getUserCart);
router.post('/', addToCart);
router.put('/:itemId', updateCartItem);
router.delete('/:itemId', removeFromCart);
router.delete('/', clearCart);
router.post('/move-to-wishlist', moveToWishlist);

module.exports = router;
