const express = require('express');
const Event = require('../models/Event');
const Club = require('../models/Club');
const { authenticateToken, requireAdmin, requireVerifiedStudent } = require('../middleware/auth');
const { 
  validateEvent, 
  validateObjectId,
  validatePagination,
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// Get all events
router.get('/', 
  authenticateToken, 
  requireVerifiedStudent,
  validatePagination,
  handleValidationErrors,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Build filter query
      const filter = { status: { $in: ['Published'] } };

      if (req.query.eventType) {
        filter.eventType = req.query.eventType;
      }

      if (req.query.organizer) {
        filter.organizer = req.query.organizer;
      }

      if (req.query.club) {
        filter.organizingClub = req.query.club;
      }

      // Filter by date range
      if (req.query.startDate || req.query.endDate) {
        filter.startDate = {};
        if (req.query.startDate) {
          filter.startDate.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
          filter.startDate.$lte = new Date(req.query.endDate);
        }
      }

      // Show only upcoming events by default
      if (req.query.timeFilter === 'upcoming') {
        filter.startDate = { $gte: new Date() };
      } else if (req.query.timeFilter === 'past') {
        filter.endDate = { $lt: new Date() };
      } else if (req.query.timeFilter === 'ongoing') {
        const now = new Date();
        filter.startDate = { $lte: now };
        filter.endDate = { $gte: now };
      }

      const events = await Event.find(filter)
        .populate('organizingClub', 'name logo')
        .populate('createdBy', 'firstName lastName')
        .populate('contactPerson', 'firstName lastName email')
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(limit);

      const total = await Event.countDocuments(filter);

      // Add registration status for current user
      const eventsWithRegistration = events.map(event => {
        const eventObj = event.toObject();
        const isRegistered = event.attendees.some(
          attendee => attendee.user.toString() === req.user.id
        );
        eventObj.isRegistered = isRegistered;
        return eventObj;
      });

      res.json({
        events: eventsWithRegistration,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalEvents: total,
          hasMore: page < Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get single event
router.get('/:id', 
  authenticateToken, 
  requireVerifiedStudent,
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id)
        .populate('organizingClub', 'name logo description')
        .populate('createdBy', 'firstName lastName')
        .populate('contactPerson', 'firstName lastName email')
        .populate('attendees.user', 'firstName lastName profilePicture course year');

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if current user is registered
      const isRegistered = event.attendees.some(
        attendee => attendee.user._id.toString() === req.user.id
      );

      const eventObj = event.toObject();
      eventObj.isRegistered = isRegistered;

      res.json({ event: eventObj });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Create event
router.post('/', 
  authenticateToken, 
  requireVerifiedStudent,
  validateEvent,
  handleValidationErrors,
  async (req, res) => {
    try {
      // Only allow club members to create events for their clubs
      if (req.body.organizer === 'Club' && req.body.organizingClub) {
        const club = await Club.findById(req.body.organizingClub);
        if (!club) {
          return res.status(404).json({ message: 'Club not found' });
        }

        const isMember = club.members.some(
          member => member.user.toString() === req.user.id
        );

        if (!isMember && req.user.role !== 'admin') {
          return res.status(403).json({ 
            message: 'Only club members can create events for the club' 
          });
        }
      }

      const eventData = {
        ...req.body,
        createdBy: req.user.id
      };

      const event = new Event(eventData);
      await event.save();

      // Add event to organizing club's events array
      if (event.organizingClub) {
        await Club.findByIdAndUpdate(
          event.organizingClub,
          { $push: { events: event._id } }
        );
      }

      await event.populate('organizingClub', 'name logo');
      await event.populate('createdBy', 'firstName lastName');

      res.status(201).json({
        message: 'Event created successfully',
        event
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Update event (creator or admin only)
router.put('/:id', 
  authenticateToken, 
  requireVerifiedStudent,
  validateObjectId,
  validateEvent,
  handleValidationErrors,
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if user can update this event
      const canUpdate = event.createdBy.toString() === req.user.id || 
                       req.user.role === 'admin';

      if (!canUpdate) {
        return res.status(403).json({ 
          message: 'Only event creator or admin can update this event' 
        });
      }

      const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      )
      .populate('organizingClub', 'name logo')
      .populate('createdBy', 'firstName lastName');

      res.json({
        message: 'Event updated successfully',
        event: updatedEvent
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Delete event (creator or admin only)
router.delete('/:id', 
  authenticateToken, 
  requireVerifiedStudent,
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if user can delete this event
      const canDelete = event.createdBy.toString() === req.user.id || 
                       req.user.role === 'admin';

      if (!canDelete) {
        return res.status(403).json({ 
          message: 'Only event creator or admin can delete this event' 
        });
      }

      await Event.findByIdAndDelete(req.params.id);

      // Remove event from organizing club's events array
      if (event.organizingClub) {
        await Club.findByIdAndUpdate(
          event.organizingClub,
          { $pull: { events: req.params.id } }
        );
      }

      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Register for event
router.post('/:id/register', 
  authenticateToken, 
  requireVerifiedStudent,
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const eventId = req.params.id;
      const userId = req.user.id;

      const event = await Event.findById(eventId);

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if event is published and not completed
      if (event.status !== 'Published') {
        return res.status(400).json({ message: 'Event is not available for registration' });
      }

      // Check if registration is required
      if (!event.registrationRequired) {
        return res.status(400).json({ message: 'This event does not require registration' });
      }

      // Check registration deadline
      if (event.registrationDeadline && new Date() > event.registrationDeadline) {
        return res.status(400).json({ message: 'Registration deadline has passed' });
      }

      // Check if event has started
      if (new Date() > event.startDate) {
        return res.status(400).json({ message: 'Cannot register for an event that has already started' });
      }

      // Check if user is already registered
      const isAlreadyRegistered = event.attendees.some(
        attendee => attendee.user.toString() === userId
      );

      if (isAlreadyRegistered) {
        return res.status(400).json({ message: 'Already registered for this event' });
      }

      // Check max participants limit
      if (event.maxParticipants && event.participantCount >= event.maxParticipants) {
        return res.status(400).json({ message: 'Event is full' });
      }

      // Add user to attendees
      event.attendees.push({
        user: userId,
        registeredAt: new Date(),
        status: 'Registered'
      });

      await event.save();

      res.json({ 
        message: 'Successfully registered for the event',
        registration: {
          eventId,
          registeredAt: new Date(),
          status: 'Registered'
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Cancel registration
router.delete('/:id/register', 
  authenticateToken, 
  requireVerifiedStudent,
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const eventId = req.params.id;
      const userId = req.user.id;

      const event = await Event.findById(eventId);

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if user is registered
      const attendeeIndex = event.attendees.findIndex(
        attendee => attendee.user.toString() === userId
      );

      if (attendeeIndex === -1) {
        return res.status(400).json({ message: 'Not registered for this event' });
      }

      // Check if event has started (may want to allow cancellation up to event start)
      const hoursUntilEvent = (event.startDate - new Date()) / (1000 * 60 * 60);
      if (hoursUntilEvent < 2) {
        return res.status(400).json({ 
          message: 'Cannot cancel registration less than 2 hours before the event' 
        });
      }

      // Remove user from attendees
      event.attendees.splice(attendeeIndex, 1);
      await event.save();

      res.json({ message: 'Registration cancelled successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get user's registered events
router.get('/user/registered', 
  authenticateToken, 
  requireVerifiedStudent,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const events = await Event.find({
        'attendees.user': userId,
        'attendees.status': 'Registered'
      })
      .populate('organizingClub', 'name logo')
      .sort({ startDate: 1 });

      res.json({ events });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get event attendees (for event creator/admin)
router.get('/:id/attendees', 
  authenticateToken, 
  requireVerifiedStudent,
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id)
        .populate('attendees.user', 'firstName lastName profilePicture course year branch email');

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if user can view attendees
      const canView = event.createdBy.toString() === req.user.id || 
                     req.user.role === 'admin' ||
                     (event.organizingClub && req.user.clubs.includes(event.organizingClub));

      if (!canView) {
        return res.status(403).json({ 
          message: 'Only event creator, club members, or admin can view attendees' 
        });
      }

      res.json({ 
        attendees: event.attendees,
        totalAttendees: event.attendees.length 
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

module.exports = router;