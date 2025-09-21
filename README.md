# NITM Hub - College Community & Dating Platform

A modern, mobile-first web platform exclusively for NIT Meghalaya students, combining dating features with college community engagement.

## 🌟 Features

### 💖 Dating & Connections
- **Swipe-based Profile Discovery**: Discover profiles in a familiar, intuitive interface.
- **Mutual Matching**: Connect with users who have also expressed interest.
- **Real-time Messaging**: Chat with your matches instantly with read receipts and typing indicators.
- **Privacy Controls**: Customize what information is visible to other users.
- **Smart Matching Algorithm**: Get personalized suggestions based on shared interests and academic details.

---

### 🎓 Community Hub
- **College Notices & Announcements**: Stay updated with important college news.
- **Club Directory**: Browse and join student clubs directly from the platform.
- **Events Calendar**: Discover, register for, and manage campus events with RSVP functionality.
- **Content Filtering**: Easily find what you're looking for with categorized content.

---

### 🛡️ Authentication & Security
- **College-Only Access**: Secure verification using college email or roll number.
- **OTP-based Verification**: A robust, two-factor authentication system.
- **JWT-based Authentication**: Secure user sessions with refresh tokens.
- **Secure Password Hashing**: Passwords are encrypted using bcrypt for maximum security.
- **Role-Based Access Control**: Differentiate between student and admin permissions.

## 🛠️ Tech Stack

This project is split into a frontend and a backend, built with the following technologies.

### Frontend
- **Framework**: React 18 & TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router 6
- **Animations**: Framer Motion
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js
- **Database**: MongoDB
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT & bcrypt
- **Email**: Nodemailer (via SMTP)

## 🚀 Getting Started

Follow these steps to set up and run the entire project locally.

### Prerequisites
- **Node.js**: Version 18 or higher
- **MongoDB**: Version 4.4 or higher
- **Package Manager**: npm or yarn

---

### 💻 Installation & Setup

1.  **Clone the repositories**:
    ```bash
    git clone <frontend-repository-url> nitm-hub-frontend
    git clone <backend-repository-url> nitm-hub-backend
    ```

2.  **Set up the backend**:
    - Navigate into the backend directory:
    ```bash
    cd nitm-hub-backend
    ```
    - Install dependencies:
    ```bash
    npm install
    ```
    - Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
    - **Configure your `.env` file**: Update the database URI, JWT secrets, and email credentials. For Gmail, you'll need an app password.
    - Start the backend server:
    ```bash
    npm run dev
    ```

3.  **Set up the frontend**:
    - Open a **new terminal** and navigate to the frontend directory:
    ```bash
    cd ../nitm-hub-frontend
    ```
    - Install dependencies:
    ```bash
    npm install
    ```
    - Start the frontend development server:
    ```bash
    npm run dev
    ```

4.  **Access the application**:
    - Open your browser and navigate to the localhost URL provided by the frontend server (typically `http://localhost:5173`).

### 📁 Project Structure
├── nitm-hub-frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React Context providers
│   │   ├── ...               # Other frontend folders
│   │   └── App.tsx
│   └── ...
└── nitm-hub-backend/
    ├── src/
    │   ├── routes/           # API endpoints
    │   ├── controllers/      # Business logic
    │   ├── models/           # Database schemas
    │   ├── ...               # Other backend folders
    │   └── server.js         # Main server file
    └── ...
## 📜 API Endpoints

The backend API is the central hub for all data. Here are some of the main routes:

### Authentication (`/api/auth`)
- `POST /register`: Create a new user account.
- `POST /login`: Authenticate a user.
- `GET /me`: Get the current user's profile.

### Dating (`/api/users`)
- `GET /matches/potential`: Get a list of potential matches.
- `POST /like/:id`: Like a user's profile.
- `GET /matches/list`: Get a list of mutual matches.

### Community (`/api/notices`, `/api/clubs`, `/api/events`)
- `GET /`: Get lists of notices, clubs, or events.
- `POST /:id/join`: Join a specific club.
- `POST /:id/register`: Register for an event.

## 📦 Deployment

The application is ready for deployment on any static hosting service for the frontend and a cloud server for the backend.

### Frontend
1.  Build the application: `npm run build`
2.  Deploy the `dist` folder.

### Backend
1.  Build the application: `npm run build`
2.  Deploy the code to a server (e.g., using PM2 or Docker).

## 📄 License

This project is developed for educational purposes for NIT Meghalaya students.

---

Built with ❤️ for NIT Meghalaya students
