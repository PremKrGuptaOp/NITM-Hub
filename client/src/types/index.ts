export interface User {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  photos: string[];
  bio: string;
  course: string;
  year: number;
  age: number;
  interests: string[];
  clubs: string[];
  privacySettings: {
    showEmail: boolean;
    showRollNumber: boolean;
    showAge: boolean;
  };
  isVerified: boolean;
  lastSeen: Date;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
  lastMessageAt?: Date;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'academic' | 'general' | 'urgent';
  publishedAt: Date;
  author: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  image: string;
  president: string;
  email: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  venue: string;
  organizer: string;
  category: string;
  maxAttendees?: number;
  currentAttendees: number;
  image: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}