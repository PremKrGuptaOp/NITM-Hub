const express = require('express');
const matchController = require('../controllers/matchController');
const { authenticateToken, requireVerifiedStudent } = require('../middleware/auth');
const { 
  validateObjectId,
  validatePagination,
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// Get potential matches
router.get('/potential', 
  authenticateToken, 
  requireVerifiedStudent,
  validatePagination,
  handleValidationErrors,
  matchController.getPotentialMatches
);

// Like a user
router.post('/like/:id', 
  authenticateToken, 
  requireVerifiedStudent,
  validateObjectId,
  handleValidationErrors,
  matchController.likeUser
);

// Unlike a user
router.delete('/like/:id', 
  authenticateToken, 
  requireVerifiedStudent,
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const targetUserId = req.params.id;
      const currentUser = await User.findById(req.user.id);

      // Remove like
      currentUser.likes = currentUser.likes.filter(
        like => like.user.toString() !== targetUserId
      );

      // Remove match if it exists
      const wasMatched = currentUser.matches.some(
        match => match.user.toString() === targetUserId
      );

      if (wasMatched) {
        currentUser.matches = currentUser.matches.filter(
          match => match.user.toString() !== targetUserId
        );

        // Remove match from target user as well
        await User.findByIdAndUpdate(targetUserId, {
          $pull: { matches: { user: req.user.id } }
        });
      }

      await currentUser.save();

      res.json({ 
        message: 'Like removed successfully',
        wasMatched
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get user's matches
router.get('/list', 
  authenticateToken, 
  requireVerifiedStudent,
  validatePagination,
  handleValidationErrors,
  matchController.getMatches
);

// Get user's likes (who they liked)
router.get('/likes/sent', 
  authenticateToken, 
  requireVerifiedStudent,
  validatePagination,
  handleValidationErrors,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const user = await User.findById(req.user.id)
        .populate({
          path: 'likes.user',
          select: 'firstName lastName profilePicture course year isActive isVerified'
        });

      // Filter active likes and apply pagination
      const activeLikes = user.likes
        .filter(like => like.user && like.user.isActive && like.user.isVerified)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(skip, skip + limit);

      const totalLikes = user.likes.filter(like => 
        like.user && like.user.isActive && like.user.isVerified
      ).length;

      res.json({ 
        likes: activeLikes,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalLikes / limit),
          totalLikes,
          hasMore: page < Math.ceil(totalLikes / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get users who liked current user
router.get('/likes/received', 
  authenticateToken, 
  requireVerifiedStudent,
  validatePagination,
  handleValidationErrors,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Find users who have liked the current user
      const usersWhoLikedMe = await User.find({
        'likes.user': req.user.id,
        isActive: true,
        isVerified: true
      })
      .select('firstName lastName profilePicture course year likes')
      .populate('clubs', 'name category')
      .sort({ 'likes.timestamp': -1 })
      .skip(skip)
      .limit(limit);

      const total = await User.countDocuments({
        'likes.user': req.user.id,
        isActive: true,
        isVerified: true
      });

      // Get the timestamp when each user liked current user
      const likesReceived = usersWhoLikedMe.map(user => {
        const likeEntry = user.likes.find(like => 
          like.user.toString() === req.user.id
        );
        
        const userObj = user.toObject();
        delete userObj.likes; // Remove likes array from response
        
        return {
          user: userObj,
          timestamp: likeEntry ? likeEntry.timestamp : null
        };
      });

      res.json({ 
        likesReceived,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalLikes: total,
          hasMore: page < Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get match statistics
router.get('/stats', 
  authenticateToken, 
  requireVerifiedStudent,
  matchController.getMatchStats
);

module.exports = router;