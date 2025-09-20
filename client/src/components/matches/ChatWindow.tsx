import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../common/Header';
import { Match, User, Message } from '../../types';
import { Send, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { currentUserId } from '../../data/mockData';

interface ChatWindowProps {
  match: Match;
  user: User;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onBack: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  match,
  user,
  messages,
  onSendMessage,
  onBack
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Chat Header */}
      <Header
        title={user.name}
        showBack
        showMore
        onBack={onBack}
        onMore={() => {}}
        className="border-b"
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isOwn = message.senderId === currentUserId;
          const showTime = index === 0 || 
            new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() > 5 * 60 * 1000;

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {showTime && (
                <div className="text-center text-xs text-gray-500 mb-2">
                  {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                </div>
              )}
              
              <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                {!isOwn && (
                  <img
                    src={user.photos[0]}
                    alt={user.name}
                    className="w-8 h-8 rounded-full mr-2 flex-shrink-0"
                  />
                )}
                
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isOwn
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t bg-white p-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${user.name}...`}
              className="w-full px-4 py-2 border border-gray-300 rounded-full resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};