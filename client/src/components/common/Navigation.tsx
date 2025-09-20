import React from 'react';
import { NavLink } from 'react-router-dom';
import { Heart, MessageCircle, Users, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/discover', icon: Heart, label: 'Discover' },
  { path: '/matches', icon: MessageCircle, label: 'Matches' },
  { path: '/community', icon: Users, label: 'Community' },
  { path: '/events', icon: Calendar, label: 'Events' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export const Navigation: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Icon size={24} />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                    />
                  )}
                </motion.div>
                <span className="text-xs mt-1">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};