import { User, Notice, Club, Event, Message, Match } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya.sharma@nitm.ac.in',
    rollNumber: 'CS21B1001',
    photos: [
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    bio: 'Computer Science student who loves coding and music. Looking for meaningful connections! 🎵💻',
    course: 'Computer Science Engineering',
    year: 2,
    age: 20,
    interests: ['Coding', 'Music', 'Photography', 'Reading'],
    clubs: ['Coding Club', 'Music Society'],
    privacySettings: {
      showEmail: false,
      showRollNumber: true,
      showAge: true
    },
    isVerified: true,
    lastSeen: new Date()
  },
  {
    id: '2',
    name: 'Arjun Patel',
    email: 'arjun.patel@nitm.ac.in',
    rollNumber: 'ME21B1023',
    photos: [
      'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    bio: 'Mechanical engineering student passionate about innovation and sports. Let\'s explore together! ⚙️🏏',
    course: 'Mechanical Engineering',
    year: 2,
    age: 21,
    interests: ['Sports', 'Innovation', 'Traveling', 'Movies'],
    clubs: ['Sports Club', 'Innovation Cell'],
    privacySettings: {
      showEmail: false,
      showRollNumber: true,
      showAge: true
    },
    isVerified: true,
    lastSeen: new Date()
  },
  {
    id: '3',
    name: 'Ananya Singh',
    email: 'ananya.singh@nitm.ac.in',
    rollNumber: 'EC21B1045',
    photos: [
      'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    bio: 'Electronics enthusiast and artist. Love creating things and meeting new people! 🎨⚡',
    course: 'Electronics & Communication Engineering',
    year: 2,
    age: 19,
    interests: ['Art', 'Electronics', 'Dancing', 'Books'],
    clubs: ['Art Club', 'Dance Society'],
    privacySettings: {
      showEmail: false,
      showRollNumber: true,
      showAge: true
    },
    isVerified: true,
    lastSeen: new Date()
  }
];

export const mockNotices: Notice[] = [
  {
    id: '1',
    title: 'Mid-Semester Examinations Schedule',
    content: 'The mid-semester examinations for all departments will commence from March 15th, 2025. Please check the detailed timetable on the academic portal.',
    category: 'academic',
    publishedAt: new Date('2025-01-10'),
    author: 'Academic Section'
  },
  {
    id: '2',
    title: 'Annual Tech Fest Registration Open',
    content: 'Registration for TechnoNIT 2025 is now open! Various competitions including coding, robotics, and design challenges. Register before January 25th.',
    category: 'general',
    publishedAt: new Date('2025-01-08'),
    author: 'Student Activities'
  },
  {
    id: '3',
    title: 'Hostel Fee Payment Deadline',
    content: 'All students are requested to pay their hostel fees by January 20th, 2025. Late payment will attract a fine of ₹500.',
    category: 'urgent',
    publishedAt: new Date('2025-01-12'),
    author: 'Hostel Administration'
  }
];

export const mockClubs: Club[] = [
  {
    id: '1',
    name: 'Coding Club',
    description: 'A community of programming enthusiasts working on exciting projects and participating in competitive coding.',
    category: 'Technical',
    memberCount: 156,
    image: 'https://images.pexels.com/photos/574077/pexels-photo-574077.jpeg?auto=compress&cs=tinysrgb&w=400',
    president: 'Rahul Kumar',
    email: 'codingclub@nitm.ac.in'
  },
  {
    id: '2',
    name: 'Music Society',
    description: 'Where melodies meet passion! Join us for jam sessions, concerts, and musical events throughout the year.',
    category: 'Cultural',
    memberCount: 89,
    image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400',
    president: 'Priya Sharma',
    email: 'music@nitm.ac.in'
  },
  {
    id: '3',
    name: 'Sports Club',
    description: 'Promoting fitness and sportsmanship through various indoor and outdoor sports activities and tournaments.',
    category: 'Sports',
    memberCount: 203,
    image: 'https://images.pexels.com/photos/262524/pexels-photo-262524.jpeg?auto=compress&cs=tinysrgb&w=400',
    president: 'Arjun Patel',
    email: 'sports@nitm.ac.in'
  }
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'TechnoNIT 2025 Coding Competition',
    description: 'Annual coding competition with exciting prizes and opportunities to showcase your programming skills.',
    date: new Date('2025-02-15'),
    time: '10:00 AM - 6:00 PM',
    venue: 'Computer Lab A',
    organizer: 'Coding Club',
    category: 'Technical',
    maxAttendees: 100,
    currentAttendees: 67,
    image: 'https://images.pexels.com/photos/574077/pexels-photo-574077.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '2',
    title: 'Cultural Night 2025',
    description: 'An evening of music, dance, and cultural performances by talented students from various departments.',
    date: new Date('2025-02-20'),
    time: '7:00 PM - 11:00 PM',
    venue: 'Main Auditorium',
    organizer: 'Cultural Committee',
    category: 'Cultural',
    currentAttendees: 234,
    image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '3',
    title: 'Inter-Department Basketball Tournament',
    description: 'Exciting basketball matches between different departments. Come cheer for your department!',
    date: new Date('2025-02-10'),
    time: '4:00 PM - 8:00 PM',
    venue: 'Sports Complex',
    organizer: 'Sports Club',
    category: 'Sports',
    currentAttendees: 89,
    image: 'https://images.pexels.com/photos/262524/pexels-photo-262524.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

export const mockMatches: Match[] = [
  {
    id: '1',
    user1Id: '1',
    user2Id: '2',
    createdAt: new Date('2025-01-10'),
    lastMessageAt: new Date('2025-01-12')
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    matchId: '1',
    senderId: '2',
    content: 'Hey! I saw we both love coding and music. That\'s awesome!',
    timestamp: new Date('2025-01-11T10:00:00'),
    isRead: true
  },
  {
    id: '2',
    matchId: '1',
    senderId: '1',
    content: 'Hi! Yes, I noticed that too. Are you part of the Coding Club?',
    timestamp: new Date('2025-01-11T10:05:00'),
    isRead: true
  },
  {
    id: '3',
    matchId: '1',
    senderId: '2',
    content: 'Not yet, but I\'m planning to join soon. How about you?',
    timestamp: new Date('2025-01-12T14:30:00'),
    isRead: false
  }
];

export const currentUserId = '1';