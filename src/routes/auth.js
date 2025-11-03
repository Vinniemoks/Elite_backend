const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many attempts, please try again after 15 minutes'
});

// Public routes
router.post('/register', authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.post('/logout', protect, authController.logout);

module.exports = router;