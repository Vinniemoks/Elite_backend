const { createOrder, captureOrder } = require('../config/payments/paypal');
const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

class PayPalService {
  async createPayment(bookingId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    const order = await createOrder(booking.totalAmount, booking.currency);

    await prisma.payment.create({
      data: {
        bookingId,
        amount: booking.totalAmount,
        currency: booking.currency,
        paymentMethod: 'paypal',
        status: 'pending',
        transactionId: order.id
      }
    });

    return { orderId: order.id };
  }

  async capturePayment(orderId) {
    const capture = await captureOrder(orderId);

    const payment = await prisma.payment.findFirst({
      where: { transactionId: orderId }
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'completed' }
      });

      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'confirmed' }
      });
    }

    return capture;
  }
}

module.exports = new PayPalService();
