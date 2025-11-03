const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

// All booking routes are protected
router.use(protect);

// User bookings
router.get('/', bookingController.getUserBookings);
router.get('/guide', bookingController.getGuideBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', bookingController.createBooking);
router.patch('/:id/status', bookingController.updateBookingStatus);

module.exports = router;