const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { authenticateToken, requireVerifiedStudent } = require('../middleware/auth');
const { 
  validateMessage, 
  validateObjectId,
  validatePagination,
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// Get conversations
router.get('/conversations', 
  authenticateToken, 
  requireVerifiedStudent,
  async (req, res) => {
    try {
      const userId = req.user.id;

      // Get all conversations where user is sender or receiver
      const conversations = await Message.aggregate([
        {
          $match: {
            $or: [
              { sender: userId },
              { receiver: userId }
            ],
            isDeleted: false
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ['$sender', userId] },
                '$receiver',
                '$sender'
              ]
            },
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$receiver', userId] },
                      { $eq: ['$isRead', false] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $sort: { 'lastMessage.createdAt': -1 }
        }
      ]);

      // Populate user details
      const populatedConversations = await User.populate(conversations, {
        path: '_id',
        select: 'firstName lastName profilePicture isActive lastActive'
      });

      // Filter out inactive users and format response
      const activeConversations = populatedConversations
        .filter(conv => conv._id && conv._id.isActive)
        .map(conv => ({
          user: conv._id,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount
        }));

      res.json({ conversations: activeConversations });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get messages with a specific user
router.get('/conversation/:userId', 
  authenticateToken, 
  requireVerifiedStudent,
  validateObjectId,
  validatePagination,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      // Check if other user exists and is active
      const otherUser = await User.findOne({
        _id: userId,
        isActive: true,
        isVerified: true
      }).select('firstName lastName profilePicture');

      if (!otherUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if current user has blocked the other user or vice versa
      const currentUser = await User.findById(currentUserId);
      if (currentUser.blocks.includes(userId) || 
          otherUser.blocks?.includes(currentUserId)) {
        return res.status(403).json({ message: 'Cannot access conversation' });
      }

      // Get messages between users
      const messages = await Message.find({
        $or: [
          { sender: currentUserId, receiver: userId },
          { sender: userId, receiver: currentUserId }
        ],
        $or: [
          { isDeleted: false },
          { 
            isDeleted: true, 
            'deletedBy.user': { $ne: currentUserId } 
          }
        ]
      })
      .populate('sender receiver', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

      // Mark messages as read
      await Message.updateMany(
        {
          sender: userId,
          receiver: currentUserId,
          isRead: false
        },
        {
          $set: {
            isRead: true,
            readAt: new Date()
          }
        }
      );

      const total = await Message.countDocuments({
        $or: [
          { sender: currentUserId, receiver: userId },
          { sender: userId, receiver: currentUserId }
        ],
        $or: [
          { isDeleted: false },
          { 
            isDeleted: true, 
            'deletedBy.user': { $ne: currentUserId } 
          }
        ]
      });

      res.json({
        messages: messages.reverse(), // Reverse to show oldest first
        otherUser,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalMessages: total,
          hasMore: page < Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Send a message
router.post('/send', 
  authenticateToken, 
  requireVerifiedStudent,
  validateMessage,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { receiver, content, messageType = 'text' } = req.body;
      const senderId = req.user.id;

      // Check if receiver exists and is active
      const receiverUser = await User.findOne({
        _id: receiver,
        isActive: true,
        isVerified: true
      });

      if (!receiverUser) {
        return res.status(404).json({ message: 'Receiver not found' });
      }

      // Check if users are matched or if they can message each other
      const senderUser = await User.findById(senderId);
      
      // Check if blocked
      if (senderUser.blocks.includes(receiver) || 
          receiverUser.blocks.includes(senderId)) {
        return res.status(403).json({ message: 'Cannot send message to this user' });
      }

      // Check if users are matched (required for first message)
      const isMatched = senderUser.matches.some(
        match => match.user.toString() === receiver
      );

      if (!isMatched) {
        // Allow messaging only if there's an existing conversation
        const existingMessages = await Message.countDocuments({
          $or: [
            { sender: senderId, receiver },
            { sender: receiver, receiver: senderId }
          ]
        });

        if (existingMessages === 0) {
          return res.status(403).json({ 
            message: 'You can only message matched users' 
          });
        }
      }

      // Create message
      const message = new Message({
        sender: senderId,
        receiver,
        content: content.trim(),
        messageType
      });

      await message.save();

      // Populate sender and receiver details
      await message.populate('sender receiver', 'firstName lastName profilePicture');

      // Emit real-time message via Socket.IO (if implemented)
      const io = req.app.get('socketio');
      if (io) {
        io.to(`user_${receiver}`).emit('newMessage', message);
      }

      res.status(201).json({
        message: 'Message sent successfully',
        data: message
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Mark message as read
router.put('/:messageId/read', 
  authenticateToken, 
  requireVerifiedStudent,
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;

      const message = await Message.findOneAndUpdate(
        {
          _id: messageId,
          receiver: userId,
          isRead: false
        },
        {
          isRead: true,
          readAt: new Date()
        },
        { new: true }
      );

      if (!message) {
        return res.status(404).json({ message: 'Message not found or already read' });
      }

      res.json({ message: 'Message marked as read' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Delete message
router.delete('/:messageId', 
  authenticateToken, 
  requireVerifiedStudent,
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;

      const message = await Message.findOne({
        _id: messageId,
        $or: [
          { sender: userId },
          { receiver: userId }
        ]
      });

      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      // Add user to deletedBy array
      const alreadyDeleted = message.deletedBy.some(
        del => del.user.toString() === userId
      );

      if (!alreadyDeleted) {
        message.deletedBy.push({
          user: userId,
          deletedAt: new Date()
        });
      }

      // If both users have deleted the message, mark as deleted
      if (message.deletedBy.length === 2) {
        message.isDeleted = true;
      }

      await message.save();

      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get unread message count
router.get('/unread/count', 
  authenticateToken, 
  requireVerifiedStudent,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const unreadCount = await Message.countDocuments({
        receiver: userId,
        isRead: false,
        isDeleted: false
      });

      res.json({ unreadCount });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

module.exports = router;