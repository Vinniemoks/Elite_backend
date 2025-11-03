const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

class ReviewService {
  async createReview(data) {
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId }
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.status !== 'completed') {
      throw new AppError('Can only review completed bookings', 400);
    }

    if (booking.touristId !== data.userId) {
      throw new AppError('Unauthorized to review this booking', 403);
    }

    const existingReview = await prisma.review.findUnique({
      where: { bookingId: data.bookingId }
    });

    if (existingReview) {
      throw new AppError('Review already exists for this booking', 400);
    }

    const review = await prisma.review.create({
      data: {
        bookingId: data.bookingId,
        guideId: booking.guideId,
        experienceId: booking.experienceId,
        touristId: data.userId,
        rating: data.rating,
        comment: data.comment,
        photos: data.photos || []
      },
      include: {
        tourist: {
          select: {
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        }
      }
    });

    await this.updateGuideRating(booking.guideId);

    return review;
  }

  async updateGuideRating(guideId) {
    const reviews = await prisma.review.findMany({
      where: { guideId, status: 'approved' }
    });

    if (reviews.length === 0) return;

    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.guide.update({
      where: { id: guideId },
      data: {
        rating: averageRating,
        totalReviews: reviews.length
      }
    });
  }

  async addGuideResponse(reviewId, guideId, response) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (review.guideId !== guideId) {
      throw new AppError('Unauthorized to respond to this review', 403);
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { guideResponse: response }
    });

    return updatedReview;
  }
}

module.exports = new ReviewService();
