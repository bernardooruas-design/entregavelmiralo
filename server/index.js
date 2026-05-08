require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const profileRouter = require('./routes/profile');
const postsRouter = require('./routes/posts');
const followersRouter = require('./routes/followers');
const followingRouter = require('./routes/following');
const locationRouter = require('./routes/location');
const leadRouter = require('./routes/lead');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// Proxy de imagem — contorna bloqueio do CDN do Instagram
app.get('/api/proxy-image', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('Missing url');

  try {
    const response = await axios.get(decodeURIComponent(url), {
      responseType: 'stream',
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        'Referer': 'https://www.instagram.com/',
        'Accept': 'image/webp,image/apng,image/*,*/*',
      },
    });
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    response.data.pipe(res);
  } catch (err) {
    res.status(502).send('Image unavailable');
  }
});

app.use('/api/profile', profileRouter);
app.use('/api/posts', postsRouter);
app.use('/api/followers', followersRouter);
app.use('/api/following', followingRouter);
app.use('/api/location', locationRouter);
app.use('/api/lead', leadRouter);

app.get('/health', (_, res) => res.json({ status: 'ok', cache: require('./cache').stats() }));

app.listen(PORT, () => console.log(`MiraloAI backend running on port ${PORT}`));
