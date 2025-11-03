require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { prisma, redisClient } = require('./config/database');
const { AppError, errorHandler } = require('./middleware/errorHandler');
const { initializeSocket } = require('./socket');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const guideRoutes = require('./routes/guides');
const experienceRoutes = require('./routes/experiences');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const messageRoutes = require('./routes/messages');

// Initialize app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);

// Experience reviews routes
app.use('/api/experiences/:experienceId/reviews', require('./routes/reviews'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running'
  });
});

// 404 handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.io
const io = initializeSocket(server);

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Connect to Redis
redisClient.connect().catch(console.error);

module.exports = server;