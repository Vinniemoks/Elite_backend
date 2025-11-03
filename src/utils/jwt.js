const jwt = require('jsonwebtoken');
const { redisClient } = require('../config/database');

/**
 * Generate JWT access token
 * @param {Object} payload - User data to include in token
 * @returns {String} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - User data to include in token
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '30d' }
  );
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Verify JWT refresh token
 * @param {String} token - JWT refresh token to verify
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Add token to blacklist in Redis
 * @param {String} token - JWT token to blacklist
 * @param {Number} exp - Token expiration time in seconds
 */
const blacklistToken = async (token, exp) => {
  const now = Math.floor(Date.now() / 1000);
  const ttl = exp - now;
  
  if (ttl > 0) {
    await redisClient.set(`bl_${token}`, 'blacklisted', {
      EX: ttl
    });
  }
};

/**
 * Check if token is blacklisted
 * @param {String} token - JWT token to check
 * @returns {Boolean} True if blacklisted, false otherwise
 */
const isTokenBlacklisted = async (token) => {
  const result = await redisClient.get(`bl_${token}`);
  return result !== null;
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  blacklistToken,
  isTokenBlacklisted
};