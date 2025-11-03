const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { hashPassword } = require('../utils/bcrypt');

/**
 * Get current user profile
 * @route GET /api/users/me
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        avatar: true,
        userType: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // If user is a guide, include guide profile
    let guideProfile = null;
    if (user.userType === 'GUIDE') {
      guideProfile = await prisma.guide.findUnique({
        where: { userId: user.id },
        select: {
          id: true,
          bio: true,
          region: true,
          languages: true,
          specializations: true,
          yearsOfExperience: true,
          licenseNumber: true,
          rating: true,
          reviewCount: true,
          isVerified: true
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...user,
        ...(guideProfile && { guideProfile })
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @route PUT /api/users/me
 */
exports.updateCurrentUser = async (req, res, next) => {
  try {
    const { firstName, lastName, phoneNumber } = req.body;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        phoneNumber
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        avatar: true,
        userType: true,
        status: true,
        emailVerified: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload profile picture
 * @route POST /api/users/me/upload-avatar
 */
exports.uploadAvatar = async (req, res, next) => {
  try {
    // File upload will be handled by multer middleware
    // req.file will contain the uploaded file information
    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }

    // Update user with avatar URL
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        avatar: req.file.location // S3 file URL
      }
    });

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar: updatedUser.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Soft delete user account
 * @route DELETE /api/users/me
 */
exports.deleteCurrentUser = async (req, res, next) => {
  try {
    // Soft delete user (set status to DELETED)
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        status: 'DELETED'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};