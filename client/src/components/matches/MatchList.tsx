import React from 'react';
import { motion } from 'framer-motion';
import { Match, User, Message } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface MatchListProps {
  matches: Match[];
  getMatchedUser: (match: Match) => User | undefined;
  onSelectMatch: (match: Match) => void;
  getLastMessage: (matchId: string) => Message | undefined;
}

export const MatchList: React.FC<MatchListProps> = ({
  matches,
  getMatchedUser,
  onSelectMatch,
  getLastMessage
}) => {
  return (
    <div className="p-4 max-w-md mx-auto">
      {matches.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💕</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No matches yet</h3>
          <p className="text-gray-500">Start swiping to find your connections!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match, index) => {
            const user = getMatchedUser(match);
            const lastMessage = getLastMessage(match.id);
            
            if (!user) return null;

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectMatch(match)}
                className="bg-white rounded-xl p-4 shadow-md cursor-pointer border hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={user.photos[0]}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">💕</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                      {lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(lastMessage.timestamp, { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate">
                      {lastMessage 
                        ? lastMessage.content 
                        : 'You matched! Say hello 👋'
                      }
                    </p>
                    
                    <div className="flex items-center mt-2 space-x-2">
                      {user.interests.slice(0, 2).map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {lastMessage && !lastMessage.isRead && (
                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};