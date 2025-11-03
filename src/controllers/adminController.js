const { prisma } = require('../config/database');
const emailService = require('../services/emailService');

exports.getApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const applications = await prisma.guideApplication.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.guideApplication.count({ where });

    res.status(200).json({
      status: 'success',
      data: {
        applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getApplicationById = async (req, res, next) => {
  try {
    const application = await prisma.guideApplication.findUnique({
      where: { id: req.params.id },
      include: {
        user: true
      }
    });

    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

exports.reviewApplication = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const { id } = req.params;

    const application = await prisma.guideApplication.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: req.user.id,
        rejectionReason: reason
      },
      include: { user: true }
    });

    if (status === 'approved') {
      await prisma.guide.create({
        data: {
          userId: application.userId,
          bio: application.bio,
          languages: application.languages,
          specializations: application.specializations,
          region: application.region,
          status: 'active'
        }
      });

      await prisma.user.update({
        where: { id: application.userId },
        data: { userType: 'guide' }
      });
    }

    await emailService.sendGuideApplicationStatus(application.user, status, reason);

    res.status(200).json({
      status: 'success',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { userType, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (userType) where.userType = userType;
    if (status) where.status = status;

    const users = await prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count({ where });

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.suspendUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { suspend } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { status: suspend ? 'suspended' : 'active' }
    });

    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const bookings = await prisma.booking.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        tourist: {
          select: { firstName: true, lastName: true, email: true }
        },
        guide: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        },
        experience: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.booking.count({ where });

    res.status(200).json({
      status: 'success',
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const payments = await prisma.payment.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        booking: {
          include: {
            tourist: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.payment.count({ where });

    res.status(200).json({
      status: 'success',
      data: {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalGuides = await prisma.guide.count({ where: { status: 'active' } });
    const totalTourists = await prisma.user.count({ where: { userType: 'tourist' } });
    const totalBookings = await prisma.booking.count();
    const completedBookings = await prisma.booking.count({ where: { status: 'completed' } });

    const totalRevenue = await prisma.payment.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true }
    });

    const recentBookings = await prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        tourist: { select: { firstName: true, lastName: true } },
        experience: { select: { title: true } }
      }
    });

    const topGuides = await prisma.guide.findMany({
      take: 10,
      orderBy: { rating: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true } }
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalUsers,
          totalGuides,
          totalTourists,
          totalBookings,
          completedBookings,
          totalRevenue: totalRevenue._sum.amount || 0
        },
        recentBookings,
        topGuides
      }
    });
  } catch (error) {
    next(error);
  }
};
