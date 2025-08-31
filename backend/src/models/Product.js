const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  images: [{
    type: String,
  }],
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    helpful: {
      type: Boolean,
      default: true,
    },
  }],
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  comparePrice: {
    type: Number,
    min: 0,
  },
  cost: {
    type: Number,
    min: 0,
  },
  weight: {
    type: Number,
    min: 0,
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
  },
  attributes: [{
    name: String,
    value: String,
  }],
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false,
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters'],
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot be more than 200 characters'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  comparePrice: {
    type: Number,
    min: 0,
  },
  cost: {
    type: Number,
    min: 0,
  },
  weight: {
    type: Number,
    min: 0,
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
  },
  images: [{
    url: {
      type: String,
      required: true,
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false,
    },
  }],
  variants: [variantSchema],
  attributes: [{
    name: {
      type: String,
      required: true,
    },
    values: [String],
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  reviews: [reviewSchema],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isOnSale: {
    type: Boolean,
    default: false,
  },
  salePercentage: {
    type: Number,
    min: 0,
    max: 100,
  },
  saleStartDate: Date,
  saleEndDate: Date,
  seo: {
    title: String,
    description: String,
    keywords: [String],
  },
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    shippingClass: {
      type: String,
      enum: ['standard', 'express', 'overnight'],
      default: 'standard',
    },
  },
  warranty: {
    type: String,
    enum: ['none', '30days', '90days', '1year', '2years', 'lifetime'],
    default: 'none',
  },
  returnPolicy: {
    type: String,
    enum: ['none', '7days', '14days', '30days', '60days'],
    default: '30days',
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  soldCount: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for average rating
productSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 0;
  
  const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / this.reviews.length) * 10) / 10;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (!this.comparePrice || this.comparePrice <= this.price) return 0;
  return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
});

// Virtual for is in stock
productSchema.virtual('isInStock').get(function() {
  return this.stock > 0;
});

// Virtual for is low stock
productSchema.virtual('isLowStock').get(function() {
  return this.stock > 0 && this.stock <= this.lowStockThreshold;
});

// Virtual for is on sale
productSchema.virtual('isCurrentlyOnSale').get(function() {
  if (!this.isOnSale) return false;
  
  const now = new Date();
  const startDate = this.saleStartDate || new Date(0);
  const endDate = this.saleEndDate || new Date(8640000000000000); // Max date
  
  return now >= startDate && now <= endDate;
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isOnSale: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 });

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    return next();
  }
  
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  next();
});

// Pre-save middleware to update rating and review count
productSchema.pre('save', function(next) {
  if (this.reviews && this.reviews.length > 0) {
    this.rating = this.averageRating;
    this.numReviews = this.reviews.length;
  }
  next();
});

// Static method to get products by category
productSchema.statics.getProductsByCategory = function(categoryId, limit = 10) {
  return this.find({ category: categoryId, isActive: true })
    .populate('category', 'name')
    .limit(limit)
    .sort({ createdAt: -1 });
};

// Static method to get featured products
productSchema.statics.getFeaturedProducts = function(limit = 10) {
  return this.find({ isFeatured: true, isActive: true })
    .populate('category', 'name')
    .limit(limit)
    .sort({ createdAt: -1 });
};

// Static method to get products on sale
productSchema.statics.getProductsOnSale = function(limit = 10) {
  const now = new Date();
  return this.find({
    isOnSale: true,
    isActive: true,
    $or: [
      { saleStartDate: { $lte: now } },
      { saleStartDate: { $exists: false } },
    ],
    $or: [
      { saleEndDate: { $gte: now } },
      { saleEndDate: { $exists: false } },
    ],
  })
    .populate('category', 'name')
    .limit(limit)
    .sort({ salePercentage: -1 });
};

// Instance method to add review
productSchema.methods.addReview = function(userId, reviewData) {
  const existingReviewIndex = this.reviews.findIndex(
    review => review.user.toString() === userId.toString()
  );

  if (existingReviewIndex > -1) {
    // Update existing review
    this.reviews[existingReviewIndex] = {
      ...this.reviews[existingReviewIndex],
      ...reviewData,
      user: userId,
    };
  } else {
    // Add new review
    this.reviews.push({
      ...reviewData,
      user: userId,
    });
  }

  return this.save();
};

// Instance method to remove review
productSchema.methods.removeReview = function(userId) {
  this.reviews = this.reviews.filter(
    review => review.user.toString() !== userId.toString()
  );
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
