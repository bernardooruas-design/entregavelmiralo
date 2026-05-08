import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { session } from '../utils/session';

function getRemaining(unlockAt: string | null): number {
  if (!unlockAt) return 0;
  return Math.max(0, new Date(unlockAt).getTime() - Date.now());
}

function formatTime(ms: number): { h: string; m: string; s: string } {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return {
    h: String(h).padStart(2, '0'),
    m: String(m).padStart(2, '0'),
    s: String(s).padStart(2, '0'),
  };
}

const STEPS_FIRST = [
  { label: 'Contraseña principal descifrada', done: true },
  { label: 'Código 2FA en proceso...', done: false, active: true },
  { label: 'Extracción de datos pendiente', done: false },
  { label: 'Acceso completo al perfil', done: false },
];

const STEPS_PRIVATE = [
  { label: 'Contraseña descifrada ✓', done: true },
  { label: 'Código 2FA superado ✓', done: true },
  { label: 'Perfil privado — solicitando datos...', done: false, active: true },
  { label: 'Acceso completo al perfil', done: false },
];

export default function WaitingScreen() {
  const [searchParams] = useSearchParams();
  const isPrivateMode = searchParams.get('private') === '1';

  const { unlockAt: storeUnlock, targetUsername, userEmail } = useAppStore();
  const navigate = useNavigate();

  // Restore store from localStorage on refresh
  useEffect(() => {
    if (!storeUnlock && session.has()) {
      session.restoreStore();
    }
  // eslint-disable-next-line
  }, []);

  const unlockAt = isPrivateMode
    ? session.privateUnlockAt
    : (storeUnlock || session.unlockAt);

  const [remaining, setRemaining] = useState(() => getRemaining(unlockAt));
  const [unlocked, setUnlocked] = useState(remaining === 0 && !!unlockAt);

  useEffect(() => {
    if (!unlockAt) { navigate('/'); return; }
    const interval = setInterval(() => {
      const rem = getRemaining(unlockAt);
      setRemaining(rem);
      if (rem === 0) {
        setUnlocked(true);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [unlockAt, navigate]);

  const time = formatTime(remaining);
  const totalMs = 36 * 3600 * 1000;
  const progress = unlockAt ? Math.min(1, (totalMs - remaining) / totalMs) : 0;

  const handleEnter = () => {
    if (!isPrivateMode) {
      // Check if profile is private → add extra 36h
      const cachedProfile = session.loadProfile();
      if (cachedProfile?.is_private && !session.isPrivateUnlocked()) {
        const privateAt = new Date(Date.now() + 36 * 3600 * 1000).toISOString();
        session.savePrivateUnlock(privateAt);
        navigate('/waiting?private=1');
        return;
      }
    }
    navigate('/dashboard');
  };

  const STEPS = isPrivateMode ? STEPS_PRIVATE : STEPS_FIRST;
  const displayUser = targetUsername || session.username || 'usuario';
  const displayEmail = userEmail || session.email || 'tu email';

  const subtitle = isPrivateMode
    ? `Accediendo a datos privados de @${displayUser}`
    : `Descifrando código de seguridad de @${displayUser}`;

  const unlockedMsg = isPrivateMode
    ? '¡Datos privados descargados!'
    : '¡Acceso desbloqueado!';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 bg-bg">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">

        {/* Icon */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-card border-2 flex items-center justify-center"
            style={{ borderColor: unlocked ? '#00e5a0' : (isPrivateMode ? '#833ab4' : '#FF8C00') }}>
            {unlocked ? (
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <rect x="8" y="20" width="28" height="18" rx="4" stroke="#00e5a0" strokeWidth="2.5"/>
                <path d="M14 20v-6a8 8 0 0 1 16 0" stroke="#00e5a0" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M15 30l4 4 10-8" stroke="#00e5a0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : isPrivateMode ? (
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <rect x="8" y="20" width="28" height="18" rx="4" stroke="#833ab4" strokeWidth="2.5"/>
                <path d="M14 20v-6a8 8 0 0 1 16 0v6" stroke="#833ab4" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="22" cy="29" r="3" fill="#833ab4"/>
                <line x1="22" y1="32" x2="22" y2="35" stroke="#833ab4" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <rect x="8" y="20" width="28" height="18" rx="4" stroke="#FF8C00" strokeWidth="2.5"/>
                <path d="M14 20v-6a8 8 0 0 1 16 0v6" stroke="#FF8C00" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="22" cy="29" r="3" fill="#FF8C00"/>
                <line x1="22" y1="32" x2="22" y2="35" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          {!unlocked && (
            <div className="absolute inset-0 rounded-full border-2 opacity-40 spin-slow"
              style={{ borderStyle: 'dashed', borderColor: isPrivateMode ? '#833ab4' : '#FF8C00' }} />
          )}
        </div>

        {/* Title */}
        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="font-syne font-bold text-xl text-text">
            {unlocked ? unlockedMsg : (isPrivateMode ? 'Perfil privado detectado' : 'Verificación en 2 pasos detectada')}
          </h2>
          <p className="text-muted text-sm font-dm">
            {unlocked
              ? 'Ya puedes acceder al perfil completo de Instagram'
              : subtitle}
          </p>
        </div>

        {/* Countdown or ready */}
        {!unlocked ? (
          <div className="w-full bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
            <p className="text-muted text-xs font-dm text-center">Tiempo estimado restante</p>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2">
              {[time.h, time.m, time.s].map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="bg-card2 border border-border rounded-xl px-4 py-3 min-w-[56px] flex items-center justify-center">
                      <span className="font-syne font-bold text-2xl text-text">{val}</span>
                    </div>
                    <span className="text-muted text-[10px] font-dm">{['horas', 'min', 'seg'][i]}</span>
                  </div>
                  {i < 2 && <span className="font-syne font-bold text-xl text-muted mb-4">:</span>}
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-border rounded-full h-1.5">
              <div className="h-1.5 rounded-full transition-all duration-1000"
                style={{
                  width: `${progress * 100}%`,
                  background: isPrivateMode
                    ? 'linear-gradient(90deg, #833ab4, #fd1d1d)'
                    : 'linear-gradient(90deg, #FF8C00, #FF2D78)',
                }} />
            </div>
            <p className="text-muted text-[10px] font-dm text-center">
              {Math.round(progress * 100)}% del proceso completado
            </p>
          </div>
        ) : (
          <button onClick={handleEnter}
            className="w-full gradient-pink-purple text-white font-dm font-semibold py-4 rounded-xl text-base hover:opacity-90 transition-opacity active:scale-[0.98]">
            Ver perfil de Instagram →
          </button>
        )}

        {/* Steps */}
        <div className="w-full flex flex-col gap-3">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-green' : (step as { active?: boolean }).active ? 'bg-yellow pulse-glow' : 'bg-border'}`}>
                {step.done && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#06060A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {(step as { active?: boolean }).active && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
              </div>
              <span className={`font-dm text-sm ${step.done || (step as { active?: boolean }).active ? 'text-text' : 'text-muted opacity-40'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Email reminder */}
        <p className="text-muted text-xs font-dm text-center opacity-60 px-4">
          Te notificaremos a <span className="text-text">{displayEmail}</span> cuando el acceso esté listo
        </p>
      </div>
    </div>
  );
}
