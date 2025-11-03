const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// All message routes are protected
router.use(protect);

router.get('/conversations', messageController.getConversations);
router.get('/:userId', messageController.getMessageHistory);
router.post('/', messageController.sendMessage);

module.exports = router;