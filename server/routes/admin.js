const express = require('express');
const User = require('../models/User');
const Notice = require('../models/Notice');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Message = require('../models/Message');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validatePagination, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Dashboard statistics
router.get('/dashboard/stats', 
  authenticateToken, 
  requireAdmin,
  async (req, res) => {
    try {
      const [
        totalUsers,
        activeUsers,
        verifiedUsers,
        totalNotices,
        totalClubs,
        totalEvents,
        totalMessages,
        recentUsers
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isVerified: true }),
        Notice.countDocuments({ isActive: true }),
        Club.countDocuments({ isActive: true }),
        Event.countDocuments(),
        Message.countDocuments(),
        User.find({ isVerified: true })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('firstName lastName email course year createdAt')
      ]);

      // Get user registrations by month (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const usersByMonth = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]);

      // Get matches per day (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const matchesByDay = await User.aggregate([
        {
          $unwind: '$matches'
        },
        {
          $match: {
            'matches.timestamp': { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$matches.timestamp'
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ]);

      res.json({
        stats: {
          totalUsers,
          activeUsers,
          verifiedUsers,
          totalNotices,
          totalClubs,
          totalEvents,
          totalMessages: Math.floor(totalMessages / 2) // Divide by 2 since each conversation has 2 entries
        },
        charts: {
          usersByMonth,
          matchesByDay
        },
        recentUsers
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get all users with admin controls
router.get('/users', 
  authenticateToken, 
  requireAdmin,
  validatePagination,
  handleValidationErrors,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const filter = {};

      // Apply filters
      if (req.query.isVerified !== undefined) {
        filter.isVerified = req.query.isVerified === 'true';
      }
      if (req.query.isActive !== undefined) {
        filter.isActive = req.query.isActive === 'true';
      }
      if (req.query.course) {
        filter.course = req.query.course;
      }
      if (req.query.year) {
        filter.year = parseInt(req.query.year);
      }
      if (req.query.search) {
        filter.$or = [
          { firstName: new RegExp(req.query.search, 'i') },
          { lastName: new RegExp(req.query.search, 'i') },
          { email: new RegExp(req.query.search, 'i') },
          { rollNumber: new RegExp(req.query.search, 'i') }
        ];
      }

      const users = await User.find(filter)
        .populate('clubs', 'name')
        .select('-password -verificationToken -resetPasswordToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments(filter);

      res.json({
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasMore: page < Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Toggle user active status
router.put('/users/:id/toggle-status', 
  authenticateToken, 
  requireAdmin,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Don't allow deactivating other admins
      if (user.role === 'admin' && user._id.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Cannot deactivate other admins' });
      }

      user.isActive = !user.isActive;
      await user.save();

      res.json({
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isActive: user.isActive
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Delete user account
router.delete('/users/:id', 
  authenticateToken, 
  requireAdmin,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Don't allow deleting other admins
      if (user.role === 'admin' && user._id.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Cannot delete other admin accounts' });
      }

      // Remove user from all clubs
      await Club.updateMany(
        {},
        {
          $pull: {
            members: { user: req.params.id },
            president: req.params.id,
            vicePresident: req.params.id,
            secretary: req.params.id
          }
        }
      );

      // Delete user's messages
      await Message.deleteMany({
        $or: [
          { sender: req.params.id },
          { receiver: req.params.id }
        ]
      });

      // Remove user from other users' likes, matches, and blocks
      await User.updateMany(
        {},
        {
          $pull: {
            'likes.user': req.params.id,
            'matches.user': req.params.id,
            blocks: req.params.id
          }
        }
      );

      // Delete the user
      await User.findByIdAndDelete(req.params.id);

      res.json({ message: 'User account deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get reported users/content (placeholder for future implementation)
router.get('/reports', 
  authenticateToken, 
  requireAdmin,
  async (req, res) => {
    try {
      // This would typically involve a separate Report model
      // For now, return empty array with structure
      res.json({
        reports: [],
        message: 'Report system not implemented yet'
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get system logs (placeholder)
router.get('/logs', 
  authenticateToken, 
  requireAdmin,
  async (req, res) => {
    try {
      // This would typically read from log files or database
      // For now, return placeholder data
      res.json({
        logs: [
          {
            timestamp: new Date(),
            level: 'info',
            message: 'System running normally',
            source: 'server'
          }
        ],
        message: 'Logging system not fully implemented'
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Bulk operations
router.post('/users/bulk-action', 
  authenticateToken, 
  requireAdmin,
  async (req, res) => {
    try {
      const { userIds, action } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: 'User IDs array is required' });
      }

      let updateOperation = {};
      let message = '';

      switch (action) {
        case 'activate':
          updateOperation = { isActive: true };
          message = 'Users activated successfully';
          break;
        case 'deactivate':
          updateOperation = { isActive: false };
          message = 'Users deactivated successfully';
          break;
        case 'verify':
          updateOperation = { isVerified: true };
          message = 'Users verified successfully';
          break;
        default:
          return res.status(400).json({ message: 'Invalid action' });
      }

      // Don't allow bulk operations on admin accounts (except by the same admin)
      const result = await User.updateMany(
        {
          _id: { $in: userIds },
          $or: [
            { role: { $ne: 'admin' } },
            { _id: req.user.id }
          ]
        },
        updateOperation
      );

      res.json({
        message,
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Send system-wide announcement
router.post('/announcement', 
  authenticateToken, 
  requireAdmin,
  async (req, res) => {
    try {
      const { title, description, category = 'General', priority = 'High' } = req.body;

      if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
      }

      const notice = new Notice({
        title,
        description,
        category,
        priority,
        postedBy: req.user.id,
        targetAudience: {
          courses: [], // Empty means all courses
          years: [],   // Empty means all years
          branches: [] // Empty means all branches
        }
      });

      await notice.save();

      res.status(201).json({
        message: 'Announcement created successfully',
        notice
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

module.exports = router;