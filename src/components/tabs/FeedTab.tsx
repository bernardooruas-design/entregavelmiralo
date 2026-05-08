import { API_BASE as API } from '../../config';
import { useAppStore } from '../../store/appStore';
import { useMemo, useState } from 'react';
import StoryViewer from '../StoryViewer';

const STORY_LIMIT = 3;
const POST_LIMIT  = 5;

function avatarUrl(n: number) {
  return `https://i.pravatar.cc/150?img=${n}`;
}
function postUrl(seed: string) {
  return `https://picsum.photos/seed/${seed}/600/600`;
}

const STORY_AVATAR_NS = [5, 12, 22, 33, 44, 8, 17, 29, 41, 7];

interface PostDef {
  avatarN: number;
  images: string[];
  caption: string;
  likes: number;
  location: string;
  comments: { avatarN: number; text: string }[];
  timeAgo: string;
  isReel?: boolean;
}

const POST_DEFS: PostDef[] = [
  {
    avatarN: 5,
    images: [postUrl('moda-chica-verano')],
    caption: '¡Verano eterno! ☀️✨ El mejor plan siempre es este #marbella #verano',
    likes: 847,
    location: 'Marbella, Málaga',
    comments: [
      { avatarN: 12, text: 'Qué guapaaa!! 😍' },
      { avatarN: 23, text: '🔥🔥🔥' },
      { avatarN: 31, text: 'Te ves increíble chica ❤️' },
    ],
    timeAgo: '2h',
  },
  {
    avatarN: 17,
    images: [postUrl('gym-entreno-madrid'), postUrl('pesas-gym-fitness')],
    caption: 'No hay excusas 💪 Día 45 del reto y sin parar #gym #constancia',
    likes: 312,
    location: 'FitBox Madrid',
    comments: [
      { avatarN: 8, text: 'Eso es 💪 crack total' },
      { avatarN: 41, text: '¡Qué máquina tío!' },
    ],
    timeAgo: '5h',
  },
  {
    avatarN: 9,
    images: [postUrl('amigos-playa-espana'), postUrl('playa-puesta-sol'), postUrl('mar-verano-azul')],
    caption: 'Finde perfecto con la mejor gente ❤️🌅 No lo cambio por nada',
    likes: 1243,
    location: 'Playa de la Barceloneta',
    comments: [
      { avatarN: 14, text: 'Dios mío los envidiooo!! 😭' },
      { avatarN: 28, text: 'La próxima me lleváis o rompo algo' },
      { avatarN: 3,  text: 'Qué bonito todo 🌊' },
    ],
    timeAgo: '1d',
  },
  {
    avatarN: 36,
    images: [postUrl('brunch-restaurante-madrid')],
    caption: 'Cuando el sábado empieza bien 🥂🍤 Recomendado 100% #brunch #foodie',
    likes: 589,
    location: 'Malasaña, Madrid',
    comments: [
      { avatarN: 19, text: 'Qué hambre me entró ahora mismo 😩' },
      { avatarN: 7,  text: '¿Dónde es esto?? Me apunto ya' },
    ],
    timeAgo: '1d',
    isReel: true,
  },
  {
    avatarN: 22,
    images: [postUrl('noche-madrid-amigos-2024'), postUrl('fiesta-terraceo')],
    caption: 'Quedadas de las buenas 🥳🎉 Gracias por tanto #finde #madrid',
    likes: 432,
    location: 'Malasaña, Madrid',
    comments: [
      { avatarN: 45, text: 'Tan guapos todos!! ❤️' },
      { avatarN: 11, text: '¿Cuándo repetimos?? jajaja' },
    ],
    timeAgo: '2d',
  },
  {
    avatarN: 13,
    images: [postUrl('roma-viaje-2024'), postUrl('coliseo-roma')],
    caption: '📍 Roma ya en el corazón para siempre 🍕🏛️ #travel #roma #eurotrip',
    likes: 2187,
    location: 'Roma, Italia',
    comments: [
      { avatarN: 6,  text: 'La mejor ciudad del mundo sin duda!!' },
      { avatarN: 29, text: 'Me muero de envidia 😭😭' },
      { avatarN: 52, text: 'Qué pinta todo madre mía 🍕' },
    ],
    timeAgo: '3d',
  },
];

const FALLBACK_NAMES = [
  'carlos_madrid', 'lucia.garcia22', 'pablo.mdz_', 'ana_ruiz',
  'sergio.f', 'marta_r', 'javi_lo', 'elena.v', 'raul_bcn', 'nuria.lp',
];

function censorName(name: string): string {
  if (name.length <= 3) return name + '*****';
  return name.slice(0, 3) + '*****';
}


function proxyUrl(url: string | null): string | null {
  if (!url) return null;
  return `${API}/api/proxy-image?url=${encodeURIComponent(url)}`;
}

export default function FeedTab() {
  const { followers, following, profile } = useAppStore();
  const isPrivate = profile?.is_private ?? false;
  const [openStoryIndex, setOpenStoryIndex] = useState<number | null>(null);

  // Use people they follow as the primary source for feed/story names
  const feedSource = following.length > 0 ? following : followers.length > 0 ? followers : [];

  const usernames: string[] = useMemo(() => {
    const base: string[] = feedSource.length > 0
      ? feedSource.map((f) => f.username)
      : [...FALLBACK_NAMES];
    while (base.length < POST_DEFS.length + STORY_LIMIT + 4) base.push(...FALLBACK_NAMES);
    return base;
  }, [feedSource]);

  // Limit: only show STORY_LIMIT stories + locked indicator for the rest
  const visibleStoryNames = useMemo(() => usernames.slice(0, STORY_LIMIT), [usernames]);
  const hiddenStoryCount = Math.max(0, usernames.length - STORY_LIMIT);

  // Limit: only show POST_LIMIT posts
  const visiblePosts = POST_DEFS.slice(0, POST_LIMIT);

  const profilePicProxied = proxyUrl(profile?.profile_pic_url ?? null);

  // Build stories array for StoryViewer
  const stories = useMemo(() => visibleStoryNames.map((name, i) => {
    const src = feedSource[i];
    const rawPic = src?.profile_pic_url ?? null;
    return {
      username: name,
      avatarUrl: proxyUrl(rawPic) ?? `https://i.pravatar.cc/150?u=${name}`,
    };
  }), [visibleStoryNames, feedSource]);

  return (
    <div className="flex flex-col" style={{ background: '#000', minHeight: '100%' }}>

      {/* Private note */}
      {isPrivate && (
        <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: '#1a1a1a', borderBottom: '1px solid #262626' }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="1.5" y="5.5" width="10" height="7" rx="1.5" stroke="#8e8e8e" strokeWidth="1.2"/>
            <path d="M4 5.5V4a2.5 2.5 0 0 1 5 0v1.5" stroke="#8e8e8e" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span style={{ color: '#8e8e8e', fontSize: 11, fontFamily: 'system-ui' }}>
            Perfil privado · Instagram no permite mostrar nombres completos por razones de seguridad
          </span>
        </div>
      )}

      {/* Stories */}
      <div className="flex gap-3 px-3 py-3 overflow-x-auto no-scrollbar border-b" style={{ borderColor: '#262626' }}>

        {/* My story — profile pic of target */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden" style={{ border: '2px solid #363636' }}>
              {profilePicProxied ? (
                <img src={profilePicProxied} alt="story" className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = avatarUrl(1); }} />
              ) : (
                <img src={avatarUrl(1)} alt="story" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2"
              style={{ background: '#0095f6', borderColor: '#000' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                <path d="M5 1v8M1 5h8" strokeWidth="1.5" stroke="white" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <span className="text-[10px]" style={{ color: '#f5f5f5', fontFamily: 'system-ui', maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
            Tu story
          </span>
        </div>

        {/* Visible stories (limited to STORY_LIMIT) */}
        {visibleStoryNames.map((name, i) => {
          const rawPic = feedSource[i]?.profile_pic_url ?? null;
          const storyAvatarSrc = proxyUrl(rawPic) ?? avatarUrl(STORY_AVATAR_NS[i] || (i + 1));
          return (
            <button
              key={name + i}
              className="flex flex-col items-center gap-1 flex-shrink-0"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              onClick={() => setOpenStoryIndex(i)}
            >
              <div className="w-16 h-16 rounded-full p-[2px]"
                style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                <div className="w-full h-full rounded-full overflow-hidden border-2" style={{ borderColor: '#000' }}>
                  <img
                    src={storyAvatarSrc}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = avatarUrl(STORY_AVATAR_NS[i] || (i + 1)); }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-center" style={{ color: '#f5f5f5', fontFamily: 'system-ui', maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {isPrivate ? censorName(name) : name}
              </span>
            </button>
          );
        })}

        {/* Locked indicator for remaining stories */}
        {hiddenStoryCount > 0 && (
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: '#1a1a1a', border: '2px dashed #363636' }}>
              <div className="flex flex-col items-center gap-0.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="#8e8e8e" strokeWidth="1.2"/>
                  <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="#8e8e8e" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <span style={{ color: '#8e8e8e', fontSize: 9, fontFamily: 'system-ui' }}>+{hiddenStoryCount}</span>
              </div>
            </div>
            <span className="text-[9px] text-center" style={{ color: '#8e8e8e', fontFamily: 'system-ui', maxWidth: 64 }}>
              Ver mañana
            </span>
          </div>
        )}
      </div>

      {/* Posts (limited to POST_LIMIT) */}
      {visiblePosts.map((def, i) => {
        const postUser = feedSource[i];
        const rawPic = postUser?.profile_pic_url ?? null;
        const avatarSrc = proxyUrl(rawPic) ?? avatarUrl(def.avatarN);
        return (
          <PostCard
            key={def.avatarN + i}
            def={def}
            avatarSrc={avatarSrc}
            username={isPrivate
              ? censorName(usernames[i] || FALLBACK_NAMES[i % FALLBACK_NAMES.length])
              : (usernames[i] || FALLBACK_NAMES[i % FALLBACK_NAMES.length])}
            commentUsernames={def.comments.map((_, ci) => {
              const raw = usernames[(i + ci + 1) % usernames.length] || FALLBACK_NAMES[(i + ci + 1) % FALLBACK_NAMES.length];
              return isPrivate ? censorName(raw) : raw;
            })}
            isPrivate={isPrivate}
          />
        );
      })}

      {/* Daily limit card */}
      <div className="flex flex-col items-center gap-3 py-8 px-5" style={{ borderTop: '1px solid #1a1a1a' }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#1a1a1a' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="3" y="7" width="16" height="12" rx="2" stroke="#8e8e8e" strokeWidth="1.5"/>
            <path d="M7 7V5a4 4 0 0 1 8 0v2" stroke="#8e8e8e" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="11" cy="13" r="1.5" fill="#8e8e8e"/>
          </svg>
        </div>
        <div className="text-center flex flex-col gap-1">
          <p style={{ color: '#f5f5f5', fontSize: 14, fontFamily: 'system-ui', fontWeight: 600 }}>
            Límite diario alcanzado
          </p>
          <p style={{ color: '#8e8e8e', fontSize: 12, fontFamily: 'system-ui' }}>
            Vuelve mañana para ver más publicaciones · {POST_LIMIT} posts/día
          </p>
        </div>
      </div>

      {/* Story viewer overlay */}
      {openStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={openStoryIndex}
          onClose={() => setOpenStoryIndex(null)}
        />
      )}
    </div>
  );
}

function PostCard({ def, avatarSrc, username, commentUsernames }: {
  def: PostDef;
  avatarSrc: string;
  username: string;
  commentUsernames: string[];
  isPrivate: boolean;
}) {
  const [imgIndex, setImgIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const multi = def.images.length > 1;

  return (
    <div className="flex flex-col border-b" style={{ borderColor: '#1a1a1a' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full p-[1.5px]"
            style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
            <div className="w-full h-full rounded-full overflow-hidden border-2" style={{ borderColor: '#000' }}>
              <img
                src={avatarSrc}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = avatarUrl(def.avatarN); }}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold" style={{ color: '#f5f5f5', fontFamily: 'system-ui' }}>{username}</span>
              {def.isReel && (
                <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: '#1a1a1a', color: '#8e8e8e', fontFamily: 'system-ui' }}>Reel</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M4.5 1C2.567 1 1 2.567 1 4.5c0 .94.365 1.797.96 2.44L4.5 8.5l2.54-1.56A3.49 3.49 0 0 0 8 4.5C8 2.567 6.433 1 4.5 1z" fill="#ed4956" opacity="0.7"/>
              </svg>
              <span className="text-[10px]" style={{ color: '#8e8e8e', fontFamily: 'system-ui' }}>{def.location}</span>
            </div>
          </div>
        </div>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="4" r="1.3" fill="#8e8e8e"/>
          <circle cx="9" cy="9" r="1.3" fill="#8e8e8e"/>
          <circle cx="9" cy="14" r="1.3" fill="#8e8e8e"/>
        </svg>
      </div>

      {/* Image / Carousel */}
      <div className="relative w-full aspect-square overflow-hidden">
        <img src={def.images[imgIndex]} alt="" className="w-full h-full object-cover" />

        {def.isReel && (
          <div className="absolute top-2.5 right-3 flex items-center gap-1.5 px-2 py-1 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.55)' }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="white">
              <rect x="1" y="1" width="9" height="9" rx="1" stroke="white" strokeWidth="1.2"/>
              <path d="M2 3.5h7M2 7h7M5 1v9" stroke="white" strokeWidth="0.8"/>
            </svg>
            <span className="text-[10px] font-semibold" style={{ color: 'white', fontFamily: 'system-ui' }}>Reel</span>
          </div>
        )}

        {multi && (
          <>
            {imgIndex > 0 && (
              <button onClick={() => setImgIndex((n) => n - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.5)' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M7.5 2L3.5 6l4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
            {imgIndex < def.images.length - 1 && (
              <button onClick={() => setImgIndex((n) => n + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.5)' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M4.5 2L8.5 6l-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
              {def.images.map((_, di) => (
                <div key={di} className="rounded-full transition-all"
                  style={{ width: di === imgIndex ? 6 : 5, height: di === imgIndex ? 6 : 5, background: di === imgIndex ? '#0095f6' : 'rgba(255,255,255,0.5)' }} />
              ))}
            </div>
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.55)' }}>
              <span className="text-xs font-semibold" style={{ color: 'white', fontFamily: 'system-ui' }}>
                {imgIndex + 1}/{def.images.length}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Actions + content */}
      <div className="flex flex-col gap-2 px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setLiked((l) => !l)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? '#ed4956' : 'none'}>
                <path d="M12 21S3.5 15 3.5 9a5.5 5.5 0 0 1 8.5-4.6A5.5 5.5 0 0 1 20.5 9c0 6-8.5 12-8.5 12z"
                  stroke={liked ? '#ed4956' : '#f5f5f5'} strokeWidth="1.6"/>
              </svg>
            </button>
            <button onClick={() => setShowComments((s) => !s)}>
              <svg width="23" height="23" viewBox="0 0 23 23" fill="none">
                <path d="M20 3H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12l4 3.5V4a1 1 0 0 0-1-1z" stroke="#f5f5f5" strokeWidth="1.6"/>
              </svg>
            </button>
            <svg width="23" height="23" viewBox="0 0 23 23" fill="none">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#f5f5f5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <svg width="23" height="23" viewBox="0 0 23 23" fill="none">
            <path d="M5 5v14l6.5-3.5L18 19V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z" stroke="#f5f5f5" strokeWidth="1.6"/>
          </svg>
        </div>

        <span className="text-sm font-semibold" style={{ color: '#f5f5f5', fontFamily: 'system-ui' }}>
          {(def.likes + (liked ? 1 : 0)).toLocaleString()} Me gusta
        </span>

        <div>
          <span className="text-sm font-semibold" style={{ color: '#f5f5f5', fontFamily: 'system-ui' }}>{username} </span>
          <span className="text-sm" style={{ color: '#f5f5f5', fontFamily: 'system-ui' }}>{def.caption}</span>
        </div>

        {!showComments && def.comments.length > 0 && (
          <button onClick={() => setShowComments(true)}>
            <span className="text-sm" style={{ color: '#8e8e8e', fontFamily: 'system-ui', textAlign: 'left', display: 'block' }}>
              Ver los {def.comments.length} comentarios
            </span>
          </button>
        )}

        {showComments && (
          <div className="flex flex-col gap-1.5">
            {def.comments.map((c, ci) => (
              <div key={ci} className="flex items-center gap-2">
                <img src={avatarUrl(c.avatarN)} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                <div>
                  <span className="text-xs font-semibold" style={{ color: '#f5f5f5', fontFamily: 'system-ui' }}>
                    {commentUsernames[ci] || 'usuario'}{' '}
                  </span>
                  <span className="text-xs" style={{ color: '#f5f5f5', fontFamily: 'system-ui' }}>{c.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <span className="text-xs" style={{ color: '#8e8e8e', fontFamily: 'system-ui' }}>Hace {def.timeAgo}</span>
      </div>
    </div>
  );
}
