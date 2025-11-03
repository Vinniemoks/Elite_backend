const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { stripe, mpesaConfig } = require('../config/payment');
const axios = require('axios');

/**
 * Process Stripe payment
 * @route POST /api/payments/stripe
 */
exports.processStripePayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethodId } = req.body;

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        experience: true,
        user: true
      }
    });

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Check if booking belongs to user
    if (booking.userId !== req.user.id) {
      return next(new AppError('Not authorized to make payment for this booking', 403));
    }

    // Check if booking is already paid
    if (booking.status === 'CONFIRMED') {
      return next(new AppError('Booking is already confirmed', 400));
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalPrice * 100), // Convert to cents
      currency: booking.currency.toLowerCase(),
      payment_method: paymentMethodId,
      confirm: true,
      description: `Payment for ${booking.experience.title}`,
      metadata: {
        bookingId: booking.id,
        experienceId: booking.experienceId,
        userId: booking.userId
      },
      receipt_email: booking.user.email
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalPrice,
        currency: booking.currency,
        method: 'STRIPE',
        status: paymentIntent.status === 'succeeded' ? 'COMPLETED' : 'PENDING',
        transactionId: paymentIntent.id,
        metadata: {
          paymentIntentId: paymentIntent.id,
          paymentMethodId: paymentMethodId
        }
      }
    });

    // Update booking status if payment succeeded
    if (paymentIntent.status === 'succeeded') {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'CONFIRMED' }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        paymentId: payment.id,
        status: payment.status,
        clientSecret: paymentIntent.client_secret
      }
    });
  } catch (error) {
    if (error.type === 'StripeCardError') {
      return next(new AppError(`Payment failed: ${error.message}`, 400));
    }
    next(error);
  }
};

/**
 * Process M-Pesa payment
 * @route POST /api/payments/mpesa
 */
exports.processMpesaPayment = async (req, res, next) => {
  try {
    const { bookingId, phoneNumber } = req.body;

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        experience: true
      }
    });

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Check if booking belongs to user
    if (booking.userId !== req.user.id) {
      return next(new AppError('Not authorized to make payment for this booking', 403));
    }

    // Check if booking is already paid
    if (booking.status === 'CONFIRMED') {
      return next(new AppError('Booking is already confirmed', 400));
    }

    // Format phone number (remove + and country code if present)
    let formattedPhone = phoneNumber.replace('+', '');
    if (formattedPhone.startsWith('254')) {
      formattedPhone = formattedPhone.substring(3);
    }
    if (!formattedPhone.startsWith('0')) {
      formattedPhone = '0' + formattedPhone;
    }

    // Get M-Pesa access token
    const auth = Buffer.from(`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`).toString('base64');
    const tokenResponse = await axios.get(
      `https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Generate timestamp
    const date = new Date();
    const timestamp = 
      date.getFullYear() +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      ('0' + date.getDate()).slice(-2) +
      ('0' + date.getHours()).slice(-2) +
      ('0' + date.getMinutes()).slice(-2) +
      ('0' + date.getSeconds()).slice(-2);

    // Generate password
    const password = Buffer.from(
      mpesaConfig.shortCode + mpesaConfig.passKey + timestamp
    ).toString('base64');

    // Initiate STK push
    const stkResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: mpesaConfig.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(booking.totalPrice),
        PartyA: formattedPhone,
        PartyB: mpesaConfig.shortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: mpesaConfig.callbackUrl,
        AccountReference: `Elite Events - ${booking.id}`,
        TransactionDesc: `Payment for ${booking.experience.title}`
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalPrice,
        currency: 'KES',
        method: 'MPESA',
        status: 'PENDING',
        transactionId: stkResponse.data.CheckoutRequestID,
        metadata: {
          checkoutRequestId: stkResponse.data.CheckoutRequestID,
          merchantRequestId: stkResponse.data.MerchantRequestID,
          phoneNumber: formattedPhone
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'M-Pesa payment initiated. Please complete the payment on your phone.',
      data: {
        paymentId: payment.id,
        status: 'PENDING',
        checkoutRequestId: stkResponse.data.CheckoutRequestID
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * M-Pesa callback
 * @route POST /api/payments/mpesa/callback
 */
exports.mpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    
    // Acknowledge receipt of callback
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
    
    // Process callback asynchronously
    if (Body.stkCallback.ResultCode === 0) {
      const checkoutRequestId = Body.stkCallback.CheckoutRequestID;
      const amount = Body.stkCallback.CallbackMetadata.Item.find(item => item.Name === 'Amount').Value;
      const mpesaReceiptNumber = Body.stkCallback.CallbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber').Value;
      
      // Find payment by checkoutRequestId
      const payment = await prisma.payment.findFirst({
        where: {
          metadata: {
            path: ['checkoutRequestId'],
            equals: checkoutRequestId
          }
        },
        include: {
          booking: true
        }
      });
      
      if (payment) {
        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            transactionId: mpesaReceiptNumber,
            metadata: {
              ...payment.metadata,
              mpesaReceiptNumber
            }
          }
        });
        
        // Update booking status
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'CONFIRMED' }
        });
      }
    }
  } catch (error) {
    console.error('M-Pesa callback error:', error);
  }
};

/**
 * Get payment status
 * @route GET /api/payments/:id
 */
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            userId: true,
            status: true
          }
        }
      }
    });
    
    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }
    
    // Check if payment belongs to user
    if (payment.booking.userId !== req.user.id) {
      return next(new AppError('Not authorized to view this payment', 403));
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        createdAt: payment.createdAt,
        bookingStatus: payment.booking.status
      }
    });
  } catch (error) {
    next(error);
  }
};