const express = require('express');
const axios = require('axios');
const cache = require('../cache');
const router = express.Router();

const FLASH_HOST = 'flashapi1.p.rapidapi.com';

const USER_POOL = [
  'maria_lopez', 'pablogarcia_m', 'lucia.r23', 'carlos_madrid_', 'ana.martinez',
  'sergio_f', 'elena.v_', 'javi_lo', 'raquel.bcn_', 'adriana_gonzalez',
  'miguel.sevilla22', 'sonia_vlc', 'diego_cordoba', 'natalia.madrid_', 'kevin.bilbao',
  'veronica_granada', 'ruben.alicante22', 'amparo_murcia', 'nacho.zaragoza', 'lidia_vigo',
];

function seededPick(pool, seed, count) {
  let h = 13;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h, 37) + seed.charCodeAt(i); h |= 0; }
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    h = Math.imul(h, 1664525) + 1013904223; h |= 0;
    const j = Math.abs(h) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count).map((username) => ({ username, profile_pic_url: null }));
}

router.post('/', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  const clean = username.replace('@', '').trim();
  const cacheKey = `following:${clean}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`[cache HIT] following:${clean}`);
    return res.json(cached);
  }

  if (!process.env.RAPIDAPI_KEY) return res.json(seededPick(USER_POOL, clean, 10));

  try {
    // Reuse user ID already fetched by followers route if available
    let userId = cache.get(`userid:${clean}`);

    if (!userId) {
      console.log(`[FlashAPI] getting user ID for ${clean} (following)`);
      const { data } = await axios.get(`https://${FLASH_HOST}/ig/user_id/`, {
        params: { user: clean },
        headers: {
          'x-rapidapi-host': FLASH_HOST,
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      userId = data?.id ? String(data.id) : null;
      if (!userId) throw new Error('No user ID returned');
      cache.set(`userid:${clean}`, userId);
    }

    console.log(`[FlashAPI] fetching following for ${clean} (id: ${userId})`);
    const { data } = await axios.get(`https://${FLASH_HOST}/ig/following/`, {
      params: { id_user: userId, nocors: 'false' },
      headers: {
        'x-rapidapi-host': FLASH_HOST,
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    const users = (data?.users || [])
      .filter((u) => u.username)
      .map((u) => ({ username: u.username, profile_pic_url: u.profile_pic_url || null }));

    if (users.length === 0) throw new Error('Empty following list');

    console.log(`[FlashAPI] got ${users.length} real following for ${clean}`);
    cache.set(cacheKey, users);
    return res.json(users);
  } catch (err) {
    console.error(`[FlashAPI] following error for ${clean}:`, err.message);
    const mock = seededPick(USER_POOL, clean, 10);
    cache.set(cacheKey, mock);
    return res.json(mock);
  }
});

module.exports = router;
