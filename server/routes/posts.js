const express = require('express');
const axios = require('axios');
const cache = require('../cache');
const router = express.Router();

const HOST = 'instagram120.p.rapidapi.com';

const MOCK_POSTS = [
  { id: '1', thumbnail: null, like_count: 234, comment_count: 18, taken_at: Date.now() / 1000 - 86400,  caption: 'Atardecer en la sierra 🌄' },
  { id: '2', thumbnail: null, like_count: 187, comment_count: 11, taken_at: Date.now() / 1000 - 172800, caption: 'Fin de semana perfecto ☀️' },
  { id: '3', thumbnail: null, like_count: 312, comment_count: 24, taken_at: Date.now() / 1000 - 259200, caption: 'Nueva aventura 🏔️' },
  { id: '4', thumbnail: null, like_count: 98,  comment_count: 7,  taken_at: Date.now() / 1000 - 345600, caption: 'Café y buenas vibraciones ☕' },
  { id: '5', thumbnail: null, like_count: 445, comment_count: 33, taken_at: Date.now() / 1000 - 432000, caption: 'Momentos únicos 📸' },
  { id: '6', thumbnail: null, like_count: 156, comment_count: 9,  taken_at: Date.now() / 1000 - 518400, caption: 'La ciudad de noche 🌃' },
];

function normalizePosts(data) {
  // instagram120 retorna { result: { edges: [{ node: {...} }] } }
  const edges = data?.result?.edges;
  if (Array.isArray(edges) && edges.length > 0) {
    return edges.slice(0, 8).map((e, i) => {
      const p = e.node || e;
      return {
        id: p.id || p.pk || String(i),
        thumbnail: p.image_versions2?.candidates?.[0]?.url || p.thumbnail_url || p.display_url || null,
        like_count: p.like_count || p.edge_media_preview_like?.count || 0,
        comment_count: p.comment_count || p.edge_media_to_comment?.count || 0,
        taken_at: p.taken_at || p.timestamp || Date.now() / 1000 - i * 86400,
        caption: (typeof p.caption === 'object' ? p.caption?.text : p.caption) || '',
      };
    });
  }

  // fallback para outros formatos
  const items = data?.items || data?.data?.items || data?.posts || [];
  if (!Array.isArray(items) || items.length === 0) return null;
  return items.slice(0, 8).map((p, i) => ({
    id: p.id || p.pk || String(i),
    thumbnail: p.image_versions2?.candidates?.[0]?.url || p.thumbnail_url || p.display_url || null,
    like_count: p.like_count || 0,
    comment_count: p.comment_count || 0,
    taken_at: p.taken_at || Date.now() / 1000 - i * 86400,
    caption: (typeof p.caption === 'object' ? p.caption?.text : p.caption) || '',
  }));
}

router.post('/', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  const clean = username.replace('@', '').trim();
  const cacheKey = `posts:${clean}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`[cache HIT] posts:${clean}`);
    return res.json(cached);
  }

  if (!process.env.RAPIDAPI_KEY) return res.json(MOCK_POSTS);

  try {
    console.log(`[API call] posts:${clean}`);
    const { data } = await axios.post(
      `https://${HOST}/api/instagram/posts`,
      { username: clean, maxId: '' },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': HOST,
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        },
        timeout: 15000,
      }
    );

    const posts = normalizePosts(data);
    if (!posts) return res.json(MOCK_POSTS);
    cache.set(cacheKey, posts);
    res.json(posts);
  } catch (err) {
    console.error('Posts API error:', err.response?.status, err.response?.data || err.message);
    res.json(MOCK_POSTS);
  }
});

module.exports = router;
