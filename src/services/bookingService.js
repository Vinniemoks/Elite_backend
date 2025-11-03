const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

class BookingService {
  async checkAvailability(guideId, date, startTime, duration) {
    const bookingDate = new Date(date);

    const existingBookings = await prisma.booking.findMany({
      where: {
        guideId,
        bookingDate,
        status: {
          in: ['pending', 'confirmed', 'in_progress']
        }
      }
    });

    if (existingBookings.length > 0) {
      return false;
    }

    return true;
  }

  async calculatePrice(experienceId, numberOfGuests, currency = 'USD') {
    const experience = await prisma.experience.findUnique({
      where: { id: experienceId }
    });

    if (!experience) {
      throw new AppError('Experience not found', 404);
    }

    const basePrice = experience.pricePerPerson * numberOfGuests;
    const serviceFee = basePrice * 0.10;
    const totalAmount = basePrice + serviceFee;

    return {
      basePrice,
      serviceFee,
      totalAmount,
      currency
    };
  }

  async createBooking(data) {
    const isAvailable = await this.checkAvailability(
      data.guideId,
      data.bookingDate,
      data.startTime,
      data.duration
    );

    if (!isAvailable) {
      throw new AppError('Guide is not available at this time', 400);
    }

    const pricing = await this.calculatePrice(
      data.experienceId,
      data.numberOfGuests,
      data.currency
    );

    const booking = await prisma.booking.create({
      data: {
        ...data,
        ...pricing,
        status: 'pending'
      },
      include: {
        tourist: true,
        guide: true,
        experience: true
      }
    });

    return booking;
  }

  async cancelBooking(bookingId, userId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.touristId !== userId) {
      throw new AppError('Unauthorized to cancel this booking', 403);
    }

    const bookingDate = new Date(booking.bookingDate);
    const now = new Date();
    const hoursDifference = (bookingDate - now) / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      throw new AppError('Cannot cancel booking less than 24 hours before start time', 400);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' }
    });

    return updatedBooking;
  }
}

module.exports = new BookingService();
