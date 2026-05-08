const express = require('express');
const axios = require('axios');
const cache = require('../cache');
const router = express.Router();

const FLASH_HOST = 'flashapi1.p.rapidapi.com';

// Deterministic fallback pool
const USER_POOL = [
  'carlos.madrid_', 'lucia_bcn22', 'pablo.sevilla', 'marta_vlc', 'jorge.bilbao',
  'sofia_malaga', 'alex.granada_', 'nuria.zaragoza', 'ivan_vigo', 'alba.cordoba',
  'miguel.alicante', 'claudia_bcn', 'sergio.murcia_', 'patricia.leon', 'raul.burgos22',
  'elena_sevilla_', 'david.salamanca', 'laura.getafe', 'antonio_malaga', 'beatriz.vlc',
  'roberto.badalona', 'cristina_madrid', 'fernando.bilbao_', 'silvia.granada22',
  'javier.zaragoza', 'ana.cordoba_', 'victor.alicante', 'irene_vigo', 'oscar.leon',
  'noelia.murcia22', 'gonzalo_bcn', 'tamara.sevilla_', 'ruben.madrid22', 'vanesa.vlc',
];

function seededPick(pool, seed, count) {
  let h = 7;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h, 31) + seed.charCodeAt(i); h |= 0; }
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    h = Math.imul(h, 1664525) + 1013904223; h |= 0;
    const j = Math.abs(h) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count).map((username) => ({ username, profile_pic_url: null }));
}

async function getUserId(username) {
  const { data } = await axios.get(`https://${FLASH_HOST}/ig/user_id/`, {
    params: { user: username },
    headers: {
      'x-rapidapi-host': FLASH_HOST,
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });
  return data?.id ? String(data.id) : null;
}

router.post('/', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  const clean = username.replace('@', '').trim();
  const cacheKey = `followers:${clean}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`[cache HIT] followers:${clean}`);
    return res.json(cached);
  }

  if (!process.env.RAPIDAPI_KEY) return res.json(seededPick(USER_POOL, clean, 10));

  try {
    // Reuse pk already cached by profile route (saves 1 FlashAPI request)
    let userId = cache.get(`userid:${clean}`);
    if (!userId) {
      console.log(`[FlashAPI] getting user ID for ${clean}`);
      userId = await getUserId(clean);
      if (!userId) throw new Error('No user ID returned');
    }

    cache.set(`userid:${clean}`, userId);
    console.log(`[FlashAPI] fetching followers for ${clean} (id: ${userId})`);
    const { data } = await axios.get(`https://${FLASH_HOST}/ig/followers/`, {
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

    if (users.length === 0) throw new Error('Empty followers list');

    console.log(`[FlashAPI] got ${users.length} real followers for ${clean}`);
    cache.set(cacheKey, users);
    return res.json(users);
  } catch (err) {
    console.error(`[FlashAPI] followers error for ${clean}:`, err.message);
    const mock = seededPick(USER_POOL, clean, 10);
    cache.set(cacheKey, mock);
    return res.json(mock);
  }
});

module.exports = router;
