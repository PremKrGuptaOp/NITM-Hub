import React from 'react';
import { motion } from 'framer-motion';
import { Club } from '../../types';
import { Users, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface ClubCardProps {
  club: Club;
}

export const ClubCard: React.FC<ClubCardProps> = ({ club }) => {
  const handleJoinClub = () => {
    toast.success(`Joined ${club.name}! Welcome aboard! 🎉`);
  };

  const handleContactClub = () => {
    toast.success(`Opening email to ${club.email}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-md overflow-hidden border hover:border-blue-200 transition-colors"
    >
      {/* Club Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={club.image}
          alt={club.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
            {club.category}
          </span>
        </div>

        {/* Member Count */}
        <div className="absolute bottom-4 right-4 flex items-center space-x-1 text-white">
          <Users size={16} />
          <span className="text-sm font-medium">{club.memberCount} members</span>
        </div>
      </div>

      {/* Club Info */}
      <div className="p-4">
        <h3 className="font-bold text-xl text-gray-900 mb-2">{club.name}</h3>
        
        <p className="text-gray-700 mb-4 leading-relaxed">
          {club.description}
        </p>

        {/* President Info */}
        <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
          <User size={16} />
          <span>President: {club.president}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleJoinClub}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold"
          >
            Join Club
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleContactClub}
            className="px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <Mail size={18} className="text-gray-600" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};