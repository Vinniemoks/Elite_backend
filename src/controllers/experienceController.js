const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get all experiences with filters
 * @route GET /api/experiences
 */
exports.getAllExperiences = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      location,
      minPrice,
      maxPrice,
      rating
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    const filter = {
      status: 'ACTIVE'
    };
    
    if (category) {
      filter.category = category;
    }
    
    if (location) {
      filter.location = {
        contains: location,
        mode: 'insensitive'
      };
    }
    
    if (minPrice || maxPrice) {
      filter.pricePerPerson = {};
      
      if (minPrice) {
        filter.pricePerPerson.gte = parseFloat(minPrice);
      }
      
      if (maxPrice) {
        filter.pricePerPerson.lte = parseFloat(maxPrice);
      }
    }
    
    // Get experiences
    const experiences = await prisma.experience.findMany({
      where: filter,
      include: {
        guide: {
          select: {
            id: true,
            rating: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Get total count
    const total = await prisma.experience.count({
      where: filter
    });
    
    res.status(200).json({
      success: true,
      data: {
        experiences,
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
 * Get single experience
 * @route GET /api/experiences/:id
 */
exports.getExperienceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const experience = await prisma.experience.findUnique({
      where: { id },
      include: {
        guide: {
          select: {
            id: true,
            bio: true,
            region: true,
            languages: true,
            specializations: true,
            rating: true,
            reviewCount: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        reviews: {
          take: 5,
          orderBy: {
            createdAt: 'desc'
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
        }
      }
    });
    
    if (!experience) {
      return next(new AppError('Experience not found', 404));
    }
    
    // Check if experience is active
    if (experience.status !== 'ACTIVE' && !req.user?.id) {
      return next(new AppError('Experience not available', 404));
    }
    
    res.status(200).json({
      success: true,
      data: experience
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create experience
 * @route POST /api/experiences
 */
exports.createExperience = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      location,
      duration,
      maxGroupSize,
      pricePerPerson,
      currency,
      inclusions,
      exclusions,
      meetingPoint
    } = req.body;
    
    // Check if user is a guide
    const guide = await prisma.guide.findFirst({
      where: { userId: req.user.id }
    });
    
    if (!guide) {
      return next(new AppError('Only guides can create experiences', 403));
    }
    
    // Create experience
    const experience = await prisma.experience.create({
      data: {
        guideId: guide.id,
        title,
        description,
        category,
        location,
        duration: parseInt(duration),
        maxGroupSize: parseInt(maxGroupSize),
        pricePerPerson: parseFloat(pricePerPerson),
        currency: currency || 'USD',
        inclusions: inclusions ? inclusions.split(',') : [],
        exclusions: exclusions ? exclusions.split(',') : [],
        meetingPoint,
        images: req.files ? req.files.map(file => file.location) : [],
        status: 'DRAFT'
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Experience created successfully',
      data: experience
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update experience
 * @route PUT /api/experiences/:id
 */
exports.updateExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      location,
      duration,
      maxGroupSize,
      pricePerPerson,
      currency,
      inclusions,
      exclusions,
      meetingPoint,
      status
    } = req.body;
    
    // Check if experience exists
    const experience = await prisma.experience.findUnique({
      where: { id },
      include: {
        guide: true
      }
    });
    
    if (!experience) {
      return next(new AppError('Experience not found', 404));
    }
    
    // Check if user is the guide who created the experience
    const guide = await prisma.guide.findFirst({
      where: { userId: req.user.id }
    });
    
    if (!guide || guide.id !== experience.guideId) {
      return next(new AppError('Not authorized to update this experience', 403));
    }
    
    // Update experience
    const updatedExperience = await prisma.experience.update({
      where: { id },
      data: {
        title,
        description,
        category,
        location,
        duration: duration ? parseInt(duration) : undefined,
        maxGroupSize: maxGroupSize ? parseInt(maxGroupSize) : undefined,
        pricePerPerson: pricePerPerson ? parseFloat(pricePerPerson) : undefined,
        currency,
        inclusions: inclusions ? inclusions.split(',') : undefined,
        exclusions: exclusions ? exclusions.split(',') : undefined,
        meetingPoint,
        status: status || undefined,
        ...(req.files && { images: req.files.map(file => file.location) })
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Experience updated successfully',
      data: updatedExperience
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete experience
 * @route DELETE /api/experiences/:id
 */
exports.deleteExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if experience exists
    const experience = await prisma.experience.findUnique({
      where: { id },
      include: {
        guide: true
      }
    });
    
    if (!experience) {
      return next(new AppError('Experience not found', 404));
    }
    
    // Check if user is the guide who created the experience
    const guide = await prisma.guide.findFirst({
      where: { userId: req.user.id }
    });
    
    if (!guide || guide.id !== experience.guideId) {
      return next(new AppError('Not authorized to delete this experience', 403));
    }
    
    // Check if there are any active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        experienceId: id,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    });
    
    if (activeBookings > 0) {
      return next(new AppError('Cannot delete experience with active bookings', 400));
    }
    
    // Soft delete (set status to ARCHIVED)
    await prisma.experience.update({
      where: { id },
      data: {
        status: 'ARCHIVED'
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Experience deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};