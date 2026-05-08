import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

export default function TopBar() {
  const navigate = useNavigate();
  const { reset } = useAppStore();

  const handleHome = () => {
    reset();
    navigate('/');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center">
      <div className="w-full max-w-[480px] flex items-center justify-between px-4 py-3.5 bg-bg/90 backdrop-blur-md border-b border-border">
        <button onClick={handleHome} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-pink-purple flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <ellipse cx="7" cy="7" rx="5" ry="3.7" stroke="white" strokeWidth="1.4"/>
              <circle cx="7" cy="7" r="2" fill="white"/>
            </svg>
          </div>
          <span className="font-syne font-extrabold text-base gradient-text">MiraloAI</span>
        </button>

        <div className="flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1.5">
          <span className="text-yellow text-xs">⚡</span>
          <span className="text-text text-xs font-dm font-medium">3 créditos</span>
        </div>
      </div>
    </div>
  );
}
