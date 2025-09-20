import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Event } from '../../types';
import { Calendar, Clock, MapPin, Users, User } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const [isRSVPd, setIsRSVPd] = useState(false);

  const handleRSVP = () => {
    setIsRSVPd(!isRSVPd);
    toast.success(isRSVPd ? 'RSVP cancelled' : 'RSVP confirmed! 🎉');
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'technical':
        return 'from-blue-500 to-indigo-500';
      case 'cultural':
        return 'from-purple-500 to-pink-500';
      case 'sports':
        return 'from-green-500 to-teal-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-md overflow-hidden border hover:border-blue-200 transition-colors"
    >
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`bg-gradient-to-r ${getCategoryColor(event.category)} text-white px-3 py-1 rounded-full text-sm font-medium`}>
            {event.category}
          </span>
        </div>

        {/* Date Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-center">
          <div className="text-xs text-gray-600 uppercase">
            {format(event.date, 'MMM')}
          </div>
          <div className="text-lg font-bold text-gray-900">
            {format(event.date, 'd')}
          </div>
        </div>
      </div>

      {/* Event Info */}
      <div className="p-4">
        <h3 className="font-bold text-xl text-gray-900 mb-2">{event.title}</h3>
        
        <p className="text-gray-700 mb-4 leading-relaxed line-clamp-2">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock size={16} />
            <span>{event.time}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin size={16} />
            <span>{event.venue}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User size={16} />
            <span>Organized by {event.organizer}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users size={16} />
            <span>
              {event.currentAttendees} attendees
              {event.maxAttendees && ` / ${event.maxAttendees} max`}
            </span>
          </div>
        </div>

        {/* RSVP Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRSVP}
          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
            isRSVPd
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
          }`}
        >
          {isRSVPd ? '✓ You\'re Going!' : 'RSVP'}
        </motion.button>
      </div>
    </motion.div>
  );
};