const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

let io;
const connectedUsers = new Map();

const initializeSocket = (socketIo) => {
  io = socketIo;

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isVerified || !user.isActive) {
        return next(new Error('Authentication error'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.firstName} connected`);
    
    // Store user connection
    connectedUsers.set(socket.userId, socket.id);
    
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    
    // Update user's last active status
    User.findByIdAndUpdate(socket.userId, { lastActive: new Date() })
      .catch(err => console.error('Error updating last active:', err));

    // Handle joining conversation rooms
    socket.on('join-conversation', (otherUserId) => {
      const roomName = [socket.userId, otherUserId].sort().join('_');
      socket.join(roomName);
      console.log(`User ${socket.user.firstName} joined conversation room: ${roomName}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave-conversation', (otherUserId) => {
      const roomName = [socket.userId, otherUserId].sort().join('_');
      socket.leave(roomName);
      console.log(`User ${socket.user.firstName} left conversation room: ${roomName}`);
    });

    // Handle real-time messaging
    socket.on('send-message', async (data) => {
      try {
        const { receiverId, content, messageType = 'text' } = data;

        // Validate receiver
        const receiver = await User.findOne({
          _id: receiverId,
          isActive: true,
          isVerified: true
        });

        if (!receiver) {
          socket.emit('error', { message: 'Receiver not found' });
          return;
        }

        // Check if users are matched or have existing conversation
        const sender = await User.findById(socket.userId);
        const isMatched = sender.matches.some(
          match => match.user.toString() === receiverId
        );

        if (!isMatched) {
          const existingMessages = await Message.countDocuments({
            $or: [
              { sender: socket.userId, receiver: receiverId },
              { sender: receiverId, receiver: socket.userId }
            ]
          });

          if (existingMessages === 0) {
            socket.emit('error', { message: 'You can only message matched users' });
            return;
          }
        }

        // Create and save message
        const message = new Message({
          sender: socket.userId,
          receiver: receiverId,
          content: content.trim(),
          messageType
        });

        await message.save();
        await message.populate('sender receiver', 'firstName lastName profilePicture');

        // Send message to conversation room
        const roomName = [socket.userId, receiverId].sort().join('_');
        io.to(roomName).emit('new-message', message);

        // Send notification to receiver if they're online
        io.to(`user_${receiverId}`).emit('message-notification', {
          senderId: socket.userId,
          senderName: socket.user.firstName,
          message: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
          timestamp: new Date()
        });

        socket.emit('message-sent', { messageId: message._id, timestamp: message.createdAt });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing-start', (receiverId) => {
      const roomName = [socket.userId, receiverId].sort().join('_');
      socket.to(roomName).emit('user-typing', {
        userId: socket.userId,
        userName: socket.user.firstName,
        isTyping: true
      });
    });

    socket.on('typing-stop', (receiverId) => {
      const roomName = [socket.userId, receiverId].sort().join('_');
      socket.to(roomName).emit('user-typing', {
        userId: socket.userId,
        userName: socket.user.firstName,
        isTyping: false
      });
    });

    // Handle message read receipts
    socket.on('mark-messages-read', async (senderId) => {
      try {
        await Message.updateMany(
          {
            sender: senderId,
            receiver: socket.userId,
            isRead: false
          },
          {
            isRead: true,
            readAt: new Date()
          }
        );

        // Notify sender that messages were read
        io.to(`user_${senderId}`).emit('messages-read', {
          readerId: socket.userId,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle user status updates
    socket.on('update-status', (status) => {
      socket.broadcast.emit('user-status-update', {
        userId: socket.userId,
        status,
        timestamp: new Date()
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.firstName} disconnected`);
      connectedUsers.delete(socket.userId);
      
      // Update last active time
      User.findByIdAndUpdate(socket.userId, { lastActive: new Date() })
        .catch(err => console.error('Error updating last active on disconnect:', err));
      
      // Notify other users
      socket.broadcast.emit('user-offline', {
        userId: socket.userId,
        timestamp: new Date()
      });
    });
  });
};

// Helper functions for external use
const getConnectedUsers = () => {
  return Array.from(connectedUsers.keys());
};

const isUserOnline = (userId) => {
  return connectedUsers.has(userId);
};

const sendNotificationToUser = (userId, notification) => {
  if (io) {
    io.to(`user_${userId}`).emit('notification', notification);
  }
};

const sendMatchNotification = (userId1, userId2, matchData) => {
  if (io) {
    io.to(`user_${userId1}`).emit('new-match', matchData);
    io.to(`user_${userId2}`).emit('new-match', matchData);
  }
};

module.exports = {
  initializeSocket,
  getConnectedUsers,
  isUserOnline,
  sendNotificationToUser,
  sendMatchNotification
};