const bcrypt = require('bcrypt');

/**
 * Hash a password
 * @param {String} password - Plain text password
 * @returns {String} Hashed password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 * @param {String} password - Plain text password
 * @param {String} hashedPassword - Hashed password
 * @returns {Boolean} True if match, false otherwise
 */
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword
};