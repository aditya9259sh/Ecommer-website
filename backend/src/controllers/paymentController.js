const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId: req.user.id,
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create checkout session
// @route   POST /api/payments/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
  try {
    const { items, successUrl, cancelUrl, metadata = {} } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items are required'
      });
    }

    if (!successUrl || !cancelUrl) {
      return res.status(400).json({
        success: false,
        message: 'Success and cancel URLs are required'
      });
    }

    // Prepare line items for Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.images || [],
          description: item.description || ''
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: req.user.id,
        ...metadata
      },
      customer_email: req.user.email,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'DE', 'FR', 'AU'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1000, // $10.00 in cents
              currency: 'usd',
            },
            display_name: 'Standard shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 3,
              },
              maximum: {
                unit: 'business_day',
                value: 5,
              },
            },
          },
        },
      ],
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    logger.error('Error creating checkout session:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get payment methods for user
// @route   GET /api/payments/methods
// @access  Private
const getPaymentMethods = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.stripeCustomerId) {
      return res.json({
        success: true,
        data: { paymentMethods: [] }
      });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    res.json({
      success: true,
      data: {
        paymentMethods: paymentMethods.data.map(method => ({
          id: method.id,
          brand: method.card.brand,
          last4: method.card.last4,
          expMonth: method.card.exp_month,
          expYear: method.card.exp_year,
          isDefault: method.id === user.defaultPaymentMethod
        }))
      }
    });
  } catch (error) {
    logger.error('Error getting payment methods:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add payment method
// @route   POST /api/payments/methods
// @access  Private
const addPaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId, setAsDefault = false } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'Payment method ID is required'
      });
    }

    let user = await User.findById(req.user.id);
    
    // Create Stripe customer if doesn't exist
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });
      
      user.stripeCustomerId = customer.id;
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId,
    });

    // Set as default if requested
    if (setAsDefault) {
      await stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      user.defaultPaymentMethod = paymentMethodId;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Payment method added successfully'
    });
  } catch (error) {
    logger.error('Error adding payment method:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Remove payment method
// @route   DELETE /api/payments/methods/:methodId
// @access  Private
const removePaymentMethod = async (req, res) => {
  try {
    const { methodId } = req.params;

    const user = await User.findById(req.user.id);
    
    if (!user.stripeCustomerId) {
      return res.status(404).json({
        success: false,
        message: 'No payment methods found'
      });
    }

    // Detach payment method
    await stripe.paymentMethods.detach(methodId);

    // Update user if this was the default method
    if (user.defaultPaymentMethod === methodId) {
      user.defaultPaymentMethod = null;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Payment method removed successfully'
    });
  } catch (error) {
    logger.error('Error removing payment method:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Set default payment method
// @route   PUT /api/payments/methods/:methodId/default
// @access  Private
const setDefaultPaymentMethod = async (req, res) => {
  try {
    const { methodId } = req.params;

    const user = await User.findById(req.user.id);
    
    if (!user.stripeCustomerId) {
      return res.status(404).json({
        success: false,
        message: 'No payment methods found'
      });
    }

    // Update Stripe customer
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: methodId,
      },
    });

    // Update user
    user.defaultPaymentMethod = methodId;
    await user.save();

    res.json({
      success: true,
      message: 'Default payment method updated successfully'
    });
  } catch (error) {
    logger.error('Error setting default payment method:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findById(req.user.id);
    
    if (!user.stripeCustomerId) {
      return res.json({
        success: true,
        data: { payments: [], pagination: { total: 0, totalPages: 0 } }
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await stripe.paymentIntents.list({
      customer: user.stripeCustomerId,
      limit: parseInt(limit),
      starting_after: skip > 0 ? `pi_${skip}` : undefined,
    });

    const total = await stripe.paymentIntents.list({
      customer: user.stripeCustomerId,
      limit: 1000, // Get total count
    });

    const totalPages = Math.ceil(total.data.length / parseInt(limit));

    res.json({
      success: true,
      data: {
        payments: payments.data.map(payment => ({
          id: payment.id,
          amount: payment.amount / 100, // Convert from cents
          currency: payment.currency,
          status: payment.status,
          created: payment.created,
          paymentMethod: payment.payment_method_types[0],
          description: payment.description
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalPayments: total.data.length,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    logger.error('Error getting payment history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Refund payment
// @route   POST /api/payments/:paymentIntentId/refund
// @access  Private/Admin
const refundPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    const { amount, reason } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const refundData = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to cents
    }

    if (reason) {
      refundData.reason = reason;
    }

    const refund = await stripe.refunds.create(refundData);

    res.json({
      success: true,
      message: 'Payment refunded successfully',
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });
  } catch (error) {
    logger.error('Error refunding payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createPaymentIntent,
  createCheckoutSession,
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  getPaymentHistory,
  refundPayment
};
