const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/applications', adminController.getApplications);
router.get('/applications/:id', adminController.getApplicationById);
router.put('/applications/:id/review', adminController.reviewApplication);

router.get('/users', adminController.getUsers);
router.put('/users/:id/suspend', adminController.suspendUser);

router.get('/bookings', adminController.getBookings);
router.get('/payments', adminController.getPayments);
router.get('/analytics', adminController.getAnalytics);

module.exports = router;
