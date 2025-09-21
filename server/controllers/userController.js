const User = require('../models/User');

const userController = {
  // Get all users with filters
  getUsers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Build filter query
      const filter = {
        isActive: true,
        isVerified: true,
        _id: { $ne: req.user.id },
        blocks: { $nin: [req.user.id] }
      };

      // Add filters based on query params
      if (req.query.course) filter.course = req.query.course;
      if (req.query.year) filter.year = parseInt(req.query.year);
      if (req.query.branch) filter.branch = new RegExp(req.query.branch, 'i');
      if (req.query.gender) filter.gender = req.query.gender;
      
      // Search by name or interests
      if (req.query.search) {
        filter.$text = { $search: req.query.search };
      }

      const users = await User.find(filter)
        .populate('clubs', 'name category')
        .select('-password -verificationToken -resetPasswordToken -likes -matches -blocks')
        .sort({ lastActive: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments(filter);

      // Apply privacy filters
      const filteredUsers = users.map(user => {
        const userObj = user.toObject();
        
        if (!user.privacy.showEmail) delete userObj.email;
        if (!user.privacy.showRollNumber) delete userObj.rollNumber;
        if (!user.privacy.showYear) delete userObj.year;
        if (!user.privacy.showCourse) delete userObj.course;
        if (!user.privacy.showClubs) delete userObj.clubs;

        return userObj;
      });

      res.json({
        users: filteredUsers,
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
  },

  // Get user by ID
  getUserById: async (req, res) => {
    try {
      const user = await User.findOne({
        _id: req.params.id,
        isActive: true,
        isVerified: true
      })
      .populate('clubs', 'name category description')
      .select('-password -verificationToken -resetPasswordToken -likes -matches');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user has blocked current user or vice versa
      if (user.blocks.includes(req.user.id)) {
        return res.status(403).json({ message: 'User not accessible' });
      }

      const currentUser = await User.findById(req.user.id);
      if (currentUser.blocks.includes(user._id)) {
        return res.status(403).json({ message: 'User not accessible' });
      }

      // Apply privacy filters
      const userObj = user.toObject();
      
      if (!user.privacy.showEmail) delete userObj.email;
      if (!user.privacy.showRollNumber) delete userObj.rollNumber;
      if (!user.privacy.showYear) delete userObj.year;
      if (!user.privacy.showCourse) delete userObj.course;
      if (!user.privacy.showClubs) delete userObj.clubs;

      res.json({ user: userObj });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const allowedFields = [
        'firstName', 'lastName', 'bio', 'profilePicture', 'additionalPhotos',
        'interests', 'hobbies', 'interestedIn', 'privacy'
      ];

      const updates = {};
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      const user = await User.findByIdAndUpdate(
        req.user.id,
        updates,
        { new: true, runValidators: true }
      )
      .populate('clubs', 'name category')
      .select('-password');

      res.json({
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Block a user
  blockUser: async (req, res) => {
    try {
      const targetUserId = req.params.id;

      if (targetUserId === req.user.id) {
        return res.status(400).json({ message: 'Cannot block yourself' });
      }

      const currentUser = await User.findById(req.user.id);

      // Check if already blocked
      if (currentUser.blocks.includes(targetUserId)) {
        return res.status(400).json({ message: 'User already blocked' });
      }

      // Add to blocks
      currentUser.blocks.push(targetUserId);

      // Remove from likes and matches if present
      currentUser.likes = currentUser.likes.filter(
        like => like.user.toString() !== targetUserId
      );
      currentUser.matches = currentUser.matches.filter(
        match => match.user.toString() !== targetUserId
      );

      await currentUser.save();

      // Remove current user from target user's likes and matches
      await User.findByIdAndUpdate(targetUserId, {
        $pull: {
          likes: { user: req.user.id },
          matches: { user: req.user.id }
        }
      });

      res.json({ message: 'User blocked successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Unblock a user
  unblockUser: async (req, res) => {
    try {
      const targetUserId = req.params.id;

      await User.findByIdAndUpdate(
        req.user.id,
        { $pull: { blocks: targetUserId } }
      );

      res.json({ message: 'User unblocked successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = userController;