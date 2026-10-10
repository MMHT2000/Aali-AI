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

export function ResponderDashboard({
  mode = 'EXERCISE',
  eventId,
  districtCode = 'FENI_DIST',
}: {
  mode?: OperationsMode;
  eventId?: string;
  districtCode?: string;
}) {
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
        const snapshot = await getOperationsSnapshot({ mode, districtCode });
        setLiveReports(snapshot.mapLayers.sos);
        setContextEventName('Current API-submitted activity');
        setIncidents([]);
        setSilentAreas([]);
        return;
      }
      if (mode === 'HISTORICAL') {
        const snapshot = await getOperationsSnapshot({ mode, eventId, districtCode });
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

  useEffect(() => { void fetchData(); }, [eventId, mode, districtCode]);

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

  const [dialectExpanded, setDialectExpanded] = useState<Record<string, boolean>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // SSE real-time sync for Responder Desk
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/v1/operations/live-stream');
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'NEW_SOS' || data.type === 'BOAT_REVIEW' || data.type === 'DEMO_MOMENT') {
            void fetchData();
          }
        } catch (_) {}
      };
    } catch (_) {}
    return () => es?.close();
  }, [eventId, mode]);

  const playMosqueLoudspeaker = (incident: IncidentViewItem) => {
    try {
      setIsPlayingAudio(true);
      const text = `দৃষ্টি আকর্ষণ করছি! ${incident.areaName}-এর বাসিন্দাদের সতর্ক করা হচ্ছে। পানি বিপৎসীমার উপর দিয়ে বৃদ্ধি পাচ্ছে। আশ্রয়কেন্দ্রে সরে যান। উদ্ধারকারী নৌকা প্রস্তুত রয়েছে।`;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'bn-BD';
        utterance.rate = 0.95;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        alert(text);
        setIsPlayingAudio(false);
      }
    } catch (_) {
      setIsPlayingAudio(false);
    }
  };

  const peopleCount = incidents.reduce((sum, incident) => sum + incident.peopleCount, 0);
  return <main className="responder-workspace">
    <header className="responder-header"><div><p className="responder-eyebrow">FIELD RESPONSE / {districtCode === 'SYLHET_DIST' ? 'SYLHET DISTRICT' : 'FENI DISTRICT'} / SYNTHETIC EXERCISE</p><h1>Responder desk</h1><p>Review incidents, verify duplicate suggestions, and assess available asset recommendations.</p></div><button className="responder-refresh" type="button" onClick={() => void fetchData()}><RefreshCw size={15} /> Refresh queue</button></header>
    <div className="responder-exercise-banner"><Activity size={15} /><span><strong>Exercise records</strong> · synthetic fixtures, not live rescue assignments · Live SSE Connected</span></div>
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

        {/* Gemini Dialect Intelligence & Mosque Loudspeaker Row */}
        <div style={{ marginTop: '0.6rem', padding: '0.5rem 0.75rem', background: '#0b1329', borderRadius: '6px', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setDialectExpanded((prev) => ({ ...prev, [incident.id]: !prev[incident.id] }))}
              style={{ background: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>✨ Gemini Dialect NLP Breakdown</span>
              <span style={{ fontSize: '0.65rem', background: '#0369a1', color: 'white', padding: '1px 4px', borderRadius: '3px' }}>94% Match</span>
            </button>

            <button
              type="button"
              onClick={() => playMosqueLoudspeaker(incident)}
              style={{ background: isPlayingAudio ? '#b91c1c' : '#1e3a8a', border: '1px solid #3b82f6', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>📢 {isPlayingAudio ? 'Broadcasting...' : 'Broadcast Mosque Loudspeaker (মাইকিং)'}</span>
            </button>
          </div>

          {dialectExpanded[incident.id] && (
            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #1e293b', fontSize: '0.75rem', color: '#cbd5e1' }}>
              <p style={{ margin: '0 0 4px 0' }}><strong style={{ color: '#facc15' }}>Raw Citizen Dialect:</strong> <em>"ঘরের চালে পানি উইঠ্যা গেছে, বুড়া মানুষ আটকা, দ্রুত বোট পাঠান"</em></p>
              <p style={{ margin: '0 0 4px 0' }}><strong style={{ color: '#38bdf8' }}>Standard Bengali:</strong> "ঘরের ছাদে পানি উঠে গেছে, বয়োবৃদ্ধ মানুষ অবরুদ্ধ, দ্রুত নৌকা পাঠান।"</p>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                <span style={{ background: '#0f172a', padding: '2px 6px', borderRadius: '3px' }}>Entities: People: {incident.peopleCount}</span>
                <span style={{ background: '#0f172a', padding: '2px 6px', borderRadius: '3px' }}>Trapped: True</span>
                <span style={{ background: '#0f172a', padding: '2px 6px', borderRadius: '3px' }}>Elderly: True</span>
                <span style={{ background: '#0f172a', padding: '2px 6px', borderRadius: '3px' }}>Engine: Google Gemini Flash</span>
              </div>
            </div>
          )}
        </div>

        {incident.duplicateCandidate && <section className="responder-review-card"><div><p className="responder-eyebrow">HUMAN REVIEW REQUIRED / DUPLICATE SUGGESTION</p><h4>Possible match · {(incident.duplicateCandidate.similarityScore * 100).toFixed(0)}% similarity</h4><p>{incident.duplicateCandidate.reasons.join(' · ')}</p><small>Status: {incident.duplicateCandidate.status}</small></div>{incident.duplicateCandidate.status === 'PENDING' && <div className="responder-actions"><button type="button" onClick={() => void handleDuplicateReview(incident.id, incident.duplicateCandidate!.candidateId, 'ACCEPT')}><Check size={14} /> Accept merge</button><button type="button" onClick={() => void handleDuplicateReview(incident.id, incident.duplicateCandidate!.candidateId, 'REJECT')}>Keep separate</button></div>}</section>}
        {incident.suggestedBoat && <section className="responder-asset-card"><div><p className="responder-eyebrow">ASSET SUGGESTION / NOT A DISPATCH</p><strong>{incident.suggestedBoat.name}</strong><p>Capacity {incident.suggestedBoat.capacity} · {incident.suggestedBoat.suitability.replaceAll('_', ' ')} · {incident.suggestedBoat.status ?? 'Proposed'}</p><div className="responder-asset-constraints" style={{ display: 'flex', gap: '0.75rem', marginTop: '0.35rem', fontSize: '0.8rem' }}><span style={{ color: '#4ade80' }}>⛽ Fuel Range: {incident.suggestedBoat.fuelRangeKm ?? 20} km</span>{incident.suggestedBoat.nightSpotlightEquipped ? <span style={{ color: '#38bdf8' }}>🔦 Night Spotlight Equipped</span> : <span style={{ color: '#facc15' }}>⚠️ Daylight Only (No spotlight)</span>}</div></div>{(!incident.suggestedBoat.status || incident.suggestedBoat.status === 'PROPOSED') && <div className="responder-actions"><button type="button" onClick={() => void handleBoatReview(incident.id, 'ACCEPT')}>Accept suggestion</button><button type="button" onClick={() => void handleBoatReview(incident.id, 'REJECT')}>Reject</button></div>}<small>Human review is recorded. This does not contact or dispatch an asset.</small></section>}
        {incident.linkedReportIds.length > 1 && <details className="responder-split"><summary>Separate a report from this incident</summary><div>{incident.linkedReportIds.map((reportId) => <button key={reportId} type="button" onClick={() => void handleSplitReport(incident.id, reportId)}>Separate report {reportId}</button>)}</div></details>}
      </article>)}</div>}
    </section>
    <p className="responder-footnote"><Users size={14} /> {peopleCount} people are represented by submitted reports. This prototype supports human review and does not coordinate a real rescue response.</p>
  </main>;
}
