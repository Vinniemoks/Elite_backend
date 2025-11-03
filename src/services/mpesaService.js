const { initiateSTKPush } = require('../config/payments/mpesa');
const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

class MpesaService {
  async initiatePayment(bookingId, phoneNumber) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { experience: true }
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.status !== 'pending') {
      throw new AppError('Booking is not pending payment', 400);
    }

    const amount = booking.totalAmount;
    const accountReference = `BK${bookingId}`;
    const transactionDesc = `Payment for ${booking.experience.title}`;

    const response = await initiateSTKPush(
      phoneNumber,
      amount,
      accountReference,
      transactionDesc
    );

    await prisma.payment.create({
      data: {
        bookingId,
        amount,
        currency: 'KES',
        paymentMethod: 'mpesa',
        status: 'pending',
        transactionId: response.CheckoutRequestID
      }
    });

    return response;
  }

  async handleCallback(callbackData) {
    const { Body } = callbackData;
    const { stkCallback } = Body;

    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;

    const payment = await prisma.payment.findFirst({
      where: { transactionId: checkoutRequestId }
    });

    if (!payment) {
      console.error('Payment not found for callback');
      return;
    }

    if (resultCode === 0) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'completed' }
      });

      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'confirmed' }
      });
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' }
      });
    }
  }
}

module.exports = new MpesaService();
