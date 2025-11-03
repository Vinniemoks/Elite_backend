const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// User profile routes
router.get('/me', userController.getCurrentUser);
router.put('/me', userController.updateCurrentUser);
router.post('/me/upload-avatar', userController.uploadAvatar);
router.delete('/me', userController.deleteCurrentUser);

module.exports = router;