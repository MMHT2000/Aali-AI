import { useEffect, useState } from 'react';
import { Login, UserSession } from './components/Login';
import { ControlRoom } from './components/ControlRoom';
import { BrowserRouter } from 'react-router-dom';
import './App.css';

export function App() {
  return <BrowserRouter><AppContent /></BrowserRouter>;
}

function AppContent() {
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('aali_session');
        if (saved) {
          setSession(JSON.parse(saved));
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
    return () => window.removeEventListener('aali_session_expired', handleExpired);
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
