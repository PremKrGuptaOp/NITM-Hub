import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../common/Header';
import { useAuth } from '../../contexts/AuthContext';
import { Settings, Edit3, Camera, LogOut, Shield, Heart } from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header 
        title="Profile" 
        showMore
        onMore={handleLogout}
      />

      <div className="p-4 max-w-md mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-md p-6 mb-6"
        >
          <div className="text-center mb-4">
            <div className="relative inline-block">
              <img
                src={user.photos[0]}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-blue-100"
              />
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                <Camera size={16} />
              </button>
            </div>
          </div>

          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-600">{user.course}</p>
            <p className="text-sm text-gray-500">Year {user.year} • Age {user.age}</p>
          </div>

          <div className="text-center mb-4">
            <p className="text-gray-700 leading-relaxed">{user.bio}</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowEditModal(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
          >
            <Edit3 size={18} />
            <span>Edit Profile</span>
          </motion.button>
        </motion.div>

        {/* Interests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-4 mb-4"
        >
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Heart size={18} className="mr-2 text-pink-500" />
            Interests
          </h3>
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
        </motion.div>

        {/* Clubs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-4 mb-4"
        >
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Settings size={18} className="mr-2 text-purple-500" />
            Clubs & Activities
          </h3>
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
        </motion.div>

        {/* Privacy Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-4 mb-6"
        >
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Shield size={18} className="mr-2 text-green-500" />
            Privacy Settings
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Show Email</span>
              <span className={user.privacySettings.showEmail ? 'text-green-600' : 'text-gray-400'}>
                {user.privacySettings.showEmail ? 'Visible' : 'Hidden'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Show Roll Number</span>
              <span className={user.privacySettings.showRollNumber ? 'text-green-600' : 'text-gray-400'}>
                {user.privacySettings.showRollNumber ? 'Visible' : 'Hidden'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Show Age</span>
              <span className={user.privacySettings.showAge ? 'text-green-600' : 'text-gray-400'}>
                {user.privacySettings.showAge ? 'Visible' : 'Hidden'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </motion.button>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};