const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    enum: ['Technical', 'Cultural', 'Sports', 'Social', 'Academic', 'Other'],
    required: true
  },
  logo: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  
  // Leadership
  president: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  vicePresident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  secretary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Members
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['Member', 'Core Member', 'Coordinator'],
      default: 'Member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Contact Information
  contactEmail: {
    type: String,
    validate: {
      validator: function(email) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Please enter a valid email'
    }
  },
  socialLinks: {
    website: String,
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  establishedYear: {
    type: Number,
    min: 2000,
    max: new Date().getFullYear()
  },
  
  // Events
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }]
}, {
  timestamps: true
});

// Index for search functionality
clubSchema.index({ name: 'text', description: 'text' });
clubSchema.index({ category: 1, isActive: 1 });

// Virtual for member count
clubSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Ensure virtual fields are serialized
clubSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Club', clubSchema);