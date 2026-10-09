import { useState } from 'react';

export interface UserSession {
  id: string;
  username: string;
  displayName: string;
  role: string;
  accessToken: string;
}

interface LoginProps {
  onLoginSuccess: (session: UserSession) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('authority_dc');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    { label: 'Deputy Commissioner (AUTHORITY)', user: 'authority_dc', role: 'AUTHORITY' },
    { label: 'Parshuram Boat Unit (RESPONDER)', user: 'responder_feni', role: 'RESPONDER' },
    { label: 'CPP Volunteer Rahim (VOLUNTEER)', user: 'volunteer_parshuram', role: 'VOLUNTEER' },
    { label: 'Red Crescent Recovery Officer (RECOVERY)', user: 'recovery_coord', role: 'RECOVERY_COORDINATOR' },
    { label: 'Public Observer (VIEWER)', user: 'viewer_guest', role: 'VIEWER' },
    { label: 'Feni District Admin (ADMIN)', user: 'admin', role: 'ADMIN' },
  ];

  const submitLogin = async (userToLogin: string, passToLogin: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userToLogin, password: passToLogin }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      const session: UserSession = {
        id: data.user.id,
        username: data.user.username,
        displayName: data.user.displayName,
        role: data.user.role,
        accessToken: data.accessToken,
      };

      localStorage.setItem('aali_session', JSON.stringify(session));
      onLoginSuccess(session);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitLogin(username, password);
  };

  return (
    <div style={{ maxWidth: '460px', margin: '2rem auto', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1.75rem', color: '#f8fafc' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.4rem', color: '#38bdf8', margin: '0 0 0.25rem' }}>
          🛡️ আলি এআই কন্ট্রোল রুম লগইন
        </h1>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Aali AI Central Control Room & Operations Workspace
        </span>
      </div>

      <div style={{ background: '#0f172a', border: '1px solid #0284c7', borderRadius: '6px', padding: '0.65rem 0.85rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#e0f2fe' }}>
        <strong style={{ color: '#38bdf8' }}>🔑 ডেমো পাসওয়ার্ড (Universal Demo Password):</strong>
        <div style={{ marginTop: '0.2rem', fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 'bold', color: '#34d399' }}>
          Admin123!
        </div>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          নিচের যেকোনো ভূমিকায় ক্লিক করে সরাসরি প্রবেশ করুন (Click any role below to sign in instantly):
        </span>
      </div>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block', marginBottom: '0.2rem' }}>
            ইউজারনেম (Username or Role):
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="authority_dc, responder_feni, etc."
            style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #475569', borderRadius: '4px', color: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block', marginBottom: '0.2rem' }}>
            পাসওয়ার্ড (Password):
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #475569', borderRadius: '4px', color: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ background: '#0284c7', color: 'white', border: 'none', padding: '0.65rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.35rem' }}
        >
          {loading ? 'প্রবেশ করা হচ্ছে...' : 'লগইন করুন (Enter Operations)'}
        </button>

        {error && (
          <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '4px', color: '#fca5a5', fontSize: '0.8rem' }}>
            ❌ {error}
          </div>
        )}
      </form>

      {/* Demo Account Fast-Switchers */}
      <div style={{ marginTop: '1.5rem', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
          ⚡ এক ক্লিকে ভূমিকা লগইন (One-Click Role Sign In):
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {demoAccounts.map((acc) => (
            <button
              key={acc.user}
              type="button"
              disabled={loading}
              onClick={() => {
                setUsername(acc.user);
                setPassword('Admin123!');
                void submitLogin(acc.user, 'Admin123!');
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                textAlign: 'left',
                background: username === acc.user ? '#1e3a5f' : '#0f172a',
                border: username === acc.user ? '1px solid #38bdf8' : '1px solid #475569',
                color: '#cbd5e1',
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              <span>
                <strong style={{ color: '#38bdf8' }}>{acc.role}:</strong> {acc.label}
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>User: <code style={{ color: '#94a3b8' }}>{acc.user}</code></div>
              </span>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8', textDecoration: 'underline' }}>
                প্রবেশ করুন →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

