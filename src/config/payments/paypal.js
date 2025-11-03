const paypal = require('@paypal/checkout-server-sdk');

const environment = process.env.PAYPAL_MODE === 'live'
  ? new paypal.core.LiveEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
  : new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );

const client = new paypal.core.PayPalHttpClient(environment);

const createOrder = async (amount, currency = 'USD') => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: currency,
        value: amount.toFixed(2)
      }
    }]
  });

  const order = await client.execute(request);
  return order.result;
};

const captureOrder = async (orderId) => {
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  const capture = await client.execute(request);
  return capture.result;
};

module.exports = { client, createOrder, captureOrder };
