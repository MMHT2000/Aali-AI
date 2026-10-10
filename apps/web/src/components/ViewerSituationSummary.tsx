import { useCallback, useEffect, useState } from 'react';
import { OperationsMode, OperationsSnapshotBase, getOperationsSnapshot } from '../lib/operations-client';

export function ViewerSituationSummary({ mode, eventId }: { mode: OperationsMode; eventId?: string }) {
  const [snapshot, setSnapshot] = useState<OperationsSnapshotBase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const result = await getOperationsSnapshot({ mode, eventId });
      if (
        !result.visibility.aggregateOnly || result.mapLayers.sos.length > 0 ||
        result.mapLayers.incidents.length > 0 || result.mapLayers.assets.length > 0
      ) {
        throw new Error('The API did not return an aggregate-only Viewer snapshot.');
      }
      setSnapshot(result);
      setError(null);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Unable to load the aggregate situation summary.');
      setSnapshot(null);
    } finally {
      setLoading(false);
    }
  }, [eventId, mode]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  if (loading) return <section className="viewer-summary" aria-busy="true"><p role="status">Loading aggregate situation summary…</p></section>;
  if (error) return <section className="viewer-summary"><h1>Situation summary unavailable</h1><p role="alert">{error}</p><button type="button" onClick={() => { setLoading(true); void refresh(); }}>Retry</button></section>;
  if (!snapshot) return null;

  const layers = snapshot.mapLayers;
  const activeSources = snapshot.context.sources.filter((source) => source.availability !== 'UNAVAILABLE').length;
  return <section className="viewer-summary" aria-labelledby="viewer-summary-title">
    <header className="viewer-summary__header">
      <div><span className="viewer-summary__eyebrow">READ-ONLY · AGGREGATE VIEW</span>
        <h1 id="viewer-summary-title">Feni situation summary</h1>
        <p>{snapshot.context.event?.name ?? 'Current Aali API activity'} · {snapshot.context.mode}</p>
      </div>
      <span className="viewer-summary__badge">No individual SOS or rescue records</span>
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
