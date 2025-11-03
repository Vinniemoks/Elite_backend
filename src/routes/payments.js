const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Public routes (for callbacks)
router.post('/mpesa/callback', paymentController.mpesaCallback);

// Protected routes
router.use(protect);

router.post('/stripe', paymentController.processStripePayment);
router.post('/mpesa', paymentController.processMpesaPayment);
router.get('/:id', paymentController.getPaymentStatus);

module.exports = router;