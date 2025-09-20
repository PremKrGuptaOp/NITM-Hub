# NITM Hub - College Community & Dating Platform

A modern, mobile-first web platform designed exclusively for NIT Meghalaya students, combining dating features with college community engagement.

## 🌟 Features

### Authentication & Security
- College email or roll number verification
- OTP-based verification system
- Secure user authentication

### Dating & Connections
- Swipe-based profile discovery
- Mutual matching system
- Real-time messaging with unread indicators
- Privacy controls for personal information

### Community Features
- College notices and announcements
- Club directory with member information
- Events calendar with RSVP functionality
- Categorized content filtering

### User Experience
- Mobile-first responsive design
- Modern, attractive UI with smooth animations
- Dark/light theme support
- Intuitive navigation between dating and community sections

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nitm-hub
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the provided localhost URL

### Login Credentials (Demo)
For testing purposes, you can use any of these demo accounts:
- Email: `priya.sharma@nitm.ac.in`
- Email: `arjun.patel@nitm.ac.in`
- Email: `ananya.singh@nitm.ac.in`
- Password: Any password (authentication is mocked)

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── common/          # Shared components (Header, Navigation)
│   ├── discover/        # Dating/discovery features
│   ├── matches/         # Chat and matches
│   ├── community/       # Notices and clubs
│   ├── events/          # Events management
│   └── profile/         # User profile management
├── contexts/            # React Context providers
├── data/               # Mock data for development
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx             # Main application component
```

## 🎨 Design System

### Color Palette
- **Primary**: Soft blues and gradients for trust and professionalism
- **Secondary**: Purple accents for dating features
- **Success**: Green for positive actions
- **Warning/Error**: Red and orange for alerts

### Typography
- Modern, readable fonts optimized for mobile
- Clear hierarchy with proper spacing
- Maximum 3 font weights for consistency

### Layout
- 8px spacing system for consistent alignment
- Card-based design with subtle shadows
- Responsive breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)

## 📱 Features Overview

### Discover Page
- Tinder-style card interface for browsing profiles
- Swipe left/right or use action buttons
- Compatibility indicators based on interests and clubs
- Photo carousel for multiple profile images

### Matches & Chat
- List of mutual matches
- Real-time chat interface with typing indicators
- Message history and read receipts
- Block/report functionality for safety

### Community Hub
- College notices categorized by urgency and type
- Club directory with member counts and contact info
- Join clubs directly from the platform
- Rich content display with images and descriptions

### Events Calendar
- Upcoming events with detailed information
- Category filtering (Technical, Cultural, Sports)
- RSVP functionality with attendee counts
- Integration with college calendar

### Profile Management
- Comprehensive profile editing
- Privacy settings for personal information
- Interest and club management
- Photo upload and management

## 🔒 Privacy & Security

- Email addresses are hidden by default
- Granular privacy controls for profile information
- Secure authentication with OTP verification
- College-only access with email domain verification

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

### Technologies Used
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Routing**: React Router 6
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Build Tool**: Vite

### Mock Data
The application uses comprehensive mock data for development:
- User profiles with realistic information
- College notices and announcements
- Club information and events
- Chat messages and matches

## 🚀 Deployment

The application is ready for deployment on any static hosting service:

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service
3. Configure routing for SPA (Single Page Application)

## 📧 Contact & Support

For questions, suggestions, or support:
- Create an issue in the repository
- Contact the development team through college channels

## 📄 License

This project is developed for educational purposes for NIT Meghalaya students.

---

Made with ❤️ for NIT Meghalaya students