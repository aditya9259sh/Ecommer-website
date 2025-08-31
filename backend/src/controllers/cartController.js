const Cart = require('../models/Cart');
const Product = require('../models/Product');
const logger = require('../utils/logger');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getUserCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name price images stockQuantity');

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    }

    // Check stock availability and update cart
    let hasStockIssues = false;
    for (let item of cart.items) {
      if (item.product && item.product.stockQuantity < item.quantity) {
        if (item.product.stockQuantity === 0) {
          item.quantity = 0;
        } else {
          item.quantity = item.product.stockQuantity;
        }
        hasStockIssues = true;
      }
    }

    if (hasStockIssues) {
      await cart.save();
    }

    // Calculate totals
    const totals = calculateCartTotals(cart.items);

    res.json({
      success: true,
      data: {
        items: cart.items,
        totals,
        itemCount: cart.items.length
      }
    });
  } catch (error) {
    logger.error('Error getting user cart:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, variant } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stockQuantity} items available in stock`
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && 
              (!variant || item.variant === variant)
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stockQuantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantity} more items. Only ${product.stockQuantity - cart.items[existingItemIndex].quantity} available`
        });
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].updatedAt = Date.now();
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        variant: variant || null,
        addedAt: Date.now(),
        updatedAt: Date.now()
      });
    }

    await cart.save();

    // Populate product details for response
    await cart.populate('items.product', 'name price images stockQuantity');

    const totals = calculateCartTotals(cart.items);

    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        items: cart.items,
        totals,
        itemCount: cart.items.length
      }
    });
  } catch (error) {
    logger.error('Error adding item to cart:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Check stock availability
      const product = await Product.findById(cart.items[itemIndex].product);
      if (product && product.stockQuantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stockQuantity} items available in stock`
        });
      }
      
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].updatedAt = Date.now();
    }

    await cart.save();

    // Populate product details for response
    await cart.populate('items.product', 'name price images stockQuantity');

    const totals = calculateCartTotals(cart.items);

    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: {
        items: cart.items,
        totals,
        itemCount: cart.items.length
      }
    });
  } catch (error) {
    logger.error('Error updating cart item:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    // Populate product details for response
    await cart.populate('items.product', 'name price images stockQuantity');

    const totals = calculateCartTotals(cart.items);

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        items: cart.items,
        totals,
        itemCount: cart.items.length
      }
    });
  } catch (error) {
    logger.error('Error removing item from cart:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Clear user cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        items: [],
        totals: { subtotal: 0, tax: 0, total: 0 },
        itemCount: 0
      }
    });
  } catch (error) {
    logger.error('Error clearing cart:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Move cart items to wishlist
// @route   POST /api/cart/move-to-wishlist
// @access  Private
const moveToWishlist = async (req, res) => {
  try {
    const { itemIds } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide item IDs to move'
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Get items to move
    const itemsToMove = cart.items.filter(
      item => itemIds.includes(item._id.toString())
    );

    if (itemsToMove.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid items found to move'
      });
    }

    // Remove items from cart
    cart.items = cart.items.filter(
      item => !itemIds.includes(item._id.toString())
    );

    await cart.save();

    // Populate product details for response
    await cart.populate('items.product', 'name price images stockQuantity');

    const totals = calculateCartTotals(cart.items);

    res.json({
      success: true,
      message: `${itemsToMove.length} item(s) moved to wishlist successfully`,
      data: {
        items: cart.items,
        totals,
        itemCount: cart.items.length,
        movedItems: itemsToMove
      }
    });
  } catch (error) {
    logger.error('Error moving items to wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Helper function to calculate cart totals
const calculateCartTotals = (items) => {
  const subtotal = items.reduce((total, item) => {
    if (item.product && item.product.price) {
      return total + (item.product.price * item.quantity);
    }
    return total;
  }, 0);

  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100
  };
};

module.exports = {
  getUserCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  moveToWishlist
};
