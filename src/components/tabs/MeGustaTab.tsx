import { useAppStore } from '../../store/appStore';
import type { Post, Follower } from '../../store/appStore';
import { getRandomUsers, getAvatarGradient, getInitials } from '../../data/spanishUsers';
import { getCiudadCercana } from '../../data/ciudades';

const POST_EMOJIS = ['🌄', '☀️', '🏔️', '☕', '📸', '🌃', '🎉', '🍕', '🎵', '🌊'];

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000 - ts);
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

interface LikeItem {
  username: string;
  profile_pic_url: string | null;
  postEmoji: string;
  postCaption: string;
  likeCount: number;
  timeAgo: string;
  ciudad: string;
}

function buildLikeItems(
  posts: Post[],
  followers: Follower[],
  region: string
): LikeItem[] {
  const usernames =
    followers.length > 0
      ? followers.map((f) => f.username)
      : getRandomUsers(8);

  const profilePics: Record<string, string | null> = {};
  followers.forEach((f) => { profilePics[f.username] = f.profile_pic_url; });

  const sourcePosts = posts.length > 0 ? posts : Array.from({ length: 6 }, (_, i) => ({
    id: String(i),
    thumbnail: null,
    like_count: Math.floor(Math.random() * 300) + 50,
    comment_count: Math.floor(Math.random() * 30),
    taken_at: Date.now() / 1000 - (i + 1) * 86400 * Math.random() * 3,
    caption: '',
  }));

  return sourcePosts.slice(0, 7).map((post, i) => {
    const username = usernames[i % usernames.length];
    return {
      username,
      profile_pic_url: profilePics[username] ?? null,
      postEmoji: POST_EMOJIS[i % POST_EMOJIS.length],
      postCaption: post.caption || `Foto · ${post.like_count} me gusta en total`,
      likeCount: post.like_count,
      timeAgo: timeAgo(post.taken_at),
      ciudad: getCiudadCercana(region),
    };
  });
}

function topLiker(items: LikeItem[]): { username: string; count: number } | null {
  if (items.length === 0) return null;
  const counts: Record<string, number> = {};
  items.forEach((i) => { counts[i.username] = (counts[i.username] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return { username: sorted[0][0], count: sorted[0][1] };
}

export default function MeGustaTab() {
  const { posts, followers, location } = useAppStore();
  const region = location?.region || 'DEFAULT';
  const items = buildLikeItems(posts, followers, region);
  const top = topLiker(items);

  return (
    <div className="flex flex-col gap-4 pb-2">
      <div className="mx-4 flex flex-col gap-1">
        <h3 className="font-syne font-bold text-base text-text">Me gusta recibidos</h3>
        <p className="text-muted text-xs font-dm">Actividad reciente en publicaciones</p>
      </div>

      <div className="mx-4 flex flex-col gap-2">
        {items.map((item, i) => (
          <LikeItem key={`${item.username}-${i}`} item={item} />
        ))}
      </div>

      {/* Top liker card */}
      {top && (
        <div className="mx-4 bg-card border border-pink/30 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div className="flex-1 min-w-0">
            <p className="text-text text-sm font-dm font-medium">
              <span className="text-pink">@{top.username}</span> aparece con frecuencia
            </p>
            <p className="text-muted text-xs font-dm">
              Le dio me gusta a {top.count} {top.count === 1 ? 'foto' : 'fotos'} esta semana
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function LikeItem({ item }: { item: LikeItem }) {
  const gradient = getAvatarGradient(item.username);
  const initials = getInitials(item.username);

  return (
    <div className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3 fade-up">
      {/* Post thumbnail */}
      <div className="w-12 h-12 rounded-xl bg-card2 border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
        <span className="text-2xl">{item.postEmoji}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {item.profile_pic_url ? (
            <img src={item.profile_pic_url} alt={item.username} className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
              <span className="text-white text-[8px] font-bold">{initials[0]}</span>
            </div>
          )}
          <p className="text-text text-sm font-dm font-medium truncate">
            @{item.username} <span className="text-muted font-normal">le dio me gusta</span>
          </p>
        </div>
        <p className="text-muted text-xs font-dm truncate mt-0.5">{item.postCaption}</p>
        <p className="text-muted text-[10px] font-dm mt-0.5">📍 {item.ciudad}</p>
      </div>

      {/* Right */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-base">❤️</span>
        <span className="text-muted text-[10px] font-dm">{item.timeAgo}</span>
      </div>
    </div>
  );
}
