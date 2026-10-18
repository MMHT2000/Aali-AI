import { useCallback, useEffect, useState } from 'react';
import { OperationsMode, OperationsSnapshotBase, OperationsSnapshotError, getOperationsSnapshot } from '../lib/operations-client';
import { ThreeTapSos } from './ThreeTapSos';

export function ViewerSituationSummary({
  mode,
  eventId,
  districtCode = 'FENI_DIST',
}: {
  mode: OperationsMode;
  eventId?: string;
  districtCode?: string;
}) {
  const isSylhet = districtCode === 'SYLHET_DIST';
  const [snapshot, setSnapshot] = useState<OperationsSnapshotBase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSignIn, setNeedsSignIn] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const result = await getOperationsSnapshot({ mode, eventId, districtCode });
      if (
        !result.visibility.aggregateOnly || result.mapLayers.sos.length > 0 ||
        result.mapLayers.incidents.length > 0 || result.mapLayers.assets.length > 0
      ) {
        throw new Error('The API did not return an aggregate-only Viewer snapshot.');
      }
      setSnapshot(result);
      setError(null);
      setNeedsSignIn(false);
    } catch (failure) {
      setNeedsSignIn(failure instanceof OperationsSnapshotError && failure.status === 401);
      setError(failure instanceof Error ? failure.message : 'Unable to load the aggregate situation summary.');
      setSnapshot(null);
    } finally {
      setLoading(false);
    }
  }, [districtCode, eventId, mode]);

  useEffect(() => {
    if (needsSignIn) return;
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15_000);
    return () => window.clearInterval(timer);
  }, [refresh, needsSignIn]);

  if (loading) return <section className="viewer-summary" aria-busy="true"><p role="status">Loading aggregate situation summary…</p></section>;
  if (needsSignIn) return <section className="viewer-summary"><h1>Sign-in required</h1><p role="alert">Your session is missing or expired. Sign in again to view the situation summary.</p><a href="/" onClick={() => {
    try { window.localStorage.removeItem('aali_session'); } catch { /* Sign-in remains available without storage. */ }
    window.dispatchEvent(new CustomEvent('aali_session_expired'));
  }}>Sign in again</a><p><a href="/sos">Submit an SOS without signing in</a></p></section>;
  if (error) return <section className="viewer-summary"><h1>Situation summary unavailable</h1><p role="alert">{error}</p><button type="button" onClick={() => { setLoading(true); void refresh(); }}>Retry</button></section>;
  if (!snapshot) return null;

  const layers = snapshot.mapLayers;
  const activeSources = snapshot.context.sources.filter((source) => source.availability !== 'UNAVAILABLE').length;
  return <section className="viewer-summary" aria-labelledby="viewer-summary-title">
    <div style={{ marginBottom: '1.5rem' }}>
      <ThreeTapSos districtCode={districtCode} />
    </div>

    <header className="viewer-summary__header">
      <div><span className="viewer-summary__eyebrow">CITIZEN UPLINK & AGGREGATE SITUATION</span>
        <h1 id="viewer-summary-title">{isSylhet ? 'Sylhet situation summary' : 'Feni situation summary'}</h1>
        <p>{snapshot.context.event?.name ?? 'Current Aali API activity'} · {snapshot.context.mode}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
        <span className="viewer-summary__badge">Zero-Install Citizen PWA Active</span>
        <span className="viewer-summary__badge">No individual SOS or rescue records</span>
      </div>
    </header>
    <dl className="viewer-summary__metrics" aria-label="Aggregate reference counts">
      <div><dt>Reference areas</dt><dd>{layers.areas.length}</dd></div>
      <div><dt>Gauge points</dt><dd>{layers.gauges.length}</dd></div>
      <div><dt>Shelters</dt><dd>{layers.shelters.length}</dd></div>
      <div><dt>Sources available</dt><dd>{activeSources} / {snapshot.context.sources.length}</dd></div>
    </dl>
    <section className="viewer-summary__sources" aria-labelledby="viewer-sources-title">
      <h2 id="viewer-sources-title">Source status</h2>
      {snapshot.context.sources.length === 0 ? <p>No source status is available.</p> : <ul>
        {snapshot.context.sources.map((source) => <li key={source.id}>
          <div><strong>{source.label}</strong><span>{source.availability.replaceAll('_', ' ')}</span></div>
          <p>{source.message}</p>
        </li>)}
      </ul>}
    </section>
    <p className="viewer-summary__disclosure">Reference layers may be synthetic or reconstructed. Source status describes availability; it does not establish that an area is safe.</p>
  </section>;
}
