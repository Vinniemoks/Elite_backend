const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken, generateRefreshToken, verifyRefreshToken, blacklistToken } = require('../utils/jwt');
const { AppError } = require('../middleware/errorHandler');

/**
 * Register a new user
 * @route POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, userType } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return next(new AppError('User already exists with this email', 400));
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = uuidv4();

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        userType: userType || 'TOURIST',
        verificationToken,
        status: 'PENDING'
      }
    });

    // TODO: Send verification email

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check if password is correct
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check if user is active
    if (user.status !== 'ACTIVE' && user.status !== 'PENDING') {
      return next(new AppError('Your account is not active', 401));
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return next(new AppError('Please verify your email first', 401));
    }

    // Generate tokens
    const accessToken = generateToken({ id: user.id, userType: user.userType });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Save refresh token to database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          avatar: user.avatar
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email
 * @route POST /api/auth/verify-email
 */
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    // Find user with token
    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    });

    if (!user) {
      return next(new AppError('Invalid or expired verification token', 400));
    }

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        status: 'ACTIVE'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password
 * @route POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return next(new AppError('User not found with this email', 404));
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // TODO: Send reset email

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 * @route POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Find user with token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh token
 * @route POST /api/auth/refresh-token
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if user exists and token matches
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.id,
        refreshToken
      }
    });

    if (!user) {
      return next(new AppError('Invalid refresh token', 401));
    }

    // Generate new tokens
    const accessToken = generateToken({ id: user.id, userType: user.userType });
    const newRefreshToken = generateRefreshToken({ id: user.id });

    // Update refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken }
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 */
exports.logout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token;
    
    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('No token provided', 400));
    }

    // Get user from request (set by protect middleware)
    const { user } = req;

    // Blacklist current token
    const decoded = verifyRefreshToken(token);
    await blacklistToken(token, decoded.exp);

    // Clear refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: null }
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};