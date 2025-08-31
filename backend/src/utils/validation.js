const Joi = require('joi');

// User validation schemas
const userValidation = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional().messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
    dateOfBirth: Joi.date().max('now').optional().messages({
      'date.max': 'Date of birth cannot be in the future'
    }),
    gender: Joi.string().valid('male', 'female', 'other').optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    dateOfBirth: Joi.date().max('now').optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required'
    }),
    newPassword: Joi.string().min(6).required().messages({
      'string.min': 'New password must be at least 6 characters long',
      'any.required': 'New password is required'
    })
  }),

  address: Joi.object({
    type: Joi.string().valid('home', 'work', 'other').required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    company: Joi.string().max(100).optional(),
    address1: Joi.string().min(5).max(200).required(),
    address2: Joi.string().max(200).optional(),
    city: Joi.string().min(2).max(100).required(),
    state: Joi.string().min(2).max(100).required(),
    zipCode: Joi.string().min(3).max(20).required(),
    country: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    isDefault: Joi.boolean().optional()
  })
};

// Product validation schemas
const productValidation = {
  create: Joi.object({
    name: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(10).max(2000).required(),
    price: Joi.number().positive().precision(2).required(),
    category: Joi.string().hex().length(24).required(),
    stockQuantity: Joi.number().integer().min(0).required(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    specifications: Joi.object().optional(),
    variants: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      value: Joi.string().required(),
      priceModifier: Joi.number().precision(2).optional()
    })).optional(),
    isFeatured: Joi.boolean().optional(),
    isActive: Joi.boolean().optional()
  }),

  update: Joi.object({
    name: Joi.string().min(3).max(200).optional(),
    description: Joi.string().min(10).max(2000).optional(),
    price: Joi.number().positive().precision(2).optional(),
    category: Joi.string().hex().length(24).optional(),
    stockQuantity: Joi.number().integer().min(0).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    specifications: Joi.object().optional(),
    variants: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      value: Joi.string().required(),
      priceModifier: Joi.number().precision(2).optional()
    })).optional(),
    isFeatured: Joi.boolean().optional(),
    isActive: Joi.boolean().optional()
  }),

  review: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(1000).optional()
  })
};

// Cart validation schemas
const cartValidation = {
  addItem: Joi.object({
    productId: Joi.string().hex().length(24).required(),
    quantity: Joi.number().integer().min(1).max(100).default(1),
    variant: Joi.string().optional()
  }),

  updateItem: Joi.object({
    quantity: Joi.number().integer().min(0).max(100).required()
  }),

  moveToWishlist: Joi.object({
    itemIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required()
  })
};

// Wishlist validation schemas
const wishlistValidation = {
  addItem: Joi.object({
    productId: Joi.string().hex().length(24).required(),
    variant: Joi.string().optional()
  }),

  moveToCart: Joi.object({
    itemIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required()
  })
};

// Order validation schemas
const orderValidation = {
  create: Joi.object({
    items: Joi.array().items(Joi.object({
      product: Joi.string().hex().length(24).required(),
      quantity: Joi.number().integer().min(1).required(),
      variant: Joi.string().optional()
    })).min(1).required(),
    shippingAddress: Joi.object({
      type: Joi.string().valid('home', 'work', 'other').required(),
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      company: Joi.string().max(100).optional(),
      address1: Joi.string().min(5).max(200).required(),
      address2: Joi.string().max(200).optional(),
      city: Joi.string().min(2).max(100).required(),
      state: Joi.string().min(2).max(100).required(),
      zipCode: Joi.string().min(3).max(20).required(),
      country: Joi.string().min(2).max(100).required(),
      phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).required()
    }).required(),
    billingAddress: Joi.object({
      type: Joi.string().valid('home', 'work', 'other').required(),
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      company: Joi.string().max(100).optional(),
      address1: Joi.string().min(5).max(200).required(),
      address2: Joi.string().max(200).optional(),
      city: Joi.string().min(2).max(100).required(),
      state: Joi.string().min(2).max(100).required(),
      zipCode: Joi.string().min(3).max(20).required(),
      country: Joi.string().min(2).max(100).required(),
      phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).required()
    }).optional(),
    paymentMethod: Joi.string().valid('card', 'paypal', 'apple_pay', 'google_pay').required(),
    paymentIntentId: Joi.string().optional(),
    notes: Joi.string().max(500).optional(),
    clearCart: Joi.boolean().optional()
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded').required(),
    trackingNumber: Joi.string().max(100).optional(),
    notes: Joi.string().max(500).optional()
  }),

  cancel: Joi.object({
    reason: Joi.string().max(500).optional()
  })
};

// Payment validation schemas
const paymentValidation = {
  createIntent: Joi.object({
    amount: Joi.number().positive().precision(2).required(),
    currency: Joi.string().length(3).default('usd'),
    metadata: Joi.object().optional()
  }),

  createCheckoutSession: Joi.object({
    items: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      price: Joi.number().positive().precision(2).required(),
      quantity: Joi.number().integer().min(1).required(),
      images: Joi.array().items(Joi.string().uri()).optional(),
      description: Joi.string().max(500).optional()
    })).min(1).required(),
    successUrl: Joi.string().uri().required(),
    cancelUrl: Joi.string().uri().required(),
    metadata: Joi.object().optional()
  }),

  addPaymentMethod: Joi.object({
    paymentMethodId: Joi.string().required(),
    setAsDefault: Joi.boolean().default(false)
  })
};

// Admin validation schemas
const adminValidation = {
  updateUserRole: Joi.object({
    role: Joi.string().valid('user', 'admin').required()
  }),

  updateSystemSettings: Joi.object({
    siteName: Joi.string().min(2).max(100).optional(),
    siteDescription: Joi.string().max(500).optional(),
    contactEmail: Joi.string().email().optional(),
    supportPhone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    maintenanceMode: Joi.boolean().optional(),
    maxUploadSize: Joi.number().integer().min(1024 * 1024).max(50 * 1024 * 1024).optional(),
    allowedFileTypes: Joi.array().items(Joi.string().valid('jpg', 'jpeg', 'png', 'gif', 'webp')).optional()
  })
};

// Query parameter validation schemas
const queryValidation = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }),

  productFilters: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(12),
    category: Joi.string().hex().length(24).optional(),
    minPrice: Joi.number().positive().precision(2).optional(),
    maxPrice: Joi.number().positive().precision(2).optional(),
    sortBy: Joi.string().valid('name', 'price', 'createdAt', 'averageRating', 'totalReviews').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().max(100).optional(),
    inStock: Joi.boolean().optional(),
    rating: Joi.number().min(1).max(5).optional()
  }),

  orderFilters: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded').optional(),
    sortBy: Joi.string().valid('createdAt', 'total', 'status').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  })
};

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessage
      });
    }
    next();
  };
};

// Query validation middleware
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Query validation error',
        errors: errorMessage
      });
    }
    next();
  };
};

module.exports = {
  userValidation,
  productValidation,
  cartValidation,
  wishlistValidation,
  orderValidation,
  paymentValidation,
  adminValidation,
  queryValidation,
  validate,
  validateQuery
};
