import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus } from 'lucide-react';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio,
    course: user.course,
    year: user.year,
    age: user.age,
    interests: user.interests,
    clubs: user.clubs,
    privacySettings: { ...user.privacySettings }
  });
  const [newInterest, setNewInterest] = useState('');
  const [newClub, setNewClub] = useState('');
  const { updateProfile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile(formData);
    if (success) {
      toast.success('Profile updated successfully!');
      onClose();
    } else {
      toast.error('Failed to update profile');
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const addClub = () => {
    if (newClub.trim() && !formData.clubs.includes(newClub.trim())) {
      setFormData(prev => ({
        ...prev,
        clubs: [...prev.clubs, newClub.trim()]
      }));
      setNewClub('');
    }
  };

  const removeClub = (club: string) => {
    setFormData(prev => ({
      ...prev,
      clubs: prev.clubs.filter(c => c !== club)
    }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, y: '100%', scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: '100%', scale: 0.95 }}
          className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <select
                    value={formData.year}
                    onChange={e => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    min="17"
                    max="30"
                    value={formData.age}
                    onChange={e => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interests
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newInterest}
                  onChange={e => setNewInterest(e.target.value)}
                  placeholder="Add interest"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                />
                <button
                  type="button"
                  onClick={addInterest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest, index) => (
                  <span
                    key={index}
                    onClick={() => removeInterest(interest)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm cursor-pointer hover:bg-blue-200"
                  >
                    {interest} ×
                  </span>
                ))}
              </div>
            </div>

            {/* Clubs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clubs & Activities
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newClub}
                  onChange={e => setNewClub(e.target.value)}
                  placeholder="Add club"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addClub())}
                />
                <button
                  type="button"
                  onClick={addClub}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.clubs.map((club, index) => (
                  <span
                    key={index}
                    onClick={() => removeClub(club)}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm cursor-pointer hover:bg-purple-200"
                  >
                    {club} ×
                  </span>
                ))}
              </div>
            </div>

            {/* Privacy Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Privacy Settings
              </label>
              <div className="space-y-3">
                {[
                  { key: 'showEmail' as const, label: 'Show Email' },
                  { key: 'showRollNumber' as const, label: 'Show Roll Number' },
                  { key: 'showAge' as const, label: 'Show Age' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-700">{label}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        privacySettings: {
                          ...prev.privacySettings,
                          [key]: !prev.privacySettings[key]
                        }
                      }))}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        formData.privacySettings[key] 
                          ? 'bg-blue-600' 
                          : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                          formData.privacySettings[key] 
                            ? 'translate-x-6' 
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
            >
              <Save size={18} />
              <span>Save Changes</span>
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};