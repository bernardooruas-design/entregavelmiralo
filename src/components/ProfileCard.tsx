import { API_BASE as API } from '../config';
import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { getInitials, getAvatarGradient } from '../data/spanishUsers';



function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function proxyUrl(url: string | null): string | null {
  if (!url) return null;
  return `${API}/api/proxy-image?url=${encodeURIComponent(url)}`;
}

export default function ProfileCard() {
  const { profile, targetUsername } = useAppStore();
  const [imgFailed, setImgFailed] = useState(false);

  if (!profile) {
    return (
      <div className="mx-4 bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="skeleton w-16 h-16 rounded-full" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-3 w-24 rounded" />
          </div>
        </div>
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
      </div>
    );
  }

  const initials = getInitials(profile.username || targetUsername);
  const gradientClass = getAvatarGradient(profile.username || targetUsername);
  const picSrc = proxyUrl(profile.profile_pic_url);
  const showPhoto = picSrc && !imgFailed;

  return (
    <div className="mx-4 bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 fade-up">
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          {showPhoto ? (
            <img
              src={picSrc}
              alt={profile.username}
              className="w-16 h-16 rounded-full object-cover border-2 border-pink"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradientClass} border-2 border-pink flex items-center justify-center`}>
              <span className="font-syne font-bold text-lg text-white">{initials}</span>
            </div>
          )}
          {/* Online indicator */}
          <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green border-2 border-card pulse-dot" />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-syne font-bold text-base text-text truncate">
            {profile.full_name || profile.username}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-muted text-xs font-dm">@{profile.username}</span>
            <span className="text-muted text-xs">·</span>
            <span className={`text-xs font-dm ${profile.is_private ? 'text-yellow' : 'text-green'}`}>
              {profile.is_private ? 'perfil privado' : 'perfil público'}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green pulse-dot" />
            <span className="text-green text-xs font-dm">en línea</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile.biography && (
        <p className="text-text text-sm font-dm leading-relaxed">{profile.biography}</p>
      )}

      {/* Stats */}
      <div className="flex items-center justify-around border-t border-border pt-4">
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-syne font-bold text-base text-text">{formatCount(profile.follower_count)}</span>
          <span className="text-muted text-xs font-dm">Seguidores</span>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-syne font-bold text-base text-text">{formatCount(profile.following_count)}</span>
          <span className="text-muted text-xs font-dm">Siguiendo</span>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-syne font-bold text-base text-text">{formatCount(profile.media_count)}</span>
          <span className="text-muted text-xs font-dm">Posts</span>
        </div>
      </div>
    </div>
  );
}
