import { useCallback, useEffect, useState } from 'react';
import { getOperationsSnapshot, OperationsSnapshot, sendSimulationControl } from '../lib/operations-client';
import { OperationsMap } from './OperationsMap';

export function OperationsOverview() {
  const [snapshot, setSnapshot] = useState<OperationsSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [controlError, setControlError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setSnapshot(await getOperationsSnapshot());
      setError(null);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Unable to reach operations API.');
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const control = async (action: string, body?: unknown) => {
    setControlError(null);
    try {
      await sendSimulationControl(action, body);
      await refresh();
    } catch (failure) {
      setControlError(failure instanceof Error ? failure.message : 'Simulation control failed.');
    }
  };

  if (error && !snapshot) return <section className="ops-state-card"><h2>Operations API unavailable</h2><p>{error}</p><button onClick={() => void refresh()}>Retry connection</button></section>;
  if (!snapshot) return <section className="ops-state-card" aria-live="polite">Loading API-backed operation state…</section>;

  const simulation = snapshot.simulation;
  const level = simulation.alert.computedLevel;
  const simulatedSos = simulation.incomingSos ?? snapshot.queue.incomingSimulatedSos ?? 0;

  return (
    <div className="ops-overview">
      <header className="ops-page-heading">
        <div><span className="eyebrow">FENI DISTRICT · CENTRAL OPERATIONS</span><h1>Situation overview</h1><p>Shared operational picture from the Aali API.</p></div>
        <div className="ops-updated"><span className="status-dot" />API snapshot<br /><small>{new Date(snapshot.generatedAt).toLocaleTimeString('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit' })} BST</small></div>
      </header>

      <section className="exercise-banner" aria-label="Simulation status">
        <div><span className="exercise-live-dot" /><strong>SYNTHETIC EXERCISE</strong><span>{simulation.scenarioName}</span><small>API fixture · not a live flood feed · no pretrained forecast model</small></div>
        <span className="exercise-tick">TICK {simulation.tickIndex + 1} / {simulation.totalTicks}</span>
      </section>

      <section className="ops-kpis" aria-label="Operational indicators">
        <article className={`ops-kpi ops-kpi--${level.toLowerCase()}`}><span>RULE ALERT LEVEL</span><strong>{level}</strong><small>{simulation.alert.reasonCodes?.length ? simulation.alert.reasonCodes.join(' · ') : 'No configured signal threshold crossed'}</small></article>
        <article className="ops-kpi"><span>OPEN INCIDENTS</span><strong>{snapshot.queue.activeIncidents ?? '—'}</strong><small>{snapshot.queue.strandedPeople ?? '—'} people in fixture incidents</small></article>
        <article className="ops-kpi"><span>SIMULATED SOS ACTIVITY</span><strong>{simulatedSos}</strong><small>Scenario activity; not resident submissions</small></article>
        <article className="ops-kpi"><span>RIVER GAUGE</span><strong>{simulation.sourceData?.gauge.available ? `${simulation.sourceData.gauge.valueM.toFixed(2)} m` : 'STALE'}</strong><small>{simulation.sourceData?.gauge.source ?? 'Evidence hidden for this role'}</small></article>
      </section>

      <div className="ops-main-grid">
        <OperationsMap layers={snapshot.mapLayers} />
        <aside className="ops-right-rail">
          <section className="ops-panel ops-evidence-panel">
            <div className="ops-panel-heading"><div><span className="eyebrow">RULE INPUTS</span><h2>Alert evidence</h2></div><span className={`alert-pill alert-pill--${level.toLowerCase()}`}>{level}</span></div>
            {simulation.sourceData ? <>
              <div className="evidence-row"><span>Muhuri gauge</span><strong>{simulation.sourceData.gauge.available ? `${simulation.sourceData.gauge.valueM.toFixed(2)} m` : 'No reading · stale'}</strong></div>
              <div className="evidence-row"><span>Rainfall · 3h</span><strong>{simulation.sourceData.rainfall.valueMm} mm</strong></div>
              <div className="evidence-row"><span>Volunteer reading</span><strong>{simulation.sourceData.volunteerReading.available ? 'Reported' : 'Unavailable'}</strong></div>
              <div className="reason-list">{simulation.alert.reasonCodes?.map((reason) => <span key={reason}>{reason}</span>) ?? <span>Rule engine returned no reason codes.</span>}</div>
              <p className="provenance-note">Deterministic alert rule output. Thresholds are prototype starting values, not validated forecasts.</p>
            </> : <p className="muted">Detailed source evidence is limited for this role.</p>}
          </section>

          <section className="ops-panel ops-simulation-panel">
            <div className="ops-panel-heading"><div><span className="eyebrow">DEMO CONTROLS</span><h2>Scenario playback</h2></div><span className={simulation.running ? 'run-state run-state--on' : 'run-state'}>{simulation.running ? 'RUNNING' : 'PAUSED'}</span></div>
            <p>{simulation.provenance} · tick {simulation.tickIndex + 1} of {simulation.totalTicks}</p>
            {['AUTHORITY', 'ADMIN'].includes(snapshot.role) ? <>
            <div className="simulation-buttons">
              <button onClick={() => void control(simulation.running ? 'pause' : 'start')}>{simulation.running ? 'Pause' : 'Run exercise'}</button>
              <button onClick={() => void control('step')}>Step forward</button>
              <button className="button-secondary" onClick={() => void control('reset')}>Reset</button>
            </div>
            <label className="control-label">Playback speed<select value={simulation.speed ?? 1} onChange={(event) => void control('speed', { speed: Number(event.target.value) })}><option value={1}>1× · 5 sec/tick</option><option value={2}>2× · 2.5 sec/tick</option><option value={4}>4× · 1.25 sec/tick</option></select></label>
            <label className="connectivity-toggle"><input type="checkbox" checked={simulation.connectivity?.internetAvailable ?? true} onChange={(event) => void control('connectivity', { internetAvailable: event.target.checked })} />Simulate internet available</label>
            <p className="provenance-note">Connectivity toggle affects the simulator state only. It does not send an SMS or represent carrier delivery.</p>
            {controlError && <p className="error-inline" role="alert">{controlError}</p>}
            </> : <p className="provenance-note">Read-only scenario view. Controls are restricted to Authority and Admin.</p>}
          </section>

          <section className="ops-panel ops-queue-panel"><div className="ops-panel-heading"><div><span className="eyebrow">RESPONSE QUEUE</span><h2>Needs attention</h2></div></div>
            {snapshot.queue.reportsPendingReview !== undefined && <div className="evidence-row"><span>Reports pending review</span><strong>{snapshot.queue.reportsPendingReview}</strong></div>}
            {snapshot.mapLayers.incidents.length ? snapshot.mapLayers.incidents.slice(0, 5).map((item) => <div className="queue-item" key={item.id}><i /><div><strong>{item.label ?? item.name}</strong><span>{item.status} · {item.peopleCount ?? 0} people · {item.provenance}</span></div></div>) : <p className="muted">No incident records in this role’s operational view.</p>}
            <p className="provenance-note">Synthetic fixture incidents and API submitted SOS reports are distinguished on the map and list.</p>
          </section>
        </aside>
      </div>
      {error && <p className="error-inline" role="status">Last refresh failed; showing the previous API snapshot. {error}</p>}
    </div>
  );
}
