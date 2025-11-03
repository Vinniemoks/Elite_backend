const emailService = require('./emailService');
const smsService = require('./smsService');
const { emitToUser } = require('../socket');
const { prisma } = require('../config/database');

class NotificationService {
  /**
   * Send notification via multiple channels
   */
  async sendNotification(userId, notification) {
    try {
      // Save notification to database
      const savedNotification = await prisma.notification.create({
        data: {
          userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data || {},
          status: 'UNREAD'
        }
      });

      // Send real-time notification via Socket.IO
      emitToUser(userId, 'notification', savedNotification);

      // Send email if specified
      if (notification.sendEmail) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, firstName: true }
        });

        if (user) {
          await emailService.sendEmail({
            to: user.email,
            subject: notification.title,
            html: `<p>Hi ${user.firstName},</p><p>${notification.message}</p>`,
            text: notification.message
          });
        }
      }

      // Send SMS if specified
      if (notification.sendSMS) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { phoneNumber: true }
        });

        if (user && user.phoneNumber) {
          await smsService.sendSMS(user.phoneNumber, notification.message);
        }
      }

      return savedNotification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send booking confirmation notification
   */
  async sendBookingConfirmation(booking) {
    const user = await prisma.user.findUnique({
      where: { id: booking.userId },
      select: { email: true, firstName: true, phoneNumber: true }
    });

    const experience = await prisma.experience.findUnique({
      where: { id: booking.experienceId },
      select: { title: true }
    });

    await this.sendNotification(booking.userId, {
      type: 'BOOKING_CONFIRMED',
      title: 'Booking Confirmed',
      message: `Your booking for "${experience.title}" has been confirmed!`,
      data: { bookingId: booking.id },
      sendEmail: true,
      sendSMS: true
    });
  }

  /**
   * Send payment confirmation notification
   */
  async sendPaymentConfirmation(payment) {
    const booking = await prisma.booking.findUnique({
      where: { id: payment.bookingId },
      include: {
        experience: { select: { title: true } }
      }
    });

    await this.sendNotification(booking.userId, {
      type: 'PAYMENT_CONFIRMED',
      title: 'Payment Successful',
      message: `Payment of ${payment.currency} ${payment.amount} received for "${booking.experience.title}"`,
      data: { paymentId: payment.id, bookingId: booking.id },
      sendEmail: true,
      sendSMS: true
    });
  }

  /**
   * Send new booking notification to guide
   */
  async sendNewBookingToGuide(booking) {
    const experience = await prisma.experience.findUnique({
      where: { id: booking.experienceId },
      include: {
        guide: {
          select: { userId: true }
        }
      }
    });

    const tourist = await prisma.user.findUnique({
      where: { id: booking.userId },
      select: { firstName: true, lastName: true }
    });

    await this.sendNotification(experience.guide.userId, {
      type: 'NEW_BOOKING',
      title: 'New Booking Received',
      message: `${tourist.firstName} ${tourist.lastName} booked "${experience.title}"`,
      data: { bookingId: booking.id },
      sendEmail: true
    });
  }

  /**
   * Send review notification to guide
   */
  async sendReviewNotification(review) {
    const experience = await prisma.experience.findUnique({
      where: { id: review.experienceId },
      include: {
        guide: { select: { userId: true } }
      }
    });

    const reviewer = await prisma.user.findUnique({
      where: { id: review.userId },
      select: { firstName: true }
    });

    await this.sendNotification(experience.guide.userId, {
      type: 'NEW_REVIEW',
      title: 'New Review Received',
      message: `${reviewer.firstName} left a ${review.rating}-star review for "${experience.title}"`,
      data: { reviewId: review.id },
      sendEmail: true
    });
  }

  /**
   * Send booking reminder (24 hours before)
   */
  async sendBookingReminder(booking) {
    const experience = await prisma.experience.findUnique({
      where: { id: booking.experienceId },
      select: { title: true }
    });

    await this.sendNotification(booking.userId, {
      type: 'BOOKING_REMINDER',
      title: 'Booking Reminder',
      message: `Reminder: Your experience "${experience.title}" is tomorrow!`,
      data: { bookingId: booking.id },
      sendEmail: true,
      sendSMS: true
    });
  }
}

module.exports = new NotificationService();
