import React, { useState } from 'react';
import { Header } from '../common/Header';
import { MatchList } from './MatchList';
import { ChatWindow } from './ChatWindow';
import { mockUsers, mockMatches, mockMessages, currentUserId } from '../../data/mockData';
import { Match, User, Message } from '../../types';

export const MatchesPage: React.FC = () => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState(mockMessages);

  const getMatchedUser = (match: Match): User | undefined => {
    const otherUserId = match.user1Id === currentUserId ? match.user2Id : match.user1Id;
    return mockUsers.find(user => user.id === otherUserId);
  };

  const handleSendMessage = (content: string) => {
    if (!selectedMatch) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      matchId: selectedMatch.id,
      senderId: currentUserId,
      content,
      timestamp: new Date(),
      isRead: false
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const getMatchMessages = (matchId: string) => {
    return messages.filter(msg => msg.matchId === matchId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {selectedMatch ? (
        <ChatWindow
          match={selectedMatch}
          user={getMatchedUser(selectedMatch)!}
          messages={getMatchMessages(selectedMatch.id)}
          onSendMessage={handleSendMessage}
          onBack={() => setSelectedMatch(null)}
        />
      ) : (
        <>
          <Header title="Matches" />
          <MatchList
            matches={mockMatches}
            getMatchedUser={getMatchedUser}
            onSelectMatch={setSelectedMatch}
            getLastMessage={(matchId) => {
              const matchMessages = getMatchMessages(matchId);
              return matchMessages[matchMessages.length - 1];
            }}
          />
        </>
      )}
    </div>
  );
};