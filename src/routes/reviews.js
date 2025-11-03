const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', reviewController.getExperienceReviews);

// Protected routes
router.use(protect);

router.post('/', reviewController.createReview);
router.post('/:reviewId/response', reviewController.addGuideResponse);

module.exports = router;