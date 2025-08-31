const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
    unique: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  image: {
    type: String,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  level: {
    type: Number,
    default: 0,
  },
  path: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  seo: {
    title: String,
    description: String,
    keywords: [String],
  },
  attributes: [{
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'number', 'boolean', 'select', 'multiselect'],
      default: 'text',
    },
    required: {
      type: Boolean,
      default: false,
    },
    values: [String], // For select/multiselect types
    unit: String, // For number type (e.g., 'kg', 'cm')
  }],
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

// Virtual for children categories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

// Virtual for product count
categorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

// Virtual for full path name
categorySchema.virtual('fullPath').get(function() {
  if (!this.path || this.path.length === 0) {
    return this.name;
  }
  
  // This would need to be populated to work properly
  return this.path.map(cat => cat.name).join(' > ') + ' > ' + this.name;
});

// Indexes for better query performance
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ isFeatured: 1 });
categorySchema.index({ sortOrder: 1 });

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    return next();
  }
  
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  next();
});

// Pre-save middleware to set level and path
categorySchema.pre('save', async function(next) {
  if (this.isModified('parent')) {
    if (this.parent) {
      const parentCategory = await this.constructor.findById(this.parent);
      if (parentCategory) {
        this.level = parentCategory.level + 1;
        this.path = [...parentCategory.path, parentCategory._id];
      }
    } else {
      this.level = 0;
      this.path = [];
    }
  }
  next();
});

// Static method to get root categories
categorySchema.statics.getRootCategories = function() {
  return this.find({ parent: null, isActive: true })
    .sort({ sortOrder: 1, name: 1 });
};

// Static method to get category tree
categorySchema.statics.getCategoryTree = function() {
  return this.find({ isActive: true })
    .populate('children')
    .sort({ sortOrder: 1, name: 1 });
};

// Static method to get category with children
categorySchema.statics.getCategoryWithChildren = function(categoryId) {
  return this.findById(categoryId)
    .populate({
      path: 'children',
      match: { isActive: true },
      populate: {
        path: 'children',
        match: { isActive: true },
      },
    });
};

// Static method to get breadcrumb path
categorySchema.statics.getBreadcrumbPath = async function(categoryId) {
  const category = await this.findById(categoryId).populate('path');
  if (!category) return [];
  
  const breadcrumb = category.path.map(cat => ({
    id: cat._id,
    name: cat.name,
    slug: cat.slug,
  }));
  
  breadcrumb.push({
    id: category._id,
    name: category.name,
    slug: category.slug,
  });
  
  return breadcrumb;
};

// Instance method to get all descendants
categorySchema.methods.getDescendants = function() {
  return this.constructor.find({
    path: this._id,
    isActive: true,
  }).sort({ level: 1, sortOrder: 1, name: 1 });
};

// Instance method to get all ancestors
categorySchema.methods.getAncestors = function() {
  if (!this.path || this.path.length === 0) {
    return [];
  }
  
  return this.constructor.find({
    _id: { $in: this.path },
    isActive: true,
  }).sort({ level: 1 });
};

// Instance method to check if category has children
categorySchema.methods.hasChildren = async function() {
  const count = await this.constructor.countDocuments({
    parent: this._id,
    isActive: true,
  });
  return count > 0;
};

// Instance method to get sibling categories
categorySchema.methods.getSiblings = function() {
  return this.constructor.find({
    parent: this.parent,
    _id: { $ne: this._id },
    isActive: true,
  }).sort({ sortOrder: 1, name: 1 });
};

module.exports = mongoose.model('Category', categorySchema);
