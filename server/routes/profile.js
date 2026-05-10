const express = require('express');
const axios = require('axios');
const cache = require('../cache');
const router = express.Router();

const HOST = 'instagram120.p.rapidapi.com';

const MOCK_PROFILE = {
  username: 'usuario_ejemplo',
  full_name: 'Usuario Ejemplo',
  biography: 'Explorando el mundo 🌍 | Fotógrafo aficionado 📸 | Madrid, España',
  profile_pic_url: null,
  follower_count: 1284,
  following_count: 347,
  media_count: 89,
  is_private: false,
};

function normalizeProfile(data, clean) {
  // instagram120 retorna { result: [{ user: {...} }] }
  const d = data?.result?.[0]?.user || data?.user || data?.data?.user || data?.data || data;
  return {
    username: d.username || d.userName || clean,
    full_name: d.full_name || d.fullName || d.name || '',
    biography: d.biography || d.bio || '',
    profile_pic_url:
      d.profile_pic_url_hd ||
      d.hd_profile_pic_versions?.[0]?.url ||
      d.profile_pic_url ||
      d.profile_image_url ||
      null,
    follower_count:
      d.follower_count ||
      d.edge_followed_by?.count ||
      d.followers_count ||
      0,
    following_count:
      d.following_count ||
      d.edge_follow?.count ||
      d.following ||
      0,
    media_count:
      d.media_count ||
      d.edge_owner_to_timeline_media?.count ||
      d.posts_count ||
      0,
    is_private: d.is_private ?? d.is_private_account ?? false,
  };
}

router.post('/', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  const clean = username.replace('@', '').trim();
  const cacheKey = `profile:${clean}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`[cache HIT] profile:${clean}`);
    return res.json(cached);
  }

  // Minimal empty profile — used as fallback when API fails (no fake data shown)
  const emptyProfile = {
    username: clean,
    full_name: '',
    biography: '',
    profile_pic_url: null,
    follower_count: 0,
    following_count: 0,
    media_count: 0,
    is_private: false,
  };

  if (!process.env.RAPIDAPI_KEY) {
    return res.json(emptyProfile);
  }

  // Helper: try one RapidAPI endpoint and return normalized profile or null
  async function tryEndpoint(url, body) {
    try {
      const { data } = await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': HOST,
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        },
        timeout: 15000,
      });
      const p = normalizeProfile(data, clean);
      // Only accept if we got meaningful data back
      if (p.follower_count > 0 || p.profile_pic_url || p.full_name) return { profile: p, raw: data };
    } catch (e) {
      console.error(`[profile] ${url} failed:`, e.response?.status, e.message);
    }
    return null;
  }

  try {
    console.log(`[API call] profile:${clean}`);

    // Primary endpoint
    let result = await tryEndpoint(`https://${HOST}/api/instagram/userInfo`, { username: clean });

    // Fallback endpoint (different path, same host)
    if (!result) {
      result = await tryEndpoint(`https://${HOST}/api/instagram/profile`, { username: clean });
    }

    if (!result) {
      console.warn(`[profile] all endpoints failed for ${clean}, returning empty`);
      return res.json(emptyProfile);
    }

    const { profile, raw } = result;
    cache.set(cacheKey, profile);

    // Cache the numeric user ID for followers/following
    const rawUser = raw?.result?.[0]?.user || raw?.user || raw?.data?.user || raw?.data || raw;
    const pk = rawUser?.pk || rawUser?.id || rawUser?.pk_id;
    if (pk) {
      cache.set(`userid:${clean}`, String(pk));
      console.log(`[profile] cached userid ${pk} for ${clean}`);
    }

    res.json(profile);
  } catch (err) {
    console.error('Profile API error:', err.message);
    res.json(emptyProfile);
  }
});

module.exports = router;
