const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'unmatched', 'blocked'],
    default: 'active'
  },
  matchedAt: {
    type: Date,
    default: Date.now
  },
  lastMessageAt: {
    type: Date
  },
  // Match score based on compatibility
  compatibilityScore: {
    type: Number,
    default: 0
  },
  // Common interests, clubs, etc.
  commonFactors: {
    interests: [{
      type: String
    }],
    clubs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club'
    }],
    course: {
      type: Boolean,
      default: false
    },
    year: {
      type: Boolean,
      default: false
    },
    branch: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Compound index to ensure unique matches
matchSchema.index({ user1: 1, user2: 1 }, { unique: true });
matchSchema.index({ status: 1, matchedAt: -1 });

// Virtual for getting the other user in the match
matchSchema.methods.getOtherUser = function(currentUserId) {
  return this.user1.toString() === currentUserId.toString() ? this.user2 : this.user1;
};

// Static method to create a match
matchSchema.statics.createMatch = async function(user1Id, user2Id, commonFactors = {}) {
  // Ensure consistent ordering (smaller ID first)
  const [smallerId, largerId] = [user1Id, user2Id].sort();
  
  const match = new this({
    user1: smallerId,
    user2: largerId,
    commonFactors,
    compatibilityScore: this.calculateCompatibilityScore(commonFactors)
  });
  
  return await match.save();
};

// Static method to calculate compatibility score
matchSchema.statics.calculateCompatibilityScore = function(commonFactors) {
  let score = 0;
  
  if (commonFactors.interests) score += commonFactors.interests.length * 2;
  if (commonFactors.clubs) score += commonFactors.clubs.length * 3;
  if (commonFactors.course) score += 1;
  if (commonFactors.year) score += 1;
  if (commonFactors.branch) score += 2;
  
  return score;
};

module.exports = mongoose.model('Match', matchSchema);