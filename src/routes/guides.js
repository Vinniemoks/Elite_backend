const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guideController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', guideController.getAllGuides);
router.get('/:id', guideController.getGuideById);
router.get('/:id/availability', guideController.getGuideAvailability);

// Protected routes
router.use(protect);

// Apply as guide (multipart form data with file uploads)
router.post('/apply', 
  (req, res, next) => {
    // Custom middleware to handle multiple file uploads
    upload.fields([
      { name: 'resume', maxCount: 1 },
      { name: 'video', maxCount: 1 },
      { name: 'idDocument', maxCount: 1 },
      { name: 'certifications', maxCount: 5 }
    ])(req, res, (err) => {
      if (err) {
        return next(err);
      }
      next();
    });
  },
  guideController.applyAsGuide
);

// Guide profile management (only for guide owners)
router.put('/:id', guideController.updateGuideProfile);
router.post('/:id/availability', guideController.setGuideAvailability);

module.exports = router;