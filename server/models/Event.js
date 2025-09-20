const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
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
  eventType: {
    type: String,
    enum: ['Workshop', 'Seminar', 'Competition', 'Cultural', 'Sports', 'Social', 'Academic', 'Other'],
    required: true
  },
  
  // Event Details
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  
  // Location
  venue: {
    type: String,
    required: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  onlineLink: {
    type: String,
    validate: {
      validator: function(v) {
        return !this.isOnline || v;
      },
      message: 'Online link is required for online events'
    }
  },
  
  // Organization
  organizer: {
    type: String,
    enum: ['Club', 'Department', 'College', 'External'],
    required: true
  },
  organizingClub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  },
  organizingDepartment: {
    type: String
  },
  
  // Registration
  registrationRequired: {
    type: Boolean,
    default: false
  },
  registrationDeadline: {
    type: Date
  },
  maxParticipants: {
    type: Number,
    min: 1
  },
  registrationFee: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Participants
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Registered', 'Attended', 'Cancelled'],
      default: 'Registered'
    }
  }],
  
  // Media
  poster: {
    type: String
  },
  images: [{
    type: String
  }],
  
  // Additional Information
  prerequisites: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Contact
  contactPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contactEmail: {
    type: String,
    validate: {
      validator: function(email) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Please enter a valid email'
    }
  },
  contactPhone: {
    type: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Cancelled', 'Completed'],
    default: 'Draft'
  },
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
eventSchema.index({ eventType: 1, status: 1, startDate: 1 });
eventSchema.index({ organizingClub: 1, status: 1 });
eventSchema.index({ startDate: 1, endDate: 1 });

// Virtual for participant count
eventSchema.virtual('participantCount').get(function() {
  return this.attendees.filter(attendee => attendee.status === 'Registered').length;
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  if (!this.maxParticipants) return null;
  return this.maxParticipants - this.participantCount;
});

// Virtual for event status based on dates
eventSchema.virtual('eventStatus').get(function() {
  const now = new Date();
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  
  if (now < start) return 'Upcoming';
  if (now >= start && now <= end) return 'Ongoing';
  return 'Completed';
});

// Ensure virtual fields are serialized
eventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);