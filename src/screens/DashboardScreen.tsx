import { useEffect } from 'react';
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

  useEffect(() => {
    if (!targetUsername) {
      if (session.has()) {
        session.restoreStore();
      } else {
        navigate('/');
      }
    }
  }, [targetUsername, navigate]);

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
