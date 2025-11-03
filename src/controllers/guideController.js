const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Submit guide application
 * @route POST /api/guides/apply
 */
exports.applyAsGuide = async (req, res, next) => {
  try {
    const { bio, region, languages, specializations, yearsOfExperience, licenseNumber } = req.body;
    const userId = req.user.id;

    // Check if user is already a guide
    const existingGuide = await prisma.guide.findUnique({
      where: { userId }
    });

    if (existingGuide) {
      return next(new AppError('You have already applied as a guide', 400));
    }

    // Create guide profile
    const guide = await prisma.guide.create({
      data: {
        userId,
        bio,
        region,
        languages: languages.split(','),
        specializations: specializations.split(','),
        yearsOfExperience: parseInt(yearsOfExperience),
        licenseNumber
      }
    });

    // Create guide application
    const application = await prisma.guideApplication.create({
      data: {
        guideId: guide.id,
        resume: req.files.resume ? req.files.resume[0].location : null,
        videoIntroduction: req.files.video ? req.files.video[0].location : null,
        idDocument: req.files.idDocument ? req.files.idDocument[0].location : null,
        certifications: req.files.certifications ? req.files.certifications.map(file => file.location) : [],
        status: 'PENDING'
      }
    });

    // Update user type
    await prisma.user.update({
      where: { id: userId },
      data: { userType: 'GUIDE' }
    });

    res.status(201).json({
      success: true,
      message: 'Guide application submitted successfully',
      data: {
        guide,
        application: {
          id: application.id,
          status: application.status
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all approved guides
 * @route GET /api/guides
 */
exports.getAllGuides = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, region, specialization, rating } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {
      isVerified: true,
      user: {
        status: 'ACTIVE'
      }
    };

    if (region) {
      filter.region = region;
    }

    if (specialization) {
      filter.specializations = {
        has: specialization
      };
    }

    if (rating) {
      filter.rating = {
        gte: parseFloat(rating)
      };
    }

    // Get guides
    const guides = await prisma.guide.findMany({
      where: filter,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: {
        rating: 'desc'
      }
    });

    // Get total count
    const total = await prisma.guide.count({
      where: filter
    });

    res.status(200).json({
      success: true,
      data: {
        guides,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single guide profile
 * @route GET /api/guides/:id
 */
exports.getGuideById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const guide = await prisma.guide.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
            status: true
          }
        },
        experiences: {
          where: {
            status: 'ACTIVE'
          },
          select: {
            id: true,
            title: true,
            category: true,
            location: true,
            duration: true,
            pricePerPerson: true,
            currency: true,
            images: true
          }
        }
      }
    });

    if (!guide) {
      return next(new AppError('Guide not found', 404));
    }

    // Check if guide is verified and active
    if (!guide.isVerified || guide.user.status !== 'ACTIVE') {
      return next(new AppError('Guide profile is not available', 404));
    }

    res.status(200).json({
      success: true,
      data: guide
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update guide profile
 * @route PUT /api/guides/:id
 */
exports.updateGuideProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bio, region, languages, specializations } = req.body;

    // Check if guide exists
    const guide = await prisma.guide.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!guide) {
      return next(new AppError('Guide not found', 404));
    }

    // Check if user is the guide owner
    if (guide.userId !== req.user.id) {
      return next(new AppError('Not authorized to update this profile', 403));
    }

    // Update guide
    const updatedGuide = await prisma.guide.update({
      where: { id },
      data: {
        bio,
        region,
        languages: languages ? languages.split(',') : guide.languages,
        specializations: specializations ? specializations.split(',') : guide.specializations
      }
    });

    res.status(200).json({
      success: true,
      message: 'Guide profile updated successfully',
      data: updatedGuide
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get guide availability
 * @route GET /api/guides/:id/availability
 */
exports.getGuideAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Check if guide exists
    const guide = await prisma.guide.findUnique({
      where: { id }
    });

    if (!guide) {
      return next(new AppError('Guide not found', 404));
    }

    // Parse dates
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days from start

    // Get availability
    const availability = await prisma.availabilityCalendar.findMany({
      where: {
        guideId: id,
        date: {
          gte: start,
          lte: end
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      data: availability
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set guide availability
 * @route POST /api/guides/:id/availability
 */
exports.setGuideAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, isAvailable } = req.body;

    // Check if guide exists
    const guide = await prisma.guide.findUnique({
      where: { id }
    });

    if (!guide) {
      return next(new AppError('Guide not found', 404));
    }

    // Check if user is the guide owner
    if (guide.userId !== req.user.id) {
      return next(new AppError('Not authorized to update availability', 403));
    }

    // Parse dates
    const availabilityDate = new Date(date);
    const availabilityStartTime = new Date(startTime);
    const availabilityEndTime = new Date(endTime);

    // Create or update availability
    const availability = await prisma.availabilityCalendar.upsert({
      where: {
        id: req.body.id || '',
      },
      update: {
        date: availabilityDate,
        startTime: availabilityStartTime,
        endTime: availabilityEndTime,
        isAvailable: isAvailable !== undefined ? isAvailable : true
      },
      create: {
        guideId: id,
        date: availabilityDate,
        startTime: availabilityStartTime,
        endTime: availabilityEndTime,
        isAvailable: isAvailable !== undefined ? isAvailable : true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: availability
    });
  } catch (error) {
    next(error);
  }
};