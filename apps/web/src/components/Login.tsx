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
    { label: 'Fire Service Lead (RESPONDER)', user: 'responder_fire_lead', role: 'RESPONDER' },
    { label: 'BDRCS Field Volunteer (VOLUNTEER)', user: 'volunteer_bdrcs', role: 'VOLUNTEER' },
    { label: 'Recovery Coordinator (RECOVERY)', user: 'recovery_coord_feni', role: 'RECOVERY_COORDINATOR' },
    { label: 'Public Observer (VIEWER)', user: 'viewer_public', role: 'VIEWER' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
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

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1.75rem', color: '#f8fafc' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', color: '#38bdf8', margin: '0 0 0.25rem' }}>
          🛡️ আলি এআই কন্ট্রোল রুম লগইন
        </h1>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Aali AI Central Control Room & Operations Workspace
        </span>
      </div>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block', marginBottom: '0.2rem' }}>
            ইউজারনেম (Username):
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
          style={{ background: '#0284c7', color: 'white', border: 'none', padding: '0.6rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.5rem' }}
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
          ⚡ দ্রুত ডেমো ভূমিকা নির্বাচন করুন (Select Demo Role):
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {demoAccounts.map((acc) => (
            <button
              key={acc.user}
              type="button"
              onClick={() => {
                setUsername(acc.user);
                setPassword('Admin123!');
              }}
              style={{
                textAlign: 'left',
                background: username === acc.user ? '#334155' : '#0f172a',
                border: '1px solid #475569',
                color: '#cbd5e1',
                padding: '0.4rem 0.6rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              <strong>{acc.role}:</strong> {acc.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

