const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    '8.8.8.8';

  const cleanIp = ip === '::1' || ip === '127.0.0.1' ? '8.8.8.8' : ip;

  if (!process.env.IPINFO_TOKEN) {
    return res.json({ city: 'Madrid', region: 'Madrid', country: 'ES' });
  }

  try {
    const { data } = await axios.get(
      `https://ipinfo.io/${cleanIp}/json?token=${process.env.IPINFO_TOKEN}`,
      { timeout: 5000 }
    );
    res.json({ city: data.city || 'Madrid', region: data.region || 'Madrid', country: data.country || 'ES' });
  } catch (err) {
    console.error('Location API error:', err.message);
    res.json({ city: 'Madrid', region: 'Madrid', country: 'ES' });
  }
});

module.exports = router;
