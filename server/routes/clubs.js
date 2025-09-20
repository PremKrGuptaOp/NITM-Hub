const express = require('express');
const Club = require('../models/Club');
const User = require('../models/User');
const { authenticateToken, requireAdmin, requireVerifiedStudent } = require('../middleware/auth');
const { 
  validateClub, 
  validateObjectId,
  validatePagination,
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// Get all clubs
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

      // Build filter query
      const filter = { isActive: true };

      if (req.query.category) {
        filter.category = req.query.category;
      }

      if (req.query.search) {
        filter.$text = { $search: req.query.search };
      }

      const clubs = await Club.find(filter)
        .populate('president vicePresident secretary', 'firstName lastName profilePicture')
        .populate('members.user', 'firstName lastName profilePicture')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit);

      const total = await Club.countDocuments(filter);

      res.json({
        clubs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalClubs: total,
          hasMore: page < Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get single club
router.get('/:id', 
  authenticateToken, 
  requireVerifiedStudent,
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const club = await Club.findOne({
        _id: req.params.id,
        isActive: true
      })
      .populate('president vicePresident secretary', 'firstName lastName profilePicture course year')
      .populate('members.user', 'firstName lastName profilePicture course year')
      .populate('events', 'title startDate venue eventType status');

      if (!club) {
        return res.status(404).json({ message: 'Club not found' });
      }

      // Check if current user is a member
      const isMember = club.members.some(
        member => member.user._id.toString() === req.user.id
      );

      const clubData = club.toObject();
      clubData.isMember = isMember;

      res.json({ club: clubData });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Create club (admin only)
router.post('/', 
  authenticateToken, 
  requireAdmin,
  validateClub,
  handleValidationErrors,
  async (req, res) => {
    try {
      const club = new Club(req.body);
      await club.save();

      await club.populate('president vicePresident secretary', 'firstName lastName profilePicture');

      res.status(201).json({
        message: 'Club created successfully',
        club
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Update club (admin only)
router.put('/:id', 
  authenticateToken, 
  requireAdmin,
  validateObjectId,
  validateClub,
  handleValidationErrors,
  async (req, res) => {
    try {
      const club = await Club.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('president vicePresident secretary', 'firstName lastName profilePicture');

      if (!club) {
        return res.status(404).json({ message: 'Club not found' });
      }

      res.json({
        message: 'Club updated successfully',
        club
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Delete club (admin only)
router.delete('/:id', 
  authenticateToken, 
  requireAdmin,
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const club = await Club.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!club) {
        return res.status(404).json({ message: 'Club not found' });
      }

      // Remove club from all users' clubs array
      await User.updateMany(
        { clubs: req.params.id },
        { $pull: { clubs: req.params.id } }
      );

      res.json({ message: 'Club deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Join club
router.post('/:id/join', 
  authenticateToken, 
  requireVerifiedStudent,
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const clubId = req.params.id;
      const userId = req.user.id;

      const club = await Club.findOne({
        _id: clubId,
        isActive: true
      });

      if (!club) {
        return res.status(404).json({ message: 'Club not found' });
      }

      // Check if user is already a member
      const isMember = club.members.some(
        member => member.user.toString() === userId
      );

      if (isMember) {
        return res.status(400).json({ message: 'Already a member of this club' });
      }

      // Add user to club members
      club.members.push({
        user: userId,
        role: 'Member',
        joinedAt: new Date()
      });

      await club.save();

      // Add club to user's clubs array
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { clubs: clubId } }
      );

      res.json({ message: 'Successfully joined the club' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Leave club
router.post('/:id/leave', 
  authenticateToken, 
  requireVerifiedStudent,
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const clubId = req.params.id;
      const userId = req.user.id;

      const club = await Club.findById(clubId);

      if (!club) {
        return res.status(404).json({ message: 'Club not found' });
      }

      // Check if user is a member
      const memberIndex = club.members.findIndex(
        member => member.user.toString() === userId
      );

      if (memberIndex === -1) {
        return res.status(400).json({ message: 'Not a member of this club' });
      }

      // Remove user from club members
      club.members.splice(memberIndex, 1);
      await club.save();

      // Remove club from user's clubs array
      await User.findByIdAndUpdate(
        userId,
        { $pull: { clubs: clubId } }
      );

      res.json({ message: 'Successfully left the club' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get club members
router.get('/:id/members', 
  authenticateToken, 
  requireVerifiedStudent,
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const club = await Club.findOne({
        _id: req.params.id,
        isActive: true
      })
      .populate('members.user', 'firstName lastName profilePicture course year branch')
      .select('members');

      if (!club) {
        return res.status(404).json({ message: 'Club not found' });
      }

      res.json({ members: club.members });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Update member role (admin only)
router.put('/:id/members/:memberId', 
  authenticateToken, 
  requireAdmin,
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id: clubId, memberId } = req.params;
      const { role } = req.body;

      if (!['Member', 'Core Member', 'Coordinator'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      const club = await Club.findById(clubId);

      if (!club) {
        return res.status(404).json({ message: 'Club not found' });
      }

      const member = club.members.find(
        member => member.user.toString() === memberId
      );

      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }

      member.role = role;
      await club.save();

      res.json({ message: 'Member role updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get club categories
router.get('/meta/categories', 
  authenticateToken, 
  requireVerifiedStudent,
  async (req, res) => {
    try {
      const categories = await Club.distinct('category', { isActive: true });
      res.json({ categories });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

module.exports = router;