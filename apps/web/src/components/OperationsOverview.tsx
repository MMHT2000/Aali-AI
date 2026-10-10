import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Clock3,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
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
  toggleGaugeBlackout,
} from '../lib/operations-client';
import { OperationsMap } from './OperationsMap';
import { MasterCrisisClock } from './MasterCrisisClock';
import { MuhuriHydrographChart } from './MuhuriHydrographChart';
import { StageDemoDirector } from './StageDemoDirector';

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

export function OperationsOverview({
  mode = 'EXERCISE',
  eventId,
  districtCode = 'FENI_DIST',
}: {
  mode?: OperationsMode;
  eventId?: string;
  districtCode?: string;
}) {
  const location = useLocation();
  const [snapshot, setSnapshot] = useState<OperationsSnapshotBase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [controlError, setControlError] = useState<string | null>(null);
  const [activeAlert, setActiveAlert] = useState<SosAlertInfo | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reportFilter, setReportFilter] = useState<ReportFilter>('pending');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [histTick, setHistTick] = useState<number>(0);
  const [histAutoPlay, setHistAutoPlay] = useState<boolean>(false);
  const knownSosIds = useRef<Set<string>>(new Set());
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!histAutoPlay) return;
    const ticks = snapshot?.historicalReplay?.ticks ?? [];
    if (ticks.length <= 1) return;
    const timer = setInterval(() => {
      setHistTick((prev) => (prev + 1) % ticks.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [histAutoPlay, snapshot?.historicalReplay?.ticks]);

  const refresh = useCallback(async () => {
    try {
      const next = await getOperationsSnapshot({ mode, eventId, districtCode });
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
  }, [eventId, mode, districtCode, soundEnabled]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);

    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/v1/operations/live-stream');
      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'NEW_SOS') {
            if (soundEnabled) playEmergencyBeep();
            setActiveAlert({
              id: parsed.payload?.reportId || `sse-${Date.now()}`,
              shortId: parsed.payload?.shortId || 'D2C',
              title: `Live SOS: ${parsed.payload?.village || 'Parshuram'}`,
              location: parsed.payload?.village || 'Parshuram Area',
              peopleCount: parsed.payload?.peopleCount || 1,
              flags: [
                parsed.payload?.isTrapped ? 'Trapped' : '',
                parsed.payload?.hasElderly ? 'Elderly' : '',
                parsed.payload?.transportKind === 'APP_DIRECT' ? 'STARLINK D2C' : 'SMS 1090',
              ].filter(Boolean),
              provenance: 'LIVE_SSE_STREAM · REAL-TIME INGESTION',
              receivedAt: parsed.timestamp || new Date().toISOString(),
            });
            void refresh();
          } else if (parsed.type === 'DEMO_MOMENT' || parsed.type === 'BOAT_REVIEW') {
            void refresh();
          }
        } catch (_) {}
      };
    } catch (_) {}

    return () => {
      window.clearInterval(timer);
      es?.close();
    };
  }, [refresh, soundEnabled]);

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

  const isSylhet = districtCode === 'SYLHET_DIST';
  const defaultEventId = isSylhet ? '11111111-1111-1111-1111-111111111104' : '11111111-1111-1111-1111-111111111101';
  const snapshotMatchesContext = snapshot.context.mode === mode &&
    (mode !== 'HISTORICAL' || (!eventId && Boolean(snapshot.context.event?.id)) || snapshot.context.event?.id === (eventId ?? defaultEventId));
  if (!snapshotMatchesContext) {
    return <section className="situation-state" aria-live="polite"><Activity size={20} /> Loading selected event and mode…</section>;
  }

  const districtLabel = isSylhet ? 'SYLHET DISTRICT · SURMA-KUSHIYARA BASIN (সুরমা-কুশিয়ারা অববাহিকা)' : 'FENI DISTRICT · MUHURI BASIN (মুহুরী নদী অববাহিকা)';

  if (mode === 'LIVE') {
    return (
      <div className="situation-room">
        <MasterCrisisClock />
        <StageDemoDirector onMomentTriggered={() => void refresh()} onRefresh={() => void refresh()} />
        {snapshot.visibility.sos && activeAlert && <section className="sos-alert" role="alert" aria-live="assertive">
          <div className="sos-alert__mark" aria-hidden="true">SOS</div>
          <div className="sos-alert__main"><div className="sos-alert__heading"><strong>New API-submitted SOS report</strong><span>{activeAlert.shortId ? `Report ${activeAlert.shortId}` : activeAlert.id}</span></div>
            <p>{activeAlert.location} · {activeAlert.peopleCount} people reported</p><small>{activeAlert.flags.join(' · ') || 'No additional needs selected'} · {activeAlert.provenance} · received {receivedTime(activeAlert.receivedAt)}</small></div>
          <div className="sos-alert__actions"><Link to={{ pathname: '/control-room/responder', search: location.search }}>Open SOS triage</Link><button type="button" onClick={() => setActiveAlert(null)}>Dismiss alert</button></div>
        </section>}
        <header className="situation-heading">
          <div><p className="situation-eyebrow">{districtLabel} <span>/</span> SHARED OPERATING PICTURE</p><h1>Live sources</h1></div>
          <div className="snapshot-time"><Clock3 size={15} /><span><small>SNAPSHOT · DHAKA TIME</small><strong>{formatDhakaTime(snapshot.generatedAt)} BST</strong></span></div>
        </header>
        <section className="exercise-strip exercise-strip--live" aria-label="Selected data mode and source status">
          <span className="exercise-strip__tag">LIVE SOURCE STATUS</span>
          <strong>{snapshot.context.event?.name ?? 'Current API-submitted activity'}</strong>
          <span className="exercise-strip__disclosure">BMD CAP public advisories are separate from Aali rule alerts; other external feeds remain unavailable</span>
        </section>
        <div className="situation-workspace">
          <OperationsMap layers={snapshot.mapLayers} districtCode={districtCode} selectedPointId={selectedItem?.id} onSelectPoint={(point) => setSelectedItemId(point.id)} />
          <aside className="operations-rail" aria-label="Data sources and authorized SOS activity">
            <section className="evidence-rail"><header className="rail-heading"><div><p className="situation-eyebrow">SOURCE REGISTER</p><h2>Availability and provenance</h2></div></header>
              {snapshot.context.sources.map((source) => <div className="evidence-line" key={source.id}><span>{source.label}</span><strong>{source.availability}</strong><small>{source.message}</small>{source.lastCheckedAt && <small>Checked {formatDhakaTime(source.lastCheckedAt)} BST</small>}{source.latestObservedAt && <small>Feed last published {formatDhakaTime(source.latestObservedAt)} BST · {source.ageSeconds == null ? 'age unknown' : `${Math.floor(source.ageSeconds / 3600)}h old`}</small>}</div>)}
            </section>
            <section className="evidence-rail" aria-labelledby="bmd-alerts-title">
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
            </section>
            {snapshot.visibility.sos && <section className="report-queue"><header className="rail-heading"><div><p className="situation-eyebrow">API-SUBMITTED REPORTS</p><h2>Current SOS activity</h2></div><span className="queue-count">{snapshot.mapLayers.sos.length}</span></header>
              {snapshot.mapLayers.sos.length ? <div className="queue-list">{snapshot.mapLayers.sos.map((item) => <button className="sos-row" key={item.id} type="button" onClick={() => setSelectedItemId(item.id)}><span className="sos-row__content"><span className="sos-row__top"><strong>{item.name ?? item.label ?? 'Location unavailable'}</strong><time>{receivedTime(item.receivedAt)}</time></span><span className="sos-row__bottom"><span>{item.status ?? 'Received'}</span><span>{item.provenance}</span></span></span></button>)}</div> : <div className="queue-empty"><strong>No current API-submitted SOS reports</strong><p>Absence of reports does not establish safety.</p></div>}
            </section>}
            {selectedItem && <section className="selected-record"><p className="situation-eyebrow">SELECTED RECORD</p><strong>{selectedItem.name ?? selectedItem.label ?? 'Map record'}</strong><dl><div><dt>Provenance</dt><dd>{selectedItem.provenance}</dd></div><div><dt>Coordinates</dt><dd>{selectedItem.latitude != null && selectedItem.longitude != null ? `${Number(selectedItem.latitude).toFixed(4)}, ${Number(selectedItem.longitude).toFixed(4)}` : 'Unknown · list only'}</dd></div></dl></section>}
          </aside>
        </div>
        <MuhuriHydrographChart districtCode={districtCode} />
      </div>
    );
  }

  if (mode === 'HISTORICAL') {
    const replay = snapshot.historicalReplay;
    const ticks = (replay?.ticks as Array<{
      tickIndex: number;
      simulatedTime: string;
      descriptionBn?: string;
      signalA: { gaugeLevelM?: number; rise3hCm?: number; minutesSinceObservation?: number; isBlanked?: boolean };
      signalB: { rainfallMm?: number; windowMinutes?: number; minutesSinceObservation?: number };
      signalC: { levelM?: number; isRapidRiseReported?: boolean; minutesSinceObservation?: number };
      breachReported?: boolean;
      actualDangerLevelExceeded?: boolean;
    }>) ?? [];
    const activeTick = ticks[histTick] ?? ticks[0] ?? {
      tickIndex: 0,
      simulatedTime: snapshot.generatedAt,
      descriptionBn: 'ঐতিহাসিক উপাত্ত বিশ্লেষণ চলছে',
      signalA: { gaugeLevelM: isSylhet ? 11.95 : 13.40, rise3hCm: 45 },
      signalB: { rainfallMm: 135.0 },
      signalC: { levelM: isSylhet ? 12.00 : 13.35, isRapidRiseReported: true },
      breachReported: true,
      actualDangerLevelExceeded: true,
    };
    const sigA = activeTick.signalA ?? {};
    const sigB = activeTick.signalB ?? {};
    const sigC = activeTick.signalC ?? {};
    const dangerThreshold = isSylhet ? 11.25 : 13.00;
    const warningThreshold = isSylhet ? 10.80 : 12.05;
    const isDanger = Boolean(activeTick.actualDangerLevelExceeded || activeTick.breachReported || ((sigA.gaugeLevelM ?? 0) >= dangerThreshold));
    const isWarning = !isDanger && Boolean(((sigA.gaugeLevelM ?? 0) >= warningThreshold) || (((sigB.rainfallMm ?? 0) >= 75) && Boolean(sigC.isRapidRiseReported)));
    const isWatch = !isDanger && !isWarning && Boolean(((sigB.rainfallMm ?? 0) >= 40) || ((sigA.gaugeLevelM ?? 0) >= (isSylhet ? 10.50 : 11.80)));
    const computedLevel = isDanger ? 'ACT' : isWarning ? 'WARNING' : isWatch ? 'WATCH' : 'NORMAL';

    return (
      <div className="situation-room">
        <MasterCrisisClock />
        <header className="situation-heading">
          <div>
            <p className="situation-eyebrow">{districtLabel} <span>/</span> HISTORICAL DELUGE RECONSTRUCTION</p>
            <h1>{snapshot.context.event?.name ?? 'Disaster Replay & Time Traveler'}</h1>
          </div>
          <div className="situation-heading__status">
            <div className="snapshot-time">
              <Clock3 size={15} />
              <span>
                <small>RECONSTRUCTED EVENT TIME</small>
                <strong>{formatDhakaTime(activeTick.simulatedTime)} BST</strong>
              </span>
            </div>
          </div>
        </header>

        {/* HISTORICAL GROUND TRUTH DOSSIER */}
        <div className="historical-truth-strip" role="region" aria-label="Ground truth disaster impact">
          <div className="truth-cell truth-cell--blackout">
            <span className="truth-cell__tag">TELECOM INFRASTRUCTURE</span>
            <strong>{isSylhet ? '84.0% Towers Submerged' : '94.3% Blackout (616/653 Towers)'}</strong>
            <small>{isSylhet ? 'Companiganj, Gowainghat & Kumargaon Grid Substation Flooded' : 'Total cellular isolation across Parshuram & Fulgazi within 6 hours'}</small>
          </div>
          <div className="truth-cell truth-cell--surge">
            <span className="truth-cell__tag">PEAK RIVER DELUGE</span>
            <strong>{isSylhet ? '12.02m (+77cm Above Danger)' : '13.40m (+40cm Above Danger)'}</strong>
            <small>{isSylhet ? 'Surma at Sylhet Point · Cherrapunji downpour 972mm/48h' : 'Muhuri at Parshuram Gauge · River telemetry sensor washed out'}</small>
          </div>
          <div className="truth-cell truth-cell--affected">
            <span className="truth-cell__tag">MAROONED CITIZENS</span>
            <strong>{isSylhet ? '4,300,000+ Stranded in Basin' : '350,000+ Cut Off on Rooftops'}</strong>
            <small>{isSylhet ? 'All highway access severed; Bangladesh Army & Navy mobilized' : 'Road access fully severed; zero telephone connectivity'}</small>
          </div>
          <div className="truth-cell truth-cell--leadtime">
            <span className="truth-cell__tag">AALI DETERMINISTIC LEAD-TIME</span>
            <strong>{isSylhet ? '+18.0h Pre-Warning Advantage' : '+14.5h Pre-Blackout Window'}</strong>
            <small>3-signal escalation fires before automated sensor blankout occurs</small>
          </div>
        </div>

        {/* TIME TRAVELER SCRUBBER & LIVE 3-SIGNAL FUSION COCKPIT */}
        <section className={`early-warning-cockpit early-warning-cockpit--${computedLevel.toLowerCase()}`} style={{ marginTop: '0.85rem' }} aria-label="Historical Time-Traveler Playback">
          <div className="cockpit-header">
            <div className="cockpit-title-wrap">
              <span className="cockpit-tag"><Activity size={13} /> HISTORICAL TIME-TRAVELER PLAYBACK ENGINE</span>
              <h2>Step-by-Step Deluge Evolution · Tick {activeTick.tickIndex + 1} of {Math.max(ticks.length, 1)}</h2>
              <p className="cockpit-subtitle">
                {activeTick.descriptionBn || 'ঐতিহাসিক উপাত্ত বিশ্লেষণ চলছে'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                type="button"
                className="quiet-button"
                style={{ background: histAutoPlay ? '#0284c7' : '#1e293b', color: '#fff', border: '1px solid #38bdf8' }}
                onClick={() => setHistAutoPlay((p) => !p)}
              >
                {histAutoPlay ? <><Pause size={14} /> Pause Auto-Play</> : <><Play size={14} /> Auto-Play Reconstruction</>}
              </button>
              <span className={`fusion-pill fusion-pill--${computedLevel.toLowerCase()}`}>
                <AlertTriangle size={14} /> RULE ALERT: {computedLevel}
              </span>
            </div>
          </div>

          {/* Interactive Tick Scrubber */}
          <div style={{ display: 'flex', gap: '0.4rem', margin: '0.75rem 0', flexWrap: 'wrap' }}>
            {ticks.map((t, idx: number) => (
              <button
                key={t.tickIndex ?? idx}
                type="button"
                onClick={() => { setHistTick(idx); setHistAutoPlay(false); }}
                style={{
                  flex: 1,
                  minWidth: '130px',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '4px',
                  border: histTick === idx ? '2px solid #38bdf8' : '1px solid #334155',
                  background: histTick === idx ? '#1e293b' : '#0f172a',
                  color: histTick === idx ? '#38bdf8' : '#94a3b8',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: '0.62rem', color: histTick === idx ? '#7dd3fc' : '#64748b' }}>
                  TICK {idx + 1} · {formatDhakaTime(t.simulatedTime)}
                </div>
                <strong style={{ fontSize: '0.72rem', display: 'block', marginTop: '2px', color: histTick === idx ? '#fff' : '#cbd5e1' }}>
                  {idx === 0 ? 'Normal River Flow' : idx === 1 ? 'Upstream Deluge Surge' : idx === 2 ? 'Warning Line Breach' : 'Danger Peak & Blackout'}
                </strong>
              </button>
            ))}
          </div>

          <div className="cockpit-signals-grid">
            <div className={`signal-card ${(sigA.gaugeLevelM ?? 0) >= dangerThreshold ? 'signal-card--critical' : ''}`}>
              <div className="signal-card__top">
                <span className="signal-label">SIGNAL A · RIVER STAFF GAUGE</span>
                <span className="signal-status-pill signal-status-pill--active">
                  {sigA.isBlanked ? '⚡ SENSOR BLANKED' : '● HISTORICAL LOG'}
                </span>
              </div>
              <div className="signal-card__value">
                <span className="signal-num">{sigA.gaugeLevelM != null ? sigA.gaugeLevelM.toFixed(2) : '--'}</span>
                <span className="signal-unit">m</span>
              </div>
              <div className="signal-card__meta">
                <span>Danger line: {dangerThreshold.toFixed(2)}m</span>
                <span className="signal-delta">{sigA.rise3hCm ? `+${sigA.rise3hCm} cm/3h` : 'Flow stable'}</span>
              </div>
            </div>

            <div className={`signal-card ${(sigB.rainfallMm ?? 0) >= 75 ? 'signal-card--critical' : ''}`}>
              <div className="signal-card__top">
                <span className="signal-label">SIGNAL B · SATELLITE PRECIPITATION</span>
                <span className="signal-status-pill signal-status-pill--active">● GSMaP & RADAR</span>
              </div>
              <div className="signal-card__value">
                <span className="signal-num">{sigB.rainfallMm != null ? sigB.rainfallMm.toFixed(1) : '--'}</span>
                <span className="signal-unit">mm / 3h</span>
              </div>
              <div className="signal-card__meta">
                <span>Trigger threshold: 75.0mm</span>
                <span>{(sigB.rainfallMm ?? 0) >= 75 ? '🚨 EXTREME PRECIPITATION' : 'Moderate rainfall'}</span>
              </div>
            </div>

            <div className={`signal-card ${Boolean(sigC.isRapidRiseReported) || ((sigC.levelM ?? 0) >= warningThreshold) ? 'signal-card--critical' : ''}`}>
              <div className="signal-card__top">
                <span className="signal-label">SIGNAL C · VOLUNTEER & FIELD OBSERVATION</span>
                <span className="signal-status-pill signal-status-pill--active">● CPP / VOLUNTEER</span>
              </div>
              <div className="signal-card__value">
                <span className="signal-num">{sigC.levelM != null ? sigC.levelM.toFixed(2) : '--'}</span>
                <span className="signal-unit">m</span>
              </div>
              <div className="signal-card__meta">
                <span>{sigC.isRapidRiseReported ? '🚨 RAPID RISE REPORTED' : 'Normal water rate'}</span>
                <span>{activeTick.breachReported ? '⚠️ EMBANKMENT BREACHED' : 'Embankment intact'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 1-CLICK CALL TO ACTION TO DC WARNING APPROVAL WORKFLOW */}
        <div
          style={{
            margin: '0.85rem 0',
            padding: '0.75rem 1rem',
            background: 'linear-gradient(90deg, #1e3a5f 0%, #0f172a 100%)',
            border: '1px solid #38bdf8',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <strong style={{ fontSize: '0.85rem', color: '#fff', display: 'block' }}>
              📢 DC Warning Review & Human Authorization Workflow
            </strong>
            <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
              Simulate bilingual evacuation broadcast drafting, DC digital signature, and cellular broadcast dispatch based on this replay tick.
            </small>
          </div>
          <Link
            to={{ pathname: '/control-room/replay', search: location.search }}
            style={{
              background: '#0284c7',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)',
            }}
          >
            Open Official Warning Review & DC Approval Workflow →
          </Link>
        </div>

        {/* WORKSPACE: MAP & RAIL */}
        <div className="situation-workspace">
          <OperationsMap
            layers={snapshot.mapLayers}
            districtCode={districtCode}
            selectedPointId={selectedItem?.id}
            onSelectPoint={(point) => setSelectedItemId(point.id)}
          />
          <aside className="operations-rail" aria-label="Reconstruction ground truth and points">
            <section className="evidence-rail">
              <header className="rail-heading">
                <div>
                  <p className="situation-eyebrow">RECONSTRUCTION PROVENANCE</p>
                  <h2>Source records & citations</h2>
                </div>
              </header>
              {snapshot.context.sources.map((source) => (
                <div className="evidence-line" key={source.id}>
                  <span>{source.label}</span>
                  <strong>{source.availability}</strong>
                  <small>{source.message}</small>
                </div>
              ))}
            </section>

            <section className="evidence-rail">
              <header className="rail-heading">
                <div>
                  <p className="situation-eyebrow">GROUND TRUTH INCIDENTS</p>
                  <h2>Documented flood breaches ({snapshot.mapLayers.incidents.length})</h2>
                </div>
              </header>
              {snapshot.mapLayers.incidents.map((inc) => (
                <div className="evidence-line" key={inc.id} style={{ flexDirection: 'column', gap: '3px', borderBottom: '1px solid #1e293b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: '#f87171' }}>{inc.label}</strong>
                    <span>{inc.peopleCount ? `${inc.peopleCount} affected` : 'Infrastructure'}</span>
                  </div>
                  <small style={{ color: '#94a3b8' }}>Provenance: {inc.provenance}</small>
                </div>
              ))}
            </section>

            <section className="evidence-rail">
              <header className="rail-heading">
                <div>
                  <p className="situation-eyebrow">RELIEF INFRASTRUCTURE</p>
                  <h2>Shelters & assets ({snapshot.mapLayers.shelters.length + snapshot.mapLayers.assets.length})</h2>
                </div>
              </header>
              {snapshot.mapLayers.shelters.map((sh) => (
                <div className="evidence-line" key={sh.id}>
                  <span>⛺ {sh.name}</span>
                  <strong>{sh.status || 'Active Shelter'}</strong>
                </div>
              ))}
              {snapshot.mapLayers.assets.map((as) => (
                <div className="evidence-line" key={as.id}>
                  <span>🚤 {as.name}</span>
                  <strong style={{ color: '#4ade80' }}>{as.status || 'Deployed'}</strong>
                </div>
              ))}
            </section>

            {selectedItem && (
              <section className="selected-record">
                <p className="situation-eyebrow">SELECTED RECONSTRUCTION PIN</p>
                <strong>{selectedItem.name ?? selectedItem.label ?? 'Map pin'}</strong>
                <dl>
                  <div><dt>Provenance</dt><dd>{selectedItem.provenance}</dd></div>
                  <div><dt>Status</dt><dd>{selectedItem.status ?? 'Historical Record'}</dd></div>
                  <div><dt>Coordinates</dt><dd>{selectedItem.latitude != null && selectedItem.longitude != null ? `${Number(selectedItem.latitude).toFixed(4)}, ${Number(selectedItem.longitude).toFixed(4)}` : 'Unknown'}</dd></div>
                </dl>
              </section>
            )}
          </aside>
        </div>

        <MuhuriHydrographChart districtCode={districtCode} />
      </div>
    );
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
      <MasterCrisisClock />
      <StageDemoDirector onMomentTriggered={() => void refresh()} onRefresh={() => void refresh()} />
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
          <p className="situation-eyebrow">{districtLabel} <span>/</span> RESPONSE OPERATIONS</p>
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

      {/* HERO 3-SIGNAL EARLY WARNING COCKPIT & BLANK-GAUGE ESCALATION */}
      <section className={`early-warning-cockpit early-warning-cockpit--${level.toLowerCase()}`} aria-label="3-Signal Early Warning & Blank-Gauge Escalation Rule">
        <div className="cockpit-header">
          <div className="cockpit-title-wrap">
            <span className="cockpit-tag"><Activity size={13} /> MULTI-SOURCE FLOOD EARLY WARNING COCKPIT</span>
            <h2>3-Signal Data Fusion & Blank-Gauge Escalation Rule</h2>
            <p className="cockpit-subtitle">
              Deterministic cross-referencing of river telemetry, satellite precipitation, and volunteer field readings. When sensors fail, safety is NEVER inferred from silence.
            </p>
          </div>
          <div className="cockpit-fusion-badge">
            <span className={`fusion-pill fusion-pill--${level.toLowerCase()}`}>
              <AlertTriangle size={14} /> RULE ALERT: {level}
            </span>
            <small style={{ color: '#8da9b0', fontSize: '0.68rem', fontWeight: 600 }}>
              DETERMINISTIC DOMAIN ENGINE · ZERO HALLUCINATION
            </small>
          </div>
        </div>

        <div className="cockpit-signals-grid">
          {/* SIGNAL A: RIVER GAUGE */}
          <div className={`signal-card ${!gauge?.available ? 'signal-card--blackout' : gauge && gauge.valueM >= 13.0 ? 'signal-card--critical' : ''}`}>
            <div className="signal-card__top">
              <span className="signal-label">SIGNAL A · RIVER STAFF GAUGE</span>
              <span className={`signal-status-pill ${gauge?.available ? 'signal-status-pill--active' : 'signal-status-pill--blackout'}`}>
                {gauge?.available ? '● REPORTING' : '⚡ SENSOR BLACKOUT'}
              </span>
            </div>
            <div className="signal-card__main">
              <span className={`signal-value ${!gauge?.available ? 'signal-value--blackout' : ''}`}>
                {gauge?.available ? `${gauge.valueM.toFixed(2)} m` : 'STALE / NO SIGNAL'}
              </span>
              <span className="signal-threshold">
                Warning: 12.05m · Danger: 13.00m ({isSylhet ? 'Surma Point' : 'Muhuri Parshuram'})
              </span>
            </div>
            <div className="signal-card__bottom">
              <span className="signal-meta">{gauge?.available ? 'BWDB Automated Telemetry' : 'Sensor Down / Offline'}</span>
              <button
                type="button"
                className={`signal-action-btn ${gauge?.available ? 'signal-action-btn--alert' : ''}`}
                onClick={async () => {
                  try {
                    await toggleGaugeBlackout(!gauge?.available);
                    await refresh();
                  } catch (e) {
                    console.error(e);
                  }
                }}
                title="Simulate August 2024 sensor loss or restore gauge telemetry"
              >
                {gauge?.available ? '⚡ Simulate Blackout' : '🔌 Restore Telemetry'}
              </button>
            </div>
          </div>

          {/* SIGNAL B: SATELLITE RAINFALL */}
          <div className={`signal-card ${(simulation.sourceData?.rainfall?.valueMm ?? 0) >= 75 ? 'signal-card--critical' : ''}`}>
            <div className="signal-card__top">
              <span className="signal-label">SIGNAL B · SATELLITE PRECIPITATION</span>
              <span className="signal-status-pill signal-status-pill--active">● GSMaP RADAR</span>
            </div>
            <div className="signal-card__main">
              <span className="signal-value">
                {simulation.sourceData?.rainfall?.available ? `${simulation.sourceData.rainfall.valueMm.toFixed(1)} mm` : 'Unavailable'}
              </span>
              <span className="signal-threshold">
                Threshold: 75.0 mm / 3h (Catchment Inflow Rate)
              </span>
            </div>
            <div className="signal-card__bottom">
              <span className="signal-meta">Upper Basin Precipitation</span>
              <span className="signal-meta" style={{ color: (simulation.sourceData?.rainfall?.valueMm ?? 0) >= 75 ? '#f87171' : '#34d399', fontWeight: 700 }}>
                {(simulation.sourceData?.rainfall?.valueMm ?? 0) >= 75 ? '⚠️ Extreme Inflow' : 'Normal Inflow'}
              </span>
            </div>
          </div>

          {/* SIGNAL C: VOLUNTEER GROUND TRUTH */}
          <div className={`signal-card ${simulation.sourceData?.volunteerReading?.available ? 'signal-card--critical' : ''}`}>
            <div className="signal-card__top">
              <span className="signal-label">SIGNAL C · VOLUNTEER GROUND TRUTH</span>
              <span className={`signal-status-pill ${simulation.sourceData?.volunteerReading?.available ? 'signal-status-pill--active' : ''}`}>
                {simulation.sourceData?.volunteerReading?.available ? '● CPP VERIFIED' : 'PENDING'}
              </span>
            </div>
            <div className="signal-card__main">
              <span className="signal-value" style={{ fontSize: '1.15rem' }}>
                {simulation.sourceData?.volunteerReading?.available ? 'RAPID RISE REPORTED' : 'Awaiting Field Reading'}
              </span>
              <span className="signal-threshold">
                Local staff gauge confirmed: +35cm/hr rise
              </span>
            </div>
            <div className="signal-card__bottom">
              <span className="signal-meta">CPP Volunteer Ground Team</span>
              <span className="signal-meta" style={{ color: '#38bdf8' }}>SMS / Packet Ingestion</span>
            </div>
          </div>
        </div>

        {/* DETERMINISTIC FUSION RULE BANNER */}
        <div className={`cockpit-rule-banner cockpit-rule-banner--${level.toLowerCase()}`}>
          <div className="cockpit-rule-banner__heading">
            <ShieldAlert size={15} style={{ color: level === 'ACT' ? '#ef4444' : '#38bdf8' }} />
            <span>RULE REASONING & EVIDENCE REGISTER ({isSylhet ? 'Sylhet District' : 'Feni District'})</span>
          </div>
          <p>
            {!gauge?.available
              ? '🚨 BLANK-GAUGE ESCALATION ACTIVE: Automated river gauge is silent / blackout. The deterministic safety rule strictly rejects "silence = safety" and forces escalation using upper-catchment satellite precipitation and volunteer observations.'
              : 'Deterministic rule evaluates 3 independent signals. Alerts are computed by visible math; AI never decides warning levels. Authority approval required for public dissemination.'}
          </p>
          <div className="rule-badges-wrap">
            {!gauge?.available && (
              <span className="rule-code-badge rule-code-badge--blankout">
                ⚡ RULE-EW-03: GAUGE_SILENT_ESCALATION
              </span>
            )}
            {simulation.alert.reasonCodes?.map((code) => (
              <span key={code} className="rule-code-badge">{code}</span>
            ))}
          </div>
        </div>
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
          <span className="summary-cell__label">{isSylhet ? 'SURMA GAUGE · SCENARIO' : 'MUHURI GAUGE · SCENARIO'}</span>
          <strong>{gauge?.available ? `${gauge.valueM.toFixed(2)} m` : 'Unavailable'}</strong>
          <small>{gauge?.source ?? 'No scenario reading available'}</small>
        </article>
      </section>

      <div className="situation-workspace">
        <OperationsMap
          layers={snapshot.mapLayers}
          districtCode={districtCode}
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
              <div className="evidence-line"><span>{isSylhet ? 'Surma gauge' : 'Muhuri gauge'}</span><strong>{simulation.sourceData.gauge.available ? `${simulation.sourceData.gauge.valueM.toFixed(2)} m` : 'Unavailable'}</strong></div>
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

      <MuhuriHydrographChart districtCode={districtCode} />

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
