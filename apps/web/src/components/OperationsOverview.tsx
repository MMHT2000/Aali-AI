import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Clock3,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Users,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  getOperationsSnapshot,
  OperationMapPoint,
  OperationsMode,
  OperationsSnapshotBase,
  sendSimulationControl,
} from '../lib/operations-client';
import { OperationsMap } from './OperationsMap';

interface SosAlertInfo {
  id: string;
  shortId?: string;
  title: string;
  location: string;
  peopleCount: number;
  flags: string[];
  provenance: string;
  receivedAt: string;
}

type ReportFilter = 'pending' | 'all';

function playEmergencyBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const context = new AudioCtx();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(587.33, context.currentTime + 0.22);
    gain.gain.setValueAtTime(0.2, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.28);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.32);
  } catch {
    // The visual alert remains available when browser audio is blocked.
  }
}

function formatDhakaTime(value?: string): string {
  if (!value) return 'Time unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Time unavailable';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function receivedTime(value?: string): string {
  if (!value) return 'Received time unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Received time unavailable';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function isPending(point: OperationMapPoint): boolean {
  return point.status === 'NEEDS_REVIEW';
}

export function OperationsOverview({ mode = 'EXERCISE', eventId }: { mode?: OperationsMode; eventId?: string }) {
  const location = useLocation();
  const [snapshot, setSnapshot] = useState<OperationsSnapshotBase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [controlError, setControlError] = useState<string | null>(null);
  const [activeAlert, setActiveAlert] = useState<SosAlertInfo | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reportFilter, setReportFilter] = useState<ReportFilter>('pending');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const knownSosIds = useRef<Set<string>>(new Set());
  const isInitialMount = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const next = await getOperationsSnapshot({ mode, eventId });
      setSnapshot(next);
      setError(null);

      const currentSos: OperationMapPoint[] = next.mapLayers?.sos ?? [];
      if (currentSos.length > 0) {
        // Keep unreviewed reports visible after a reload; later polls alert on new IDs.
        const candidate = isInitialMount.current
          ? currentSos.find(isPending)
          : currentSos.find((item) => !knownSosIds.current.has(item.id));
        if (candidate) {
          const flags: string[] = [];
          if (candidate.isTrapped) flags.push('Trapped');
          if (candidate.hasChild) flags.push('Child or infant');
          if (candidate.elderlyCount) flags.push('Older person');
          if (candidate.hasMedicalNeed) flags.push('Medical need');

          setActiveAlert({
            id: candidate.id,
            shortId: candidate.shortId,
            title: candidate.label || candidate.name || 'SOS report received',
            location: candidate.name || 'Location unavailable',
            peopleCount: candidate.peopleCount || 1,
            flags,
            provenance: candidate.provenance,
            receivedAt: candidate.receivedAt || new Date().toISOString(),
          });
          if (soundEnabled) playEmergencyBeep();
        }
      }
      currentSos.forEach((item) => knownSosIds.current.add(item.id));
      isInitialMount.current = false;
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Unable to reach operations API.');
    }
  }, [eventId, mode, soundEnabled]);

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

  const testAlert = () => {
    setActiveAlert({
      id: `local-test-${Date.now()}`,
      shortId: 'TEST',
      title: 'Local visual test alert',
      location: 'Synthetic test location',
      peopleCount: 4,
      flags: ['Local UI test only'],
      provenance: 'LOCAL_TEST_ONLY · NOT AN API REPORT',
      receivedAt: new Date().toISOString(),
    });
    if (soundEnabled) playEmergencyBeep();
  };

  const allSos = useMemo(() => {
    const points = snapshot?.mapLayers.sos ?? [];
    return [...points].sort((a, b) => {
      const pendingDelta = Number(isPending(b)) - Number(isPending(a));
      if (pendingDelta !== 0) return pendingDelta;
      return new Date(b.receivedAt ?? 0).getTime() - new Date(a.receivedAt ?? 0).getTime();
    });
  }, [snapshot?.mapLayers.sos]);
  const pendingSos = allSos.filter(isPending);
  const visibleSos = reportFilter === 'pending' ? pendingSos : allSos;
  const allMapPoints = useMemo(() => {
    if (!snapshot) return [];
    return [
      ...snapshot.mapLayers.sos,
      ...snapshot.mapLayers.incidents,
      ...snapshot.mapLayers.gauges,
      ...snapshot.mapLayers.shelters,
      ...snapshot.mapLayers.assets,
      ...snapshot.mapLayers.areas,
    ];
  }, [snapshot]);
  const selectedItem = allMapPoints.find((item) => item.id === selectedItemId)
    ?? pendingSos[0]
    ?? allSos[0]
    ?? null;

  if (error && !snapshot) {
    const isAuthError = error.includes('401');
    return (
      <section className="situation-state" role="alert">
        <div className="situation-state__icon"><AlertTriangle size={20} /></div>
        <div>
          <p className="situation-eyebrow">SITUATION ROOM</p>
          <h1>{isAuthError ? 'Session expired' : 'Operations feed unavailable'}</h1>
          <p>{isAuthError ? 'Sign in again to reconnect to the operations snapshot.' : error}</p>
          <button type="button" onClick={() => void refresh()}>{isAuthError ? 'Sign in again' : 'Retry connection'}</button>
        </div>
      </section>
    );
  }
  if (!snapshot) {
    return <section className="situation-state" aria-live="polite"><Activity size={20} /> Loading the Feni operating picture…</section>;
  }

  const snapshotMatchesContext = snapshot.context.mode === mode &&
    (mode !== 'HISTORICAL' || snapshot.context.event?.id === (eventId ?? '11111111-1111-1111-1111-111111111101'));
  if (!snapshotMatchesContext) {
    return <section className="situation-state" aria-live="polite"><Activity size={20} /> Loading selected event and mode…</section>;
  }

  if (mode !== 'EXERCISE') {
    const title = mode === 'LIVE' ? 'Live sources' : 'Historical reconstruction';
    return <div className="situation-room">
      {mode === 'LIVE' && snapshot.visibility.sos && activeAlert && <section className="sos-alert" role="alert" aria-live="assertive">
        <div className="sos-alert__mark" aria-hidden="true">SOS</div>
        <div className="sos-alert__main"><div className="sos-alert__heading"><strong>New API-submitted SOS report</strong><span>{activeAlert.shortId ? `Report ${activeAlert.shortId}` : activeAlert.id}</span></div>
          <p>{activeAlert.location} · {activeAlert.peopleCount} people reported</p><small>{activeAlert.flags.join(' · ') || 'No additional needs selected'} · {activeAlert.provenance} · received {receivedTime(activeAlert.receivedAt)}</small></div>
        <div className="sos-alert__actions"><Link to={{ pathname: '/control-room/responder', search: location.search }}>Open SOS triage</Link><button type="button" onClick={() => setActiveAlert(null)}>Dismiss alert</button></div>
      </section>}
      <header className="situation-heading">
        <div><p className="situation-eyebrow">FENI DISTRICT <span>/</span> SHARED OPERATING PICTURE</p><h1>{title}</h1></div>
        <div className="snapshot-time"><Clock3 size={15} /><span><small>SNAPSHOT · DHAKA TIME</small><strong>{formatDhakaTime(snapshot.generatedAt)} BST</strong></span></div>
      </header>
      <section className={`exercise-strip exercise-strip--${mode.toLowerCase()}`} aria-label="Selected data mode and source status">
        <span className="exercise-strip__tag">{mode === 'LIVE' ? 'LIVE SOURCE STATUS' : 'HISTORICAL RECONSTRUCTION'}</span>
        <strong>{snapshot.context.event?.name ?? 'Current API-submitted activity'}</strong>
        <span className="exercise-strip__disclosure">{mode === 'LIVE' ? 'BMD CAP public advisories are separate from Aali rule alerts; other external feeds remain unavailable' : 'Fixture source citations and gaps are not yet verified'}</span>
      </section>
      <div className="situation-workspace">
        <OperationsMap layers={snapshot.mapLayers} selectedPointId={selectedItem?.id} onSelectPoint={(point) => setSelectedItemId(point.id)} />
        <aside className="operations-rail" aria-label="Data sources and authorized SOS activity">
          <section className="evidence-rail"><header className="rail-heading"><div><p className="situation-eyebrow">SOURCE REGISTER</p><h2>Availability and provenance</h2></div></header>
            {snapshot.context.sources.map((source) => <div className="evidence-line" key={source.id}><span>{source.label}</span><strong>{source.availability}</strong><small>{source.message}</small>{source.lastCheckedAt && <small>Checked {formatDhakaTime(source.lastCheckedAt)} BST</small>}{source.latestObservedAt && <small>Feed last published {formatDhakaTime(source.latestObservedAt)} BST · {source.ageSeconds == null ? 'age unknown' : `${Math.floor(source.ageSeconds / 3600)}h old`}</small>}</div>)}
          </section>
          {mode === 'LIVE' && <section className="evidence-rail" aria-labelledby="bmd-alerts-title">
            <header className="rail-heading"><div><p className="situation-eyebrow">EXTERNAL SOURCE · BMD CAP</p><h2 id="bmd-alerts-title">Public weather advisories</h2></div><span className="queue-count">{snapshot.externalAlerts?.length ?? 0}</span></header>
            {snapshot.externalAlerts?.length ? <div className="queue-list">{snapshot.externalAlerts.map((alert) => <article className="evidence-line" key={alert.id}>
              <strong>{alert.headline}</strong>
              <span>{alert.severity ?? 'Severity unavailable'}{alert.urgency ? ` · ${alert.urgency}` : ''}{alert.certainty ? ` · ${alert.certainty}` : ''}</span>
              <small>{alert.areas.length ? `Area: ${alert.areas.join(', ')}` : 'Area description unavailable'} · issued {formatDhakaTime(alert.issuedAt ?? undefined)} · expires {formatDhakaTime(alert.expiresAt)}</small>
              {alert.description && <small>{alert.description}</small>}
              {alert.instruction && <small>Instruction: {alert.instruction}</small>}
              <a href={alert.sourceUrl} target="_blank" rel="noreferrer">Open original CAP record</a>
              <small>Fetched {formatDhakaTime(alert.fetchedAt)} · public source advisory; not an Aali warning or human approval</small>
            </article>)}</div> : <p className="evidence-note">{snapshot.context.sources.find((source) => source.id === 'bmd')?.availability === 'AVAILABLE'
              ? 'No current unexpired Actual CAP alerts were found in the fetched feed entries. No alert does not establish safety.'
              : 'No current advisory can be confirmed while the BMD CAP feed is unavailable.'}</p>}
          </section>}
          {snapshot.visibility.sos && <section className="report-queue"><header className="rail-heading"><div><p className="situation-eyebrow">API-SUBMITTED REPORTS</p><h2>Current SOS activity</h2></div><span className="queue-count">{snapshot.mapLayers.sos.length}</span></header>
            {snapshot.mapLayers.sos.length ? <div className="queue-list">{snapshot.mapLayers.sos.map((item) => <button className="sos-row" key={item.id} type="button" onClick={() => setSelectedItemId(item.id)}><span className="sos-row__content"><span className="sos-row__top"><strong>{item.name ?? item.label ?? 'Location unavailable'}</strong><time>{receivedTime(item.receivedAt)}</time></span><span className="sos-row__bottom"><span>{item.status ?? 'Received'}</span><span>{item.provenance}</span></span></span></button>)}</div> : <div className="queue-empty"><strong>{mode === 'LIVE' ? 'No current API-submitted SOS reports' : 'Historical SOS reports are not included in this reconstruction'}</strong><p>Absence of reports does not establish safety.</p></div>}
          </section>}
          {selectedItem && <section className="selected-record"><p className="situation-eyebrow">SELECTED RECORD</p><strong>{selectedItem.name ?? selectedItem.label ?? 'Map record'}</strong><dl><div><dt>Provenance</dt><dd>{selectedItem.provenance}</dd></div><div><dt>Coordinates</dt><dd>{selectedItem.latitude != null && selectedItem.longitude != null ? `${Number(selectedItem.latitude).toFixed(4)}, ${Number(selectedItem.longitude).toFixed(4)}` : 'Unknown · list only'}</dd></div></dl></section>}
        </aside>
      </div>
    </div>;
  }
  if (!snapshot.simulation) return <section className="situation-state" role="alert">Exercise scenario state is unavailable.</section>;

  const { simulation, queue } = snapshot;
  const level = simulation?.alert.computedLevel ?? 'UNAVAILABLE';
  const canControl = snapshot.visibility.simulationControls;
  const canTriage = snapshot.visibility.sos;
  const gauge = simulation?.sourceData?.gauge;
  const currentLocal = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit',
  }).format(new Date(snapshot.generatedAt));

  return (
    <div className="situation-room">
      {activeAlert && (
        <section className="sos-alert" role="alert" aria-live="assertive">
          <div className="sos-alert__mark" aria-hidden="true">SOS</div>
          <div className="sos-alert__main">
            <div className="sos-alert__heading">
              <strong>{activeAlert.id.startsWith('local-test-') ? 'Local test alert' : 'New SOS report'}</strong>
              <span>{activeAlert.shortId ? `Report ${activeAlert.shortId}` : activeAlert.id}</span>
            </div>
            <p>{activeAlert.location} <span>·</span> {activeAlert.peopleCount} people reported</p>
            <small>{activeAlert.flags.length ? activeAlert.flags.join(' · ') : 'No additional needs selected'} · {activeAlert.provenance} · received {receivedTime(activeAlert.receivedAt)}</small>
          </div>
          <div className="sos-alert__actions">
            {canTriage && <Link to={{ pathname: '/control-room/responder', search: location.search }}>Open SOS triage</Link>}
            <button type="button" onClick={() => setActiveAlert(null)}>Dismiss alert</button>
          </div>
        </section>
      )}

      <header className="situation-heading">
        <div>
          <p className="situation-eyebrow">FENI DISTRICT <span>/</span> RESPONSE OPERATIONS</p>
          <h1>Situation room</h1>
        </div>
        <div className="situation-heading__status">
          <div className="snapshot-time"><Clock3 size={15} /><span><small>API SNAPSHOT · DHAKA TIME</small><strong>{currentLocal} BST</strong></span></div>
          <button className="quiet-button" type="button" aria-pressed={soundEnabled} onClick={() => setSoundEnabled((enabled) => !enabled)}>
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}{soundEnabled ? 'Alert sound on' : 'Alert sound off'}
          </button>
        </div>
      </header>

      <section className="exercise-strip" aria-label="Data mode and exercise status">
        <span className="exercise-strip__tag">SYNTHETIC EXERCISE</span>
        <strong>{simulation.scenarioName}</strong>
        <span className="exercise-strip__divider" />
        <span>{simulation.running ? 'RUNNING' : 'PAUSED'} · tick {simulation.tickIndex + 1} of {simulation.totalTicks}</span>
        <span className="exercise-strip__disclosure">Fixture data · not a live flood feed</span>
      </section>

      <section className="situation-summary" aria-label="Operational status">
        <article className={`summary-cell summary-cell--${level.toLowerCase()}`}>
          <span className="summary-cell__label">RULE ALERT</span>
          <strong>{level}</strong>
          <small>{simulation.alert.reasonCodes?.length ? simulation.alert.reasonCodes.join(' · ') : 'No rule threshold crossed'}</small>
        </article>
        <article className="summary-cell summary-cell--urgent">
          <span className="summary-cell__label">SOS NEEDING REVIEW</span>
          <strong>{queue.reportsPendingReview ?? pendingSos.length}</strong>
          <small>{pendingSos.length === 1 ? 'report awaits a responder' : 'reports await a responder'}</small>
        </article>
        <article className="summary-cell">
          <span className="summary-cell__label">OPEN INCIDENTS</span>
          <strong>{queue.activeIncidents ?? '—'}</strong>
          <small>{queue.strandedPeople ?? '—'} people in linked incidents</small>
        </article>
        <article className="summary-cell">
          <span className="summary-cell__label">MUHURI GAUGE · SCENARIO</span>
          <strong>{gauge?.available ? `${gauge.valueM.toFixed(2)} m` : 'Unavailable'}</strong>
          <small>{gauge?.source ?? 'No scenario reading available'}</small>
        </article>
      </section>

      <div className="situation-workspace">
        <OperationsMap
          layers={snapshot.mapLayers}
          selectedPointId={selectedItem?.id}
          onSelectPoint={(point) => setSelectedItemId(point.id)}
        />

        <aside className="operations-rail" aria-label="Priority reports and evidence">
          <section className="report-queue" aria-labelledby="report-queue-title">
            <header className="rail-heading">
              <div>
                <p className="situation-eyebrow">RESPONSE QUEUE</p>
                <h2 id="report-queue-title">Resident SOS</h2>
              </div>
              <span className="queue-count" aria-label={`${pendingSos.length} reports need review`}>{pendingSos.length}</span>
            </header>
            <div className="queue-filter" role="group" aria-label="SOS report filter">
              <button type="button" aria-pressed={reportFilter === 'pending'} onClick={() => setReportFilter('pending')}>Needs review <span>{pendingSos.length}</span></button>
              <button type="button" aria-pressed={reportFilter === 'all'} onClick={() => setReportFilter('all')}>All reports <span>{allSos.length}</span></button>
            </div>
            {visibleSos.length === 0 ? (
              <div className="queue-empty">
                <div className="queue-empty__icon"><Users size={18} /></div>
                <strong>{reportFilter === 'pending' ? 'No SOS awaiting review' : 'No SOS reports in this snapshot'}</strong>
                <p>No report here does not indicate that an area is safe.</p>
              </div>
            ) : (
              <div className="queue-list" aria-label="SOS reports">
                {visibleSos.map((item) => (
                  <button
                    className={`sos-row${isPending(item) ? ' sos-row--pending' : ''}${selectedItem?.id === item.id ? ' is-selected' : ''}`}
                    key={item.id}
                    type="button"
                    aria-pressed={selectedItem?.id === item.id}
                    onClick={() => setSelectedItemId(item.id)}
                  >
                    <span className="sos-row__marker" aria-hidden="true">{isPending(item) ? '!' : '·'}</span>
                    <span className="sos-row__content">
                      <span className="sos-row__top"><strong>{item.name ?? item.label ?? 'Location unavailable'}</strong><time>{receivedTime(item.receivedAt)}</time></span>
                      <span className="sos-row__meta">{item.peopleCount ?? 1} people · {item.shortId ? `ID ${item.shortId}` : 'ID unavailable'}</span>
                      <span className="sos-row__bottom"><span className={isPending(item) ? 'status-label status-label--urgent' : 'status-label'}>{isPending(item) ? 'Needs review' : item.status ?? 'Received'}</span><span>{item.provenance}</span></span>
                    </span>
                  </button>
                ))}
              </div>
            )}
            {selectedItem && (
              <div className="selected-record" aria-live="polite">
                <p className="situation-eyebrow">SELECTED RECORD</p>
                <strong>{selectedItem.name ?? selectedItem.label ?? 'Map record'}</strong>
                <dl>
                  <div><dt>Status</dt><dd>{selectedItem.status ?? 'Not provided'}</dd></div>
                  <div><dt>Source</dt><dd>{selectedItem.provenance}</dd></div>
                  <div><dt>Coordinates</dt><dd>{selectedItem.latitude != null && selectedItem.longitude != null ? `${Number(selectedItem.latitude).toFixed(4)}, ${Number(selectedItem.longitude).toFixed(4)}` : 'Unknown · list only'}</dd></div>
                </dl>
                {canTriage && snapshot.mapLayers.sos.some((item) => item.id === selectedItem.id) && <Link to={{ pathname: '/control-room/responder', search: location.search }} className="rail-action">Review in SOS workspace <span aria-hidden="true">→</span></Link>}
              </div>
            )}
          </section>

          <section className="evidence-rail" aria-labelledby="rule-evidence-title">
            <header className="rail-heading rail-heading--compact">
              <div><p className="situation-eyebrow">DETERMINISTIC RULE OUTPUT</p><h2 id="rule-evidence-title">Alert evidence</h2></div>
              <span className={`rule-level rule-level--${level.toLowerCase()}`}>{level}</span>
            </header>
            {simulation.sourceData ? <>
              <div className="evidence-line"><span>Muhuri gauge</span><strong>{simulation.sourceData.gauge.available ? `${simulation.sourceData.gauge.valueM.toFixed(2)} m` : 'Unavailable'}</strong></div>
              <div className="evidence-line"><span>Rainfall · scenario</span><strong>{simulation.sourceData.rainfall.available ? `${simulation.sourceData.rainfall.valueMm} mm` : 'Unavailable'}</strong></div>
              <div className="evidence-line"><span>Volunteer observation</span><strong>{simulation.sourceData.volunteerReading.available ? 'Submitted' : 'Unavailable'}</strong></div>
              <div className="rule-reasons" aria-label="Alert reason codes">
                {simulation.alert.reasonCodes?.length ? simulation.alert.reasonCodes.map((reason) => <span key={reason}>{reason}</span>) : <span className="rule-reasons__none">No reason codes returned by the rule engine</span>}
              </div>
              <p className="evidence-note">Scenario state updated {formatDhakaTime(simulation.simulatedAt)}. Rule output only; this is not a validated forecast.</p>
            </> : <p className="evidence-note">Detailed rule inputs are not available to this role.</p>}
          </section>
        </aside>
      </div>

      {canControl && <details className="exercise-controls">
        <summary><span><Activity size={16} /> Exercise controls</span><span>{simulation.running ? 'Running' : 'Paused'} · tick {simulation.tickIndex + 1}/{simulation.totalTicks}</span></summary>
        <div className="exercise-controls__body">
          <div className="exercise-controls__actions">
            <button type="button" onClick={() => void control(simulation.running ? 'pause' : 'start')}>{simulation.running ? <Pause size={15} /> : <Play size={15} />}{simulation.running ? 'Pause' : 'Start exercise'}</button>
            <button type="button" onClick={() => void control('step')}><SkipForward size={15} />Advance one tick</button>
            <button type="button" onClick={() => void control('reset')}><RotateCcw size={15} />Reset</button>
          </div>
          <label className="exercise-speed">Speed<select value={simulation.speed ?? 1} onChange={(event) => void control('speed', { speed: Number(event.target.value) })}><option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option></select></label>
          <label className="exercise-connectivity">{simulation.connectivity?.internetAvailable ? <Wifi size={15} /> : <WifiOff size={15} />}<input type="checkbox" checked={simulation.connectivity?.internetAvailable ?? true} onChange={(event) => void control('connectivity', { internetAvailable: event.target.checked })} />Scenario internet available</label>
          <button className="local-test-alert" type="button" onClick={testAlert}>Test local alert display</button>
          <span className="exercise-disclaimer">Connectivity is a scenario toggle; it does not send SMS or represent carrier delivery.</span>
          {controlError && <p className="situation-error" role="alert">{controlError}</p>}
        </div>
      </details>}

      {error && <p className="situation-warning" role="status">Last snapshot request failed; showing the previous API data. {error}</p>}
    </div>
  );
}
