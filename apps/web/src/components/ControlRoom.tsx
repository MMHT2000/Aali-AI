import { FormEvent, useEffect, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Activity, AlertTriangle, ClipboardList, Map, Radio, Settings, ShieldCheck, Truck, Users, Waves } from 'lucide-react';
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
import { getOperationsSnapshot, OperationMapPoint } from '../lib/operations-client';
import { apiFetch } from '../lib/authenticated-fetch';
import { canAccessControlRoomRoute } from '../lib/control-room-access';
import { checkApiHealth, ApiHealthResponse } from '../lib/api-client';
import './ControlRoom.css';

interface ControlRoomProps { session: UserSession; onLogout: () => void }
const routes = [
  { path: '/control-room/map', label: 'Situation map', icon: Map },
  { path: '/control-room/responder', label: 'Rescue operations', icon: Radio },
  { path: '/control-room/alerts', label: 'Alerts & approvals', icon: AlertTriangle },
  { path: '/control-room/replay', label: 'Replay & exercise', icon: Activity },
  { path: '/control-room/recovery', label: 'Recovery needs', icon: Truck },
  { path: '/control-room/field', label: 'Field reporting', icon: ClipboardList },
  { path: '/control-room/simulator', label: 'Resident simulator', icon: Users },
  { path: '/control-room/language', label: 'Language assistant', icon: Waves },
  { path: '/control-room/audit', label: 'Audit trail', icon: ShieldCheck },
  { path: '/control-room/settings', label: 'System settings', icon: Settings },
];

export function ControlRoom({ session, onLogout }: ControlRoomProps) {
  const [health, setHealth] = useState<ApiHealthResponse | null>(null);
  const location = useLocation();
  const visible = routes.filter((item) => canAccessControlRoomRoute(item.path, session.role));
  useEffect(() => { checkApiHealth().then(setHealth).catch(() => setHealth(null)); }, []);
  const allowed = (path: string) => canAccessControlRoomRoute(path, session.role);
  const fallback = visible[0]?.path ?? '/login';

  return <div className="control-shell">
    <header className="control-topbar">
      <div className="control-brand"><span className="brand-mark">A</span><div><strong>AALI AI <span>OPERATIONS</span></strong><small>Feni district · decision support prototype</small></div></div>
      <div className="session-strip"><span className={health?.status === 'ok' ? 'api-indicator online' : 'api-indicator'} />API {health?.status === 'ok' ? 'CONNECTED' : 'UNAVAILABLE'}<span className="session-name">{session.displayName} · {session.role}</span><button className="logout-button" onClick={onLogout}>Sign out</button></div>
    </header>
    <div className="prototype-ribbon"><strong>DEMO ENVIRONMENT</strong> Synthetic scenario data and prototype rules. This is not an emergency service. Official warnings and dispatches require authorized human approval.</div>
    <div className="control-body">
      <aside className="control-sidebar"><div className="sidebar-heading">WORKSPACES</div>{visible.map(({ path, label, icon: Icon }) => <NavLink key={path} to={path} className={({ isActive }) => `control-nav-link${isActive || location.pathname === path ? ' active' : ''}`}><Icon size={17} /><span>{label}</span></NavLink>)}<div className="sidebar-foot"><span>LOCAL TIME</span><strong>{new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' })} BST</strong><small>{health?.modes?.aiProvider ?? 'Deterministic local language fallback'}</small></div></aside>
      <main className="control-content"><Routes>
        <Route path="/control-room/map" element={allowed('/control-room/map') ? <OperationsOverview /> : <Navigate to={fallback} replace />} />
        <Route path="/control-room/responder" element={allowed('/control-room/responder') ? <ResponderDashboard /> : <Navigate to={fallback} replace />} />
        <Route path="/control-room/alerts" element={allowed('/control-room/alerts') ? <FloodReplayWarning /> : <Navigate to={fallback} replace />} />
        <Route path="/control-room/replay" element={allowed('/control-room/replay') ? <FloodReplayWarning /> : <Navigate to={fallback} replace />} />
        <Route path="/control-room/recovery" element={allowed('/control-room/recovery') ? <RecoveryLedger /> : <Navigate to={fallback} replace />} />
        <Route path="/control-room/field" element={session.role === 'VOLUNTEER' || session.role === 'ADMIN' ? <VolunteerRoute /> : <Navigate to={fallback} replace />} />
        <Route path="/control-room/simulator" element={allowed('/control-room/simulator') ? <><ResidentSimulator /><ThreeTapSos /><GatewaySimulator /></> : <Navigate to={fallback} replace />} />
        <Route path="/control-room/language" element={allowed('/control-room/language') ? <AiLanguageAssistant /> : <Navigate to={fallback} replace />} />
        <Route path="/control-room/audit" element={allowed('/control-room/audit') ? <AuditViewer /> : <Navigate to={fallback} replace />} />
        <Route path="/control-room/settings" element={allowed('/control-room/settings') ? <SettingsPanel /> : <Navigate to={fallback} replace />} />
        <Route path="*" element={<Navigate to={fallback} replace />} />
      </Routes></main>
    </div>
  </div>;
}

function VolunteerRoute() {
  return <VolunteerFieldForm />;
}

function VolunteerFieldForm() {
  const [areas, setAreas] = useState<OperationMapPoint[]>([]);
  const [areaId, setAreaId] = useState('');
  const [levelM, setLevelM] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { getOperationsSnapshot().then((data) => { setAreas(data.mapLayers.areas); setAreaId(data.mapLayers.areas[0]?.id ?? ''); }).catch(() => setMessage('Could not load village list from API.')); }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setMessage('');
    const response = await apiFetch('/api/v1/field-readings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ areaId, levelM: Number(levelM), note }) });
    setMessage(response.ok ? 'Reading recorded by API.' : `Submission failed (${response.status}).`);
  };
  return <section className="ops-panel field-desk"><span className="eyebrow">VOLUNTEER WORKSPACE · API SUBMISSION</span><h1>Field water reading</h1><p>Submit a synthetic exercise reading. It is stored as a volunteer report and does not establish an official gauge observation.</p><form onSubmit={(event) => void submit(event)}><label>Village<select required value={areaId} onChange={(event) => setAreaId(event.target.value)}>{areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label><label>Observed water level (metres)<input required type="number" min="0" max="20" step="0.01" value={levelM} onChange={(event) => setLevelM(event.target.value)} /></label><label>Field note<textarea maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} /></label><button type="submit" disabled={!areaId || !levelM}>Submit reading</button>{message && <p role="status">{message}</p>}</form></section>;
}
