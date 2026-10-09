import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOperationsSnapshot, OperationMapPoint, OperationsSnapshot, sendSimulationControl } from '../lib/operations-client';
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

function playEmergencyBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(587.33, ctx.currentTime + 0.22);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.32);
  } catch {
    // Audio blocked or not supported
  }
}

export function OperationsOverview() {
  const [snapshot, setSnapshot] = useState<OperationsSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [controlError, setControlError] = useState<string | null>(null);
  const [activeAlert, setActiveAlert] = useState<SosAlertInfo | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const knownSosIds = useRef<Set<string>>(new Set());
  const isInitialMount = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const next = await getOperationsSnapshot();
      setSnapshot(next);
      setError(null);

      const currentSos: OperationMapPoint[] = next.mapLayers?.sos ?? [];
      if (!isInitialMount.current && currentSos.length > 0) {
        const newArrivals = currentSos.filter((item) => !knownSosIds.current.has(item.id));
        if (newArrivals.length > 0) {
          const newest = newArrivals[0];
          const flags: string[] = [];
          if (newest.isTrapped) flags.push('পানিবন্দি');
          if (newest.hasChild) flags.push('শিশু');
          if (newest.elderlyCount) flags.push('বয়োবৃদ্ধ');
          if (newest.hasMedicalNeed) flags.push('চিকিৎসা');

          const alertInfo: SosAlertInfo = {
            id: newest.id,
            shortId: newest.shortId,
            title: newest.label || newest.name || 'জরুরি এসওএস প্রাপ্তি',
            location: newest.name || 'পরশুরাম / ফেনী',
            peopleCount: newest.peopleCount || 1,
            flags,
            provenance: newest.provenance || 'MOBILE_DIRECT_SOS',
            receivedAt: newest.receivedAt || new Date().toISOString(),
          };

          setActiveAlert(alertInfo);
          if (soundEnabled) {
            playEmergencyBeep();
          }
        }
      }
      currentSos.forEach((item) => knownSosIds.current.add(item.id));
      isInitialMount.current = false;
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Unable to reach operations API.');
    }
  }, [soundEnabled]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 4000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const triggerTestAlert = () => {
    playEmergencyBeep();
    setActiveAlert({
      id: `test-${Date.now()}`,
      shortId: 'TEST',
      title: 'চিথলিয়া (পরশুরাম) · ৪ জন বিপদাপন্ন',
      location: 'চিথলিয়া প্রাইমারি স্কুল সংলগ্ন',
      peopleCount: 4,
      flags: ['পানিবন্দি', 'শিশু', 'বয়োবৃদ্ধ'],
      provenance: 'MOBILE_RESIDENT_APP (Simulated D2C)',
      receivedAt: new Date().toISOString(),
    });
  };

  const control = async (action: string, body?: unknown) => {
    setControlError(null);
    try {
      await sendSimulationControl(action, body);
      await refresh();
    } catch (failure) {
      setControlError(failure instanceof Error ? failure.message : 'Simulation control failed.');
    }
  };

  if (error && !snapshot) {
    const isAuthError = error.includes('401');
    return (
      <section className="ops-state-card" role="alert">
        <h2>{isAuthError ? 'লগইন সেশনের মেয়াদ শেষ (Session Expired)' : 'Operations API unavailable'}</h2>
        <p>{isAuthError ? 'আপনার অথরাইজেশন সেশনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে পুনরায় সাইন ইন করুন।' : error}</p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'center' }}>
          {isAuthError ? (
            <button
              onClick={() => {
                try {
                  window.localStorage?.removeItem('aali_session');
                } catch {
                  // ignore
                }
                window.dispatchEvent(new CustomEvent('aali_session_expired'));
              }}
              style={{ background: '#0284c7', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              পুনরায় সাইন ইন করুন (Sign in again)
            </button>
          ) : (
            <button onClick={() => void refresh()}>Retry connection</button>
          )}
        </div>
      </section>
    );
  }
  if (!snapshot) return <section className="ops-state-card" aria-live="polite">Loading API-backed operation state…</section>;

  const simulation = snapshot.simulation;
  const level = simulation.alert.computedLevel;
  const simulatedSos = simulation.incomingSos ?? snapshot.queue.incomingSimulatedSos ?? 0;
  const liveSosList = snapshot.mapLayers.sos || [];

  return (
    <div className="ops-overview">
      {/* Real-time Emergency Audio-Visual Popup Banner */}
      {activeAlert && (
        <aside
          role="alert"
          aria-live="assertive"
          style={{
            background: 'linear-gradient(90deg, #7f1d1d, #991b1b)',
            border: '2px solid #ef4444',
            borderRadius: '8px',
            padding: '1rem 1.25rem',
            marginBottom: '1rem',
            color: '#fff',
            boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            animation: 'fadeIn 0.25s ease-in-out',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🚨</span>
              <strong style={{ fontSize: '1.05rem', color: '#fee2e2', letterSpacing: '0.02em' }}>
                নতুন জরুরি এসওএস অ্যালার্ট (NEW EMERGENCY SOS ALERT)
              </strong>
            </div>
            <button
              onClick={() => setActiveAlert(null)}
              style={{ background: 'transparent', border: 'none', color: '#fca5a5', fontSize: '1.2rem', cursor: 'pointer' }}
              aria-label="Dismiss alert"
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.85rem', background: 'rgba(0,0,0,0.25)', padding: '0.65rem 0.85rem', borderRadius: '5px' }}>
            <div>
              <span style={{ color: '#fca5a5' }}>📍 স্থান / এলাকা:</span> <strong>{activeAlert.location}</strong>
            </div>
            <div>
              <span style={{ color: '#fca5a5' }}>👥 বিপদাপন্ন ব্যক্তি:</span> <strong style={{ color: '#fbbf24' }}>{activeAlert.peopleCount} জন</strong>
            </div>
            <div>
              <span style={{ color: '#fca5a5' }}>⚠️ জরুরী ঝুঁকি ফ্ল্যাগ:</span> <strong>{activeAlert.flags.length > 0 ? activeAlert.flags.join(' · ') : 'সাধারণ উদ্ধার'}</strong>
            </div>
            <div>
              <span style={{ color: '#fca5a5' }}>📡 নেটওয়ার্ক উৎস:</span> <code style={{ color: '#93c5fd' }}>{activeAlert.provenance}</code>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#fecaca' }}>
              সময়: {new Date(activeAlert.receivedAt).toLocaleTimeString('en-GB', { timeZone: 'Asia/Dhaka' })} BST
            </span>
            <Link
              to="/control-room/responder"
              style={{
                background: '#ea580c',
                color: '#fff',
                textDecoration: 'none',
                padding: '0.45rem 0.9rem',
                borderRadius: '4px',
                fontSize: '0.82rem',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              🚤 উদ্ধারকারী বোট পাঠান (Dispatch Boat)
            </Link>
            <button
              onClick={() => setActiveAlert(null)}
              style={{ background: '#374151', color: '#e5e7eb', border: 'none', padding: '0.45rem 0.8rem', borderRadius: '4px', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              স্বীকার করুন (Dismiss)
            </button>
          </div>
        </aside>
      )}

      <header className="ops-page-heading">
        <div>
          <span className="eyebrow">FENI DISTRICT · CENTRAL OPERATIONS</span>
          <h1>Situation overview</h1>
          <p>Shared operational picture from the Aali API.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            style={{
              background: soundEnabled ? '#0f766e' : '#334155',
              color: '#fff',
              border: '1px solid #14b8a6',
              padding: '0.35rem 0.65rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
            title="টগল অ্যালার্ট শব্দ"
          >
            {soundEnabled ? '🔊 অ্যালার্ট সাউন্ড চালু' : '🔇 নিঃশব্দ'}
          </button>
          <button
            onClick={triggerTestAlert}
            style={{
              background: '#0284c7',
              color: '#fff',
              border: 'none',
              padding: '0.35rem 0.65rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            🔔 টেস্ট অ্যালার্ট
          </button>
          <div className="ops-updated">
            <span className="status-dot" />
            API snapshot<br />
            <small>{new Date(snapshot.generatedAt).toLocaleTimeString('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit' })} BST</small>
          </div>
        </div>
      </header>

      <section className="exercise-banner" aria-label="Simulation status">
        <div><span className="exercise-live-dot" /><strong>SYNTHETIC EXERCISE</strong><span>{simulation.scenarioName}</span><small>API fixture · not a live flood feed · no pretrained forecast model</small></div>
        <span className="exercise-tick">TICK {simulation.tickIndex + 1} / {simulation.totalTicks}</span>
      </section>

      <section className="ops-kpis" aria-label="Operational indicators">
        <article className={`ops-kpi ops-kpi--${level.toLowerCase()}`}><span>RULE ALERT LEVEL</span><strong>{level}</strong><small>{simulation.alert.reasonCodes?.length ? simulation.alert.reasonCodes.join(' · ') : 'No configured signal threshold crossed'}</small></article>
        <article className="ops-kpi"><span>OPEN INCIDENTS</span><strong>{snapshot.queue.activeIncidents ?? '—'}</strong><small>{snapshot.queue.strandedPeople ?? '—'} people in fixture incidents</small></article>
        <article className="ops-kpi" style={{ borderLeft: liveSosList.length > 0 ? '4px solid #ea580c' : undefined }}>
          <span>LIVE RESIDENT SOS</span>
          <strong style={{ color: liveSosList.length > 0 ? '#f97316' : 'inherit' }}>{liveSosList.length}</strong>
          <small>{simulatedSos} scenario simulation activities</small>
        </article>
        <article className="ops-kpi"><span>RIVER GAUGE</span><strong>{simulation.sourceData?.gauge.available ? `${simulation.sourceData.gauge.valueM.toFixed(2)} m` : 'STALE'}</strong><small>{simulation.sourceData?.gauge.source ?? 'Evidence hidden for this role'}</small></article>
      </section>

      <div className="ops-main-grid">
        <OperationsMap layers={snapshot.mapLayers} />
        <aside className="ops-right-rail">
          {/* Live Mobile / Resident SOS Feed */}
          <section className="ops-panel" style={{ border: '1px solid #c2410c', background: '#1c1917' }}>
            <div className="ops-panel-heading">
              <div>
                <span className="eyebrow" style={{ color: '#fb923c' }}>REAL-TIME FEED</span>
                <h2 style={{ color: '#ffedd5' }}>🚨 লাইভ এসওএস রিপোর্ট ({liveSosList.length})</h2>
              </div>
              <span style={{ background: '#7c2d12', color: '#fed7aa', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                LIVE
              </span>
            </div>
            {liveSosList.length === 0 ? (
              <p className="muted">মোবাইল অ্যাপ বা D2C গেটওয়ে থেকে এখনও কোনো এসওএস রিপোর্ট জমা পড়েনি। অ্যান্ড্রয়েড অ্যাপ থেকে এসওএস পাঠালে এখানে তৎক্ষণাৎ যুক্ত হবে।</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
                {liveSosList.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#292524',
                      border: '1px solid #44403c',
                      borderRadius: '5px',
                      padding: '0.55rem 0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.8rem', color: '#fed7aa' }}>
                        {item.label ?? item.name}
                      </strong>
                      <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem', borderRadius: '3px', background: item.status === 'NEEDS_REVIEW' ? '#7f1d1d' : '#1e3a5f', color: '#fff' }}>
                        {item.status ?? 'RECEIVED'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#a8a29e' }}>
                      <span>বিপদাপন্ন: <strong style={{ color: '#fbbf24' }}>{item.peopleCount ?? 1} জন</strong></span>
                      {' · '}
                      <span>উৎস: <code style={{ color: '#93c5fd' }}>{item.provenance}</code></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                      <Link
                        to="/control-room/responder"
                        style={{ fontSize: '0.72rem', color: '#fb923c', textDecoration: 'underline' }}
                      >
                        রেসকিউ টিম নিয়োগ করুন →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="provenance-note" style={{ marginTop: '0.5rem' }}>
              মোবাইল ও D2C রিলে সরাসরি এই কেন্দ্রীয় তালিকায় রিয়েল-টাইম আপডেট হয়।
            </p>
          </section>

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
