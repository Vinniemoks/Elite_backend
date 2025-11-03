const AfricasTalking = require('africastalking');

const credentials = {
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME || 'sandbox'
};

const africasTalking = AfricasTalking(credentials);
const sms = africasTalking.SMS;

const sendSMS = async (to, message) => {
  const options = {
    to: Array.isArray(to) ? to : [to],
    message,
    from: process.env.AT_SENDER_ID
  };

  try {
    const result = await sms.send(options);
    console.log('SMS sent:', result);
    return result;
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
};

module.exports = { sendSMS };
