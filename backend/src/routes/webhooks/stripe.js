const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../../models/Order');
const logger = require('../../utils/logger');

// Stripe webhook endpoint (no auth required)
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Error handling webhook event:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Handle successful payment
const handlePaymentSuccess = async (paymentIntent) => {
  try {
    const { orderId, userId } = paymentIntent.metadata;
    
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.status = 'confirmed';
        order.paymentStatus = 'paid';
        order.paymentIntentId = paymentIntent.id;
        order.paidAt = Date.now();
        
        // Add status history
        order.statusHistory.push({
          status: 'confirmed',
          updatedBy: 'system',
          updatedAt: Date.now(),
          notes: 'Payment successful via Stripe'
        });
        
        await order.save();
        logger.info(`Order ${orderId} confirmed after successful payment`);
      }
    }
  } catch (error) {
    logger.error('Error handling payment success:', error);
  }
};

// Handle failed payment
const handlePaymentFailure = async (paymentIntent) => {
  try {
    const { orderId, userId } = paymentIntent.metadata;
    
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.status = 'payment_failed';
        order.paymentStatus = 'failed';
        order.paymentIntentId = paymentIntent.id;
        
        // Add status history
        order.statusHistory.push({
          status: 'payment_failed',
          updatedBy: 'system',
          updatedAt: Date.now(),
          notes: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`
        });
        
        await order.save();
        logger.info(`Order ${orderId} marked as payment failed`);
      }
    }
  } catch (error) {
    logger.error('Error handling payment failure:', error);
  }
};

// Handle completed checkout session
const handleCheckoutCompleted = async (session) => {
  try {
    const { orderId, userId } = session.metadata;
    
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.status = 'confirmed';
        order.paymentStatus = 'paid';
        order.paymentIntentId = session.payment_intent;
        order.paidAt = Date.now();
        
        // Add status history
        order.statusHistory.push({
          status: 'confirmed',
          updatedBy: 'system',
          updatedAt: Date.now(),
          notes: 'Checkout completed via Stripe'
        });
        
        await order.save();
        logger.info(`Order ${orderId} confirmed after checkout completion`);
      }
    }
  } catch (error) {
    logger.error('Error handling checkout completion:', error);
  }
};

// Handle refund
const handleRefund = async (charge) => {
  try {
    // Find order by payment intent ID
    const order = await Order.findOne({ paymentIntentId: charge.payment_intent });
    
    if (order) {
      order.paymentStatus = 'refunded';
      order.refundedAt = Date.now();
      order.refundAmount = charge.amount_refunded / 100; // Convert from cents
      
      // Add status history
      order.statusHistory.push({
        status: 'refunded',
        updatedBy: 'system',
        updatedAt: Date.now(),
        notes: `Refund processed: ${charge.amount_refunded / 100} ${charge.currency.toUpperCase()}`
      });
      
      await order.save();
      logger.info(`Order ${order._id} refunded: ${charge.amount_refunded / 100} ${charge.currency.toUpperCase()}`);
    }
  } catch (error) {
    logger.error('Error handling refund:', error);
  }
};

// Handle subscription created
const handleSubscriptionCreated = async (subscription) => {
  try {
    logger.info(`New subscription created: ${subscription.id}`);
    // Implement subscription logic here
  } catch (error) {
    logger.error('Error handling subscription creation:', error);
  }
};

// Handle subscription updated
const handleSubscriptionUpdated = async (subscription) => {
  try {
    logger.info(`Subscription updated: ${subscription.id}`);
    // Implement subscription update logic here
  } catch (error) {
    logger.error('Error handling subscription update:', error);
  }
};

// Handle subscription deleted
const handleSubscriptionDeleted = async (subscription) => {
  try {
    logger.info(`Subscription cancelled: ${subscription.id}`);
    // Implement subscription cancellation logic here
  } catch (error) {
    logger.error('Error handling subscription deletion:', error);
  }
};

module.exports = router;
