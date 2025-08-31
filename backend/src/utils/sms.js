const twilio = require('twilio');
const logger = require('./logger');

// Initialize Twilio client
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && 
    process.env.TWILIO_AUTH_TOKEN && 
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC') && 
    process.env.TWILIO_AUTH_TOKEN !== 'your-twilio-auth-token') {
  try {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  } catch (error) {
    logger.warn('Failed to initialize Twilio client', { error: error.message });
    twilioClient = null;
  }
}

/**
 * Send SMS using Twilio
 * @param {string} phoneNumber - Phone number to send SMS to
 * @param {string} message - Message content
 * @returns {Promise<Object>} - Twilio response
 */
const sendSMS = async (phoneNumber, message) => {
  try {
    if (!twilioClient) {
      logger.warn('Twilio not configured, SMS functionality disabled');
      return { success: false, error: 'SMS service not configured' };
    }

    const response = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    logger.info(`SMS sent successfully to ${phoneNumber}`, { messageId: response.sid });
    return { success: true, messageId: response.sid };
  } catch (error) {
    logger.error('Error sending SMS', { error: error.message, phoneNumber });
    return { success: false, error: error.message };
  }
};

/**
 * Send OTP via SMS
 * @param {string} phoneNumber - Phone number to send OTP to
 * @param {string} otp - OTP code
 * @returns {Promise<Object>} - Send result
 */
const sendOTP = async (phoneNumber, otp) => {
  const message = `Your verification code is: ${otp}. Valid for 10 minutes.`;
  return await sendSMS(phoneNumber, message);
};

/**
 * Send order confirmation SMS
 * @param {string} phoneNumber - Phone number to send confirmation to
 * @param {string} orderNumber - Order number
 * @param {string} trackingNumber - Tracking number
 * @returns {Promise<Object>} - Send result
 */
const sendOrderConfirmation = async (phoneNumber, orderNumber, trackingNumber) => {
  const message = `Order ${orderNumber} confirmed! Tracking: ${trackingNumber}. Thank you for shopping with us!`;
  return await sendSMS(phoneNumber, message);
};

/**
 * Send delivery update SMS
 * @param {string} phoneNumber - Phone number to send update to
 * @param {string} orderNumber - Order number
 * @param {string} status - Delivery status
 * @returns {Promise<Object>} - Send result
 */
const sendDeliveryUpdate = async (phoneNumber, orderNumber, status) => {
  const message = `Order ${orderNumber} update: ${status}. Track your order on our website.`;
  return await sendSMS(phoneNumber, message);
};

module.exports = {
  sendSMS,
  sendOTP,
  sendOrderConfirmation,
  sendDeliveryUpdate,
};
