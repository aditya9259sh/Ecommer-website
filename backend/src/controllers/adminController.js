const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const logger = require('../utils/logger');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Get counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCategories = await Category.countDocuments();

    // Get monthly stats
    const monthlyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
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

    // Get yearly stats
    const yearlyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfYear }
    });

    const yearlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear },
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

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber total status createdAt user');

    // Get low stock products
    const lowStockProducts = await Product.find({ stockQuantity: { $lt: 10 } })
      .select('name stockQuantity price')
      .limit(10);

    // Get top selling products
    const topProducts = await Product.find()
      .sort({ soldCount: -1 })
      .limit(10)
      .select('name soldCount price images');

    // Get order status distribution
    const orderStatusStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalCategories
        },
        monthly: {
          orders: monthlyOrders,
          revenue: monthlyRevenue[0]?.total || 0
        },
        yearly: {
          orders: yearlyOrders,
          revenue: yearlyRevenue[0]?.total || 0
        },
        recentOrders,
        lowStockProducts,
        topProducts,
        orderStatusStats
      }
    });
  } catch (error) {
    logger.error('Error getting dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    logger.error('Error getting all users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role is required (user or admin)'
      });
    }

    // Prevent admin from removing their own admin role
    if (id === req.user.id && role === 'user') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove your own admin role'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role, updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    logger.error('Error updating user role:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has active orders
    const activeOrders = await Order.countDocuments({
      user: id,
      status: { $in: ['pending', 'confirmed', 'shipped'] }
    });

    if (activeOrders > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with active orders'
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getSystemAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    let startDate;
    const now = new Date();

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // User registration trends
    const userTrends = await User.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Order trends
    const orderTrends = await Order.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Product performance
    const productPerformance = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stockQuantity' },
          totalSold: { $sum: '$soldCount' },
          avgPrice: { $avg: '$price' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      }
    ]);

    // Revenue by category
    const revenueByCategory = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['completed', 'shipped', 'delivered'] }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $unwind: '$productInfo'
      },
      {
        $group: {
          _id: '$productInfo.category',
          revenue: { $sum: '$items.total' },
          orders: { $addToSet: '$_id' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        userTrends,
        orderTrends,
        productPerformance,
        revenueByCategory
      }
    });
  } catch (error) {
    logger.error('Error getting system analytics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get admin notifications
// @route   GET /api/admin/notifications
// @access  Private/Admin
const getAdminNotifications = async (req, res) => {
  try {
    const notifications = [];

    // Check for low stock products
    const lowStockCount = await Product.countDocuments({ stockQuantity: { $lt: 10 } });
    if (lowStockCount > 0) {
      notifications.push({
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${lowStockCount} products have low stock (less than 10 items)`,
        priority: 'high'
      });
    }

    // Check for pending orders
    const pendingOrdersCount = await Order.countDocuments({ status: 'pending' });
    if (pendingOrdersCount > 0) {
      notifications.push({
        type: 'info',
        title: 'Pending Orders',
        message: `${pendingOrdersCount} orders are pending confirmation`,
        priority: 'medium'
      });
    }

    // Check for new users (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newUsersCount = await User.countDocuments({ createdAt: { $gte: yesterday } });
    if (newUsersCount > 0) {
      notifications.push({
        type: 'success',
        title: 'New Users',
        message: `${newUsersCount} new users registered in the last 24 hours`,
        priority: 'low'
      });
    }

    // Check for system health
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();

    if (totalProducts === 0) {
      notifications.push({
        type: 'error',
        title: 'System Issue',
        message: 'No products found in the system',
        priority: 'high'
      });
    }

    res.json({
      success: true,
      data: {
        notifications,
        counts: {
          lowStock: lowStockCount,
          pendingOrders: pendingOrdersCount,
          newUsers: newUsersCount
        }
      }
    });
  } catch (error) {
    logger.error('Error getting admin notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSystemSettings = async (req, res) => {
  try {
    const {
      siteName,
      siteDescription,
      contactEmail,
      supportPhone,
      maintenanceMode,
      maxUploadSize,
      allowedFileTypes
    } = req.body;

    // In a real application, you would save these to a database or config file
    // For now, we'll just return success
    const settings = {
      siteName: siteName || 'E-Commerce Store',
      siteDescription: siteDescription || 'Your trusted online shopping destination',
      contactEmail: contactEmail || 'support@ecommerce.com',
      supportPhone: supportPhone || '+1-800-123-4567',
      maintenanceMode: maintenanceMode || false,
      maxUploadSize: maxUploadSize || 5242880, // 5MB
      allowedFileTypes: allowedFileTypes || ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      updatedAt: Date.now(),
      updatedBy: req.user.id
    };

    res.json({
      success: true,
      message: 'System settings updated successfully',
      data: settings
    });
  } catch (error) {
    logger.error('Error updating system settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getSystemAnalytics,
  getAdminNotifications,
  updateSystemSettings
};
