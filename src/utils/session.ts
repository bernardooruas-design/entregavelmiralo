/**
 * Gestão de sessão e cache local — MiraloAI
 * Uma consulta por email. Dados persistidos em localStorage.
 */

import { useAppStore } from '../store/appStore';
import type { ProfileData, Post, Follower, LocationData, TargetGender } from '../store/appStore';

const P = 'miraloai_';

// ─── Leitura/escrita bruta ─────────────────────────────────────────────────

function lsGet(key: string): string | null {
  try { return localStorage.getItem(P + key); } catch { return null; }
}
function lsSet(key: string, val: string) {
  try { localStorage.setItem(P + key, val); } catch {}
}
function lsJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(P + key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function lsJsonSet(key: string, val: unknown) {
  try { localStorage.setItem(P + key, JSON.stringify(val)); } catch {}
}

// ─── Sessão ────────────────────────────────────────────────────────────────

export interface SessionMeta {
  email: string;
  username: string;
  gender: TargetGender;
  unlockAt: string;
}

export const session = {
  // Leituras
  get email()    { return lsGet('email')     ?? ''; },
  get username() { return lsGet('username')  ?? ''; },
  get gender()   { return (lsGet('gender')   ?? null) as TargetGender; },
  get unlockAt() { return lsGet('unlock_at') ?? null; },

  has(): boolean {
    return !!(this.email && this.username && this.unlockAt);
  },

  isUnlocked(): boolean {
    const u = this.unlockAt;
    return u ? new Date(u) <= new Date() : false;
  },

  // Guardar sessão após criar lead
  save(meta: SessionMeta) {
    lsSet('email',     meta.email);
    lsSet('username',  meta.username);
    lsSet('gender',    meta.gender ?? '');
    lsSet('unlock_at', meta.unlockAt);
  },

  // Limpar tudo (só se necessário — normalmente não limpa para preservar cache)
  clear() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(P))
      .forEach((k) => localStorage.removeItem(k));
  },

  // ─── Cache de dados da consulta ─────────────────────────────────────────

  saveProfile(d: ProfileData)  { lsJsonSet('data_profile',   d); },
  savePosts(d: Post[])         { lsJsonSet('data_posts',      d); },
  saveFollowers(d: Follower[]) { lsJsonSet('data_followers',  d); },
  saveFollowing(d: Follower[]) { lsJsonSet('data_following',  d); },
  saveLocation(d: LocationData){ lsJsonSet('data_location',   d); },

  loadProfile():   ProfileData  | null { return lsJson('data_profile');   },
  loadPosts():     Post[]       | null { return lsJson('data_posts');      },
  loadFollowers(): Follower[]   | null { return lsJson('data_followers');  },
  loadFollowing(): Follower[]   | null { return lsJson('data_following');  },
  loadLocation():  LocationData | null { return lsJson('data_location');   },

  hasCachedData(): boolean {
    return !!lsGet('data_profile');
  },

  // ─── Private-profile second lock (extra 36h after first unlock) ────────────

  get privateUnlockAt() { return lsGet('private_unlock_at') ?? null; },

  savePrivateUnlock(at: string) {
    lsSet('private_unlock_at', at);
  },

  isPrivateUnlocked(): boolean {
    const u = this.privateUnlockAt;
    return u ? new Date(u) <= new Date() : false;
  },

  // ─── Restaurar store a partir do cache ──────────────────────────────────

  restoreStore() {
    const store = useAppStore.getState();

    const email    = this.email;
    const username = this.username;
    const gender   = this.gender;
    const unlockAt = this.unlockAt;

    if (email)    store.setUserEmail(email);
    if (username) store.setTargetUsername(username);
    if (gender)   store.setTargetGender(gender);
    if (unlockAt) store.setUnlockAt(unlockAt);

    const profile   = this.loadProfile();
    const posts     = this.loadPosts();
    const followers = this.loadFollowers();
    const following = this.loadFollowing();
    const location  = this.loadLocation();

    if (profile)   store.setProfile(profile);
    if (posts)     store.setPosts(posts);
    if (followers) store.setFollowers(followers);
    if (following) store.setFollowing(following);
    if (location)  store.setLocation(location);
  },
};
