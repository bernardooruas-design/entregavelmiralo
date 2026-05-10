import { API_BASE as API } from '../../config';
import { useAppStore } from '../../store/appStore';
import { useMemo, useState } from 'react';
import StoryViewer from '../StoryViewer';

const STORY_LIMIT = 3;
const POST_LIMIT  = 5;

const COMMENT_TEXTS = [
  '😍 Increíble!!', '🔥🔥', 'Te ves genial ❤️', '¡Qué envidia! 😭',
  '💯 crack', 'Me muero jajaja', '¡¡Qué guapo/a!!', 'La próxima me llevas',
  '🙌🙌🙌', 'Dios mío sí!!', 'Brutal tío', '❤️❤️❤️',
];

function relativeTime(takenAt: number): string {
  const diff = Math.floor((Date.now() / 1000) - takenAt);
  if (diff < 3600)  return `${Math.max(1, Math.floor(diff / 60))}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return `${Math.floor(diff / 604800)}sem`;
}

function censorName(name: string): string {
  if (name.length <= 3) return name + '*****';
  return name.slice(0, 3) + '*****';
}

function proxyUrl(url: string | null): string | null {
  if (!url) return null;
  return `${API}/api/proxy-image?url=${encodeURIComponent(url)}`;
}

export default function FeedTab() {
  const { followers, following, posts, profile } = useAppStore();
  const isPrivate = profile?.is_private ?? false;
  const [openStoryIndex, setOpenStoryIndex] = useState<number | null>(null);

  // Real people: prefer following (mutual contacts look more natural in feed)
  const feedSource = following.length > 0 ? following : followers;

  // Cycle through real people to always have enough for posts + stories + comments
  const cyclicPeople = useMemo(() => {
    if (feedSource.length === 0) return [];
    const result = [...feedSource];
    while (result.length < POST_LIMIT + STORY_LIMIT + 12) result.push(...feedSource);
    return result;
  }, [feedSource]);

  // Stories: first STORY_LIMIT people from following/followers
  const visibleStoryPeople = cyclicPeople.slice(0, STORY_LIMIT);
  const hiddenStoryCount = Math.max(0, feedSource.length - STORY_LIMIT);

  // Feed posts: use real posts from API (thumbnail + real likes/caption)
  // Each post is attributed to a real following/follower person
  const visiblePosts = useMemo(() => posts.slice(0, POST_LIMIT), [posts]);

  const profilePicProxied = proxyUrl(profile?.profile_pic_url ?? null);

  // Build stories array for StoryViewer — real people only
  const stories = useMemo(() => visibleStoryPeople.map((person) => ({
    username: isPrivate ? censorName(person.username) : person.username,
    avatarUrl: proxyUrl(person.profile_pic_url) ?? `https://i.pravatar.cc/150?u=${person.username}`,
  })), [visibleStoryPeople, isPrivate]);

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

        {/* Visible stories — real following/follower people */}
        {visibleStoryPeople.map((person, i) => {
          const storyAvatarSrc = proxyUrl(person.profile_pic_url) ?? `https://i.pravatar.cc/150?u=${person.username}`;
          const displayName = isPrivate ? censorName(person.username) : person.username;
          return (
            <button
              key={person.username + i}
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
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?u=${person.username}`; }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-center" style={{ color: '#f5f5f5', fontFamily: 'system-ui', maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName}
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

      {/* Posts — real thumbnails from API, attributed to real following/followers */}
      {visiblePosts.map((post, i) => {
        const person = cyclicPeople[i];
        if (!person) return null;
        const avatarSrc = proxyUrl(person.profile_pic_url) ?? `https://i.pravatar.cc/150?u=${person.username}`;
        const displayName = isPrivate ? censorName(person.username) : person.username;
        // 2-3 commenters from real people
        const commentPeople = [
          cyclicPeople[(i + 1) % Math.max(1, cyclicPeople.length)],
          cyclicPeople[(i + 2) % Math.max(1, cyclicPeople.length)],
          cyclicPeople[(i + 3) % Math.max(1, cyclicPeople.length)],
        ].filter(Boolean);
        return (
          <PostCard
            key={post.id}
            postImageUrl={proxyUrl(post.thumbnail)}
            caption={post.caption}
            likes={post.like_count}
            commentCount={post.comment_count}
            timeAgo={relativeTime(post.taken_at)}
            avatarSrc={avatarSrc}
            username={displayName}
            commenters={commentPeople.slice(0, 2).map((p, ci) => ({
              avatarSrc: proxyUrl(p?.profile_pic_url) ?? `https://i.pravatar.cc/150?u=${p?.username}`,
              username: isPrivate ? censorName(p?.username ?? '') : (p?.username ?? ''),
              text: COMMENT_TEXTS[(i * 3 + ci) % COMMENT_TEXTS.length],
            }))}
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

function PostCard({ postImageUrl, caption, likes, commentCount, timeAgo, avatarSrc, username, commenters }: {
  postImageUrl: string | null;
  caption: string;
  likes: number;
  commentCount: number;
  timeAgo: string;
  avatarSrc: string;
  username: string;
  commenters: { avatarSrc: string; username: string; text: string }[];
}) {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex flex-col border-b" style={{ borderColor: '#1a1a1a' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full p-[1.5px]"
            style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
            <div className="w-full h-full rounded-full overflow-hidden border-2" style={{ borderColor: '#000' }}>
              <img src={avatarSrc} alt="" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?u=${username}`; }} />
            </div>
          </div>
          <span className="text-sm font-semibold" style={{ color: '#f5f5f5', fontFamily: 'system-ui' }}>{username}</span>
        </div>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="4" r="1.3" fill="#8e8e8e"/>
          <circle cx="9" cy="9" r="1.3" fill="#8e8e8e"/>
          <circle cx="9" cy="14" r="1.3" fill="#8e8e8e"/>
        </svg>
      </div>

      {/* Real post image */}
      <div className="relative w-full aspect-square overflow-hidden bg-[#111]">
        {postImageUrl && !imgError ? (
          <img src={postImageUrl} alt="" className="w-full h-full object-cover"
            onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="4" y="4" width="32" height="32" rx="4" stroke="#363636" strokeWidth="1.5"/>
              <circle cx="14" cy="15" r="3" stroke="#363636" strokeWidth="1.5"/>
              <path d="M4 28l8-7 6 6 5-5 9 8" stroke="#363636" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
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
          {(likes + (liked ? 1 : 0)).toLocaleString()} Me gusta
        </span>

        {caption && (
          <div>
            <span className="text-sm font-semibold" style={{ color: '#f5f5f5', fontFamily: 'system-ui' }}>{username} </span>
            <span className="text-sm" style={{ color: '#f5f5f5', fontFamily: 'system-ui' }}>
              {caption.length > 120 ? caption.slice(0, 120) + '…' : caption}
            </span>
          </div>
        )}

        {!showComments && commentCount > 0 && (
          <button onClick={() => setShowComments(true)} className="text-left">
            <span className="text-sm" style={{ color: '#8e8e8e', fontFamily: 'system-ui' }}>
              Ver los {commentCount.toLocaleString()} comentarios
            </span>
          </button>
        )}

        {showComments && commenters.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {commenters.map((c, ci) => (
              <div key={ci} className="flex items-center gap-2">
                <img src={c.avatarSrc} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?u=${c.username}`; }} />
                <div>
                  <span className="text-xs font-semibold" style={{ color: '#f5f5f5', fontFamily: 'system-ui' }}>{c.username} </span>
                  <span className="text-xs" style={{ color: '#f5f5f5', fontFamily: 'system-ui' }}>{c.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <span className="text-xs" style={{ color: '#8e8e8e', fontFamily: 'system-ui' }}>Hace {timeAgo}</span>
      </div>
    </div>
  );
}
