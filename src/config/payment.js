const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

// M-Pesa Configuration
const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  shortCode: process.env.MPESA_SHORT_CODE,
  passKey: process.env.MPESA_PASS_KEY,
  callbackUrl: process.env.MPESA_CALLBACK_URL,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
};

// PayPal Configuration
const paypalConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET,
  environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox'
};

module.exports = {
  stripe,
  mpesaConfig,
  paypalConfig
};