import { API_BASE as API } from '../../config';
import { useAppStore } from '../../store/appStore';
import { getRandomUsers, getAvatarGradient, getInitials } from '../../data/spanishUsers';


function proxyUrl(url: string | null): string | null {
  if (!url) return null;
  return `${API}/api/proxy-image?url=${encodeURIComponent(url)}`;
}

type Badge = 'nuevo' | 'salio' | 'mutuo';

interface FollowerItem {
  username: string;
  profile_pic_url: string | null;
  badge: Badge;
  timeAgo: string;
  action: string;
}

const BADGES: Badge[]  = ['nuevo', 'nuevo', 'mutuo', 'salio', 'nuevo', 'mutuo', 'salio', 'nuevo', 'mutuo', 'salio'];
const TIME_AGOS        = ['hace 2h', 'hace 5h', 'hace 1d', 'hace 2d', 'hace 3h', 'hace 6h', 'hace 4h', 'hace 8h', 'hace 12h', 'hace 1d'];
const ACTIONS          = [
  'Empezó a seguir',
  'Empezó a seguir',
  'Se siguen mutuamente',
  'Dejó de seguir',
  'Empezó a seguir',
  'Se siguen mutuamente',
  'Dejó de seguir',
  'Empezó a seguir',
  'Se siguen mutuamente',
  'Dejó de seguir',
];

function buildList(
  followers: { username: string; profile_pic_url: string | null }[],
  following: { username: string; profile_pic_url: string | null }[],
  isPrivate: boolean,
): FollowerItem[] {
  // Merge: first few from following (they know each other), rest from followers
  const combined: { username: string; profile_pic_url: string | null }[] = [];
  const seenUsernames = new Set<string>();

  const addUser = (u: { username: string; profile_pic_url: string | null }) => {
    if (!seenUsernames.has(u.username)) {
      seenUsernames.add(u.username);
      combined.push(u);
    }
  };

  following.slice(0, 5).forEach(addUser);
  followers.slice(0, 8).forEach(addUser);

  if (!isPrivate && combined.length > 0) {
    return combined.slice(0, 10).map((u, i) => ({
      username: u.username,
      profile_pic_url: u.profile_pic_url,
      badge: BADGES[i % BADGES.length],
      timeAgo: TIME_AGOS[i % TIME_AGOS.length],
      action: ACTIONS[i % ACTIONS.length],
    }));
  }

  // Private or no data → mock list
  const mockUsers = getRandomUsers(10);
  return mockUsers.map((u, i) => ({
    username: u,
    profile_pic_url: null,
    badge: BADGES[i % BADGES.length],
    timeAgo: TIME_AGOS[i % TIME_AGOS.length],
    action: ACTIONS[i % ACTIONS.length],
  }));
}

const BADGE_STYLES: Record<Badge, string> = {
  nuevo: 'bg-green/10 text-green border-green/20',
  salio: 'bg-pink/10 text-pink border-pink/20',
  mutuo: 'bg-purple/10 text-purple border-purple/20',
};

const BADGE_LABELS: Record<Badge, string> = {
  nuevo: 'nuevo',
  salio: 'salió',
  mutuo: 'mutuo',
};

export default function SeguidoresTab() {
  const { followers, following, profile } = useAppStore();
  const isPrivate = profile?.is_private ?? false;
  const list = buildList(followers, following, isPrivate);

  return (
    <div className="flex flex-col gap-4 pb-2">
      <div className="mx-4 flex flex-col gap-1">
        <h3 className="font-syne font-bold text-base text-text">Actividad de seguidores</h3>
        <p className="text-muted text-xs font-dm">Últimos 7 días</p>
      </div>

      <div className="mx-4 flex flex-col gap-2">
        {list.map((item) => (
          <FollowerItem key={item.username + item.timeAgo} item={item} />
        ))}
      </div>

      {/* Historial premium */}
      <div className="mx-4 bg-card border border-border rounded-xl p-3.5 flex items-center gap-3">
        <span className="text-xl">📊</span>
        <div className="flex-1 min-w-0">
          <p className="text-text text-sm font-dm font-medium">Historial completo disponible en Premium</p>
          <p className="text-muted text-xs font-dm">Últimos 30 días · todos los cambios</p>
        </div>
        <span className="text-[10px] bg-yellow/10 text-yellow px-1.5 py-0.5 rounded-full font-dm border border-yellow/20 flex-shrink-0">🔒 Pro</span>
      </div>
    </div>
  );
}

function FollowerItem({ item }: { item: FollowerItem }) {
  const gradient = getAvatarGradient(item.username);
  const initials = getInitials(item.username);
  const proxied = proxyUrl(item.profile_pic_url);

  return (
    <div className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3 fade-up">
      <div className="flex-shrink-0">
        {proxied ? (
          <img
            src={proxied}
            alt={item.username}
            className="w-11 h-11 rounded-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="font-syne font-bold text-sm text-white">{initials}</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-text text-sm font-dm font-medium truncate">@{item.username}</p>
        <p className="text-muted text-xs font-dm truncate">
          {item.action} · {item.timeAgo}
        </p>
      </div>

      <span className={`flex-shrink-0 text-[10px] font-dm font-bold px-2 py-1 rounded-full border ${BADGE_STYLES[item.badge]}`}>
        {BADGE_LABELS[item.badge]}
      </span>
    </div>
  );
}
