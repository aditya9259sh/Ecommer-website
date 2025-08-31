const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  attributes: [{
    name: String,
    value: String,
  }],
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  coupon: {
    code: String,
    discount: Number,
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
    },
  },
  notes: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for total items count
cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for subtotal
cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Virtual for total with discount
cartSchema.virtual('total').get(function() {
  let total = this.subtotal;
  
  if (this.coupon && this.coupon.discount) {
    if (this.coupon.type === 'percentage') {
      total = total * (1 - this.coupon.discount / 100);
    } else {
      total = Math.max(0, total - this.coupon.discount);
    }
  }
  
  return Math.round(total * 100) / 100;
});

// Virtual for discount amount
cartSchema.virtual('discountAmount').get(function() {
  if (!this.coupon || !this.coupon.discount) return 0;
  
  if (this.coupon.type === 'percentage') {
    return this.subtotal * (this.coupon.discount / 100);
  } else {
    return Math.min(this.coupon.discount, this.subtotal);
  }
});

// Virtual for is empty
cartSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

// Indexes for better query performance
cartSchema.index({ user: 1 });
cartSchema.index({ 'items.product': 1 });
cartSchema.index({ lastUpdated: -1 });

// Pre-save middleware to update lastUpdated
cartSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Static method to get cart by user
cartSchema.statics.getCartByUser = function(userId) {
  return this.findOne({ user: userId, isActive: true })
    .populate('items.product', 'name price images stock isActive')
    .populate('items.variant', 'name price stock');
};

// Static method to get cart summary
cartSchema.statics.getCartSummary = function(userId) {
  return this.findOne({ user: userId, isActive: true })
    .select('items')
    .populate('items.product', 'name price images stock isActive');
};

// Instance method to add item to cart
cartSchema.methods.addItem = function(productId, quantity = 1, variantId = null, attributes = []) {
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() && 
    item.variant?.toString() === variantId?.toString()
  );

  if (existingItemIndex > -1) {
    // Update existing item quantity
    this.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    this.items.push({
      product: productId,
      variant: variantId,
      quantity,
      attributes,
    });
  }

  return this.save();
};

// Instance method to update item quantity
cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const itemIndex = this.items.findIndex(item => item._id.toString() === itemId);
  
  if (itemIndex > -1) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      this.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      this.items[itemIndex].quantity = quantity;
    }
    return this.save();
  }
  
  throw new Error('Item not found in cart');
};

// Instance method to remove item from cart
cartSchema.methods.removeItem = function(itemId) {
  this.items = this.items.filter(item => item._id.toString() !== itemId);
  return this.save();
};

// Instance method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.coupon = null;
  this.notes = '';
  return this.save();
};

// Instance method to apply coupon
cartSchema.methods.applyCoupon = function(couponCode, discount, type) {
  this.coupon = {
    code: couponCode,
    discount,
    type,
  };
  return this.save();
};

// Instance method to remove coupon
cartSchema.methods.removeCoupon = function() {
  this.coupon = null;
  return this.save();
};

// Instance method to check if product is in cart
cartSchema.methods.hasProduct = function(productId, variantId = null) {
  return this.items.some(item => 
    item.product.toString() === productId.toString() && 
    item.variant?.toString() === variantId?.toString()
  );
};

// Instance method to get item by product
cartSchema.methods.getItemByProduct = function(productId, variantId = null) {
  return this.items.find(item => 
    item.product.toString() === productId.toString() && 
    item.variant?.toString() === variantId?.toString()
  );
};

// Instance method to validate cart items
cartSchema.methods.validateItems = async function() {
  const Product = mongoose.model('Product');
  const errors = [];
  
  for (const item of this.items) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      errors.push(`Product ${item.product} not found`);
      continue;
    }
    
    if (!product.isActive) {
      errors.push(`Product ${product.name} is not available`);
      continue;
    }
    
    if (product.stock < item.quantity) {
      errors.push(`Insufficient stock for ${product.name}`);
      continue;
    }
    
    // Check if price has changed
    if (product.price !== item.price) {
      item.price = product.price;
    }
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
  
  return this.save();
};

module.exports = mongoose.model('Cart', cartSchema);
