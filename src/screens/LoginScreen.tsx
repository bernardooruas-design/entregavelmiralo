import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppStore } from '../store/appStore';
import type { TargetGender } from '../store/appStore';
import { session } from '../utils/session';

const API = 'http://localhost:3001';
const INTRO_TEXT = 'Estás a punto de acceder al Instagram de quien deseas...';
type Phase = 'typing' | 'cta' | 'email' | 'checking' | 'gender' | 'username';

export default function LoginScreen() {
  const [phase, setPhase] = useState<Phase>('typing');
  const [charIndex, setCharIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [eyeOpen, setEyeOpen] = useState(true);
  const navigate = useNavigate();
  const { setTargetUsername, setUserEmail, setTargetGender } = useAppStore();

  // ── Ao abrir: verificar se já existe sessão salva ─────────────────────────
  useEffect(() => {
    if (!session.has()) return;

    // Restaurar store com dados em cache
    session.restoreStore();

    if (session.isUnlocked()) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/waiting', { replace: true });
    }
  // eslint-disable-next-line
  }, []);

  // ── Animação de digitação ─────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'typing') return;
    if (charIndex >= INTRO_TEXT.length) {
      const t = setTimeout(() => setPhase('cta'), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCharIndex((i) => i + 1), 40);
    return () => clearTimeout(t);
  }, [charIndex, phase]);

  // ── Piscar do olho ────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    async function loop() {
      while (mounted) {
        await sleep(3000);
        if (!mounted) break;
        setEyeOpen(false); await sleep(160);
        if (!mounted) break;
        setEyeOpen(true);  await sleep(220);
        if (!mounted) break;
        setEyeOpen(false); await sleep(160);
        if (!mounted) break;
        setEyeOpen(true);
      }
    }
    loop();
    return () => { mounted = false; };
  }, []);

  // ── Submissão do email — verifica no backend se já existe sessão ──────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = email.trim().toLowerCase();
    if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setEmailError('Introduce un email válido');
      return;
    }
    setEmailError('');
    setPhase('checking');

    try {
      const { data } = await axios.get(`${API}/api/lead/status?email=${encodeURIComponent(val)}`);

      if (data.unlockAt && data.targetUsername) {
        // Email já tem sessão — restaurar e redirecionar
        session.save({
          email: val,
          username: data.targetUsername,
          gender: data.gender as TargetGender,
          unlockAt: data.unlockAt,
        });
        session.restoreStore();
        setUserEmail(val);

        if (data.unlocked) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/waiting', { replace: true });
        }
        return;
      }
    } catch {
      // Se API falhar, continuar normalmente
    }

    // Email novo — continuar fluxo
    setUserEmail(val);
    setPhase('gender');
  };

  const handleGenderSelect = (g: TargetGender) => {
    setTargetGender(g);
    setPhase('username');
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim().replace('@', '');
    if (!clean) { setUsernameError('Introduce un usuario'); return; }
    setTargetUsername(clean);
    navigate('/loading');
  };

  const typed = INTRO_TEXT.slice(0, charIndex);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: '#06060A' }}>
      <div className="w-full max-w-sm flex flex-col items-center gap-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)' }}>
            <EyeIcon open={eyeOpen} />
          </div>
          <h1 style={{ fontFamily: "'Billabong','Dancing Script','Great Vibes',cursive", fontSize: 44, color: '#fff', fontWeight: 400, letterSpacing: -0.5, lineHeight: 1, margin: 0 }}>
            MiraloAI
          </h1>
        </div>

        {/* Typing */}
        {(phase === 'typing' || phase === 'cta') && (
          <div className="w-full flex flex-col items-center gap-7">
            <p style={{ fontFamily: 'system-ui', color: '#f5f5f5', fontSize: 17, textAlign: 'center', lineHeight: 1.6, minHeight: 60 }}>
              {typed}
              {phase === 'typing' && (
                <span style={{ display: 'inline-block', width: 2, height: '1em', background: '#FF2D78', marginLeft: 2, verticalAlign: 'text-bottom', animation: 'blink 0.75s steps(1) infinite' }} />
              )}
            </p>
            {phase === 'cta' && (
              <button onClick={() => setPhase('email')} className="fade-up"
                style={{ background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)', color: '#fff', fontFamily: 'system-ui', fontWeight: 700, fontSize: 16, borderRadius: 12, padding: '15px 0', border: 'none', cursor: 'pointer', width: '100%', boxShadow: '0 4px 24px rgba(253,29,29,0.35)' }}>
                Entrar ahora
              </button>
            )}
          </div>
        )}

        {/* Email */}
        {(phase === 'email' || phase === 'checking') && (
          <div className="w-full flex flex-col gap-5 fade-up">
            <div className="text-center">
              <p style={{ color: '#f5f5f5', fontSize: 17, fontFamily: 'system-ui', fontWeight: 600, marginBottom: 6 }}>Introduce tu email</p>
              <p style={{ color: '#8e8e8e', fontSize: 13, fontFamily: 'system-ui' }}>Te enviaremos el informe cuando esté listo</p>
            </div>
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
              <input
                autoFocus
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                disabled={phase === 'checking'}
                style={{ background: '#121212', border: emailError ? '1.5px solid #ed4956' : '1.5px solid #363636', borderRadius: 10, outline: 'none', color: '#f5f5f5', fontSize: 15, padding: '14px 16px', width: '100%', boxSizing: 'border-box', fontFamily: 'system-ui', opacity: phase === 'checking' ? 0.6 : 1 }}
              />
              {emailError && <p style={{ color: '#ed4956', fontSize: 12, textAlign: 'center', fontFamily: 'system-ui' }}>{emailError}</p>}
              <button type="submit" disabled={phase === 'checking'}
                style={{ background: '#0095f6', color: '#fff', fontWeight: 700, fontSize: 15, borderRadius: 10, padding: '14px', border: 'none', cursor: phase === 'checking' ? 'not-allowed' : 'pointer', width: '100%', fontFamily: 'system-ui', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {phase === 'checking' ? (
                  <>
                    <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Verificando...
                  </>
                ) : 'Continuar'}
              </button>
            </form>
            <p style={{ color: '#555', fontSize: 11, textAlign: 'center', fontFamily: 'system-ui' }}>
              🔒 Tu email nunca será compartido con terceros
            </p>
          </div>
        )}

        {/* Gender */}
        {phase === 'gender' && (
          <div className="w-full flex flex-col gap-6 fade-up">
            <div className="text-center">
              <p style={{ color: '#f5f5f5', fontSize: 17, fontFamily: 'system-ui', fontWeight: 600, marginBottom: 6 }}>¿Quién quieres analizar?</p>
              <p style={{ color: '#8e8e8e', fontSize: 13, fontFamily: 'system-ui' }}>Esto nos ayuda a personalizar el informe</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={() => handleGenderSelect('male')}
                style={{ background: '#121212', border: '1.5px solid #363636', borderRadius: 16, padding: '24px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 36 }}>👨</span>
                <span style={{ color: '#f5f5f5', fontSize: 15, fontFamily: 'system-ui', fontWeight: 600 }}>Hombre</span>
              </button>
              <button onClick={() => handleGenderSelect('female')}
                style={{ background: '#121212', border: '1.5px solid #363636', borderRadius: 16, padding: '24px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 36 }}>👩</span>
                <span style={{ color: '#f5f5f5', fontSize: 15, fontFamily: 'system-ui', fontWeight: 600 }}>Mujer</span>
              </button>
            </div>
          </div>
        )}

        {/* Username */}
        {phase === 'username' && (
          <div className="w-full flex flex-col gap-5 fade-up">
            <p style={{ color: '#8e8e8e', fontSize: 14, textAlign: 'center', fontFamily: 'system-ui' }}>
              Introduce el usuario de Instagram a analizar
            </p>
            <form onSubmit={handleUsernameSubmit} className="flex flex-col gap-4">
              <div style={{ display: 'flex', alignItems: 'center', background: '#121212', border: usernameError ? '1.5px solid #ed4956' : '1.5px solid #363636', borderRadius: 10, overflow: 'hidden' }}>
                <span style={{ paddingLeft: 14, color: '#8e8e8e', fontSize: 15, userSelect: 'none', flexShrink: 0, fontFamily: 'system-ui' }}>@</span>
                <input
                  autoFocus
                  type="text"
                  placeholder="carlos_madrid"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setUsernameError(''); }}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f5f5f5', fontSize: 15, padding: '14px 14px 14px 6px', width: '100%', fontFamily: 'system-ui' }}
                />
              </div>
              {usernameError && <p style={{ color: '#ed4956', fontSize: 12, textAlign: 'center', fontFamily: 'system-ui' }}>{usernameError}</p>}
              <button type="submit" style={{ background: '#0095f6', color: '#fff', fontWeight: 700, fontSize: 15, borderRadius: 10, padding: '14px', border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'system-ui' }}>
                Analizar perfil
              </button>
            </form>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00e5a0', boxShadow: '0 0 6px #00e5a0' }} />
              <span style={{ color: '#8e8e8e', fontSize: 12, fontFamily: 'system-ui' }}>100% anónimo · sin rastros</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin   { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      {open ? (
        <>
          <path d="M4 22C4 22 11 10 22 10C33 10 40 22 40 22C40 22 33 34 22 34C11 34 4 22 4 22Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
          <circle cx="22" cy="22" r="6" fill="white"/>
          <circle cx="22" cy="22" r="3.2" fill="#FF2D78"/>
          <circle cx="23.8" cy="20.2" r="1.2" fill="white" opacity="0.9"/>
        </>
      ) : (
        <>
          <path d="M4 22C4 22 11 10 22 10C33 10 40 22 40 22C40 22 33 34 22 34C11 34 4 22 4 22Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
          <line x1="4" y1="22" x2="40" y2="22" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        </>
      )}
    </svg>
  );
}

function sleep(ms: number) { return new Promise<void>((r) => setTimeout(r, ms)); }
