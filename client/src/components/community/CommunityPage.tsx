import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../common/Header';
import { NoticeCard } from './NoticeCard';
import { ClubCard } from './ClubCard';
import { mockNotices, mockClubs } from '../../data/mockData';
import { Bell, Users, Calendar } from 'lucide-react';

type TabType = 'notices' | 'clubs';

export const CommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('notices');

  const tabs = [
    { id: 'notices' as TabType, label: 'Notices', icon: Bell, count: mockNotices.length },
    { id: 'clubs' as TabType, label: 'Clubs', icon: Users, count: mockClubs.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header title="Community" />

      {/* Tabs */}
      <div className="px-4 py-2 bg-white border-b">
        <div className="flex space-x-1 max-w-md mx-auto">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
                activeTab === id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium">{label}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                activeTab === id ? 'bg-blue-200' : 'bg-gray-200'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto">
        {activeTab === 'notices' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {mockNotices.map((notice, index) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <NoticeCard notice={notice} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'clubs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4"
          >
            {mockClubs.map((club, index) => (
              <motion.div
                key={club.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ClubCard club={club} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};