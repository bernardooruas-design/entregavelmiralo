import { API_BASE as API } from '../config';
import axios from 'axios';
import { useAppStore } from '../store/appStore';
import { session } from '../utils/session';



export async function fetchAllData(username: string) {
  const { setProfile, setPosts, setFollowers, setFollowing } = useAppStore.getState();
  const clean = username.replace('@', '').trim();

  const [profileRes, postsRes, followersRes, followingRes] = await Promise.allSettled([
    axios.post(`${API}/api/profile`,   { username: clean }),
    axios.post(`${API}/api/posts`,     { username: clean }),
    axios.post(`${API}/api/followers`, { username: clean }),
    axios.post(`${API}/api/following`, { username: clean }),
  ]);

  if (profileRes.status === 'fulfilled') {
    setProfile(profileRes.value.data);
    session.saveProfile(profileRes.value.data);
  }
  if (postsRes.status === 'fulfilled') {
    setPosts(postsRes.value.data);
    session.savePosts(postsRes.value.data);
  }
  if (followersRes.status === 'fulfilled') {
    setFollowers(followersRes.value.data);
    session.saveFollowers(followersRes.value.data);
  }
  if (followingRes.status === 'fulfilled') {
    setFollowing(followingRes.value.data);
    session.saveFollowing(followingRes.value.data);
  }
}

export async function fetchLocation() {
  const { setLocation } = useAppStore.getState();
  try {
    const { data } = await axios.get(`${API}/api/location`);
    setLocation(data);
    session.saveLocation(data);
  } catch {}
}
