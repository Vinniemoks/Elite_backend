const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

// All notification routes require authentication
router.use(protect);

/**
 * Get user notifications
 * @route GET /api/notifications
 */
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (status) {
      where.status = status;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.notification.count({ where });

    res.status(200).json({
      success: true,
      data: {
        notifications,
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
});

/**
 * Mark notification as read
 * @route PATCH /api/notifications/:id/read
 */
router.patch('/:id/read', async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    if (notification.userId !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { status: 'READ' }
    });

    res.status(200).json({
      success: true,
      data: updatedNotification
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Mark all notifications as read
 * @route PATCH /api/notifications/read-all
 */
router.patch('/read-all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        status: 'UNREAD'
      },
      data: { status: 'READ' }
    });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Delete notification
 * @route DELETE /api/notifications/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    if (notification.userId !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    await prisma.notification.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get unread count
 * @route GET /api/notifications/unread-count
 */
router.get('/unread-count', async (req, res, next) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: req.user.id,
        status: 'UNREAD'
      }
    });

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
