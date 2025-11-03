const { createPaymentIntent, confirmPayment, createRefund } = require('../config/payments/stripe');
const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

class StripeService {
  async createPayment(bookingId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { experience: true }
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    const paymentIntent = await createPaymentIntent(
      booking.totalAmount,
      booking.currency.toLowerCase(),
      { bookingId }
    );

    await prisma.payment.create({
      data: {
        bookingId,
        amount: booking.totalAmount,
        currency: booking.currency,
        paymentMethod: 'stripe',
        status: 'pending',
        transactionId: paymentIntent.id
      }
    });

    return { clientSecret: paymentIntent.client_secret };
  }

  async handleWebhook(event) {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const payment = await prisma.payment.findFirst({
        where: { transactionId: paymentIntent.id }
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
    }
  }
}

module.exports = new StripeService();
