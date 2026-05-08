import axios from 'axios';
import { useAppStore } from '../store/appStore';

const API = 'http://localhost:3001';

export async function fetchLocation() {
  const { setLocation } = useAppStore.getState();
  try {
    const { data } = await axios.get(`${API}/api/location`);
    setLocation(data);
  } catch {
    setLocation({ city: 'Madrid', region: 'Madrid', country: 'ES' });
  }
}
