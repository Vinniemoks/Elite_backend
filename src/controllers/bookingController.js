const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get all bookings for current user
 * @route GET /api/bookings
 */
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        experience: {
          select: {
            id: true,
            title: true,
            location: true,
            images: true,
            guide: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bookings for guide's experiences
 * @route GET /api/bookings/guide
 */
exports.getGuideBookings = async (req, res, next) => {
  try {
    // Check if user is a guide
    const guide = await prisma.guide.findFirst({
      where: { userId: req.user.id }
    });

    if (!guide) {
      return next(new AppError('Only guides can access this resource', 403));
    }

    const bookings = await prisma.booking.findMany({
      where: {
        experience: {
          guideId: guide.id
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true
          }
        },
        experience: {
          select: {
            id: true,
            title: true,
            location: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get booking by ID
 * @route GET /api/bookings/:id
 */
exports.getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true
          }
        },
        experience: {
          include: {
            guide: {
              select: {
                id: true,
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
        },
        payment: true
      }
    });

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Check if user is authorized to view this booking
    const guide = await prisma.guide.findFirst({
      where: { userId: req.user.id }
    });

    const isGuideOfExperience = guide && booking.experience.guideId === guide.id;
    const isBookingOwner = booking.userId === req.user.id;

    if (!isGuideOfExperience && !isBookingOwner) {
      return next(new AppError('Not authorized to view this booking', 403));
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create booking
 * @route POST /api/bookings
 */
exports.createBooking = async (req, res, next) => {
  try {
    const {
      experienceId,
      date,
      numberOfPeople,
      specialRequests,
      currency
    } = req.body;

    // Check if experience exists and is active
    const experience = await prisma.experience.findFirst({
      where: {
        id: experienceId,
        status: 'ACTIVE'
      }
    });

    if (!experience) {
      return next(new AppError('Experience not found or not available', 404));
    }

    // Check if date is in the future
    const bookingDate = new Date(date);
    if (bookingDate < new Date()) {
      return next(new AppError('Booking date must be in the future', 400));
    }

    // Check if number of people is valid
    if (numberOfPeople <= 0 || numberOfPeople > experience.maxGroupSize) {
      return next(new AppError(`Number of people must be between 1 and ${experience.maxGroupSize}`, 400));
    }

    // Calculate total price
    const totalPrice = experience.pricePerPerson * numberOfPeople;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        experienceId,
        date: bookingDate,
        numberOfPeople: parseInt(numberOfPeople),
        specialRequests,
        totalPrice,
        currency: currency || experience.currency,
        status: 'PENDING'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking,
        paymentRequired: true
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update booking status
 * @route PATCH /api/bookings/:id/status
 */
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        experience: {
          include: {
            guide: true
          }
        }
      }
    });

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Check if user is authorized to update this booking
    const guide = await prisma.guide.findFirst({
      where: { userId: req.user.id }
    });

    const isGuideOfExperience = guide && booking.experience.guideId === guide.id;
    const isBookingOwner = booking.userId === req.user.id;

    // Validate status change permissions
    if (status === 'CONFIRMED' || status === 'REJECTED') {
      // Only guide can confirm or reject
      if (!isGuideOfExperience) {
        return next(new AppError('Only the guide can confirm or reject bookings', 403));
      }
    } else if (status === 'CANCELLED') {
      // Only booking owner can cancel
      if (!isBookingOwner) {
        return next(new AppError('Only the booking owner can cancel bookings', 403));
      }
      
      // Check if booking is already confirmed and within 24 hours of experience
      if (booking.status === 'CONFIRMED') {
        const bookingDate = new Date(booking.date);
        const now = new Date();
        const hoursUntilBooking = (bookingDate - now) / (1000 * 60 * 60);
        
        if (hoursUntilBooking < 24) {
          return next(new AppError('Bookings cannot be cancelled within 24 hours of the experience', 400));
        }
      }
    } else {
      return next(new AppError('Invalid status', 400));
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status }
    });

    // TODO: Send notification to user or guide about status change

    res.status(200).json({
      success: true,
      message: `Booking ${status.toLowerCase()} successfully`,
      data: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};