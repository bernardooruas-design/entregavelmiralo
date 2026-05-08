import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { fetchAllData } from '../hooks/useInstagram';
import { fetchLocation } from '../hooks/useLocation';

const STAGES = [
  'Localizando perfil público',
  'Recopilando datos de seguidores',
  'Mapeando interacciones recientes',
  'Generando informe de actividad',
  'Finalizando análisis completo',
];

export default function LoadingScreen() {
  const [stage, setStage] = useState(0);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const { targetUsername } = useAppStore();

  useEffect(() => {
    if (!targetUsername) {
      navigate('/');
      return;
    }

    // Start API calls in parallel
    Promise.all([
      fetchAllData(targetUsername),
      fetchLocation(),
    ]).catch(console.error);

    // Animate stages
    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < STAGES.length) {
        setStage(current);
      } else {
        clearInterval(interval);
        setDone(true);
      }
    }, 900);

    return () => clearInterval(interval);
  }, [targetUsername, navigate]);

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => navigate('/ig-login'), 400);
      return () => clearTimeout(t);
    }
  }, [done, navigate]);

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-5">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm">

        {/* Eye icon pulsing */}
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-card border-2 border-pink flex items-center justify-center pulse-glow">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <ellipse cx="24" cy="24" rx="18" ry="13" stroke="#FF2D78" strokeWidth="3"/>
              <circle cx="24" cy="24" r="7" fill="#FF2D78"/>
              <circle cx="26.5" cy="21.5" r="2.5" fill="white" opacity="0.8"/>
            </svg>
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-pink opacity-30 spin-slow" style={{ borderStyle: 'dashed' }} />
        </div>

        {/* Username */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-muted text-sm font-dm">Analizando perfil</p>
          <p className="text-pink font-syne font-bold text-2xl">@{targetUsername}</p>
        </div>

        {/* Stages */}
        <div className="w-full flex flex-col gap-3">
          {STAGES.map((s, i) => {
            const isActive = i === stage;
            const isDone = i < stage || done;
            return (
              <div
                key={s}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isDone ? 'opacity-100' : isActive ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isDone
                    ? 'bg-green'
                    : isActive
                    ? 'bg-pink pulse-glow'
                    : 'bg-border'
                }`}>
                  {isDone && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#06060A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {isActive && !isDone && (
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </div>
                <span className={`font-dm text-sm ${isDone ? 'text-text' : isActive ? 'text-text' : 'text-muted'}`}>
                  {s}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-border rounded-full h-1">
          <div
            className="h-1 rounded-full gradient-pink-purple transition-all duration-700"
            style={{ width: `${((stage + 1) / STAGES.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
