import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Check, RefreshCw, Users } from 'lucide-react';
import { apiFetch as fetch } from '../lib/authenticated-fetch';
import { getOperationsSnapshot, OperationMapPoint, OperationsMode } from '../lib/operations-client';

export interface IncidentViewItem {
  id: string;
  summary: string;
  areaName: string;
  peopleCount: number;
  urgencyFlags: { child: boolean; elderly: boolean; medical: boolean; trapped: boolean };
  confidence: number;
  confidenceReasons: string[];
  priorityScore: number;
  priorityReasons: string[];
  status: string;
  reportsCount: number;
  linkedReportIds: string[];
  duplicateCandidate?: { candidateId: string; similarityScore: number; reasons: string[]; status: string };
  suggestedBoat?: {
    assetId: string;
    name: string;
    capacity: number;
    suitability: string;
    status?: string;
    fuelRangeKm?: number;
    nightSpotlightEquipped?: boolean;
    daylightOnlyRequired?: boolean;
    currentSpeedKts?: number;
  };
}

export interface SilentVillageItem {
  isSilentVillage: boolean;
  actionRequired: string;
  statusLabel: string;
  reason: string;
}

const flagLabels: Array<[keyof IncidentViewItem['urgencyFlags'], string]> = [
  ['trapped', 'Trapped'], ['medical', 'Medical need'], ['child', 'Child'], ['elderly', 'Older adult'],
];

export function ResponderDashboard({ mode = 'EXERCISE', eventId }: { mode?: OperationsMode; eventId?: string }) {
  const [incidents, setIncidents] = useState<IncidentViewItem[]>([]);
  const [silentAreas, setSilentAreas] = useState<SilentVillageItem[]>([]);
  const [liveReports, setLiveReports] = useState<OperationMapPoint[]>([]);
  const [contextEventName, setContextEventName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      if (mode === 'LIVE') {
        const snapshot = await getOperationsSnapshot({ mode });
        setLiveReports(snapshot.mapLayers.sos);
        setContextEventName('Current API-submitted activity');
        setIncidents([]);
        setSilentAreas([]);
        return;
      }
      if (mode === 'HISTORICAL') {
        const snapshot = await getOperationsSnapshot({ mode, eventId });
        setContextEventName(snapshot.context.event?.name ?? 'Historical event');
        setLiveReports([]);
        setIncidents([]);
        setSilentAreas([]);
        return;
      }
      setLiveReports([]);
      const selectedEventId = eventId ?? '11111111-1111-1111-1111-111111111103';
      const [incRes, silentRes] = await Promise.all([
        fetch(`/api/v1/incidents?eventId=${encodeURIComponent(selectedEventId)}`),
        fetch(`/api/v1/incidents/silent-areas?eventId=${encodeURIComponent(selectedEventId)}`),
      ]);
      if (!incRes?.ok || !silentRes?.ok) throw new Error('The incident queue could not be loaded for this account.');
      setIncidents(await incRes.json());
      setSilentAreas(await silentRes.json());
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : 'Could not load responder data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchData(); }, [eventId, mode]);

  if (mode === 'LIVE' || mode === 'HISTORICAL') {
    return <section className="responder-workspace">
      <header className="responder-header"><div><p className="responder-eyebrow">RESPONDER WORKSPACE / {mode === 'LIVE' ? 'LIVE API REPORTS' : 'HISTORICAL RECONSTRUCTION'}</p><h1>{mode === 'LIVE' ? 'Current SOS reports' : contextEventName ?? 'Historical event view'}</h1></div><button className="responder-refresh" type="button" onClick={() => void fetchData()}><RefreshCw size={15} /> Refresh</button></header>
      <p className="responder-disclosure">{mode === 'LIVE' ? 'Reports submitted to the Aali API. This queue does not imply an assignment or dispatch.' : 'Historical reconstruction is for context and does not contain current responder assignments.'}</p>
      {loadError && <p role="alert" className="responder-error">{loadError}</p>}
      {loading ? <p role="status" className="responder-empty">Loading selected context…</p> : mode === 'LIVE' && liveReports.length > 0
        ? <ul className="responder-live-list">{liveReports.map((report) => <li key={report.id}><div><strong>{report.name ?? report.label ?? 'SOS location unavailable'}</strong><span>{report.peopleCount ?? 1} people · {report.status ?? 'Received'}</span></div><small>{report.provenance} · received {report.receivedAt ? new Date(report.receivedAt).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }) : 'time unavailable'}</small></li>)}</ul>
        : <p className="responder-empty">{mode === 'LIVE' ? 'No current API-submitted SOS reports.' : 'No current rescue queue is shown in historical mode.'}</p>}
    </section>;
  }

  const review = async (url: string, body: Record<string, string>, success: string) => {
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error(`Request rejected (${response.status}).`);
      setActionMessage(success);
      await fetchData();
    } catch (err: unknown) {
      setActionMessage(`Review failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDuplicateReview = (incidentId: string, candidateId: string, decision: 'ACCEPT' | 'REJECT') => review(
    `/api/v1/incidents/${incidentId}/duplicate-candidates/${candidateId}/review`,
    { decision, reason: `Operator ${decision} via dashboard` },
    `Duplicate candidate ${decision === 'ACCEPT' ? 'accepted' : 'rejected'} and recorded.`,
  );
  const handleSplitReport = (incidentId: string, reportId: string) => review(
    `/api/v1/incidents/${incidentId}/split`, { reportId, reason: 'Operator verified reports are physically distinct' },
    `Report ${reportId} separated into an independent incident.`,
  );
  const handleBoatReview = (incidentId: string, decision: 'ACCEPT' | 'REJECT') => review(
    `/api/v1/incidents/${incidentId}/boat-recommendation/review`, { decision, reason: `Responder manual review: ${decision}` },
    `Boat recommendation ${decision === 'ACCEPT' ? 'accepted' : 'rejected'} for review. No dispatch was sent.`,
  );

  const peopleCount = incidents.reduce((sum, incident) => sum + incident.peopleCount, 0);
  return <main className="responder-workspace">
    <header className="responder-header"><div><p className="responder-eyebrow">FIELD RESPONSE / FENI DISTRICT / SYNTHETIC EXERCISE</p><h1>Responder desk</h1><p>Review incidents, verify duplicate suggestions, and assess available asset recommendations.</p></div><button className="responder-refresh" type="button" onClick={() => void fetchData()}><RefreshCw size={15} /> Refresh queue</button></header>
    <div className="responder-exercise-banner"><Activity size={15} /><span><strong>Exercise records</strong> · synthetic fixtures, not live rescue assignments</span></div>
    {actionMessage && <p className="responder-feedback" role="status">{actionMessage}</p>}
    {loadError && <p className="responder-error" role="alert">{loadError} <button type="button" onClick={() => void fetchData()}>Retry</button></p>}

    <section className="responder-metrics" aria-label="Queue summary">
      <article><span>Open incidents</span><strong>{loading ? '—' : incidents.length}</strong><small>in selected event</small></article>
      <article><span>People reported</span><strong>{loading ? '—' : peopleCount}</strong><small>across listed incidents</small></article>
      <article className={silentAreas.length ? 'responder-metric--review' : ''}><span>Areas to verify</span><strong>{loading ? '—' : silentAreas.length}</strong><small>silence is unknown, not safety</small></article>
    </section>

    {silentAreas.length > 0 && <section className="responder-silent" aria-labelledby="silent-title"><header><AlertTriangle size={17} /><h2 id="silent-title">Verification flags · verify by safe means</h2></header>{silentAreas.map((area, index) => <p key={`${area.statusLabel}-${index}`}>{area.reason}</p>)}<small>No reports do not establish that an area is safe. Do not enter a hazardous area solely to verify this flag.</small></section>}

    <section className="responder-incidents" aria-labelledby="incident-queue-title"><header className="responder-section-heading"><div><p className="responder-eyebrow">PRIORITIZED QUEUE</p><h2 id="incident-queue-title">Incident review</h2></div><span>{incidents.length} records</span></header>
      {loading ? <p className="responder-empty" role="status">Loading incident queue…</p> : incidents.length === 0 ? <p className="responder-empty">No exercise incidents are available for this event.</p> : <div className="responder-incident-list">{incidents.map((incident) => <article className="responder-incident" key={incident.id}>
        <header className="responder-incident__top"><div><span className="responder-incident__id">INCIDENT / {incident.id}</span><h3>{incident.summary}</h3><p>{incident.areaName} · {incident.peopleCount} people · {incident.reportsCount} linked reports</p></div><span className="responder-status">{incident.status.replaceAll('_', ' ')}</span></header>
        <div className="responder-score-row"><span><strong>Priority {(incident.priorityScore * 100).toFixed(0)}%</strong><small>{incident.priorityReasons.join(' · ') || 'Rule-based score; evidence unavailable'}</small></span><span><strong>Confidence {(incident.confidence * 100).toFixed(0)}%</strong><small>{incident.confidenceReasons.join(' · ') || 'Confidence evidence unavailable'}</small></span></div>
        <div className="responder-flags" aria-label="Reported urgency needs">{flagLabels.filter(([key]) => incident.urgencyFlags[key]).map(([, label]) => <span key={label}>{label}</span>)}{!Object.values(incident.urgencyFlags).some(Boolean) && <span>No additional urgency flags</span>}</div>
        {incident.duplicateCandidate && <section className="responder-review-card"><div><p className="responder-eyebrow">HUMAN REVIEW REQUIRED / DUPLICATE SUGGESTION</p><h4>Possible match · {(incident.duplicateCandidate.similarityScore * 100).toFixed(0)}% similarity</h4><p>{incident.duplicateCandidate.reasons.join(' · ')}</p><small>Status: {incident.duplicateCandidate.status}</small></div>{incident.duplicateCandidate.status === 'PENDING' && <div className="responder-actions"><button type="button" onClick={() => void handleDuplicateReview(incident.id, incident.duplicateCandidate!.candidateId, 'ACCEPT')}><Check size={14} /> Accept merge</button><button type="button" onClick={() => void handleDuplicateReview(incident.id, incident.duplicateCandidate!.candidateId, 'REJECT')}>Keep separate</button></div>}</section>}
        {incident.suggestedBoat && <section className="responder-asset-card"><div><p className="responder-eyebrow">ASSET SUGGESTION / NOT A DISPATCH</p><strong>{incident.suggestedBoat.name}</strong><p>Capacity {incident.suggestedBoat.capacity} · {incident.suggestedBoat.suitability.replaceAll('_', ' ')} · {incident.suggestedBoat.status ?? 'Proposed'}</p><div className="responder-asset-constraints" style={{ display: 'flex', gap: '0.75rem', marginTop: '0.35rem', fontSize: '0.8rem' }}><span style={{ color: '#4ade80' }}>⛽ Fuel Range: {incident.suggestedBoat.fuelRangeKm ?? 20} km</span>{incident.suggestedBoat.nightSpotlightEquipped ? <span style={{ color: '#38bdf8' }}>🔦 Night Spotlight Equipped</span> : <span style={{ color: '#facc15' }}>⚠️ Daylight Only (No spotlight)</span>}</div></div>{(!incident.suggestedBoat.status || incident.suggestedBoat.status === 'PROPOSED') && <div className="responder-actions"><button type="button" onClick={() => void handleBoatReview(incident.id, 'ACCEPT')}>Accept suggestion</button><button type="button" onClick={() => void handleBoatReview(incident.id, 'REJECT')}>Reject</button></div>}<small>Human review is recorded. This does not contact or dispatch an asset.</small></section>}
        {incident.linkedReportIds.length > 1 && <details className="responder-split"><summary>Separate a report from this incident</summary><div>{incident.linkedReportIds.map((reportId) => <button key={reportId} type="button" onClick={() => void handleSplitReport(incident.id, reportId)}>Separate report {reportId}</button>)}</div></details>}
      </article>)}</div>}
    </section>
    <p className="responder-footnote"><Users size={14} /> {peopleCount} people are represented by submitted reports. This prototype supports human review and does not coordinate a real rescue response.</p>
  </main>;
}
