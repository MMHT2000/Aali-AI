import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Activity, BrainCircuit, CloudRain, MapPin, RefreshCw, Satellite, ShieldCheck } from 'lucide-react';
import { BrainArea, BrainPlan, PersonalGuidance, brainAreas, latestBrain, personalBrain, reviewBrain, runBrain } from '../lib/brain-client';
import { apiFetch } from '../lib/authenticated-fetch';
import { OperationsMode } from '../lib/operations-client';
import './AiBrain.css';
const BrainMap = lazy(() => import('./BrainMap'));
interface WorkerStatus {
  enabled: boolean; running: boolean; controlsHealthy: boolean; lastCompletedAt: string | null;
  areas: Record<string, { status: string; riskLevel?: string }>;
  controls: { scope: string; paused: boolean; reason: string }[];
}

export function AiBrain({ role, mode, districtCode }: { role: string; mode: OperationsMode; districtCode: string }) {
  const [worker, setWorker] = useState<WorkerStatus | null>(null);
  const [workerError, setWorkerError] = useState('');
  const [controlReason, setControlReason] = useState('');
  const [controlBusy, setControlBusy] = useState(false);
  const changeControl = async (scope: string, paused: boolean) => {
    setControlBusy(true); setWorkerError('');
    try {
      const response = await apiFetch('/api/v1/brain/autonomy/control', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scope, paused, reason: controlReason }) });
      if (!response.ok) throw new Error(`Intervention failed (${response.status}); control was not confirmed.`);
      setWorker(await response.json() as WorkerStatus); setControlReason('');
    } catch (error) { setWorkerError(String(error)); }
    finally { setControlBusy(false); }
  };
  const [areas, setAreas] = useState<BrainArea[]>([]);
  const [areaId, setAreaId] = useState(districtCode === 'SYLHET_DIST' ? 'sylhet' : 'feni');
  const [plan, setPlan] = useState<BrainPlan | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [auto, setAuto] = useState(true); const [reason, setReason] = useState('');
  const [people, setPeople] = useState(1); const [guidance, setGuidance] = useState<PersonalGuidance | null>(null);
  const generation = useRef(0);
  const area = areas.find(a => a.id === areaId);
  const historical = mode === 'HISTORICAL';
  const oversight = role === 'ADMIN';
  useEffect(() => { setAreaId(districtCode === 'SYLHET_DIST' ? 'sylhet' : 'feni'); }, [districtCode]);
  useEffect(() => { const controller = new AbortController(); brainAreas(controller.signal).then(setAreas).catch(e => { if (!controller.signal.aborted) setError(String(e)); }); return () => controller.abort(); }, []);
  useEffect(() => {
    const controller = new AbortController(); const current = ++generation.current;
    setPlan(null); setGuidance(null); setError(''); setBusy(false);
    if (!historical && !oversight) latestBrain(areaId, mode, controller.signal).then(data => { if (current === generation.current) setPlan(data); }).catch(e => { if (!controller.signal.aborted) setError(String(e)); });
    return () => { controller.abort(); generation.current++; };
  }, [areaId, mode, historical, oversight]);
  useEffect(() => {
    if (!auto || historical || oversight) return;
    const controller = new AbortController();
    const timer = setInterval(() => { const current = generation.current; void latestBrain(areaId, mode, controller.signal).then(data => { if (current === generation.current) { setPlan(data); setGuidance(null); } }).catch(e => { if (!controller.signal.aborted) setError(String(e)); }); }, 15000);
    return () => { clearInterval(timer); controller.abort(); };
  }, [auto, areaId, mode, historical, oversight]);
  const analyze = async () => {
    const current = ++generation.current; setBusy(true); setError(''); setGuidance(null);
    try { const result = await runBrain(areaId, mode); if (current === generation.current) setPlan(result); }
    catch (e) { if (current === generation.current) setError(String(e)); }
    finally { if (current === generation.current) setBusy(false); }
  };
  const review = async (actionId: string, decision: string) => {
    if (!plan) return; const current = generation.current; setBusy(true); setError('');
    try { const result = await reviewBrain(plan.id, actionId, decision, reason); if (current === generation.current) { setPlan(result); setReason(''); } }
    catch (e) { if (current === generation.current) setError(String(e)); }
    finally { if (current === generation.current) setBusy(false); }
  };
  const personalize = (useLocation: boolean) => {
    const current = generation.current;
    const send = async (location?: { latitude: number; longitude: number }) => {
      try { const result = await personalBrain({ areaId, mode, people, ...location }); if (current === generation.current) setGuidance(result); }
      catch (e) { if (current === generation.current) setError(String(e)); }
    };
    setGuidance(null); setError('');
    if (!useLocation) { void send(); return; }
    if (!navigator.geolocation) { setError('Location unavailable. Use guidance without GPS.'); return; }
    navigator.geolocation.getCurrentPosition(position => { if (current === generation.current) void send({ latitude: position.coords.latitude, longitude: position.coords.longitude }); }, () => { if (current === generation.current) setError('Location denied or unavailable. Use guidance without GPS.'); }, { timeout: 10000, maximumAge: 60000 });
  };
  useEffect(() => {
    const controller = new AbortController();
    const check = () => { void apiFetch('/api/v1/brain/autonomy/status', { signal: controller.signal }).then(response => { if (!response.ok) throw new Error('Worker status unavailable (' + response.status + ')'); return response.json(); }).then(value => { if (!value || typeof value.enabled !== 'boolean' || !Array.isArray(value.controls) || !value.areas) throw new Error('Worker returned an invalid status response'); if (!controller.signal.aborted) { setWorker(value); setWorkerError(''); } }).catch(error => { if (!controller.signal.aborted) setWorkerError(String(error)); }); };
    check(); const timer = setInterval(check, 15000);
    return () => { controller.abort(); clearInterval(timer); };
  }, []);
  const stale = plan && Date.now() - Date.parse(plan.createdAt) > 30 * 60000;
  return <div className="ai-brain">
    <header className="brain-hero"><div><span className="brain-eyebrow"><BrainCircuit size={18} /> AALI INTELLIGENCE</span><h1>One area. A shared response plan.</h1><p>The server monitors areas and prepares plans even while this page is closed. Forecast signals, satellite context and operational evidence inform each plan.</p></div><span className={`brain-mode ${mode === 'EXERCISE' ? 'exercise' : ''}`}>{mode === 'EXERCISE' ? 'SYNTHETIC EXERCISE' : mode}</span></header>
    <div className="brain-toolbar"><label>Analysis area<select value={areaId} onChange={e => setAreaId(e.target.value)}>{areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label><div><small>BASIN</small><strong>{area?.basin ?? 'Loading areas…'}</strong></div><button className="brain-primary" onClick={() => void analyze()} disabled={busy || historical || oversight}><RefreshCw size={16} /> {busy ? 'Analysing evidence…' : 'Run area analysis'}</button><label className="brain-auto"><input type="checkbox" checked={auto} disabled={historical} onChange={e => setAuto(e.target.checked)} /> Show server updates every 15 seconds</label></div>
    <section className="brain-card" aria-label="Autonomous monitoring">
      <div className="brain-section-title"><h2>Autonomous monitoring</h2><span className={worker?.running ? 'brain-worker-badge is-running' : 'brain-worker-badge'}>{worker?.controls.some(control => control.scope === 'ALL' && control.paused) ? 'PAUSED BY HUMAN' : worker?.enabled ? 'AUTONOMOUS' : 'STATUS'}</span></div>
      <p>{worker ? !worker.controlsHealthy && worker.enabled ? 'Automation is suspended while persisted intervention controls are unavailable.' : worker.controls.some(control => control.scope === 'ALL' && control.paused) ? 'Global pause is active. Saved plans stay available and manual analysis remains available.' : worker.enabled ? worker.running ? 'Agent is checking all areas now.' : 'Agent is active. All areas are checked every 15 minutes.' : 'Background worker is disabled on this server.' : 'Checking worker status...'}</p>
      <div className={worker?.running ? 'brain-agent-flow is-running' : 'brain-agent-flow'} aria-label="Agent workflow">{['Collect forecasts', 'Screen risk', 'Prepare priorities', 'Save area plan'].map((step, index) => <div key={step}><span>{index + 1}</span><strong>{step}</strong><small>{worker?.running ? 'Sweep in progress' : worker?.lastCompletedAt ? 'Last sweep completed' : 'Awaiting sweep'}</small></div>)}</div>
      <p>Monitoring and planning continue with the browser closed while the API and database run. Phone wake-up delivery is not connected.</p>
      {worker?.lastCompletedAt && <small>Last sweep: {new Date(worker.lastCompletedAt).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' })} | Asia/Dhaka</small>}
      {workerError && <p role="alert" className="brain-error">{workerError}</p>}
      {worker && ['AUTHORITY', 'ADMIN'].includes(role) && <details className="brain-intervention"><summary>Human intervention: pause or resume automation</summary><p>A pause stops subsequent automatic plans for the selected scope. A running source request may finish; manual analysis and review remain available. Saved controls survive server restart.</p><label>Intervention reason<input value={controlReason} maxLength={300} onChange={event => setControlReason(event.target.value)} placeholder="Why are you taking control?" /></label><div className="brain-buttons">{['ALL', areaId].map(scope => { const paused = worker.controls.some(control => control.scope === scope && control.paused); return <button key={scope} disabled={controlBusy || controlReason.trim().length < 5} onClick={() => void changeControl(scope, !paused)}>{paused ? 'Resume' : 'Pause'} {scope === 'ALL' ? 'all areas' : 'selected area'}</button>; })}</div><small>Resuming one area does not override a global pause. Resume takes effect on the next scheduled sweep.</small>{worker.controls.filter(control => control.paused).map(control => <p key={control.scope}>{control.scope}: paused | {control.reason}</p>)}</details>}
    </section>
    <Suspense fallback={<section className="brain-card" role="status">Loading area map...</section>}><BrainMap areas={areas} areaId={areaId} plan={plan} mode={mode} running={worker?.running ?? false} statuses={worker?.areas ?? {}} onSelect={setAreaId} /></Suspense>
    {historical && <p role="status">AI Brain does not mix current forecasts with historical replay. Select Live or Exercise in the command header.</p>}
    {error && <p className="brain-error" role="alert">{error}</p>}
    {stale && <p className="brain-error" role="status">This analysis is over 30 minutes old. Refresh before reviewing tasks or requesting guidance.</p>}
    {oversight && <p role="status">Admin oversight shows monitoring status and intervention controls. Operational plans remain scoped to operational roles.</p>}
    {!plan && !busy && !historical && !oversight && <section className="brain-card"><h2>Start with the evidence</h2><p>The background worker prepares saved plans automatically when enabled. You can also request an immediate analysis. Live queries free public forecast and satellite catalogues. Exercise uses explicit synthetic weather and existing exercise records.</p></section>}
    {plan && <>
      <div className="brain-metrics"><section className={`brain-card risk-${plan.risk.level.toLowerCase()}`}><Activity /><small>EXPERIMENTAL SCREENING</small><h2>{plan.risk.level}</h2><p>{plan.risk.label}</p></section><section className="brain-card"><CloudRain /><small>CURRENT UTC DAY · RAIN FORECAST</small><h2>{plan.risk.rain24hMm === null ? 'Unknown' : `${plan.risk.rain24hMm} mm`}</h2><p>Area forecast, not an observed street condition.</p></section><section className="brain-card"><ShieldCheck /><small>OPEN COORDINATION TASKS</small><h2>{plan.actions.filter(a => a.state === 'PENDING_REVIEW' && !['PREPARE', 'VERIFY_DATA'].includes(a.kind)).length}</h2><p>No warning, boat or relief delivery is sent automatically.</p></section></div>
      <section className="brain-card brain-agent"><div className="brain-section-title"><BrainCircuit /><h2>Agent briefing</h2><span>{plan.agent.provider}</span></div><p>{plan.agent.summary}</p><small>{plan.agent.status} · {plan.agent.provider === 'OPENAI' ? 'AI draft: verify against source records.' : 'Local deterministic planner active.'}</small><div className="brain-trace">{plan.agent.trace.map((t, i) => <span key={i}>{t.tool} · {t.status}</span>)}</div><small>Saved {new Date(plan.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' })} · Asia/Dhaka</small></section>
      <div className="brain-columns"><section className="brain-card"><h2>Forecast outlook</h2><ul>{plan.risk.reasons.map(r => <li key={r}>{r}</li>)}</ul><div className="brain-table-wrap"><table><caption>Model forecasts · UTC dates · missing values remain unknown</caption><thead><tr><th>Date</th><th>Rain mm</th><th>River m³/s</th><th>Ensemble P25–P75</th></tr></thead><tbody>{plan.environment.days.map(d => <tr key={d.date}><td>{d.date}</td><td>{d.rainMm ?? '—'}</td><td>{d.discharge ?? '—'}</td><td>{d.p25 ?? '—'}–{d.p75 ?? '—'}</td></tr>)}</tbody></table></div>{plan.environment.grid && <small>Selected river grid: {plan.environment.grid.latitude}, {plan.environment.grid.longitude}. River match requires verification.</small>}</section>
      <section className="brain-card"><div className="brain-section-title"><Satellite /><h2>Satellite context</h2></div><p>Sentinel-2 optical scenes. Acquisition time matters; cloud cover can hide floodwater. These images do not predict or delineate floods.</p>{!plan.environment.imagery.length && <p>No satellite scene available for this analysis.</p>}{plan.environment.imagery.slice(0, 3).map(scene => <a className="brain-scene" key={scene.id} href={scene.url} target="_blank" rel="noreferrer">{scene.thumbnail && <img src={scene.thumbnail} alt={`Satellite context acquired ${scene.acquiredAt}`} loading="lazy" referrerPolicy="no-referrer" />}<span>{new Date(scene.acquiredAt).toLocaleDateString()}<small>Cloud: {scene.cloudPercent === null ? 'unknown' : `${scene.cloudPercent}%`} · View source record</small></span></a>)}</section></div>
      <section className="brain-card"><h2>Evidence register</h2><div className="brain-sources">{plan.environment.evidence.map(e => <article key={e.id}><strong>{e.provider.replaceAll('_', ' ')}</strong><span className={`brain-source-state ${e.status.toLowerCase()}`}>{e.status} · {e.kind}</span><p>{e.note}</p><small>Valid/acquired: {e.validAt ?? 'unknown'}<br />Retrieved: {e.fetchedAt}</small>{e.url && <a href={e.url} target="_blank" rel="noreferrer">Source data</a>}</article>)}</div></section>
      <section className="brain-card"><h2>Preparation, response and recovery</h2><p>{plan.operations.provenance.replaceAll('_', ' ')} · Preparation guidance is ready automatically; reviewing it is optional. Operational tasks remain proposals until verified.</p><label>Review reason<input value={reason} onChange={e => setReason(e.target.value)} maxLength={300} placeholder="What did you verify? Minimum 5 characters." /></label><div className="brain-actions">{plan.actions.map(action => <article key={action.id} className={plan.agent.focusActionIds.includes(action.id) ? 'brain-focus' : ''}><span className="brain-action-kind">{action.kind.replaceAll('_', ' ')} · {action.priority} priority</span><h3>{action.title}</h3><p>{action.detail}</p><small>Evidence: {action.sourceIds.join(', ') || 'General preparation guidance'}<br />Reviewer: {action.requiredRole} · {action.state}</small>{role === action.requiredRole && ['PENDING_REVIEW', 'READY'].includes(action.state) && <div className="brain-buttons"><button disabled={busy || !!stale || reason.trim().length < 5} onClick={() => void review(action.id, 'ACKNOWLEDGED')}>Acknowledge review</button><button disabled={busy || !!stale || reason.trim().length < 5} onClick={() => void review(action.id, 'DISMISSED')}>Dismiss with reason</button></div>}</article>)}</div></section>
      <section className="brain-card"><div className="brain-section-title"><MapPin /><h2>Household guidance preview</h2></div><p>GPS is optional, used for this request only, and never sent to GPT. Shelter capacity and access require verification.</p><div className="brain-buttons"><label>People<input type="number" min={1} max={99} value={people} onChange={e => setPeople(Number(e.target.value))} /></label><button disabled={!!stale || !Number.isInteger(people) || people < 1 || people > 99} onClick={() => personalize(false)}>Without GPS</button><button disabled={!!stale || !Number.isInteger(people) || people < 1 || people > 99} onClick={() => personalize(true)}>Use my location</button></div>{guidance && <div role="status"><ul>{guidance.preparation.map(p => <li key={p}>{p}</li>)}</ul><p>{guidance.shelterStatus}</p>{guidance.shelterCandidates.map(s => <p key={s.id}><strong>{s.name}</strong> · {s.distanceKm} km straight line · {s.remainingCapacity} exercise places · {s.bookingStatus} · Route unverified</p>)}<p>{guidance.aidStatus}</p></div>}</section>
      <details className="brain-card"><summary>Model boundaries and missing capabilities</summary><ul>{plan.limitations.map(l => <li key={l}>{l}</li>)}</ul></details>
    </>}
  </div>;
}
