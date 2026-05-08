import { create } from 'zustand';

export interface ProfileData {
  username: string;
  full_name: string;
  biography: string;
  profile_pic_url: string | null;
  follower_count: number;
  following_count: number;
  media_count: number;
  is_private: boolean;
}

export interface Post {
  id: string;
  thumbnail: string | null;
  like_count: number;
  comment_count: number;
  taken_at: number;
  caption: string;
}

export interface Follower {
  username: string;
  profile_pic_url: string | null;
}

export interface LocationData {
  city: string;
  region: string;
  country: string;
}

export type TargetGender = 'male' | 'female' | null;

interface AppState {
  targetUsername: string;
  userEmail: string;
  targetGender: TargetGender;
  unlockAt: string | null;
  profile: ProfileData | null;
  posts: Post[];
  followers: Follower[];
  following: Follower[];
  location: LocationData | null;
  activeTab: number;
  setTargetUsername: (u: string) => void;
  setUserEmail: (e: string) => void;
  setTargetGender: (g: TargetGender) => void;
  setUnlockAt: (t: string) => void;
  setProfile: (p: ProfileData) => void;
  setPosts: (p: Post[]) => void;
  setFollowers: (f: Follower[]) => void;
  setFollowing: (f: Follower[]) => void;
  setLocation: (l: LocationData) => void;
  setActiveTab: (t: number) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  targetUsername: '',
  userEmail: '',
  targetGender: null,
  unlockAt: null,
  profile: null,
  posts: [],
  followers: [],
  following: [],
  location: null,
  activeTab: 0,
  setTargetUsername: (u) => set({ targetUsername: u }),
  setUserEmail: (e) => set({ userEmail: e }),
  setTargetGender: (g) => set({ targetGender: g }),
  setUnlockAt: (t) => set({ unlockAt: t }),
  setProfile: (p) => set({ profile: p }),
  setPosts: (p) => set({ posts: p }),
  setFollowers: (f) => set({ followers: f }),
  setFollowing: (f) => set({ following: f }),
  setLocation: (l) => set({ location: l }),
  setActiveTab: (t) => set({ activeTab: t }),
  reset: () => set({
    targetUsername: '', userEmail: '', targetGender: null, unlockAt: null,
    profile: null, posts: [], followers: [], following: [], location: null, activeTab: 0,
  }),
}));
