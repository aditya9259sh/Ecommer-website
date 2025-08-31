const express = require('express');
const router = express.Router();
const {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
  checkWishlistItem
} = require('../controllers/wishlistController');

const { protect } = require('../middleware/auth');

// All wishlist routes require authentication
router.use(protect);

router.get('/', getUserWishlist);
router.post('/', addToWishlist);
router.delete('/:itemId', removeFromWishlist);
router.delete('/', clearWishlist);
router.post('/move-to-cart', moveToCart);
router.get('/check/:productId', checkWishlistItem);

module.exports = router;
