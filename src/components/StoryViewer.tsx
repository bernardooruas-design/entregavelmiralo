import { useEffect, useState, useCallback } from 'react';

interface Story {
  username: string;
  avatarUrl: string;
}

interface Props {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

const STORY_DURATION = 5000;

const API_BASE = 'http://localhost:3001';
function postUrl(seed: string) {
  return `https://picsum.photos/seed/${seed}-story/600/900`;
}

export default function StoryViewer({ stories, initialIndex, onClose }: Props) {
  const [current, setCurrent] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  const goNext = useCallback(() => {
    if (current < stories.length - 1) {
      setCurrent((c) => c + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [current, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (current > 0) {
      setCurrent((c) => c - 1);
      setProgress(0);
    }
  }, [current]);

  // Progress bar animation
  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        goNext();
      }
    }, 50);
    return () => clearInterval(interval);
  }, [current, goNext]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const story = stories[current];
  if (!story) return null;

  const bgImage = postUrl(story.username);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.95)' }}
    >
      <div className="relative w-full max-w-sm h-full max-h-[100dvh] overflow-hidden"
        style={{ background: '#111' }}>

        {/* Background image */}
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.9 }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%)' }} />

        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.3)' }}>
              <div
                className="h-full rounded-full transition-none"
                style={{
                  width: i < current ? '100%' : i === current ? `${progress}%` : '0%',
                  background: 'white',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-7 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2" style={{ borderColor: 'white' }}>
              <img src={story.avatarUrl} alt="" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?u=${story.username}`; }} />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-semibold" style={{ fontFamily: 'system-ui' }}>
                {story.username}
              </span>
              <span className="text-white text-[10px] opacity-70" style={{ fontFamily: 'system-ui' }}>Hace 2h</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Tap zones */}
        <div className="absolute inset-0 flex z-10" style={{ top: 60 }}>
          <div className="flex-1 h-full" onClick={goPrev} />
          <div className="flex-1 h-full" onClick={goNext} />
        </div>

        {/* Bottom actions */}
        <div className="absolute bottom-6 left-4 right-4 flex items-center gap-3 z-10">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-full border" style={{ borderColor: 'rgba(255,255,255,0.4)' }}>
            <span className="text-white text-xs opacity-60" style={{ fontFamily: 'system-ui' }}>Enviar mensaje...</span>
          </div>
          <button>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 21S2 15 2 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 7-9 13-9 13z" stroke="white" strokeWidth="1.6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
