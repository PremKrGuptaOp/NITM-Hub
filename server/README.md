# NITM Hub Backend API

A comprehensive backend API for NIT Meghalaya students, providing dating/matching features, community content, and secure authentication.

## 🚀 Features

### Authentication & Security
- JWT-based authentication with refresh tokens
- Email verification for new accounts
- Password reset functionality
- Role-based access control (students & admins)
- Rate limiting and input validation
- Secure password hashing with bcrypt

### Dating & Matching
- Smart matching algorithm based on interests, clubs, and academic details
- Like/match system with mutual match detection
- Privacy controls for profile visibility
- Block/unblock functionality
- Match history and statistics

### Messaging System
- Real-time messaging with Socket.IO
- Conversation management
- Read receipts and typing indicators
- Message deletion and conversation history
- File attachment support (planned)

### Community Features
- **Notices**: College announcements with targeted distribution
- **Clubs**: Student organization management and membership
- **Events**: Event creation, registration, and management
- Advanced filtering and search capabilities

### Admin Panel
- User management and moderation
- Analytics dashboard with statistics
- Content management for notices, clubs, and events
- Bulk operations and system monitoring

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- SMTP server for email functionality

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nitm-hub-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/nitm-hub
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_REFRESH_SECRET=your_refresh_token_secret_here
   
   # Email configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Admin credentials
   ADMIN_EMAIL=admin@nitm.ac.in
   ADMIN_PASSWORD=admin123
   ```

4. **Database setup**
   ```bash
   # Seed the database with sample data
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /verify-email/:token` - Verify email address
- `POST /resend-verification` - Resend verification email
- `POST /forgot-password` - Request password reset
- `POST /reset-password/:token` - Reset password
- `POST /refresh-token` - Refresh access token
- `GET /me` - Get current user profile

### User Routes (`/api/users`)
- `GET /` - Get all users (with filters)
- `GET /:id` - Get user by ID
- `PUT /profile` - Update user profile
- `GET /matches/potential` - Get potential matches
- `POST /like/:id` - Like a user
- `GET /matches/list` - Get matched users
- `POST /block/:id` - Block a user
- `DELETE /block/:id` - Unblock a user

### Message Routes (`/api/messages`)
- `GET /conversations` - Get user conversations
- `GET /conversation/:userId` - Get messages with specific user
- `POST /send` - Send a message
- `PUT /:messageId/read` - Mark message as read
- `DELETE /:messageId` - Delete message
- `GET /unread/count` - Get unread message count

### Notice Routes (`/api/notices`)
- `GET /` - Get all notices
- `GET /:id` - Get single notice
- `POST /` - Create notice (admin only)
- `PUT /:id` - Update notice (admin only)
- `DELETE /:id` - Delete notice (admin only)

### Club Routes (`/api/clubs`)
- `GET /` - Get all clubs
- `GET /:id` - Get single club
- `POST /` - Create club (admin only)
- `PUT /:id` - Update club (admin only)
- `POST /:id/join` - Join club
- `POST /:id/leave` - Leave club
- `GET /:id/members` - Get club members

### Event Routes (`/api/events`)
- `GET /` - Get all events
- `GET /:id` - Get single event
- `POST /` - Create event
- `PUT /:id` - Update event
- `DELETE /:id` - Delete event
- `POST /:id/register` - Register for event
- `DELETE /:id/register` - Cancel registration

### Admin Routes (`/api/admin`)
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /users` - Get all users (admin view)
- `PUT /users/:id/toggle-status` - Toggle user status
- `DELETE /users/:id` - Delete user account
- `POST /users/bulk-action` - Bulk user operations

## 🔧 Configuration

### Email Service
Configure your SMTP settings in the `.env` file. For Gmail:
1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password in `EMAIL_PASS`

### Database Models
- **User**: Profile, academic info, preferences, matches
- **Message**: Chat messages with metadata
- **Notice**: College announcements
- **Club**: Student organizations
- **Event**: Campus events and activities

### Security Features
- JWT tokens with configurable expiration
- Password complexity requirements
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- CORS protection
- Helmet security headers

## 🚀 Deployment

### Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start server.js --name nitm-hub-api
pm2 startup
pm2 save
```

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 Monitoring

The API includes built-in monitoring features:
- Request logging with Morgan
- Error tracking and handling
- Performance metrics (planned)
- Health check endpoint (`/api/health`)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in `.env`

2. **Email Not Sending**
   - Verify SMTP credentials
   - Check firewall settings
   - Ensure app password for Gmail

3. **JWT Token Errors**
   - Check JWT_SECRET in environment
   - Verify token expiration settings

### Support
For support and questions, contact the development team or create an issue in the repository.

---

Built with ❤️ for NIT Meghalaya students