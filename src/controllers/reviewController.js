const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get all reviews for an experience
 * @route GET /api/experiences/:experienceId/reviews
 */
exports.getExperienceReviews = async (req, res, next) => {
  try {
    const { experienceId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get reviews
    const reviews = await prisma.review.findMany({
      where: {
        experienceId,
        status: 'APPROVED'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        guideResponse: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: parseInt(limit)
    });
    
    // Get total count
    const total = await prisma.review.count({
      where: {
        experienceId,
        status: 'APPROVED'
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a review
 * @route POST /api/experiences/:experienceId/reviews
 */
exports.createReview = async (req, res, next) => {
  try {
    const { experienceId } = req.params;
    const { rating, comment } = req.body;
    
    // Check if experience exists
    const experience = await prisma.experience.findUnique({
      where: { id: experienceId }
    });
    
    if (!experience) {
      return next(new AppError('Experience not found', 404));
    }
    
    // Check if user has a completed booking for this experience
    const hasCompletedBooking = await prisma.booking.findFirst({
      where: {
        userId: req.user.id,
        experienceId,
        status: 'COMPLETED'
      }
    });
    
    if (!hasCompletedBooking) {
      return next(new AppError('You can only review experiences you have completed', 403));
    }
    
    // Check if user has already reviewed this experience
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: req.user.id,
        experienceId
      }
    });
    
    if (existingReview) {
      return next(new AppError('You have already reviewed this experience', 400));
    }
    
    // Create review
    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        experienceId,
        rating: parseInt(rating),
        comment,
        status: 'APPROVED' // Auto-approve for now, can be changed to PENDING for moderation
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });
    
    // Update experience rating
    const allReviews = await prisma.review.findMany({
      where: {
        experienceId,
        status: 'APPROVED'
      },
      select: {
        rating: true
      }
    });
    
    const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;
    
    await prisma.experience.update({
      where: { id: experienceId },
      data: {
        rating: averageRating,
        reviewCount: allReviews.length
      }
    });
    
    // Update guide rating
    const guideReviews = await prisma.review.findMany({
      where: {
        experience: {
          guideId: experience.guideId
        },
        status: 'APPROVED'
      },
      select: {
        rating: true
      }
    });
    
    const guideAverageRating = guideReviews.reduce((sum, review) => sum + review.rating, 0) / guideReviews.length;
    
    await prisma.guide.update({
      where: { id: experience.guideId },
      data: {
        rating: guideAverageRating,
        reviewCount: guideReviews.length
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add guide response to a review
 * @route POST /api/reviews/:reviewId/response
 */
exports.addGuideResponse = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { response } = req.body;
    
    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        experience: {
          include: {
            guide: true
          }
        }
      }
    });
    
    if (!review) {
      return next(new AppError('Review not found', 404));
    }
    
    // Check if user is the guide for this experience
    const guide = await prisma.guide.findFirst({
      where: { userId: req.user.id }
    });
    
    if (!guide || guide.id !== review.experience.guideId) {
      return next(new AppError('Only the guide can respond to this review', 403));
    }
    
    // Check if guide has already responded
    if (review.guideResponse) {
      return next(new AppError('You have already responded to this review', 400));
    }
    
    // Add guide response
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        guideResponse: response
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: updatedReview
    });
  } catch (error) {
    next(error);
  }
};