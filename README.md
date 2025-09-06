# Civic Issues Backend

A comprehensive backend system for managing civic issues and local government problem reporting. Built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Management**: Registration, authentication, and role-based access control
- **Issue Reporting**: Create, track, and manage civic issues with images and location data
- **Location-based Analytics**: State, district, tehsil, and village-wise statistics
- **Admin Dashboard**: Comprehensive administrative tools and analytics
- **Real-time Notifications**: User notification system for issue updates
- **File Upload**: Image upload support with organized storage
- **Advanced Filtering**: Multi-criteria search and filtering capabilities
- **Geospatial Queries**: Location-based issue discovery and analysis

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer with organized storage
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Morgan

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd civic-issues-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Database Setup**
   - Ensure MongoDB is running
   - Update `MONGODB_URI` in your `.env` file

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## ⚙️ Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/civic-issues

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Cloudinary (for image storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📁 Project Structure

```
backend/
├── models/              # Database models
│   ├── User.js         # User model
│   ├── Issue.js        # Issue model
│   └── Notification.js # Notification model
├── routes/             # API routes
│   ├── auth.js         # Authentication routes
│   ├── issues.js       # Issue management routes
│   ├── admin.js        # Admin routes
│   ├── users.js        # User management routes
│   ├── notifications.js # Notification routes
│   └── analytics.js    # Analytics routes
├── middleware/         # Custom middleware
│   ├── auth.js         # Authentication middleware
│   └── upload.js       # File upload middleware
├── uploads/            # File upload directory
├── server.js           # Main server file
├── package.json        # Dependencies
└── README.md           # This file
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Issues
- `POST /api/issues` - Create new issue
- `GET /api/issues` - Get all issues with filters
- `GET /api/issues/:id` - Get single issue
- `PUT /api/issues/:id` - Update issue
- `POST /api/issues/:id/vote` - Vote on issue
- `GET /api/issues/nearby` - Get nearby issues

### Admin
- `GET /api/admin/dashboard` - Admin dashboard statistics
- `PUT /api/admin/issues/:id/status` - Update issue status
- `PUT /api/admin/issues/:id/assign` - Assign issue to staff
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `PUT /api/admin/users/:id/verify` - Verify user account

### Users
- `GET /api/users/profile` - Get current user profile
- `GET /api/users/my-issues` - Get user's reported issues
- `GET /api/users/assigned-issues` - Get assigned issues (staff/admin)
- `GET /api/users/search` - Search users (admin only)

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Analytics
- `GET /api/analytics/issues-overview` - Issues overview statistics
- `GET /api/analytics/location-stats` - Location-based statistics
- `GET /api/analytics/trends` - Issue trends over time
- `GET /api/analytics/user-stats` - User statistics (admin only)
- `GET /api/analytics/performance` - Performance metrics (admin only)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization

## 📊 Data Models

### User
- Basic info (name, email, phone)
- Location (state, district, tehsil, village)
- Role (citizen, staff, admin)
- Verification status

### Issue
- Title, description, category
- Location with coordinates
- Images and attachments
- Status and priority
- Assignment and tracking

### Notification
- Recipient and type
- Related issue/user
- Read status and priority
- Action requirements

## 🗺️ Location Hierarchy

The system supports a hierarchical location structure:
- **State** → **District** → **Tehsil** → **Village**

This allows for:
- Granular issue tracking
- Location-based analytics
- Administrative organization
- Geographic filtering

## 📱 Mobile App Integration

The backend is designed to work seamlessly with:
- React Native mobile apps
- Web dashboards
- Third-party integrations

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```bash
# Build image
docker build -t civic-issues-backend .

# Run container
docker run -p 5000:5000 civic-issues-backend
```

## 🧪 Testing

```bash
# Run tests
npm test

# Health check
curl http://localhost:5000/health
```

## 📈 Performance Features

- Database indexing for fast queries
- Pagination for large datasets
- Efficient aggregation pipelines
- Optimized file storage
- Rate limiting for API protection

## 🔄 Future Enhancements

- Real-time notifications with Socket.io
- Cloud storage integration (AWS S3, Cloudinary)
- Email/SMS notifications
- Advanced reporting and exports
- Mobile push notifications
- API rate limiting per user
- Caching with Redis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🎯 Hackathon Project

This backend was developed for the **Smart India Hackathon** to address local government civic issue management challenges. It provides a robust foundation for building comprehensive civic engagement platforms.

---

**Built with ❤️ for better civic governance**
