// Backend API URL — in production (Vercel), API is on same domain so no base URL needed.
// In local dev, point to the local Express server.
export const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');
