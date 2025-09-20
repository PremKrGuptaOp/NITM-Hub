import React, { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { User } from '../../types';
import { MapPin, GraduationCap, Heart, Star } from 'lucide-react';

interface ProfileCardProps {
  user: User;
  onSwipe: (direction: 'left' | 'right') => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user, onSwipe }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      onSwipe(info.offset.x > 0 ? 'right' : 'left');
    }
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % user.photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + user.photos.length) % user.photos.length);
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-grab active:cursor-grabbing"
    >
      {/* Photo Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={user.photos[currentPhotoIndex]}
          alt={user.name}
          className="w-full h-full object-cover"
        />
        
        {/* Photo Navigation */}
        <div className="absolute top-4 left-4 right-4 flex space-x-1">
          {user.photos.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-1 rounded-full ${
                index === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Photo Navigation Buttons */}
        <button
          onClick={prevPhoto}
          className="absolute left-0 top-0 w-1/2 h-full"
        />
        <button
          onClick={nextPhoto}
          className="absolute right-0 top-0 w-1/2 h-full"
        />

        {/* Online Status */}
        <div className="absolute top-4 right-4 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
      </div>

      {/* Profile Info */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {user.name}, {user.age}
            </h3>
            <div className="flex items-center text-gray-600 mt-1">
              <GraduationCap className="w-4 h-4 mr-1" />
              <span className="text-sm">{user.course} • Year {user.year}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-green-600 text-sm">
              <Star className="w-4 h-4 mr-1 fill-current" />
              <span>Active</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-gray-700 mb-4 leading-relaxed">{user.bio}</p>

        {/* Interests */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Interests</h4>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Clubs */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Clubs & Activities</h4>
          <div className="flex flex-wrap gap-2">
            {user.clubs.map((club, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
              >
                {club}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};