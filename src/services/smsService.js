const { sendSMS } = require('../config/sms');

class SMSService {
  async sendBookingConfirmation(phoneNumber, bookingDetails) {
    const message = `Elite Events: Your booking for ${bookingDetails.experience} on ${bookingDetails.date} is confirmed. Booking ID: ${bookingDetails.id}`;
    return await sendSMS(phoneNumber, message);
  }

  async sendPaymentConfirmation(phoneNumber, amount, currency) {
    const message = `Elite Events: Payment of ${currency} ${amount} received successfully. Thank you!`;
    return await sendSMS(phoneNumber, message);
  }

  async sendBookingReminder(phoneNumber, bookingDetails) {
    const message = `Elite Events: Reminder - Your experience "${bookingDetails.experience}" is tomorrow at ${bookingDetails.time}. See you there!`;
    return await sendSMS(phoneNumber, message);
  }

  async sendOTP(phoneNumber, otp) {
    const message = `Your Elite Events verification code is: ${otp}. Valid for 10 minutes.`;
    return await sendSMS(phoneNumber, message);
  }
}

module.exports = new SMSService();
