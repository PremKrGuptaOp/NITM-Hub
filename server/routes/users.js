const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, requireVerifiedStudent } = require('../middleware/auth');
const { 
  validateUserUpdate, 
  validateObjectId,
  validatePagination,
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// Get all users (with pagination and filters)
router.get('/', 
  authenticateToken, 
  requireVerifiedStudent,
  validatePagination,
  handleValidationErrors,
  userController.getUsers
);

// Get user by ID
router.get('/:id', 
  authenticateToken, 
  requireVerifiedStudent,
  validateObjectId,
  handleValidationErrors,
  userController.getUserById
);

// Update user profile
router.put('/profile', 
  authenticateToken, 
  requireVerifiedStudent,
  validateUserUpdate,
  handleValidationErrors,
  userController.updateProfile
);

// Get potential matches
router.get('/matches/potential', 
  authenticateToken, 
  requireVerifiedStudent,
  async (req, res) => {
    try {
      const currentUser = await User.findById(req.user.id)
        .populate('likes.user matches.user blocks clubs');

      // Get IDs of users to exclude
      const likedUserIds = currentUser.likes.map(like => like.user._id);
      const matchedUserIds = currentUser.matches.map(match => match.user._id);
      const blockedUserIds = currentUser.blocks;

      const excludeIds = [...likedUserIds, ...matchedUserIds, ...blockedUserIds, req.user.id];

      // Build match criteria
      const matchFilter = {
        isActive: true,
        isVerified: true,
        _id: { $nin: excludeIds },
        blocks: { $nin: [req.user.id] }, // Don't show users who blocked current user
        interestedIn: { $in: [currentUser.gender] }
      };

      // Add gender preference filter
      if (currentUser.interestedIn && currentUser.interestedIn.length > 0) {
        matchFilter.gender = { $in: currentUser.interestedIn };
      }

      let potentialMatches = await User.find(matchFilter)
        .populate('clubs', 'name category')
        .select('-password -verificationToken -resetPasswordToken -likes -matches -blocks')
        .limit(20);

      // Score matches based on common interests and clubs
      potentialMatches = potentialMatches.map(match => {
        let score = 0;
        const matchObj = match.toObject();

        // Common interests
        const commonInterests = match.interests?.filter(interest => 
          currentUser.interests?.includes(interest)
        ) || [];
        score += commonInterests.length * 2;

        // Common clubs
        const currentUserClubIds = currentUser.clubs.map(club => club._id.toString());
        const commonClubs = match.clubs?.filter(club => 
          currentUserClubIds.includes(club._id.toString())
        ) || [];
        score += commonClubs.length * 3;

        // Same course/year bonus
        if (match.course === currentUser.course) score += 1;
        if (match.year === currentUser.year) score += 1;
        if (match.branch === currentUser.branch) score += 2;

        matchObj.matchScore = score;
        matchObj.commonInterests = commonInterests;
        matchObj.commonClubs = commonClubs;

        // Apply privacy filters
        if (!match.privacy.showEmail) delete matchObj.email;
        if (!match.privacy.showRollNumber) delete matchObj.rollNumber;
        if (!match.privacy.showYear) delete matchObj.year;
        if (!match.privacy.showCourse) delete matchObj.course;
        if (!match.privacy.showClubs) delete matchObj.clubs;

        return matchObj;
      });

      // Sort by match score (highest first)
      potentialMatches.sort((a, b) => b.matchScore - a.matchScore);

      res.json({ potentialMatches });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Like a user
router.post('/like/:id', 
  authenticateToken, 
  requireVerifiedStudent,
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const targetUserId = req.params.id;

      if (targetUserId === req.user.id) {
        return res.status(400).json({ message: 'Cannot like yourself' });
      }

      const targetUser = await User.findOne({
        _id: targetUserId,
        isActive: true,
        isVerified: true
      });

      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const currentUser = await User.findById(req.user.id);

      // Check if already liked
      const alreadyLiked = currentUser.likes.some(
        like => like.user.toString() === targetUserId
      );

      if (alreadyLiked) {
        return res.status(400).json({ message: 'User already liked' });
      }

      // Check if blocked
      if (currentUser.blocks.includes(targetUserId) || 
          targetUser.blocks.includes(req.user.id)) {
        return res.status(403).json({ message: 'Cannot like this user' });
      }

      // Add like
      currentUser.likes.push({
        user: targetUserId,
        timestamp: new Date()
      });

      await currentUser.save();

      // Check if it's a mutual like (match)
      const targetUserLikesMe = targetUser.likes.some(
        like => like.user.toString() === req.user.id
      );

      let isMatch = false;
      if (targetUserLikesMe) {
        // Create mutual match
        currentUser.matches.push({
          user: targetUserId,
          timestamp: new Date()
        });

        targetUser.matches.push({
          user: req.user.id,
          timestamp: new Date()
        });

        await currentUser.save();
        await targetUser.save();

        isMatch = true;
      }

      res.json({
        message: isMatch ? 'It\'s a match!' : 'User liked successfully',
        isMatch,
        like: {
          user: targetUserId,
          timestamp: new Date()
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get matches
router.get('/matches/list', 
  authenticateToken, 
  requireVerifiedStudent,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
        .populate({
          path: 'matches.user',
          select: '-password -verificationToken -resetPasswordToken -likes -matches -blocks',
          populate: {
            path: 'clubs',
            select: 'name category'
          }
        });

      // Filter out inactive or unverified matches
      const activeMatches = user.matches.filter(match => 
        match.user && match.user.isActive && match.user.isVerified
      );

      res.json({ matches: activeMatches });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Block a user
router.post('/block/:id', 
  authenticateToken, 
  requireVerifiedStudent,
  validateObjectId,
  handleValidationErrors,
  userController.blockUser
);

// Unblock a user
router.delete('/block/:id', 
  authenticateToken, 
  requireVerifiedStudent,
  validateObjectId,
  handleValidationErrors,
  userController.unblockUser
);

// Get blocked users
router.get('/blocks/list', 
  authenticateToken, 
  requireVerifiedStudent,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
        .populate('blocks', 'firstName lastName profilePicture');

      res.json({ blockedUsers: user.blocks });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

module.exports = router;