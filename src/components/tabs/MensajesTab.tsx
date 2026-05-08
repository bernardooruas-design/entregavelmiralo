import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useMemo } from 'react';
import type { TargetGender } from '../../store/appStore';

const DM_LIMIT = 2;
const API_BASE = 'http://localhost:3001';

function avatarUrl(n: number) {
  return `https://i.pravatar.cc/150?img=${n}`;
}
function proxyUrl(url: string | null): string | null {
  if (!url) return null;
  return `${API_BASE}/api/proxy-image?url=${encodeURIComponent(url)}`;
}

const AVATAR_NS = [4, 18, 27, 38, 11, 6, 31, 45];

// Male target DMs
const MALE_PUBLIC_NAMES  = ['fernando_gil', 'diego.lopez_', 'carlos_fdz', 'pablo.m', 'sergio_rv'];
const MALE_PRIVATE_NAMES = ['Fer*****', 'die*****', 'car*****', 'pab*****', 'ser*****'];
const MALE_PREVIEWS = [
  { preview: '😂 Tío mira este reel, te mueres', time: 'Ahora', unread: true,  online: true  },
  { preview: '📎 Reenvió un reel de @futbol.humor', time: '41 min', unread: true,  online: true  },
  { preview: 'Ok tío hablamos luego', time: '2 h',  unread: false, online: false },
  { preview: 'Reaccionó con 💀 a tu mensaje',        time: '5 h',  unread: false, online: false },
  { preview: 'Tú: ¿Quedamos el sábado?',             time: '1 d',  unread: false, online: false },
];

// Female target DMs
const FEMALE_PUBLIC_NAMES  = ['laura.garcia_', 'isabel.v', 'maria_rm', 'daniela_c', 'carmen.lp'];
const FEMALE_PRIVATE_NAMES = ['lau*****', 'isa*****', 'mar*****', 'dan*****', 'car*****'];
const FEMALE_PREVIEWS = [
  { preview: '😍 Chica mira este reel, qué look',    time: 'Ahora', unread: true,  online: true  },
  { preview: '📎 Te mandó un reel de @fashion.tips', time: '28 min', unread: true,  online: true  },
  { preview: 'Bueno hablamos luego guapa 🥰',         time: '2 h',  unread: false, online: false },
  { preview: 'Reaccionó con ❤️ a tu foto',            time: '6 h',  unread: false, online: false },
  { preview: 'Tú: ¿Quedamos para el brunch?',         time: '1 d',  unread: false, online: false },
];

const NOTE_TEXTS = [
  'Aquí pensando en ti 🥱',
  '¡¡JAJAJA exactamente!!',
  '|| que plan más bueno',
  'Chicos esta noche? 🔥',
];

function buildDmUsers(
  isPrivate: boolean,
  gender: TargetGender,
  following: { username: string; profile_pic_url: string | null }[],
  followers: { username: string; profile_pic_url: string | null }[],
) {
  const isFemale = gender === 'female';
  const publicNames  = isFemale ? FEMALE_PUBLIC_NAMES  : MALE_PUBLIC_NAMES;
  const privateNames = isFemale ? FEMALE_PRIVATE_NAMES : MALE_PRIVATE_NAMES;
  const previews     = isFemale ? FEMALE_PREVIEWS      : MALE_PREVIEWS;

  if (isPrivate) {
    return privateNames.map((name, i) => ({ name, profile_pic_url: null, ...previews[i] }));
  }

  // Use following (mutual contacts), fall back to followers, then defaults
  const source = following.length >= 5 ? following : followers.length >= 5 ? followers : null;
  if (source) {
    return source.slice(0, 5).map((f, i) => ({ name: f.username, profile_pic_url: f.profile_pic_url, ...previews[i] }));
  }
  return publicNames.map((name, i) => ({ name, profile_pic_url: null, ...previews[i] }));
}

export default function MensajesTab() {
  const { profile, followers, following, targetGender } = useAppStore();
  const isPrivate = profile?.is_private ?? false;
  const navigate = useNavigate();

  const allDmUsers = useMemo(
    () => buildDmUsers(isPrivate, targetGender, following, followers),
    [isPrivate, targetGender, following, followers],
  );

  const visibleDms = allDmUsers.slice(0, DM_LIMIT);
  const lockedCount = allDmUsers.length - DM_LIMIT;

  return (
    <div className="flex flex-col" style={{ background: '#000', minHeight: '100%' }}>
      {/* DM Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#262626' }}>
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 5l5 5 5-5" stroke="#f5f5f5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-base font-semibold" style={{ color: '#f5f5f5', fontFamily: 'system-ui' }}>
            {profile?.username || 'usuario'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="9" stroke="#f5f5f5" strokeWidth="1.5"/>
            <path d="M11 8v3l2 2" stroke="#f5f5f5" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M3 5h16M3 11h10M3 17h13" stroke="#f5f5f5" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="17" cy="11" r="4" fill="#f5f5f5"/>
            <path d="M15.5 11h3M17 9.5v3" stroke="#000" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2.5 border-b" style={{ borderColor: '#1a1a1a' }}>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ background: '#1a1a1a' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="#8e8e8e" strokeWidth="1.3"/>
            <path d="M9.5 9.5L12 12" stroke="#8e8e8e" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span className="text-sm" style={{ color: '#8e8e8e', fontFamily: 'system-ui' }}>Pregunta a Meta AI o busca</span>
        </div>
      </div>

      {/* Private notice */}
      {isPrivate && (
        <div className="flex items-center gap-2 px-4 py-2" style={{ background: '#111', borderBottom: '1px solid #1a1a1a' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1.5" y="5" width="9" height="6.5" rx="1.5" stroke="#8e8e8e" strokeWidth="1.1"/>
            <path d="M3.5 5V3.5a2.5 2.5 0 0 1 5 0V5" stroke="#8e8e8e" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
          <span style={{ color: '#8e8e8e', fontSize: 10.5, fontFamily: 'system-ui' }}>
            Perfil privado · nombres ocultados por seguridad de Instagram
          </span>
        </div>
      )}

      {/* Notes row */}
      <div className="flex gap-3 px-4 py-3 overflow-x-auto no-scrollbar border-b" style={{ borderColor: '#1a1a1a' }}>
        {NOTE_TEXTS.map((note, i) => {
          const noteUser = allDmUsers[i];
          const noteAvatarSrc = (i > 0 && noteUser)
            ? (proxyUrl(noteUser.profile_pic_url) ?? avatarUrl(AVATAR_NS[i] || (i + 1)))
            : avatarUrl(AVATAR_NS[i] || (i + 1));
          return (
          <div key={note} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="relative">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2" style={{ borderColor: '#363636' }}>
                <img
                  src={noteAvatarSrc}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = avatarUrl(AVATAR_NS[i] || (i + 1)); }}
                />
              </div>
              {i === 0 && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full w-5 h-5 flex items-center justify-center border-2" style={{ borderColor: '#000' }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M5 1v8M1 5h8" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
            </div>
            <span className="text-[10px] text-center" style={{ color: '#f5f5f5', fontFamily: 'system-ui', maxWidth: 56, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {i === 0 ? 'Tu nota' : (allDmUsers[i]?.name || '—')}
            </span>
            {i > 0 && (
              <span className="text-[9px] text-center" style={{ color: '#8e8e8e', fontFamily: 'system-ui', maxWidth: 56, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {note}
              </span>
            )}
          </div>
          );
        })}
      </div>

      {/* Conversations header */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="text-sm font-semibold" style={{ color: '#f5f5f5', fontFamily: 'system-ui' }}>Mensajes</span>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ background: '#1a1a1a' }}>
          <span className="text-xs font-semibold" style={{ color: '#f5f5f5', fontFamily: 'system-ui' }}>Solicitudes</span>
          <span className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: '#ed4956', color: 'white', fontFamily: 'system-ui' }}>4</span>
        </div>
      </div>

      {/* Visible DMs (limited) */}
      {visibleDms.map((dm, i) => {
        const dmAvatarSrc = proxyUrl(dm.profile_pic_url) ?? avatarUrl(AVATAR_NS[i] || (i + 1));
        return (
        <button
          key={dm.name + i}
          onClick={() => navigate(`/dm/${i}?name=${encodeURIComponent(dm.name)}&online=${dm.online ? '1' : '0'}`)}
          className="flex items-center gap-3 px-4 py-3 text-left w-full hover:opacity-80 transition-opacity"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full overflow-hidden"
              style={{ border: dm.unread ? '2px solid #0095f6' : 'none' }}>
              <img
                src={dmAvatarSrc}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = avatarUrl(AVATAR_NS[i] || (i + 1)); }}
              />
            </div>
            {dm.online && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
                style={{ background: '#00e5a0', borderColor: '#000' }} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className={`text-sm ${dm.unread ? 'font-semibold' : ''}`}
                style={{ color: '#f5f5f5', fontFamily: 'system-ui' }}>
                {dm.name}
              </span>
              <span className="text-xs" style={{ color: '#8e8e8e', fontFamily: 'system-ui' }}>{dm.time}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm truncate" style={{ color: dm.unread ? '#f5f5f5' : '#8e8e8e', fontFamily: 'system-ui', maxWidth: '80%' }}>
                {dm.preview}
              </span>
              {dm.unread && (
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#0095f6' }} />
              )}
            </div>
          </div>
        </button>
        );
      })}

      {/* Locked DMs */}
      {lockedCount > 0 && (
        <div className="flex flex-col">
          {Array.from({ length: lockedCount }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ opacity: 0.35 }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#1a1a1a', border: '2px dashed #363636' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="2.5" y="8" width="13" height="9" rx="2" stroke="#8e8e8e" strokeWidth="1.4"/>
                  <path d="M5 8V6a4 4 0 0 1 8 0v2" stroke="#8e8e8e" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="h-3 w-28 rounded" style={{ background: '#2a2a2a', marginBottom: 6 }} />
                <div className="h-2.5 w-44 rounded" style={{ background: '#1e1e1e' }} />
              </div>
            </div>
          ))}

          {/* Daily limit notice */}
          <div className="mx-4 my-3 flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: '#111', border: '1px solid #262626' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="#8e8e8e" strokeWidth="1.2"/>
              <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="#8e8e8e" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span style={{ color: '#8e8e8e', fontSize: 11, fontFamily: 'system-ui' }}>
              Límite diario · {DM_LIMIT} mensajes/día · Vuelve mañana
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
