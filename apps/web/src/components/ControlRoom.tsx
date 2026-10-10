import { FormEvent, useEffect, useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import { Activity, AlertTriangle, ClipboardList, LogOut, Map, Radio, Settings, ShieldCheck, Truck, Users, Waves } from 'lucide-react';
import { UserSession } from './Login';
import { ResponderDashboard } from './ResponderDashboard';
import { FloodReplayWarning } from './FloodReplayWarning';
import { RecoveryLedger } from './RecoveryLedger';
import { AiLanguageAssistant } from './AiLanguageAssistant';
import { ThreeTapSos } from './ThreeTapSos';
import { GatewaySimulator } from './GatewaySimulator';
import { ResidentSimulator } from './ResidentSimulator';
import { SettingsPanel } from './SettingsPanel';
import { AuditViewer } from './AuditViewer';
import { OperationsOverview } from './OperationsOverview';
import { getOperationsSnapshot, OperationMapPoint, OperationsMode } from '../lib/operations-client';
import { apiFetch } from '../lib/authenticated-fetch';
import { canAccessControlRoomRoute, getRoleHomePath } from '../lib/control-room-access';
import { ViewerSituationSummary } from './ViewerSituationSummary';
import { checkApiHealth, ApiHealthResponse } from '../lib/api-client';
import './ControlRoom.css';

interface ControlRoomProps { session: UserSession; onLogout: () => void }
const routes = [
  { path: '/control-room/map', label: 'Situation room', group: 'OPERATIONS', icon: Map },
  { path: '/control-room/viewer', label: 'Situation summary', group: 'OPERATIONS', icon: Activity },
  { path: '/control-room/responder', label: 'SOS & incidents', group: 'RESPONSE', icon: Radio },
  { path: '/control-room/field', label: 'Field reports', group: 'RESPONSE', icon: ClipboardList },
  { path: '/control-room/alerts', label: 'Warnings & approvals', group: 'PREPAREDNESS', icon: AlertTriangle },
  { path: '/control-room/replay', label: 'Replay & exercise', group: 'PREPAREDNESS', icon: Activity },
  { path: '/control-room/simulator', label: 'Resident simulator', group: 'DEMO TOOLS', icon: Users },
  { path: '/control-room/recovery', label: 'Recovery needs', group: 'RECOVERY', icon: Truck },
  { path: '/control-room/language', label: 'Language support', group: 'OVERSIGHT', icon: Waves },
  { path: '/control-room/audit', label: 'Audit log', group: 'OVERSIGHT', icon: ShieldCheck },
  { path: '/control-room/settings', label: 'Configuration', group: 'OVERSIGHT', icon: Settings },
];

export function ControlRoom({ session, onLogout }: ControlRoomProps) {
  const [health, setHealth] = useState<ApiHealthResponse | null>(null);
  const [healthChecked, setHealthChecked] = useState(false);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const modeValue = searchParams.get('mode');
  const mode: OperationsMode = modeValue === 'LIVE' || modeValue === 'HISTORICAL' ? modeValue : 'EXERCISE';
  const eventId = mode === 'HISTORICAL' ? searchParams.get('eventId') ?? undefined : undefined;
  const setOperatingContext = (nextMode: OperationsMode, nextEventId?: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextMode === 'EXERCISE') nextParams.delete('mode'); else nextParams.set('mode', nextMode);
    if (nextMode === 'HISTORICAL' && nextEventId) nextParams.set('eventId', nextEventId);
    else nextParams.delete('eventId');
    setSearchParams(nextParams);
  };
  const visible = routes.filter((item) => canAccessControlRoomRoute(item.path, session.role));
  const visibleGroups = [...new Set(visible.map((item) => item.group))];
  const activeRoute = visible.find((item) => item.path === location.pathname) ?? visible[0];
  useEffect(() => {
    let active = true;
    const refreshHealth = () => {
      void checkApiHealth()
        .then((nextHealth) => {
          if (active) setHealth(nextHealth);
        })
        .catch(() => {
          if (active) setHealth(null);
        })
        .finally(() => {
          if (active) setHealthChecked(true);
        });
    };
    refreshHealth();
    const timer = window.setInterval(refreshHealth, 15_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);
  const allowed = (path: string) => canAccessControlRoomRoute(path, session.role);
  const fallback = getRoleHomePath(session.role);
  const apiLabel = health?.status === 'ok' ? 'Connected' : healthChecked ? 'Unavailable' : 'Checking';

  return <div className="control-shell">
    <a className="skip-link" href="#main-content">Skip to workspace</a>
    <header className="control-topbar">
      <Link className="control-brand" to={{ pathname: fallback, search: location.search }} aria-label="Aali AI role workspace home">
        <span className="brand-mark" aria-hidden="true">A</span>
        <span className="brand-copy"><strong>AALI <span>OPERATIONS</span></strong><small>Feni district coordination</small></span>
      </Link>
      <div className="command-context" aria-label="Current workspace and data mode">
        <span className="context-eyebrow">CURRENT WORKSPACE</span>
        <strong>{activeRoute?.label ?? 'Operations'}</strong>
        <label className="mode-select-label">Data mode
          <select aria-label="Shared data mode" value={mode} onChange={(event) => {
            const selected = event.target.value;
            if (selected === 'LIVE' || selected === 'EXERCISE' || selected === 'HISTORICAL') {
              setOperatingContext(selected, selected === 'HISTORICAL' ? '11111111-1111-1111-1111-111111111101' : undefined);
            }
          }}>
            <option value="LIVE">Live sources</option>
            <option value="EXERCISE">Exercise</option>
            <option value="HISTORICAL">Historical</option>
          </select>
        </label>
        {mode === 'HISTORICAL' && <label className="mode-select-label">Event
          <select aria-label="Historical event" value={eventId ?? '11111111-1111-1111-1111-111111111101'} onChange={(event) => setOperatingContext('HISTORICAL', event.target.value)}>
            <option value="11111111-1111-1111-1111-111111111101">August 2024 reconstruction</option>
            <option value="11111111-1111-1111-1111-111111111102">July 2025 reconstruction</option>
          </select>
        </label>}
      </div>
      <div className="session-strip">
        <div className={`api-status${health?.status === 'ok' ? ' is-online' : ''}`} role="status" aria-label={`API ${apiLabel.toLowerCase()}`}>
          <span className="api-indicator" aria-hidden="true" />
          <span><small>API</small><strong>{apiLabel}</strong></span>
        </div>
        <div className="session-identity"><span className="identity-mark" aria-hidden="true">{session.role.slice(0, 1)}</span><span><strong>{session.displayName}</strong><small>{session.role.replaceAll('_', ' ')}</small></span></div>
        <button className="logout-button" onClick={onLogout} aria-label="Sign out"><LogOut size={16} /><span>Sign out</span></button>
      </div>
    </header>
    <div className="control-body">
      <aside className="control-sidebar">
        <nav className="control-navigation" aria-label="Operations workspaces">
          {visibleGroups.map((group) => <section className="navigation-group" key={group} aria-label={group}>
            <h2 className="sidebar-heading">{group}</h2>
            {visible.filter((item) => item.group === group).map(({ path, label, icon: Icon }) => <NavLink key={path} to={{ pathname: path, search: location.search }} end className={({ isActive }) => `control-nav-link${isActive || location.pathname === path ? ' active' : ''}`}>
              <Icon size={17} aria-hidden="true" /><span>{label}</span>
            </NavLink>)}
          </section>)}
        </nav>
        <div className="sidebar-foot"><span>LOCAL TIME · DHAKA</span><strong>{new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' })} BST</strong><small>Times are shown in Asia/Dhaka</small></div>
      </aside>
      <main className="control-content" id="main-content" tabIndex={-1} aria-label={`${activeRoute?.label ?? 'Operations'} workspace`}>
        <Routes>
        <Route path="/control-room/map" element={allowed('/control-room/map') ? <OperationsOverview mode={mode} eventId={eventId} /> : <Navigate to={{ pathname: fallback, search: location.search }} replace />} />
        <Route path="/control-room/viewer" element={allowed('/control-room/viewer') ? <ViewerSituationSummary mode={mode} eventId={eventId} /> : <Navigate to={{ pathname: fallback, search: location.search }} replace />} />
        <Route path="/control-room/responder" element={allowed('/control-room/responder') ? <ResponderDashboard mode={mode} eventId={eventId} /> : <Navigate to={{ pathname: fallback, search: location.search }} replace />} />
        <Route path="/control-room/alerts" element={allowed('/control-room/alerts') ? <FloodReplayWarning mode={mode} eventId={eventId} session={session} /> : <Navigate to={{ pathname: fallback, search: location.search }} replace />} />
        <Route path="/control-room/replay" element={allowed('/control-room/replay') ? <FloodReplayWarning mode={mode} eventId={eventId} session={session} /> : <Navigate to={{ pathname: fallback, search: location.search }} replace />} />
        <Route path="/control-room/recovery" element={allowed('/control-room/recovery') ? <RecoveryLedger mode={mode} eventId={eventId} /> : <Navigate to={{ pathname: fallback, search: location.search }} replace />} />
        <Route path="/control-room/field" element={session.role === 'VOLUNTEER' || session.role === 'ADMIN' ? <VolunteerRoute mode={mode} eventId={eventId} /> : <Navigate to={{ pathname: fallback, search: location.search }} replace />} />
        <Route path="/control-room/simulator" element={allowed('/control-room/simulator') ? <><ResidentSimulator /><ThreeTapSos /><GatewaySimulator /></> : <Navigate to={{ pathname: fallback, search: location.search }} replace />} />
        <Route path="/control-room/language" element={allowed('/control-room/language') ? <AiLanguageAssistant /> : <Navigate to={{ pathname: fallback, search: location.search }} replace />} />
        <Route path="/control-room/audit" element={allowed('/control-room/audit') ? <AuditViewer /> : <Navigate to={{ pathname: fallback, search: location.search }} replace />} />
        <Route path="/control-room/settings" element={allowed('/control-room/settings') ? <SettingsPanel /> : <Navigate to={{ pathname: fallback, search: location.search }} replace />} />
        <Route path="*" element={<Navigate to={{ pathname: fallback, search: location.search }} replace />} />
      </Routes></main>
    </div>
  </div>;
}

function VolunteerRoute({ mode, eventId }: { mode: OperationsMode; eventId?: string }) {
  return <VolunteerFieldForm mode={mode} eventId={eventId} />;
}

function VolunteerFieldForm({ mode, eventId }: { mode: OperationsMode; eventId?: string }) {
  const [areas, setAreas] = useState<OperationMapPoint[]>([]);
  const [areaId, setAreaId] = useState('');
  const [levelM, setLevelM] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { getOperationsSnapshot({ mode, eventId }).then((data) => { setAreas(data.mapLayers.areas); setAreaId(data.mapLayers.areas[0]?.id ?? ''); }).catch(() => setMessage('Could not load village list from API.')); }, [eventId, mode]);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setMessage('');
    const response = await apiFetch('/api/v1/field-readings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ areaId, levelM: Number(levelM), note }) });
    setMessage(response.ok ? 'Reading recorded by API.' : `Submission failed (${response.status}).`);
  };
  return <section className="ops-panel field-desk"><span className="eyebrow">VOLUNTEER WORKSPACE · API SUBMISSION</span><h1>Field water reading</h1><p>Submit a synthetic exercise reading. It is stored as a volunteer report and does not establish an official gauge observation.</p><form onSubmit={(event) => void submit(event)}><label>Village<select required value={areaId} onChange={(event) => setAreaId(event.target.value)}>{areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label><label>Observed water level (metres)<input required type="number" min="0" max="20" step="0.01" value={levelM} onChange={(event) => setLevelM(event.target.value)} /></label><label>Field note<textarea maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} /></label><button type="submit" disabled={!areaId || !levelM}>Submit reading</button>{message && <p role="status">{message}</p>}</form></section>;
}
