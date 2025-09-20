import React from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showMore?: boolean;
  onBack?: () => void;
  onMore?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  showMore = false,
  onBack,
  onMore,
  className = ''
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={`flex items-center justify-between p-4 bg-white shadow-sm ${className}`}>
      <div className="flex items-center">
        {showBack && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
          </motion.button>
        )}
        <h1 className="text-xl font-semibold text-gray-900 ml-2">{title}</h1>
      </div>
      
      {showMore && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onMore}
          className="p-2 text-gray-600 hover:text-gray-800"
        >
          <MoreVertical size={20} />
        </motion.button>
      )}
    </header>
  );
};