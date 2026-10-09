import { useEffect, useState } from 'react';

export interface IncidentViewItem {
  id: string;
  summary: string;
  areaName: string;
  peopleCount: number;
  urgencyFlags: {
    child: boolean;
    elderly: boolean;
    medical: boolean;
    trapped: boolean;
  };
  confidence: number;
  confidenceReasons: string[];
  priorityScore: number;
  priorityReasons: string[];
  status: string;
  reportsCount: number;
  linkedReportIds: string[];
  duplicateCandidate?: {
    candidateId: string;
    similarityScore: number;
    reasons: string[];
    status: string;
  };
  suggestedBoat?: {
    assetId: string;
    name: string;
    capacity: number;
    suitability: string;
  };
}

export interface SilentVillageItem {
  isSilentVillage: boolean;
  actionRequired: string;
  statusLabel: string;
  reason: string;
}

export function ResponderDashboard() {
  const [incidents, setIncidents] = useState<IncidentViewItem[]>([]);
  const [silentAreas, setSilentAreas] = useState<SilentVillageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [incRes, silentRes] = await Promise.all([
        fetch('/api/v1/incidents'),
        fetch('/api/v1/incidents/silent-areas'),
      ]);
      if (incRes.ok) setIncidents(await incRes.json());
      if (silentRes.ok) setSilentAreas(await silentRes.json());
    } catch {
      // offline / mock fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDuplicateReview = async (incidentId: string, candidateId: string, decision: 'ACCEPT' | 'REJECT') => {
    try {
      const res = await fetch(`/api/v1/incidents/${incidentId}/duplicate-candidates/${candidateId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, reason: `Operator ${decision} via dashboard` }),
      });
      if (res.ok) {
        setActionMessage(`Duplicate candidate ${decision}ED successfully.`);
        fetchData();
      }
    } catch (err: unknown) {
      setActionMessage(`Review failed: ${err instanceof Error ? err.message : 'Error'}`);
    }
  };

  const handleSplitReport = async (incidentId: string, reportId: string) => {
    try {
      const res = await fetch(`/api/v1/incidents/${incidentId}/split`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, reason: 'Operator verified reports are physically distinct' }),
      });
      if (res.ok) {
        setActionMessage(`Report ${reportId} separated into independent incident.`);
        fetchData();
      }
    } catch (err: unknown) {
      setActionMessage(`Split failed: ${err instanceof Error ? err.message : 'Error'}`);
    }
  };

  return (
    <div className="responder-dashboard" style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📋 রেসপন্ডার ড্যাশবোর্ড / Responder Operations Dashboard
        </h2>
        <button
          onClick={fetchData}
          style={{ background: '#0284c7', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px' }}
        >
          🔄 রিফ্রেশ (Refresh)
        </button>
      </div>

      {actionMessage && (
        <div style={{ padding: '0.5rem 1rem', background: '#064e3b', border: '1px solid #10b981', color: '#a7f3d0', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem' }}>
          {actionMessage}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#1e293b', border: '1px solid #475569', padding: '1rem', borderRadius: '6px' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>সক্রিয় উদ্ধার ঘটনা (Active Incidents)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#f87171' }}>{incidents.length}</div>
        </div>
        <div style={{ background: '#1e293b', border: '1px solid #475569', padding: '1rem', borderRadius: '6px' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>উদ্ধারপ্রত্যাশী মানুষ (Stranded People)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#38bdf8' }}>
            {incidents.reduce((sum, i) => sum + i.peopleCount, 0)}
          </div>
        </div>
        <div style={{ background: '#1e293b', border: '1px solid #475569', padding: '1rem', borderRadius: '6px' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>নীরব গ্রাম সতর্কতা (Silent Villages)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#f59e0b' }}>{silentAreas.length}</div>
        </div>
      </div>

      {/* Silent Village Alert Banner */}
      {silentAreas.length > 0 && (
        <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem' }}>
          <h4 style={{ color: '#fbbf24', fontSize: '1rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚠️ নীরব গ্রাম সতর্কতা / SILENT VILLAGE FLAG (Action: VERIFY BY SAFE MEANS)
          </h4>
          {silentAreas.map((s, idx) => (
            <p key={idx} style={{ fontSize: '0.85rem', color: '#fef3c7' }}>
              {s.reason}
            </p>
          ))}
          <span style={{ fontSize: '0.75rem', color: '#d97706', display: 'block', marginTop: '0.4rem', fontStyle: 'italic' }}>
            * Note: Aali never interprets lack of SOS calls as safety. Silent villages demand active, safe verification.
          </span>
        </div>
      )}

      {/* Incidents Table / List View */}
      <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#f8fafc' }}>
          উদ্ধার অগ্রাধিকার তালিকা / Triage & Priority Incident List
        </h3>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>লোড হচ্ছে...</p>
        ) : incidents.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>বর্তমানে কোনো উদ্ধার ঘটনা নেই।</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {incidents.map((inc) => (
              <div
                key={inc.id}
                style={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  padding: '1rem',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: '1rem', color: '#38bdf8' }}>{inc.summary}</strong>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      📍 {inc.areaName} | মানুষ: <b style={{ color: 'white' }}>{inc.peopleCount} জন</b> | রিপোর্ট সংখ্যা: {inc.reportsCount}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        background: inc.priorityScore >= 0.7 ? '#dc2626' : '#d97706',
                        color: 'white',
                      }}
                    >
                      Priority: {(inc.priorityScore * 100).toFixed(0)}%
                    </span>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      Confidence: {(inc.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Urgency badges */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {inc.urgencyFlags.trapped && <span style={{ fontSize: '0.7rem', background: '#7f1d1d', color: '#fca5a5', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>পানিবন্দী (Trapped)</span>}
                  {inc.urgencyFlags.child && <span style={{ fontSize: '0.7rem', background: '#1e3a8a', color: '#bfdbfe', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>শিশু (Child)</span>}
                  {inc.urgencyFlags.elderly && <span style={{ fontSize: '0.7rem', background: '#374151', color: '#e5e7eb', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>বৃদ্ধ (Elderly)</span>}
                  {inc.urgencyFlags.medical && <span style={{ fontSize: '0.7rem', background: '#831843', color: '#fbcfe8', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>চিকিৎসা (Medical)</span>}
                </div>

                {/* Boat recommendation */}
                {inc.suggestedBoat && (
                  <div style={{ fontSize: '0.8rem', background: '#1e293b', padding: '0.5rem', borderRadius: '4px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: '#38bdf8' }}>🛥️ প্রস্তাবিত উদ্ধারকারী নৌকা (Suggested Boat):</span> <b>{inc.suggestedBoat.name}</b> (ধারণক্ষমতা: {inc.suggestedBoat.capacity} জন)
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      * রেসপন্ডার অনুমোদন প্রয়োজন (No auto-dispatch)
                    </span>
                  </div>
                )}

                {/* Duplicate candidate review section */}
                {inc.duplicateCandidate && (
                  <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid #a855f7', padding: '0.6rem', borderRadius: '4px', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#c084fc' }}>
                        🔗 সম্ভাব্য ডুপ্লিকেট রিপোর্ট সনাক্ত (Duplicate Match Suggestion: {(inc.duplicateCandidate.similarityScore * 100).toFixed(0)}%)
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#e9d5ff', fontWeight: 'bold' }}>
                        Status: {inc.duplicateCandidate.status}
                      </span>
                    </div>
                    <ul style={{ fontSize: '0.75rem', color: '#cbd5e1', paddingLeft: '1.2rem', margin: 0 }}>
                      {inc.duplicateCandidate.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>

                    {inc.duplicateCandidate.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => handleDuplicateReview(inc.id, inc.duplicateCandidate!.candidateId, 'ACCEPT')}
                          style={{ background: '#10b981', color: 'black', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '3px', fontSize: '0.75rem', fontWeight: 'bold' }}
                        >
                          ✓ মার্জ অনুমোদন (Accept Merge)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateReview(inc.id, inc.duplicateCandidate!.candidateId, 'REJECT')}
                          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '3px', fontSize: '0.75rem' }}
                        >
                          ✕ বাতিল (Reject)
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Unmerge / Split action */}
                {inc.linkedReportIds.length > 1 && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>রিপোর্ট আলাদা করুন (Split Report):</span>
                    {inc.linkedReportIds.map((repId) => (
                      <button
                        key={repId}
                        type="button"
                        onClick={() => handleSplitReport(inc.id, repId)}
                        style={{ background: '#334155', border: '1px solid #64748b', color: '#cbd5e1', padding: '0.2rem 0.5rem', borderRadius: '3px', fontSize: '0.75rem' }}
                      >
                        আলাদা করুন {repId}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

