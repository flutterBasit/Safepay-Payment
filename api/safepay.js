// api/safepay.js
const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { amount = 0, currency = 'PKR', metadata = {} } = req.body || {};

    const orderResp = await axios.post(
      'https://sandbox.api.getsafepay.com/order/setup',
      { amount, currency, metadata },
      {
        headers: {
          Authorization: `Bearer ${process.env.SAFEPAY_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const tracker = orderResp.data?.data?.tracker;

    const passportResp = await axios.post(
      'https://sandbox.api.getsafepay.com/passport/create',
      { tracker },
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
      details: err.response?.data || err.message,  // 👈 Added detailed error
    });
  }
};
