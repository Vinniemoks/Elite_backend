const { sendEmail } = require('../config/email');

class EmailService {
  async sendWelcomeEmail(user) {
    const html = `
      <h1>Welcome to Elite Events Kenya!</h1>
      <p>Hi ${user.firstName},</p>
      <p>Thank you for joining Elite Events Kenya. We're excited to have you on board!</p>
      <p>Start exploring authentic Kenyan experiences with verified local guides.</p>
      <p>Best regards,<br>Elite Events Kenya Team</p>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Welcome to Elite Events Kenya',
      html,
      text: `Welcome to Elite Events Kenya! Hi ${user.firstName}, thank you for joining us.`
    });
  }

  async sendVerificationEmail(user, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const html = `
      <h1>Verify Your Email</h1>
      <p>Hi ${user.firstName},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email - Elite Events Kenya',
      html,
      text: `Verify your email: ${verificationUrl}`
    });
  }

  async sendPasswordResetEmail(user, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const html = `
      <h1>Password Reset Request</h1>
      <p>Hi ${user.firstName},</p>
      <p>You requested to reset your password. Click the link below:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset - Elite Events Kenya',
      html,
      text: `Reset your password: ${resetUrl}`
    });
  }

  async sendBookingConfirmation(booking, user, guide, experience) {
    const html = `
      <h1>Booking Confirmed!</h1>
      <p>Hi ${user.firstName},</p>
      <p>Your booking has been confirmed:</p>
      <ul>
        <li><strong>Experience:</strong> ${experience.title}</li>
        <li><strong>Guide:</strong> ${guide.firstName} ${guide.lastName}</li>
        <li><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</li>
        <li><strong>Time:</strong> ${booking.startTime}</li>
        <li><strong>Guests:</strong> ${booking.numberOfGuests}</li>
        <li><strong>Total:</strong> ${booking.currency} ${booking.totalAmount}</li>
      </ul>
      <p>Your guide will contact you soon with more details.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Booking Confirmed - Elite Events Kenya',
      html,
      text: `Your booking for ${experience.title} has been confirmed.`
    });
  }

  async sendGuideApplicationStatus(user, status, reason = null) {
    const html = `
      <h1>Guide Application ${status === 'approved' ? 'Approved' : 'Update'}</h1>
      <p>Hi ${user.firstName},</p>
      ${status === 'approved'
        ? '<p>Congratulations! Your guide application has been approved.</p><p>You can now start creating experiences and accepting bookings.</p>'
        : `<p>Your guide application status: ${status}</p>${reason ? `<p>Reason: ${reason}</p>` : ''}`
      }
    `;

    await sendEmail({
      to: user.email,
      subject: `Guide Application ${status} - Elite Events Kenya`,
      html,
      text: `Your guide application has been ${status}.`
    });
  }
}

module.exports = new EmailService();
