const express = require('express');
const router = express.Router();

const UNLOCK_HOURS = 36;

// Demo emails — always treated as already unlocked (countdown = 0)
const DEMO_EMAILS = ['demo@miraloai.com', 'test@miraloai.com'];
const ALREADY_UNLOCKED = new Date(Date.now() - 1000).toISOString(); // 1 second in the past

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) return null;
  try {
    const { createClient } = require('@supabase/supabase-js');
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  } catch { return null; }
}

// POST /api/lead  — create or retrieve lead
router.post('/', async (req, res) => {
  const { email, targetUsername, gender } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  // Demo emails bypass the countdown entirely — always unlocked
  if (DEMO_EMAILS.includes(email.toLowerCase())) {
    console.log(`[lead] demo email ${email} — returning unlocked`);
    return res.json({ email, unlockAt: ALREADY_UNLOCKED, isNew: false });
  }

  const unlockAt = new Date(Date.now() + UNLOCK_HOURS * 3600 * 1000).toISOString();
  const supabase = getSupabase();

  if (!supabase) {
    // No Supabase configured — return a fresh countdown
    console.log(`[lead] No Supabase — mock unlock for ${email}`);
    return res.json({ email, unlockAt, isNew: true });
  }

  try {
    // Check for existing lead
    const { data: existing } = await supabase
      .from('leads')
      .select('unlock_at, email')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existing) {
      console.log(`[lead] existing lead ${email} → unlockAt ${existing.unlock_at}`);
      return res.json({ email, unlockAt: existing.unlock_at, isNew: false });
    }

    // Insert new lead
    await supabase.from('leads').insert({
      email: email.toLowerCase(),
      target_username: targetUsername,
      gender,
      unlock_at: unlockAt,
    });
    console.log(`[lead] created lead ${email} → unlockAt ${unlockAt}`);
    return res.json({ email, unlockAt, isNew: true });
  } catch (err) {
    console.error('[lead] Supabase error:', err.message);
    return res.json({ email, unlockAt, isNew: true });
  }
});

// GET /api/lead/status?email=xxx
router.get('/status', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });

  // Demo emails are always unlocked
  if (DEMO_EMAILS.includes(email.toLowerCase())) {
    return res.json({ unlocked: true, unlockAt: ALREADY_UNLOCKED, targetUsername: null, gender: null });
  }

  const supabase = getSupabase();
  if (!supabase) return res.json({ unlocked: false, unlockAt: null });

  try {
    const { data } = await supabase
      .from('leads')
      .select('unlock_at')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (!data) return res.json({ unlocked: false, unlockAt: null, targetUsername: null, gender: null });
    const unlocked = new Date(data.unlock_at) <= new Date();
    return res.json({ unlocked, unlockAt: data.unlock_at, targetUsername: data.target_username, gender: data.gender });
  } catch (err) {
    return res.json({ unlocked: false, unlockAt: null, targetUsername: null, gender: null });
  }
});

module.exports = router;
