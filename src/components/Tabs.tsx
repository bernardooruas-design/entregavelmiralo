import { useAppStore } from '../store/appStore';
import ResumenTab from './tabs/ResumenTab';
import SeguidoresTab from './tabs/SeguidoresTab';
import MeGustaTab from './tabs/MeGustaTab';
import MensajesTab from './tabs/MensajesTab';
import AlertasTab from './tabs/AlertasTab';
import FeedTab from './tabs/FeedTab';

const TAB_LABELS = ['Resumen', 'Feed', 'Seguidores', 'Me gusta', 'Mensajes', 'Alertas'];

export default function Tabs() {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <div className="flex flex-col gap-0">
      {/* Tab strip */}
      <div className="flex items-center gap-1 px-4 overflow-x-auto no-scrollbar">
        {TAB_LABELS.map((label, i) => (
          <button
            key={label}
            onClick={() => setActiveTab(i)}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-dm font-medium transition-all duration-200 ${
              activeTab === i
                ? 'bg-pink/15 text-pink border border-pink/30'
                : 'text-muted hover:text-text hover:bg-card2'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="pt-3">
        {activeTab === 0 && <ResumenTab />}
        {activeTab === 1 && <FeedTab />}
        {activeTab === 2 && <SeguidoresTab />}
        {activeTab === 3 && <MeGustaTab />}
        {activeTab === 4 && <MensajesTab />}
        {activeTab === 5 && <AlertasTab />}
      </div>
    </div>
  );
}
