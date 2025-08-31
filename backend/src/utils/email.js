const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.SITE_NAME || 'E-Commerce Store'}" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    if (options.attachments) {
      mailOptions.attachments = options.attachments;
    }

    const info = await transporter.sendMail(mailOptions);
    
    logger.info(`Email sent successfully to ${options.to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Our E-Commerce Store!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome ${user.name}!</h2>
      <p>Thank you for joining our e-commerce platform. We're excited to have you on board!</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #007bff;">Getting Started</h3>
        <ul>
          <li>Browse our product catalog</li>
          <li>Add items to your wishlist</li>
          <li>Complete your first order</li>
          <li>Update your profile and preferences</li>
        </ul>
      </div>
      
      <p>If you have any questions, feel free to contact our support team.</p>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL}/shop" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Start Shopping</a>
      </div>
      
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        This email was sent to ${user.email}. If you didn't create an account, please ignore this email.
      </p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html
  });
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (order, user) => {
  const subject = `Order Confirmation - ${order.orderNumber}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Order Confirmed!</h2>
      <p>Hi ${user.name},</p>
      <p>Your order has been confirmed and is being processed.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #007bff;">Order Details</h3>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> $${order.total}</p>
        <p><strong>Status:</strong> ${order.status}</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #007bff;">Order Items</h3>
        ${order.items.map(item => `
          <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
            <p><strong>${item.name}</strong></p>
            <p>Quantity: ${item.quantity} | Price: $${item.price} | Total: $${item.total}</p>
          </div>
        `).join('')}
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL}/orders/${order._id}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order</a>
      </div>
      
      <p>We'll send you updates on your order status. Thank you for shopping with us!</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html
  });
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  const subject = 'Password Reset Request';
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hi ${user.name},</p>
      <p>You requested a password reset for your account.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>This link will expire in 1 hour for security reasons.</p>
      
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        If the button doesn't work, copy and paste this link into your browser: ${resetUrl}
      </p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html
  });
};

// Send email verification email
const sendEmailVerificationEmail = async (user, verificationToken) => {
  const subject = 'Verify Your Email Address';
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Verify Your Email</h2>
      <p>Hi ${user.name},</p>
      <p>Please verify your email address to complete your account setup.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
      </div>
      
      <p>If you didn't create an account, please ignore this email.</p>
      
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        If the button doesn't work, copy and paste this link into your browser: ${verifyUrl}
      </p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html
  });
};

// Send order status update email
const sendOrderStatusUpdateEmail = async (order, user, newStatus) => {
  const subject = `Order Status Update - ${order.orderNumber}`;
  const statusMessages = {
    'confirmed': 'Your order has been confirmed and is being prepared for shipping.',
    'shipped': 'Your order has been shipped and is on its way to you.',
    'delivered': 'Your order has been delivered successfully.',
    'cancelled': 'Your order has been cancelled as requested.'
  };
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Order Status Update</h2>
      <p>Hi ${user.name},</p>
      <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #007bff;">Order Details</h3>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>New Status:</strong> ${newStatus}</p>
        <p><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL}/orders/${order._id}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order</a>
      </div>
      
      <p>Thank you for shopping with us!</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html
  });
};

// Send promotional email
const sendPromotionalEmail = async (user, subject, content) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${subject}</h2>
      <div>${content}</div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL}/shop" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Shop Now</a>
      </div>
      
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        You're receiving this email because you subscribed to promotional emails. 
        <a href="${process.env.FRONTEND_URL}/unsubscribe">Unsubscribe</a>
      </p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
  sendOrderStatusUpdateEmail,
  sendPromotionalEmail
};
