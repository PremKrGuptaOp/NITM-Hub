const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    enum: ['Academic', 'Exam', 'Event', 'General', 'Placement', 'Hostel', 'Emergency'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  targetAudience: {
    courses: [{
      type: String,
      enum: ['BTech', 'MTech', 'PhD', 'MBA']
    }],
    years: [{
      type: Number,
      min: 1,
      max: 5
    }],
    branches: [{
      type: String
    }]
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date
  },
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient querying
noticeSchema.index({ category: 1, priority: 1, createdAt: -1 });
noticeSchema.index({ isActive: 1, expiresAt: 1 });
noticeSchema.index({ 'targetAudience.courses': 1, 'targetAudience.years': 1 });

module.exports = mongoose.model('Notice', noticeSchema);