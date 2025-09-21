const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
  
  return { accessToken, refreshToken };
};

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const {
        email,
        rollNumber,
        password,
        firstName,
        lastName,
        course,
        branch,
        year,
        dateOfBirth,
        gender,
        interestedIn
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { rollNumber }]
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'User already exists with this email or roll number'
        });
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const user = new User({
        email,
        rollNumber,
        password,
        firstName,
        lastName,
        course,
        branch,
        year,
        dateOfBirth,
        gender,
        interestedIn,
        verificationToken,
        verificationExpires
      });

      await user.save();

      // Send verification email
      try {
        await sendVerificationEmail(email, verificationToken, firstName);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
      }

      res.status(201).json({
        message: 'User registered successfully. Please check your email for verification.',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check if user is verified
      if (!user.isVerified) {
        return res.status(400).json({
          message: 'Please verify your email before logging in'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(400).json({
          message: 'Your account has been deactivated'
        });
      }

      // Update last active
      user.lastActive = new Date();
      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id);

      res.json({
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isVerified
        },
        tokens: {
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Verify email
  verifyEmail: async (req, res) => {
    try {
      const { token } = req.params;

      const user = await User.findOne({
        verificationToken: token,
        verificationExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          message: 'Invalid or expired verification token'
        });
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationExpires = undefined;
      await user.save();

      // Send welcome email
      try {
        await sendWelcomeEmail(user.email, user.firstName);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get current user
  getMe: async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
        .populate('clubs', 'name category')
        .select('-password');

      res.json({
        user: {
          id: user._id,
          email: user.email,
          rollNumber: user.rollNumber,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          profilePicture: user.profilePicture,
          bio: user.bio,
          course: user.course,
          branch: user.branch,
          year: user.year,
          age: user.age,
          gender: user.gender,
          interestedIn: user.interestedIn,
          interests: user.interests,
          hobbies: user.hobbies,
          clubs: user.clubs,
          privacy: user.privacy,
          role: user.role,
          isVerified: user.isVerified,
          isActive: user.isActive,
          lastActive: user.lastActive
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Refresh token
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user || !user.isVerified || !user.isActive) {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

      res.json({
        tokens: {
          accessToken,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      res.status(403).json({ message: 'Invalid refresh token' });
    }
  }
};

module.exports = authController;