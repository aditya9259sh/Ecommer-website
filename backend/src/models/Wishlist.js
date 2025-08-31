const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    maxlength: 200,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
});

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [wishlistItemSchema],
  isPublic: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    default: 'My Wishlist',
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 500,
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

// Virtual for item count
wishlistSchema.virtual('itemCount').get(function() {
  return this.items.length;
});

// Virtual for is empty
wishlistSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

// Virtual for total estimated value
wishlistSchema.virtual('estimatedValue').get(function() {
  // This would need to be populated to work properly
  return 0;
});

// Indexes for better query performance
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'items.product': 1 });
wishlistSchema.index({ lastUpdated: -1 });
wishlistSchema.index({ isPublic: 1 });

// Pre-save middleware to update lastUpdated
wishlistSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Static method to get wishlist by user
wishlistSchema.statics.getWishlistByUser = function(userId) {
  return this.findOne({ user: userId })
    .populate('items.product', 'name price images stock isActive rating numReviews')
    .sort({ 'items.addedAt': -1 });
};

// Static method to get public wishlists
wishlistSchema.statics.getPublicWishlists = function(limit = 10) {
  return this.find({ isPublic: true })
    .populate('user', 'name')
    .populate('items.product', 'name price images')
    .limit(limit)
    .sort({ lastUpdated: -1 });
};

// Instance method to add product to wishlist
wishlistSchema.methods.addProduct = function(productId, notes = '', priority = 'medium') {
  const existingItem = this.items.find(item => 
    item.product.toString() === productId.toString()
  );

  if (existingItem) {
    // Update existing item
    existingItem.notes = notes;
    existingItem.priority = priority;
    existingItem.addedAt = new Date();
  } else {
    // Add new item
    this.items.push({
      product: productId,
      notes,
      priority,
    });
  }

  return this.save();
};

// Instance method to remove product from wishlist
wishlistSchema.methods.removeProduct = function(productId) {
  this.items = this.items.filter(item => 
    item.product.toString() !== productId.toString()
  );
  return this.save();
};

// Instance method to update item notes
wishlistSchema.methods.updateItemNotes = function(productId, notes) {
  const item = this.items.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (item) {
    item.notes = notes;
    return this.save();
  }
  
  throw new Error('Product not found in wishlist');
};

// Instance method to update item priority
wishlistSchema.methods.updateItemPriority = function(productId, priority) {
  const item = this.items.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (item) {
    item.priority = priority;
    return this.save();
  }
  
  throw new Error('Product not found in wishlist');
};

// Instance method to clear wishlist
wishlistSchema.methods.clearWishlist = function() {
  this.items = [];
  return this.save();
};

// Instance method to check if product is in wishlist
wishlistSchema.methods.hasProduct = function(productId) {
  return this.items.some(item => 
    item.product.toString() === productId.toString()
  );
};

// Instance method to get items by priority
wishlistSchema.methods.getItemsByPriority = function(priority) {
  return this.items.filter(item => item.priority === priority);
};

// Instance method to move item to cart (returns cart items)
wishlistSchema.methods.moveToCart = function(productIds) {
  const itemsToMove = this.items.filter(item => 
    productIds.includes(item.product.toString())
  );
  
  // Remove items from wishlist
  this.items = this.items.filter(item => 
    !productIds.includes(item.product.toString())
  );
  
  return this.save().then(() => itemsToMove);
};

// Instance method to share wishlist
wishlistSchema.methods.shareWishlist = function() {
  this.isPublic = true;
  return this.save();
};

// Instance method to make wishlist private
wishlistSchema.methods.makePrivate = function() {
  this.isPublic = false;
  return this.save();
};

// Instance method to get wishlist summary
wishlistSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    itemCount: this.itemCount,
    isPublic: this.isPublic,
    lastUpdated: this.lastUpdated,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Wishlist', wishlistSchema);
