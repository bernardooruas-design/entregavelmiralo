import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// SPA routing fix for static hosts (Vercel 404.html redirect pattern).
// When Vercel can't find /dashboard it serves 404.html which saves the path
// and redirects to /. Here we restore the original path before React renders.
const redirectPath = sessionStorage.getItem('miraloai_redirect');
if (redirectPath && redirectPath !== '/') {
  sessionStorage.removeItem('miraloai_redirect');
  window.history.replaceState(null, '', redirectPath);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
