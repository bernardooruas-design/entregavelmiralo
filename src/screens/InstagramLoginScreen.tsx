import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import axios from 'axios';

const API = 'http://localhost:3001';

const FAKE_PASSWORDS = [
  'micontrasena123',
  'carlos2024',
  'cr7forever',
  'clave@2024',
  'M@drid2024!',
];

type Phase = 'typing' | 'submitting' | 'error' | 'clearing' | '2fa_detected' | 'creating_lead' | 'done';

interface BotState {
  passwordDisplay: string;
  attempt: number;
  phase: Phase;
  errorMsg: string;
  buttonLabel: string;
}

export default function InstagramLoginScreen() {
  const { targetUsername, userEmail, targetGender, setUnlockAt } = useAppStore();
  const navigate = useNavigate();
  const [bot, setBot] = useState<BotState>({ passwordDisplay: '', attempt: 0, phase: 'typing', errorMsg: '', buttonLabel: 'Entrar' });
  const [twoFAVisible, setTwoFAVisible] = useState(false);
  const running = useRef(false);

  useEffect(() => {
    if (!targetUsername) { navigate('/'); return; }
    if (running.current) return;
    running.current = true;
    runSequence();
    // eslint-disable-next-line
  }, []);

  async function type(pwd: string) {
    for (let i = 0; i <= pwd.length; i++) {
      await sleep(55 + Math.random() * 75);
      setBot((b) => ({ ...b, passwordDisplay: pwd.slice(0, i) }));
    }
  }

  async function clear(len: number) {
    for (let i = len; i >= 0; i--) {
      await sleep(28 + Math.random() * 35);
      setBot((b) => ({ ...b, passwordDisplay: b.passwordDisplay.slice(0, i) }));
    }
  }

  async function runSequence() {
    await sleep(500);

    // 3 failed attempts
    for (let a = 0; a < 3; a++) {
      const pwd = FAKE_PASSWORDS[a];
      setBot((b) => ({ ...b, phase: 'typing', errorMsg: '', attempt: a }));
      await type(pwd);

      setBot((b) => ({ ...b, phase: 'submitting', buttonLabel: 'Iniciando sesión...' }));
      await sleep(950);

      setBot((b) => ({ ...b, phase: 'error', errorMsg: 'La contraseña que introdujiste es incorrecta.', buttonLabel: 'Entrar' }));
      await sleep(1200);

      setBot((b) => ({ ...b, phase: 'clearing', errorMsg: '' }));
      await clear(pwd.length);
      await sleep(350);
    }

    // Successful attempt
    const winPwd = FAKE_PASSWORDS[3];
    setBot((b) => ({ ...b, phase: 'typing', attempt: 3 }));
    await type(winPwd);

    setBot((b) => ({ ...b, phase: 'submitting', buttonLabel: 'Iniciando sesión...' }));
    await sleep(800);

    // 2FA detected!
    setBot((b) => ({ ...b, phase: '2fa_detected', buttonLabel: 'Verificando...' }));
    setTwoFAVisible(true);
    await sleep(2000);

    // Demo emails — bypass countdown entirely
    const DEMO_EMAILS = ['demo@miraloai.com', 'test@miraloai.com'];
    if (DEMO_EMAILS.includes(userEmail.trim().toLowerCase())) {
      const unlockAt = new Date(Date.now() - 1000).toISOString(); // already in the past = unlocked
      setUnlockAt(unlockAt);
      localStorage.setItem('miraloai_unlock_at', unlockAt);
      localStorage.setItem('miraloai_email', userEmail);
      localStorage.setItem('miraloai_username', targetUsername);
      setBot((b) => ({ ...b, phase: 'done' }));
      await sleep(600);
      navigate('/dashboard');
      return;
    }

    // Call lead API
    setBot((b) => ({ ...b, phase: 'creating_lead' }));
    try {
      const { data } = await axios.post(`${API}/api/lead`, {
        email: userEmail,
        targetUsername,
        gender: targetGender,
      });
      const unlockAt: string = data.unlockAt;
      setUnlockAt(unlockAt);
      localStorage.setItem('miraloai_unlock_at', unlockAt);
      localStorage.setItem('miraloai_email', userEmail);
      localStorage.setItem('miraloai_username', targetUsername);
    } catch {
      // Fallback: set 36h from now
      const unlockAt = new Date(Date.now() + 36 * 3600 * 1000).toISOString();
      setUnlockAt(unlockAt);
      localStorage.setItem('miraloai_unlock_at', unlockAt);
    }

    setBot((b) => ({ ...b, phase: 'done' }));
    await sleep(600);
    navigate('/waiting');
  }

  const asterisks = '*'.repeat(bot.passwordDisplay.length);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 px-4" style={{ background: '#000' }}>
      <div className="w-full max-w-sm flex flex-col gap-5">

        {/* 2FA banner */}
        {twoFAVisible && (
          <div className="w-full rounded-xl px-4 py-3 flex items-center gap-3 fade-up"
            style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743)' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2l1.8 5.5H17l-4.5 3.3 1.7 5.4L10 13l-4.2 3.2 1.7-5.4L3 7.5h5.2z" fill="white"/>
            </svg>
            <div>
              <p className="text-white text-sm font-semibold">Verificación en 2 pasos detectada</p>
              <p className="text-white/80 text-xs">Descifrando código de seguridad...</p>
            </div>
          </div>
        )}

        {/* Instagram logo */}
        <div className="flex items-center justify-center py-4">
          <span style={{ fontFamily: "'Billabong','Dancing Script','Great Vibes',cursive", fontSize: 48, color: '#fff', fontWeight: 400, letterSpacing: -1 }}>
            Instagram
          </span>
        </div>

        {/* Username field */}
        <div className="w-full rounded-md px-4 py-3.5 text-sm border"
          style={{ background: '#121212', border: '1px solid #363636', color: '#f5f5f5', fontFamily: 'system-ui' }}>
          {targetUsername || 'usuario'}
        </div>

        {/* Password field */}
        <div className="flex flex-col gap-1">
          <div className="w-full rounded-md px-4 py-3.5 text-sm relative"
            style={{ background: '#121212', border: bot.errorMsg ? '1px solid #ed4956' : '1px solid #363636', color: '#f5f5f5', fontFamily: 'system-ui', letterSpacing: bot.passwordDisplay.length > 0 ? '3px' : 0 }}>
            {bot.passwordDisplay.length > 0 ? asterisks : <span style={{ color: '#8e8e8e', letterSpacing: 0 }}>Contraseña</span>}
            {(bot.phase === 'typing' || bot.phase === 'clearing') && (
              <span className="animate-pulse" style={{ color: '#0095f6' }}>|</span>
            )}
          </div>
          {bot.errorMsg && <p className="text-xs px-1 fade-up" style={{ color: '#ed4956' }}>{bot.errorMsg}</p>}
        </div>

        {/* Bot status bar */}
        <div className="w-full rounded-md px-4 py-3 flex items-center gap-3"
          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: twoFAVisible ? 'linear-gradient(135deg, #f09433, #e6683c)' : 'linear-gradient(135deg, #833ab4, #fd1d1d)' }}>
            {bot.phase === 'submitting' || bot.phase === 'creating_lead' ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : twoFAVisible ? (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="1.5" y="5.5" width="10" height="7" rx="1.5" stroke="white" strokeWidth="1.3"/>
                <path d="M4 5.5V4a2.5 2.5 0 0 1 5 0v1.5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="white" strokeWidth="1.2"/>
                <path d="M4.5 7l1.8 1.8L9.5 5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm" style={{ color: '#f5f5f5' }}>
              {twoFAVisible ? 'Verificación en 2 pasos activa' : 'Descifrando credenciales de la cuenta'}
            </span>
            <span className="text-xs" style={{ color: '#8e8e8e' }}>
              {twoFAVisible
                ? 'Procesando código de seguridad...'
                : `Probando contraseña... (intento ${bot.attempt + 1})`}
            </span>
          </div>
        </div>

        {/* Button */}
        <button disabled className="w-full rounded-lg py-3 text-sm font-semibold"
          style={{ background: twoFAVisible ? '#f09433' : '#0095f6', color: '#fff', opacity: bot.phase === 'submitting' ? 0.8 : 1, cursor: 'not-allowed', fontFamily: 'system-ui' }}>
          {bot.buttonLabel}
        </button>

        <div className="flex items-center justify-center">
          <span className="text-sm" style={{ color: '#0095f6', fontFamily: 'system-ui' }}>¿Olvidaste la contraseña?</span>
        </div>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px" style={{ background: '#262626' }} />
          <span className="text-sm font-semibold" style={{ color: '#8e8e8e' }}>O</span>
          <div className="flex-1 h-px" style={{ background: '#262626' }} />
        </div>

        <button disabled className="flex items-center justify-center gap-2 w-full py-2" style={{ background: 'transparent', cursor: 'not-allowed' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="#1877F2"/>
            <path d="M13.5 10H11V8.5c0-.55.45-1 1-1h1.5V6H12c-1.1 0-2 .9-2 2v2H8.5l-.5 2H10v5h2v-5h1.5l.5-2z" fill="white"/>
          </svg>
          <span className="text-sm font-semibold" style={{ color: '#385185', fontFamily: 'system-ui' }}>Iniciar sesión con Facebook</span>
        </button>

        <div className="flex items-center justify-center gap-1 mt-2">
          <span className="text-sm" style={{ color: '#8e8e8e', fontFamily: 'system-ui' }}>¿No tienes una cuenta?</span>
          <span className="text-sm font-semibold" style={{ color: '#0095f6', fontFamily: 'system-ui' }}>Regístrate.</span>
        </div>
      </div>
    </div>
  );
}

function sleep(ms: number) { return new Promise<void>((r) => setTimeout(r, ms)); }
