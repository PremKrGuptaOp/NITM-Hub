const User = require('../models/User');
const Match = require('../models/Match');

const matchController = {
  // Get potential matches
  getPotentialMatches: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

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
        blocks: { $nin: [req.user.id] },
        interestedIn: { $in: [currentUser.gender] }
      };

      // Add gender preference filter
      if (currentUser.interestedIn && currentUser.interestedIn.length > 0) {
        matchFilter.gender = { $in: currentUser.interestedIn };
      }

      let potentialMatches = await User.find(matchFilter)
        .populate('clubs', 'name category')
        .select('-password -verificationToken -resetPasswordToken -likes -matches -blocks')
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments(matchFilter);

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

      res.json({ 
        potentialMatches,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalMatches: total,
          hasMore: page < Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Like a user
  likeUser: async (req, res) => {
    try {
      const targetUserId = req.params.id;

      if (targetUserId === req.user.id) {
        return res.status(400).json({ message: 'Cannot like yourself' });
      }

      const targetUser = await User.findOne({
        _id: targetUserId,
        isActive: true,
        isVerified: true
      }).populate('clubs interests');

      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const currentUser = await User.findById(req.user.id).populate('clubs interests');

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
      let matchData = null;

      if (targetUserLikesMe) {
        // Calculate common factors for match
        const commonFactors = {
          interests: currentUser.interests?.filter(interest => 
            targetUser.interests?.includes(interest)
          ) || [],
          clubs: currentUser.clubs?.filter(club => 
            targetUser.clubs?.some(targetClub => targetClub._id.toString() === club._id.toString())
          ).map(club => club._id) || [],
          course: currentUser.course === targetUser.course,
          year: currentUser.year === targetUser.year,
          branch: currentUser.branch === targetUser.branch
        };

        // Create match record
        matchData = await Match.createMatch(req.user.id, targetUserId, commonFactors);

        // Add to users' matches arrays
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

        // Send real-time match notification
        const io = req.app.get('socketio');
        if (io) {
          const matchNotification = {
            matchedUser: {
              id: currentUser._id,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              profilePicture: currentUser.profilePicture
            },
            timestamp: new Date(),
            matchId: matchData._id
          };

          io.to(`user_${targetUserId}`).emit('new-match', matchNotification);
          
          const targetMatchNotification = {
            matchedUser: {
              id: targetUser._id,
              firstName: targetUser.firstName,
              lastName: targetUser.lastName,
              profilePicture: targetUser.profilePicture
            },
            timestamp: new Date(),
            matchId: matchData._id
          };

          io.to(`user_${req.user.id}`).emit('new-match', targetMatchNotification);
        }
      }

      res.json({
        message: isMatch ? 'It\'s a match!' : 'User liked successfully',
        isMatch,
        matchId: matchData?._id,
        like: {
          user: targetUserId,
          timestamp: new Date()
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get user's matches
  getMatches: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const matches = await Match.find({
        $or: [
          { user1: req.user.id },
          { user2: req.user.id }
        ],
        status: 'active'
      })
      .populate('user1 user2', '-password -verificationToken -resetPasswordToken -likes -matches -blocks')
      .populate('commonFactors.clubs', 'name category')
      .sort({ matchedAt: -1 })
      .skip(skip)
      .limit(limit);

      const total = await Match.countDocuments({
        $or: [
          { user1: req.user.id },
          { user2: req.user.id }
        ],
        status: 'active'
      });

      // Format matches to show the other user
      const formattedMatches = matches.map(match => {
        const otherUser = match.getOtherUser(req.user.id);
        const otherUserData = match.user1._id.toString() === req.user.id ? match.user2 : match.user1;
        
        return {
          matchId: match._id,
          user: otherUserData,
          matchedAt: match.matchedAt,
          lastMessageAt: match.lastMessageAt,
          compatibilityScore: match.compatibilityScore,
          commonFactors: match.commonFactors
        };
      });

      res.json({ 
        matches: formattedMatches,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalMatches: total,
          hasMore: page < Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get match statistics
  getMatchStats: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      const totalMatches = await Match.countDocuments({
        $or: [
          { user1: req.user.id },
          { user2: req.user.id }
        ],
        status: 'active'
      });

      const stats = {
        totalLikes: user.likes.length,
        totalMatches,
        profileViews: user.views ? user.views.length : 0,
        joinedDate: user.createdAt
      };

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      stats.recentLikes = user.likes.filter(like => 
        like.timestamp >= sevenDaysAgo
      ).length;

      const recentMatches = await Match.countDocuments({
        $or: [
          { user1: req.user.id },
          { user2: req.user.id }
        ],
        status: 'active',
        matchedAt: { $gte: sevenDaysAgo }
      });

      stats.recentMatches = recentMatches;

      res.json({ stats });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = matchController;