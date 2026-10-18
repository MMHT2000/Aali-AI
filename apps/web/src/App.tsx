import { useEffect, useState } from 'react';
import { Login, UserSession } from './components/Login';
import { ControlRoom } from './components/ControlRoom';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { HouseholdPreparedness } from './components/HouseholdPreparedness';
import { ResidentSos } from './components/ResidentSos';
import './App.css';

export function App() {
  return <BrowserRouter><AppContent /></BrowserRouter>;
}

function AppContent() {
  const location = useLocation();
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('aali_session');
        if (saved) {
          const parsed: unknown = JSON.parse(saved);
          if (typeof parsed === 'object' && parsed !== null &&
            'id' in parsed && typeof parsed.id === 'string' &&
            'username' in parsed && typeof parsed.username === 'string' &&
            'displayName' in parsed && typeof parsed.displayName === 'string' &&
            'role' in parsed && typeof parsed.role === 'string' &&
            'accessToken' in parsed && typeof parsed.accessToken === 'string' && parsed.accessToken.trim()) {
            setSession(parsed as UserSession);
          } else window.localStorage.removeItem('aali_session');
        }
      }
    } catch {
      // ignore storage access errors in test
    }

    const handleExpired = () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem('aali_session');
        }
      } catch {
        // ignore
      }
      setSession(null);
    };

    window.addEventListener('aali_session_expired', handleExpired);
    const handleStorage = (event: StorageEvent) => {
      if ((event.key === 'aali_session' || event.key === null) && !event.newValue) handleExpired();
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('aali_session_expired', handleExpired);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
  };

  const handleLogout = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('aali_session');
      }
    } catch {
      // ignore
    }
    setSession(null);
  };

  if (location.pathname === '/preparedness') return <HouseholdPreparedness />;
  if (location.pathname === '/sos' || (session && !session.accessToken?.trim())) return <ResidentSos />;

  if (!session) {
    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return <ControlRoom session={session} onLogout={handleLogout} />;
}

export default App;
