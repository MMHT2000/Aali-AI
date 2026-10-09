import { useEffect, useState } from 'react';
import { Login, UserSession } from './components/Login';
import { ControlRoom } from './components/ControlRoom';
import './App.css';

export function App() {
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
        <aside className="banner-disclaimer" aria-label="System status disclosure">
          <strong>সতর্কতা / Prototype Notice:</strong> Aali AI is a decision-support prototype, not an operational emergency service. Satellite links, carrier gateways, and cell broadcasts are simulated for demonstrations. All official warnings and boat dispatches require authorized human approval.
        </aside>
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return <ControlRoom session={session} onLogout={handleLogout} />;
}

export default App;
