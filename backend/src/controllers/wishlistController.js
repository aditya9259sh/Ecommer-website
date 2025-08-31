const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const logger = require('../utils/logger');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getUserWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('items.product', 'name price images stockQuantity averageRating totalReviews');

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, items: [] });
      await wishlist.save();
    }

    res.json({
      success: true,
      data: {
        items: wishlist.items,
        itemCount: wishlist.items.length
      }
    });
  } catch (error) {
    logger.error('Error getting user wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add item to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
  try {
    const { productId, variant } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, items: [] });
    }

    // Check if product already exists in wishlist
    const existingItem = wishlist.items.find(
      item => item.product.toString() === productId && 
              (!variant || item.variant === variant)
    );

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Product already exists in wishlist'
      });
    }

    // Add new item
    wishlist.items.push({
      product: productId,
      variant: variant || null,
      addedAt: Date.now()
    });

    await wishlist.save();

    // Populate product details for response
    await wishlist.populate('items.product', 'name price images stockQuantity averageRating totalReviews');

    res.status(201).json({
      success: true,
      message: 'Item added to wishlist successfully',
      data: {
        items: wishlist.items,
        itemCount: wishlist.items.length
      }
    });
  } catch (error) {
    logger.error('Error adding item to wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:itemId
// @access  Private
const removeFromWishlist = async (req, res) => {
  try {
    const { itemId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    const itemIndex = wishlist.items.findIndex(
      item => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found'
      });
    }

    wishlist.items.splice(itemIndex, 1);
    await wishlist.save();

    // Populate product details for response
    await wishlist.populate('items.product', 'name price images stockQuantity averageRating totalReviews');

    res.json({
      success: true,
      message: 'Item removed from wishlist successfully',
      data: {
        items: wishlist.items,
        itemCount: wishlist.items.length
      }
    });
  } catch (error) {
    logger.error('Error removing item from wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Clear user wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    wishlist.items = [];
    await wishlist.save();

    res.json({
      success: true,
      message: 'Wishlist cleared successfully',
      data: {
        items: [],
        itemCount: 0
      }
    });
  } catch (error) {
    logger.error('Error clearing wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Move wishlist items to cart
// @route   POST /api/wishlist/move-to-cart
// @access  Private
const moveToCart = async (req, res) => {
  try {
    const { itemIds } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide item IDs to move'
      });
    }

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Get items to move
    const itemsToMove = wishlist.items.filter(
      item => itemIds.includes(item._id.toString())
    );

    if (itemsToMove.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid items found to move'
      });
    }

    // Remove items from wishlist
    wishlist.items = wishlist.items.filter(
      item => !itemIds.includes(item._id.toString())
    );

    await wishlist.save();

    // Populate product details for response
    await wishlist.populate('items.product', 'name price images stockQuantity averageRating totalReviews');

    res.json({
      success: true,
      message: `${itemsToMove.length} item(s) moved to cart successfully`,
      data: {
        items: wishlist.items,
        itemCount: wishlist.items.length,
        movedItems: itemsToMove
      }
    });
  } catch (error) {
    logger.error('Error moving items to cart:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
const checkWishlistItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.json({
        success: true,
        data: { isInWishlist: false }
      });
    }

    const isInWishlist = wishlist.items.some(
      item => item.product.toString() === productId
    );

    res.json({
      success: true,
      data: { isInWishlist }
    });
  } catch (error) {
    logger.error('Error checking wishlist item:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
  checkWishlistItem
};
