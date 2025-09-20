import React from 'react';
import { motion } from 'framer-motion';
import { Notice } from '../../types';
import { Calendar, User, AlertCircle, Info, Bell } from 'lucide-react';
import { format } from 'date-fns';

interface NoticeCardProps {
  notice: Notice;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice }) => {
  const getCategoryColor = (category: Notice['category']) => {
    switch (category) {
      case 'urgent':
        return 'from-red-500 to-orange-500';
      case 'academic':
        return 'from-blue-500 to-indigo-500';
      case 'general':
        return 'from-green-500 to-teal-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryIcon = (category: Notice['category']) => {
    switch (category) {
      case 'urgent':
        return AlertCircle;
      case 'academic':
        return Bell;
      case 'general':
        return Info;
      default:
        return Bell;
    }
  };

  const CategoryIcon = getCategoryIcon(notice.category);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-md overflow-hidden border hover:border-blue-200 transition-colors"
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${getCategoryColor(notice.category)} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CategoryIcon size={20} />
            <span className="text-sm font-medium capitalize">{notice.category}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm">
            <Calendar size={16} />
            <span>{format(notice.publishedAt, 'MMM d')}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
          {notice.title}
        </h3>
        
        <p className="text-gray-700 mb-4 leading-relaxed">
          {notice.content}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User size={16} />
            <span>{notice.author}</span>
          </div>
          
          <span className="text-xs text-gray-500">
            {format(notice.publishedAt, 'PPP')}
          </span>
        </div>
      </div>
    </motion.div>
  );
};