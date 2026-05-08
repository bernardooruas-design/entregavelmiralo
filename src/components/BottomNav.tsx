import { useAppStore } from '../store/appStore';

const TABS = [
  {
    label: 'Buscar',
    tabIndex: 0,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.7"/>
        <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Feed',
    tabIndex: 1,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7"/>
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7"/>
        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7"/>
        <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7"/>
      </svg>
    ),
  },
  {
    label: 'Seguidores',
    tabIndex: 2,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="8" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.7"/>
        <path d="M2 16.5c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        <path d="M15 11a3 3 0 0 1 0 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Mensajes',
    tabIndex: 4,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M17 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h10l4 3V4a1 1 0 0 0-1-1z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Alertas',
    tabIndex: 5,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2a6 6 0 0 1 6 6c0 3.5 1.5 5 1.5 5h-15S4 11.5 4 8a6 6 0 0 1 6-6z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
        <path d="M8.3 16a1.8 1.8 0 0 0 3.4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="w-full max-w-[480px] bg-bg/90 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.tabIndex;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.tabIndex)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-pink bg-pink/10' : 'text-muted'
                }`}
              >
                {tab.icon}
                <span className={`text-[10px] font-dm font-medium ${isActive ? 'text-pink' : 'text-muted'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
