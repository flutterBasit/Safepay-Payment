// api/safepay.js
const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { amount = 0, currency = 'PKR', metadata = {} } = req.body || {};

    // Step 1: Create order session
    const orderResp = await axios.post(
      'https://sandbox.api.getsafepay.com/order/v1/session',
      { amount, currency, metadata },
      {
        headers: {
          Authorization: `Bearer ${process.env.SAFEPAY_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const tracker = orderResp.data?.data?.tracker;

    // Step 2: Create checkout session
    const passportResp = await axios.post(
      'https://sandbox.api.getsafepay.com/checkout/v1/session',
      { tracker, orderId: orderResp.data?.data?.orderId },
      {
        headers: {
          Authorization: `Bearer ${process.env.SAFEPAY_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const tbt = passportResp.data?.data?.tbt;

    return res.status(200).json({ tracker, tbt });
  } catch (err) {
    console.error('Safepay error:', err.response?.data || err.message);
    return res.status(500).json({
      error: 'Failed to create Safepay session',
      details: err.response?.data || err.message,
    });
  }
};
