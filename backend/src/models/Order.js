const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
  },
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
  },
  attributes: [{
    name: String,
    value: String,
  }],
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  shipping: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
      'returned',
    ],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'cash_on_delivery', 'bank_transfer'],
    required: true,
  },
  paymentIntentId: {
    type: String,
  },
  shippingAddress: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    company: String,
    address1: {
      type: String,
      required: true,
    },
    address2: String,
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  billingAddress: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    company: String,
    address1: {
      type: String,
      required: true,
    },
    address2: String,
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  shippingMethod: {
    name: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedDays: {
      type: Number,
      min: 1,
    },
  },
  tracking: {
    number: String,
    carrier: String,
    url: String,
    status: String,
    events: [{
      status: String,
      location: String,
      timestamp: Date,
      description: String,
    }],
  },
  notes: {
    customer: String,
    internal: String,
  },
  timeline: [{
    status: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  refunds: [{
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending',
    },
    processedAt: Date,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  isGift: {
    type: Boolean,
    default: false,
  },
  giftMessage: String,
  coupon: {
    code: String,
    discount: Number,
  },
  taxRate: {
    type: Number,
    default: 0,
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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for order status color
orderSchema.virtual('statusColor').get(function() {
  const statusColors = {
    pending: 'yellow',
    confirmed: 'blue',
    processing: 'purple',
    shipped: 'indigo',
    delivered: 'green',
    cancelled: 'red',
    refunded: 'gray',
    returned: 'orange',
  };
  return statusColors[this.status] || 'gray';
});

// Virtual for payment status color
orderSchema.virtual('paymentStatusColor').get(function() {
  const statusColors = {
    pending: 'yellow',
    paid: 'green',
    failed: 'red',
    refunded: 'gray',
    partially_refunded: 'orange',
  };
  return statusColors[this.paymentStatus] || 'gray';
});

// Virtual for total refunded amount
orderSchema.virtual('totalRefunded').get(function() {
  if (!this.refunds || this.refunds.length === 0) return 0;
  return this.refunds.reduce((sum, refund) => sum + refund.amount, 0);
});

// Virtual for is fully refunded
orderSchema.virtual('isFullyRefunded').get(function() {
  return this.totalRefunded >= this.total;
});

// Indexes for better query performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shippingAddress.zipCode': 1 });
orderSchema.index({ 'shippingAddress.country': 1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get count of orders for today
    const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd },
    });
    
    const sequence = String(count + 1).padStart(4, '0');
    this.orderNumber = `ORD-${year}${month}${day}-${sequence}`;
  }
  next();
});

// Pre-save middleware to update timeline
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
    });
  }
  next();
});

// Static method to get orders by status
orderSchema.statics.getOrdersByStatus = function(status, limit = 10) {
  return this.find({ status })
    .populate('user', 'name email')
    .populate('items.product', 'name images')
    .limit(limit)
    .sort({ createdAt: -1 });
};

// Static method to get orders by user
orderSchema.statics.getOrdersByUser = function(userId, limit = 10) {
  return this.find({ user: userId })
    .populate('items.product', 'name images')
    .limit(limit)
    .sort({ createdAt: -1 });
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$total' },
      },
    },
  ]);
  
  const totalOrders = await this.countDocuments();
  const totalRevenue = await this.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  
  return {
    byStatus: stats,
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
  };
};

// Instance method to add timeline event
orderSchema.methods.addTimelineEvent = function(status, note, updatedBy = null) {
  this.timeline.push({
    status,
    timestamp: new Date(),
    note,
    updatedBy,
  });
  return this.save();
};

// Instance method to process refund
orderSchema.methods.processRefund = function(amount, reason, processedBy) {
  this.refunds.push({
    amount,
    reason,
    status: 'processed',
    processedAt: new Date(),
    processedBy,
  });
  
  // Update payment status
  if (this.totalRefunded + amount >= this.total) {
    this.paymentStatus = 'refunded';
  } else {
    this.paymentStatus = 'partially_refunded';
  }
  
  return this.save();
};

// Instance method to update tracking
orderSchema.methods.updateTracking = function(trackingData) {
  this.tracking = { ...this.tracking, ...trackingData };
  return this.save();
};

module.exports = mongoose.model('Order', orderSchema);
