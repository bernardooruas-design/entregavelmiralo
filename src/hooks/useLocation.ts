import { API_BASE as API } from '../config';
import axios from 'axios';
import { useAppStore } from '../store/appStore';



export async function fetchLocation() {
  const { setLocation } = useAppStore.getState();
  try {
    const { data } = await axios.get(`${API}/api/location`);
    setLocation(data);
  } catch {
    setLocation({ city: 'Madrid', region: 'Madrid', country: 'ES' });
  }
}
