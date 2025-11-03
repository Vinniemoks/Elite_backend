const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experienceController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadExperienceImages } = require('../middleware/upload');

// Public routes
router.get('/', experienceController.getAllExperiences);
router.get('/:id', experienceController.getExperienceById);

// Protected routes
router.use(protect);

// Guide only routes
router.post('/', 
  restrictTo('GUIDE'), 
  uploadExperienceImages.array('images', 5), 
  experienceController.createExperience
);

router.put('/:id', 
  restrictTo('GUIDE'), 
  uploadExperienceImages.array('images', 5), 
  experienceController.updateExperience
);

router.delete('/:id', 
  restrictTo('GUIDE'), 
  experienceController.deleteExperience
);

module.exports = router;