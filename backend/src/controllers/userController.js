const User = require('../models/User');
const Order = require('../models/Order');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('defaultAddress');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Error getting user profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      dateOfBirth,
      gender,
      preferences
    } = req.body;

    const updateFields = {};
    
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
    if (gender) updateFields.gender = gender;
    if (preferences) updateFields.preferences = preferences;

    updateFields.updatedAt = Date.now();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.updatedAt = Date.now();
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = async (req, res) => {
  try {
    const {
      type,
      firstName,
      lastName,
      company,
      address1,
      address2,
      city,
      state,
      zipCode,
      country,
      phone,
      isDefault
    } = req.body;

    if (!type || !firstName || !lastName || !address1 || !city || !state || !zipCode || !country) {
      return res.status(400).json({
        success: false,
        message: 'Required address fields are missing'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const newAddress = {
      type,
      firstName,
      lastName,
      company,
      address1,
      address2,
      city,
      state,
      zipCode,
      country,
      phone,
      isDefault: isDefault || false
    };

    // If this is the first address or marked as default, set as default
    if (user.addresses.length === 0 || isDefault) {
      // Remove default from other addresses
      user.addresses.forEach(addr => addr.isDefault = false);
      newAddress.isDefault = true;
      user.defaultAddress = newAddress;
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: newAddress
    });
  } catch (error) {
    logger.error('Error adding address:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const updateFields = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Update address fields
    Object.keys(updateFields).forEach(key => {
      if (key !== '_id' && key !== '__v') {
        user.addresses[addressIndex][key] = updateFields[key];
      }
    });

    // Handle default address logic
    if (updateFields.isDefault) {
      user.addresses.forEach((addr, index) => {
        if (index !== addressIndex) {
          addr.isDefault = false;
        }
      });
      user.defaultAddress = user.addresses[addressIndex];
    }

    await user.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: user.addresses[addressIndex]
    });
  } catch (error) {
    logger.error('Error updating address:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const deletedAddress = user.addresses[addressIndex];

    // Remove address
    user.addresses.splice(addressIndex, 1);

    // If deleted address was default, set new default
    if (deletedAddress.isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
      user.defaultAddress = user.addresses[0];
    } else if (user.addresses.length === 0) {
      user.defaultAddress = null;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting address:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Set default address
// @route   PUT /api/users/addresses/:addressId/default
// @access  Private
const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Remove default from all addresses
    user.addresses.forEach(addr => addr.isDefault = false);

    // Set new default
    user.addresses[addressIndex].isDefault = true;
    user.defaultAddress = user.addresses[addressIndex];

    await user.save();

    res.json({
      success: true,
      message: 'Default address updated successfully',
      data: user.addresses[addressIndex]
    });
  } catch (error) {
    logger.error('Error setting default address:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
const getUserAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('addresses defaultAddress');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        addresses: user.addresses,
        defaultAddress: user.defaultAddress
      }
    });
  } catch (error) {
    logger.error('Error getting user addresses:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user orders summary
// @route   GET /api/users/orders-summary
// @access  Private
const getUserOrdersSummary = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get order counts by status
    const orderSummary = await Order.aggregate([
      {
        $match: { user: user._id }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      }
    ]);

    // Get total orders and spending
    const totalOrders = await Order.countDocuments({ user: user._id });
    const totalSpent = await Order.aggregate([
      {
        $match: { 
          user: user._id,
          status: { $in: ['completed', 'shipped', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        orderSummary,
        totalOrders,
        totalSpent: totalSpent[0]?.total || 0
      }
    });
  } catch (error) {
    logger.error('Error getting user orders summary:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
const updateUserPreferences = async (req, res) => {
  try {
    const {
      language,
      currency,
      timezone,
      emailNotifications,
      smsNotifications,
      marketingEmails,
      theme
    } = req.body;

    const updateFields = {};
    
    if (language !== undefined) updateFields['preferences.language'] = language;
    if (currency !== undefined) updateFields['preferences.currency'] = currency;
    if (timezone !== undefined) updateFields['preferences.timezone'] = timezone;
    if (emailNotifications !== undefined) updateFields['preferences.emailNotifications'] = emailNotifications;
    if (smsNotifications !== undefined) updateFields['preferences.smsNotifications'] = smsNotifications;
    if (marketingEmails !== undefined) updateFields['preferences.marketingEmails'] = marketingEmails;
    if (theme !== undefined) updateFields['preferences.theme'] = theme;

    updateFields.updatedAt = Date.now();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    });
  } catch (error) {
    logger.error('Error updating user preferences:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
const deleteUserAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Check for active orders
    const activeOrders = await Order.countDocuments({
      user: user._id,
      status: { $in: ['pending', 'confirmed', 'shipped'] }
    });

    if (activeOrders > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account with active orders'
      });
    }

    // Delete user account
    await User.findByIdAndDelete(user._id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting user account:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getUserAddresses,
  getUserOrdersSummary,
  updateUserPreferences,
  deleteUserAccount
};
