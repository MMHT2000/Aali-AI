import { useEffect, useState } from 'react';
import { ApiHealthResponse, ApiReadinessResponse, checkApiHealth, checkApiReadiness } from './lib/api-client';
import { GatewaySimulator } from './components/GatewaySimulator';
import { ThreeTapSos } from './components/ThreeTapSos';
import { RecoveryLedger } from './components/RecoveryLedger';
import { AiLanguageAssistant } from './components/AiLanguageAssistant';
import { FloodReplayWarning } from './components/FloodReplayWarning';
import { ResponderDashboard } from './components/ResponderDashboard';
import './App.css';

export function App() {
  const [health, setHealth] = useState<ApiHealthResponse | null>(null);
  const [readiness, setReadiness] = useState<ApiReadinessResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const [h, r] = await Promise.all([checkApiHealth(), checkApiReadiness()]);
      setHealth(h);
      setReadiness(r);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reach API server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="app-container">
      {/* Required product honesty banner */}
      <aside className="banner-disclaimer" aria-label="System status disclosure">
        <strong>সতর্কতা / Prototype Notice:</strong> Aali AI is a decision-support prototype, not an operational emergency service. Satellite links, carrier gateways, and cell broadcasts are simulated for demonstrations. All official warnings and boat dispatches require authorized human approval.
      </aside>

      <header className="header">
        <div>
          <h1 className="brand-title">
            <span>আলি এআই</span> / Aali AI
          </h1>
          <p className="brand-subtitle">Feni Flash-Flood Warning, Rescue Coordination & Recovery Decision Support</p>
          <p className="tagline">"When the towers die, the SOS doesn't."</p>
        </div>
      </header>

      {/* Recovery Coordination & Aid Ledger (Phase 8) */}
      <section style={{ margin: '1rem 0' }}>
        <RecoveryLedger />
      </section>

      {/* AI-Assisted Language Features & Fallback (Phase 7) */}
      <section style={{ margin: '1rem 0' }}>
        <AiLanguageAssistant />
      </section>

      {/* Flood Alert Rules, Historical Replay & Warning Approval (Phase 6) */}
      <section style={{ margin: '1rem 0' }}>
        <FloodReplayWarning />
      </section>

      {/* Responder Decision-Support Dashboard (Phase 5) */}
      <section style={{ margin: '1rem 0' }}>
        <ResponderDashboard />
      </section>

      {/* Primary SOS Interactive Section */}
      <section style={{ margin: '1rem 0' }}>
        <ThreeTapSos />
        <GatewaySimulator />
      </section>

      <main className="grid-cards">
        {/* Backend API Health Card */}
        <section className="card" aria-labelledby="card-health-heading">
          <h2 id="card-health-heading" className="card-title">
            API Health & Modes
            {loading ? (
              <span className="badge badge-loading">Checking...</span>
            ) : error ? (
              <span className="badge badge-error">Offline</span>
            ) : (
              <span className="badge badge-ok">{health?.status}</span>
            )}
          </h2>

          {loading && <p>Checking backend status...</p>}

          {error && (
            <div>
              <p style={{ color: 'var(--color-danger)', marginBottom: '0.5rem' }}>{error}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Ensure NestJS backend is running at <code>http://localhost:3001</code>.
              </p>
              <button className="btn-retry" onClick={fetchStatus}>
                Retry Connection
              </button>
            </div>
          )}

          {health && (
            <div className="info-list">
              <div className="info-row">
                <span className="info-label">API Version:</span>
                <span className="info-val">{health.version}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Environment:</span>
                <span className="info-val">{health.environment}</span>
              </div>
              <div className="info-row">
                <span className="info-label">AI Provider:</span>
                <span className="info-val">{health.modes.aiProvider} (deterministic local)</span>
              </div>
              <div className="info-row">
                <span className="info-label">SMS Gateway:</span>
                <span className="info-val">{health.modes.smsGateway} (demo mode)</span>
              </div>
              <div className="info-row">
                <span className="info-label">Satellite Mode:</span>
                <span className="info-val">{health.modes.satellite}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Official Data Mode:</span>
                <span className="info-val">{health.modes.officialData}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Database Check:</span>
                <span className="info-val">{readiness?.checks.database.status ?? 'unknown'}</span>
              </div>
            </div>
          )}
        </section>

        {/* Phase Roadmap Card */}
        <section className="card" aria-labelledby="card-roadmap-heading">
          <h2 id="card-roadmap-heading" className="card-title">
            Implementation Phases
          </h2>
          <ul className="roadmap-list">
            <li className="roadmap-item">
              <span className="roadmap-status status-active">Phase 0 & 1</span>
              <div>
                <strong>Scaffold & Baseline</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Monorepo layout, NestJS API, React client, health endpoint, typecheck & build setup.
                </p>
              </div>
            </li>
            <li className="roadmap-item">
              <span className="roadmap-status status-pending">Phase 2</span>
              <div>
                <strong>Domain Model & Auth</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  TypeORM entities, MySQL migrations, JWT auth with RBAC, synthetic Feni seed fixtures.
                </p>
              </div>
            </li>
            <li className="roadmap-item">
              <span className="roadmap-status status-pending">Phase 3</span>
              <div>
                <strong>Disaster Packet & 3-Tap SOS</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  IndexedDB offline queue, compact ASCII packet encode/decode, GPS + village fallback.
                </p>
              </div>
            </li>
            <li className="roadmap-item">
              <span className="roadmap-status status-active">Phase 5 & 6</span>
              <div>
                <strong>Dashboard, Replay & Warning Approvals</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Deterministic 3-signal rules, historical replay, sensor blackout escalation, and role-guarded warnings.
                </p>
              </div>
            </li>
            <li className="roadmap-item">
              <span className="roadmap-status status-pending">Phase 7-9</span>
              <div>
                <strong>AI Language Layer, Recovery & Security</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Bangla/Banglish NLP extraction with deterministic fallback, recovery ledger, and audit log.
                </p>
              </div>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
