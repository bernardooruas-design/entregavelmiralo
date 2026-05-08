import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';
import LoadingScreen from './screens/LoadingScreen';
import InstagramLoginScreen from './screens/InstagramLoginScreen';
import WaitingScreen from './screens/WaitingScreen';
import DashboardScreen from './screens/DashboardScreen';
import DMChatScreen from './screens/DMChatScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/loading" element={<LoadingScreen />} />
        <Route path="/ig-login" element={<InstagramLoginScreen />} />
        <Route path="/waiting" element={<WaitingScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/dm/:id" element={<DMChatScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
