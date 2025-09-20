const express = require('express');
const Notice = require('../models/Notice');
const { authenticateToken, requireAdmin, requireVerifiedStudent } = require('../middleware/auth');
const { 
  validateNotice, 
  validateObjectId,
  validatePagination,
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// Get all notices (public for verified students)
router.get('/', 
  authenticateToken, 
  requireVerifiedStudent,
  validatePagination,
  handleValidationErrors,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const currentUser = req.user;

      // Build filter query
      const filter = {
        isActive: true,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      };

      // Filter by category if specified
      if (req.query.category) {
        filter.category = req.query.category;
      }

      // Filter by priority if specified
      if (req.query.priority) {
        filter.priority = req.query.priority;
      }

      // Filter by target audience
      const targetFilter = {
        $or: [
          { 'targetAudience.courses': { $size: 0 } }, // No specific course targeting
          { 'targetAudience.courses': currentUser.course },
          { 'targetAudience.years': { $size: 0 } }, // No specific year targeting
          { 'targetAudience.years': currentUser.year },
          { 'targetAudience.branches': { $size: 0 } }, // No specific branch targeting
          { 'targetAudience.branches': currentUser.branch }
        ]
      };

      const finalFilter = {
        $and: [filter, targetFilter]
      };

      const notices = await Notice.find(finalFilter)
        .populate('postedBy', 'firstName lastName role')
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notice.countDocuments(finalFilter);

      res.json({
        notices,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalNotices: total,
          hasMore: page < Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get single notice
router.get('/:id', 
  authenticateToken, 
  requireVerifiedStudent,
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const notice = await Notice.findOne({
        _id: req.params.id,
        isActive: true
      }).populate('postedBy', 'firstName lastName role');

      if (!notice) {
        return res.status(404).json({ message: 'Notice not found' });
      }

      // Check if notice has expired
      if (notice.expiresAt && new Date() > notice.expiresAt) {
        return res.status(410).json({ message: 'Notice has expired' });
      }

      // Add view if not already viewed by this user
      const alreadyViewed = notice.views.some(
        view => view.user.toString() === req.user.id
      );

      if (!alreadyViewed) {
        notice.views.push({
          user: req.user.id,
          viewedAt: new Date()
        });
        await notice.save();
      }

      res.json({ notice });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Create notice (admin only)
router.post('/', 
  authenticateToken, 
  requireAdmin,
  validateNotice,
  handleValidationErrors,
  async (req, res) => {
    try {
      const noticeData = {
        ...req.body,
        postedBy: req.user.id
      };

      const notice = new Notice(noticeData);
      await notice.save();

      await notice.populate('postedBy', 'firstName lastName role');

      res.status(201).json({
        message: 'Notice created successfully',
        notice
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Update notice (admin only)
router.put('/:id', 
  authenticateToken, 
  requireAdmin,
  validateObjectId,
  validateNotice,
  handleValidationErrors,
  async (req, res) => {
    try {
      const notice = await Notice.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('postedBy', 'firstName lastName role');

      if (!notice) {
        return res.status(404).json({ message: 'Notice not found' });
      }

      res.json({
        message: 'Notice updated successfully',
        notice
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Delete notice (admin only)
router.delete('/:id', 
  authenticateToken, 
  requireAdmin,
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const notice = await Notice.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!notice) {
        return res.status(404).json({ message: 'Notice not found' });
      }

      res.json({ message: 'Notice deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get notice categories
router.get('/meta/categories', 
  authenticateToken, 
  requireVerifiedStudent,
  async (req, res) => {
    try {
      const categories = await Notice.distinct('category', {
        isActive: true,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      });

      res.json({ categories });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Mark notice as viewed
router.post('/:id/view', 
  authenticateToken, 
  requireVerifiedStudent,
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const notice = await Notice.findById(req.params.id);

      if (!notice) {
        return res.status(404).json({ message: 'Notice not found' });
      }

      // Check if already viewed
      const alreadyViewed = notice.views.some(
        view => view.user.toString() === req.user.id
      );

      if (!alreadyViewed) {
        notice.views.push({
          user: req.user.id,
          viewedAt: new Date()
        });
        await notice.save();
      }

      res.json({ message: 'Notice marked as viewed' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

module.exports = router;