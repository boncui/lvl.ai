# LVL.AI Backend API

A robust, scalable backend API built with TypeScript, Express.js, Node.js, and MongoDB.

## 🚀 Features

- **TypeScript** - Full type safety and modern JavaScript features
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt for secure password storage
- **Input Validation** - Express-validator for request validation
- **Rate Limiting** - Protection against brute force attacks
- **Security Headers** - Helmet.js for security
- **Logging** - Winston for comprehensive logging
- **File Upload** - Multer for handling file uploads
- **Email Service** - Nodemailer for email functionality
- **Testing** - Jest for unit and integration testing
- **Code Quality** - ESLint and Prettier for code formatting
- **Environment Configuration** - Dotenv for environment variables

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts   # MongoDB connection
│   │   └── env.ts        # Environment variables
│   ├── controllers/      # Route controllers
│   │   ├── authController.ts
│   │   └── userController.ts
│   ├── middleware/        # Custom middleware
│   │   ├── auth.ts       # Authentication middleware
│   │   ├── errorHandler.ts
│   │   ├── notFound.ts
│   │   └── upload.ts     # File upload middleware
│   ├── models/           # MongoDB models
│   │   └── User.ts
│   ├── routes/           # API routes
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   └── api.ts
│   ├── services/         # Business logic services
│   │   └── emailService.ts
│   ├── tests/            # Test files
│   │   ├── setup.ts
│   │   └── auth.test.ts
│   ├── utils/            # Utility functions
│   │   ├── logger.ts
│   │   └── helpers.ts
│   └── index.ts          # Application entry point
├── package.json          # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── jest.config.js       # Jest testing configuration
├── nodemon.json        # Development server configuration
├── .eslintrc.json      # ESLint configuration
├── .prettierrc         # Prettier configuration
├── .gitignore          # Git ignore patterns
└── env.example         # Environment variables template
```

## 🛠️ Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your configuration values.

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Update password
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/verify-email/:token` - Verify email

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### General
- `GET /api/` - API status
- `GET /api/protected` - Protected route example
- `GET /health` - Health check

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🧪 Testing

Run tests with:
```bash
npm test
```

The test suite includes:
- Unit tests for utilities and services
- Integration tests for API endpoints
- Authentication flow tests

## 📝 Environment Variables

Key environment variables (see `env.example` for complete list):

- `NODE_ENV` - Environment (development/production/test)
- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `EMAIL_HOST` - SMTP host for emails
- `CORS_ORIGIN` - Allowed CORS origin

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Start the server**
   ```bash
   npm start
   ```

## 📋 Requirements

- Node.js >= 18.0.0
- MongoDB >= 4.4
- npm or yarn

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and linting
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
