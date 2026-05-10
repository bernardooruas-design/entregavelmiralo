import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { session } from '../utils/session';
import TopBar from '../components/TopBar';
import ProfileCard from '../components/ProfileCard';
import Tabs from '../components/Tabs';
import BottomNav from '../components/BottomNav';

export default function DashboardScreen() {
  const { targetUsername } = useAppStore();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Always try to restore from localStorage first (handles F5 / direct URL)
    if (!useAppStore.getState().targetUsername) {
      if (session.has()) {
        session.restoreStore();
        setReady(true);
      } else {
        navigate('/');
        return;
      }
    } else {
      setReady(true);
    }
  }, []); // run once on mount, not on every targetUsername change

  // Don't render until session is restored to avoid flash
  if (!ready) return null;

  return (
    <div className="min-h-screen bg-bg flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col relative">
        <TopBar />

        {/* Scrollable content */}
        <div className="flex flex-col gap-4 pt-[64px] pb-[80px] overflow-y-auto">
          <ProfileCard />
          <Tabs />
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
