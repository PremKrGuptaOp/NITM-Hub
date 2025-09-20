import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../common/Header';
import { ProfileCard } from './ProfileCard';
import { mockUsers, currentUserId } from '../../data/mockData';
import { User } from '../../types';
import { Heart, X, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export const DiscoverPage: React.FC = () => {
  const [users] = useState<User[]>(mockUsers.filter(user => user.id !== currentUserId));
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentUser = users[currentIndex];
    
    if (direction === 'right') {
      toast.success(`You liked ${currentUser.name}!`);
      // Simulate match
      if (Math.random() > 0.5) {
        setTimeout(() => {
          toast('🎉 It\'s a match!', {
            duration: 3000,
            icon: '💕'
          });
        }, 1000);
      }
    }

    setCurrentIndex(prev => prev + 1);
  };

  const currentUser = users[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header 
        title="Discover" 
        showMore 
        onMore={() => toast('Settings coming soon!')}
      />

      <div className="p-4 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {currentUser ? (
            <motion.div
              key={currentUser.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mb-6"
            >
              <ProfileCard user={currentUser} onSwipe={handleSwipe} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No more profiles</h3>
              <p className="text-gray-500">Check back later for new connections!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        {currentUser && (
          <div className="flex justify-center space-x-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipe('left')}
              className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:border-red-200"
            >
              <X className="w-7 h-7 text-red-500" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipe('right')}
              className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full shadow-lg flex items-center justify-center text-white"
            >
              <Heart className="w-7 h-7" fill="currentColor" />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};