const { verifyToken, isTokenBlacklisted } = require('../utils/jwt');
const { AppError } = require('./errorHandler');
const { prisma } = require('../config/database');

/**
 * Middleware to protect routes that require authentication
 */
const protect = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    let token;
    
    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    // Check if token is blacklisted
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      return next(new AppError('Token revoked, please login again', 401));
    }

    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return next(new AppError('User account is not active', 401));
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Not authorized to access this route', 401));
  }
};

/**
 * Middleware to restrict access based on user type
 * @param {...String} roles - User types allowed to access the route
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userType)) {
      return next(new AppError('Not authorized to access this route', 403));
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo
};