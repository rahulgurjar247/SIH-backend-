import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import routes
import routes from './routes/index.js';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS configuration (allow all)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Handle preflight
app.options('*', cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check requested', { ip: req.ip });
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/v1/', routes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const startTime = Date.now();
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const connectionTime = Date.now() - startTime;
    logger.success('Database connected successfully', {
      host: conn.connection.host,
      database: conn.connection.name,
      connectionTime: `${connectionTime}ms`
    });
  } catch (error) {
    logger.error('Database connection failed', error, {
      uri: process.env.MONGODB_URI ? 'URI provided' : 'No URI provided'
    });
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      logger.success('Server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        healthCheck: `http://localhost:${PORT}/health`,
        apiBase: `http://localhost:${PORT}/api/v1`
      });
    });
  } catch (error) {
    logger.error('Server startup failed', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection', err, {
    promise: promise.toString(),
    stack: err.stack
  });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', err, {
    stack: err.stack
  });
  process.exit(1);
});

startServer();
