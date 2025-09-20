const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        // Only allow NITM email addresses
        return email.endsWith('@nitm.ac.in') || email.endsWith('@student.nitm.ac.in');
      },
      message: 'Only NIT Meghalaya email addresses are allowed'
    }
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Profile Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  additionalPhotos: [{
    type: String
  }],
  bio: {
    type: String,
    maxlength: 500
  },
  
  // Academic Information
  course: {
    type: String,
    required: true,
    enum: ['BTech', 'MTech', 'PhD', 'MBA']
  },
  branch: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  // Personal Information
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  interestedIn: [{
    type: String,
    enum: ['Male', 'Female', 'Other']
  }],
  
  // Interests and Hobbies
  interests: [{
    type: String,
    trim: true
  }],
  hobbies: [{
    type: String,
    trim: true
  }],
  
  // Club Memberships
  clubs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  }],
  
  // Dating Features
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  matches: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  blocks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Privacy Settings
  privacy: {
    showEmail: {
      type: Boolean,
      default: false
    },
    showRollNumber: {
      type: Boolean,
      default: false
    },
    showYear: {
      type: Boolean,
      default: true
    },
    showCourse: {
      type: Boolean,
      default: true
    },
    showClubs: {
      type: Boolean,
      default: true
    }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  
  // Role
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  }
}, {
  timestamps: true
});

// Index for search functionality
userSchema.index({ firstName: 'text', lastName: 'text', interests: 'text' });
userSchema.index({ course: 1, year: 1, branch: 1 });
userSchema.index({ isActive: 1, isVerified: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get age from date of birth
userSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);