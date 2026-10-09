import { useState, useEffect } from 'react';
import { apiFetch as fetch } from '../lib/authenticated-fetch';
import { OperationsMode } from '../lib/operations-client';
import { UserSession } from './Login';

export interface ReplayTickView {
  tickIndex: number;
  simulatedTime: string;
  descriptionBn: string;
  signalA: {
    gaugeLevelM: number;
    rise3hCm: number;
    minutesSinceObservation: number;
    isBlanked?: boolean;
  };
  signalB: {
    rainfallMm: number;
    windowMinutes: number;
    minutesSinceObservation: number;
  };
  signalC: {
    levelM: number;
    isRapidRiseReported: boolean;
    minutesSinceObservation: number;
  };
  breachReported: boolean;
  actualDangerLevelExceeded: boolean;
}

export interface ReplayScenarioView {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  period: string;
  isReconstructed: boolean;
  provenance: string;
  ticks: ReplayTickView[];
}

export interface ReplayEvaluationView {
  computedLevel: 'NORMAL' | 'WATCH' | 'WARNING' | 'ACT';
  baseLevel: 'NORMAL' | 'WATCH' | 'WARNING' | 'ACT';
  isEscalatedBySilentGauge: boolean;
  signalsFired: {
    signalA_Gauge: boolean;
    signalB_Rainfall: boolean;
    signalC_Volunteer: boolean;
    breachReported: boolean;
  };
  reasonCodes: string[];
  reasonsBn: string[];
  computedLeadTimeHours: number | null;
  prototypeNotice: string;
}

export interface WarningView {
  id: string;
  event_id: string;

  state: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SENT_SIMULATED';
  body_bn: string;
  body_en?: string;
  created_at: string;
  approved_by?: string | null;
  approved_at?: string | null;
  approval_note?: string | null;
}

export function FloodReplayWarning({ mode, eventId, session }: { mode: OperationsMode; eventId?: string; session: UserSession }) {
  const [scenarios, setScenarios] = useState<ReplayScenarioView[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [currentTickIndex, setCurrentTickIndex] = useState<number>(0);
  const [isGaugeBlanked, setIsGaugeBlanked] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<ReplayEvaluationView | null>(null);
  const [warnings, setWarnings] = useState<WarningView[]>([]);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const canApprove = session.role === 'AUTHORITY' || session.role === 'ADMIN';
  const replayEnabled = mode === 'HISTORICAL';

  // Replay fixtures and warning drafts follow the shared event selection.
  useEffect(() => {
    setScenarios([]);
    setWarnings([]);
    setSelectedScenarioId('');
    setCurrentTickIndex(0);
    setEvaluation(null);
    setIsPlaying(false);
    if (!replayEnabled || !eventId) return;

    fetch('/api/v1/replay/scenarios')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ReplayScenarioView[]) => {
        const selected = data.filter((scenario) => scenario.id === eventId);
        setScenarios(selected);
        if (selected.length > 0) setSelectedScenarioId(selected[0].id);
      })
      .catch(() => {});

    if (canApprove) fetch('/api/v1/warnings')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: WarningView[]) => setWarnings(data.filter((warning) => warning.event_id === eventId)))
      .catch(() => {});
  }, [canApprove, eventId, replayEnabled]);

  // Update evaluation when tick, scenario, or gauge blanking changes
  useEffect(() => {
    const sc = scenarios.find((s) => s.id === selectedScenarioId);
    if (!replayEnabled || !canApprove || !sc || !sc.ticks[currentTickIndex]) return;

    const tick = sc.ticks[currentTickIndex];

    fetch('/api/v1/alerts/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        areaId: '22222222-2222-2222-2222-222222222202',
        areaName: 'Parshuram',
        reportedBreach: tick.breachReported,
        signalA: {
          ...tick.signalA,
          isBlanked: isGaugeBlanked || tick.signalA.isBlanked,
        },
        signalB: tick.signalB,
        signalC: tick.signalC,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ReplayEvaluationView | null) => {
        if (data) setEvaluation(data);
      })
      .catch(() => {});
  }, [canApprove, replayEnabled, selectedScenarioId, currentTickIndex, isGaugeBlanked, scenarios]);

  // Handle auto-step play timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTickIndex((prev) => {
          const sc = scenarios.find((s) => s.id === selectedScenarioId);
          if (sc && prev < sc.ticks.length - 1) {
            return prev + 1;
          }
          setIsPlaying(false);
          return prev;
        });
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, scenarios, selectedScenarioId]);

  const activeScenario = scenarios.find((s) => s.id === selectedScenarioId);
  const activeTick = activeScenario?.ticks[currentTickIndex];

  const handleCreateDraftFromAlert = async () => {
    if (!canApprove || !replayEnabled || !eventId || !evaluation || !activeTick) return;

    try {
      const res = await fetch('/api/v1/warnings/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          areaId: '22222222-2222-2222-2222-222222222202',
          areaName: 'Parshuram',
          alertLevel: evaluation.computedLevel,
          supportingSignals: evaluation.reasonCodes,
          shelterName: 'Parshuram Govt Model High School Shelter',
          bodyBn: `জরুরি বন্যা সতর্কতা [${evaluation.computedLevel}]: পরশুরাম এলাকায় নদীর পানির উচ্চতা ও উজানের বৃষ্টির কারণে ঝুঁকি বৃদ্ধি পেয়েছে। নিকটস্থ পরশুরাম সরকারি মডেল উচ্চ বিদ্যালয় আশ্রয়কেন্দ্রে অবস্থান নিন। সংকেত: ${evaluation.reasonCodes.join(', ')}`,
        }),
      });
      if (res.ok) {
        const newWarn = await res.json();
        setWarnings((prev) => [newWarn, ...prev]);
        setActionFeedback('নতুন সতর্কতা খসড়া প্রস্তুত হয়েছে (Draft Warning Created).');
      }
    } catch {
      setActionFeedback('Failed to create draft warning.');
    }
  };

  const handleApproveWarning = async (id: string) => {
    if (!canApprove) {
      setActionFeedback('অননুমোদিত: সতর্কতা অনুমোদনের জন্য AUTHORITY ভূমিকা প্রয়োজন (Authority role required).');
      return;
    }
    try {
      const res = await fetch(`/api/v1/warnings/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: 'Approved by Feni District Disaster Authority Officer' }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWarnings((prev) => prev.map((w) => (w.id === id ? updated : w)));
        setActionFeedback(`সতর্কতা ${id} সফলভাবে অনুমোদিত হয়েছে (Approved).`);
      }
    } catch {
      setActionFeedback('Approval action failed.');
    }
  };

  const handleSimulateBroadcast = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/warnings/${id}/send-simulated`, {
        method: 'POST',
      });
      if (res.ok) {
        setWarnings((prev) =>
          prev.map((w) => (w.id === id ? { ...w, state: 'SENT_SIMULATED' } : w)),
        );
        setActionFeedback(`সতর্কতা ${id} সিমুলেটেড ব্রডকাস্ট পাঠানো হয়েছে (SIMULATED CELL BROADCAST ONLY).`);
      }
    } catch {
      setActionFeedback('Simulated broadcast failed.');
    }
  };

  const getAlertBadgeColor = (lvl?: string) => {
    switch (lvl) {
      case 'ACT':
        return '#dc2626';
      case 'WARNING':
        return '#ea580c';
      case 'WATCH':
        return '#ca8a04';
      default:
        return '#16a34a';
    }
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '1.25rem', marginTop: '1.5rem', color: '#f8fafc' }}>
      {/* Reconstructed data disclosure banner */}
      {replayEnabled && <div style={{ background: 'rgba(234, 88, 12, 0.15)', border: '1px solid #ea580c', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem' }}>
        <strong style={{ color: '#fb923c', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          ⚠️ RECONSTRUCTED / NOT LIVE — ঐতিহাসিক পুনঃনির্মাণ ডেমো
        </strong>
        <p style={{ fontSize: '0.82rem', color: '#fed7aa', margin: '0.25rem 0 0' }}>
          This is a reconstructed fixture with source citations not yet independently audited. Lead times are calculated by deterministic rules. External broadcasts are simulated for decision-support testing.
        </p>
      </div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', color: '#38bdf8', margin: 0 }}>
            🌊 বন্যা সংকেত ও ঐতিহাসিক রিপ্লে / Three-Signal Flood Alert & Replay
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            মুহুরী নদী (পরশুরাম গেজ) ৩-সংকেত সিদ্ধান্ত এবং কর্মকর্তা অনুমোদন ব্যবস্থা
          </span>
        </div>

        <span role="status">{mode === 'LIVE' ? 'Live source mode: replay controls are unavailable.' : mode === 'EXERCISE' ? 'Exercise mode: select Historical to inspect reconstructed replay fixtures.' : !eventId ? 'Select a historical event to load its replay.' : !canApprove ? `${session.role} has read-only replay access; rule evaluation and warning actions are restricted.` : `Historical event: ${eventId}`}</span>
      </div>

      {actionFeedback && (
        <div style={{ background: '#064e3b', border: '1px solid #10b981', color: '#a7f3d0', padding: '0.5rem 0.8rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem' }}>
          {actionFeedback}
        </div>
      )}

      {/* Replay Scenario Controls */}
      {replayEnabled && activeScenario && <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.8rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>দৃশ্যপট নির্বাচন (Scenario):</label>
            <select
              value={selectedScenarioId}
              onChange={(e) => {
                setSelectedScenarioId(e.target.value);
                setCurrentTickIndex(0);
                setIsPlaying(false);
              }}
              style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid #475569', borderRadius: '4px', padding: '0.35rem 0.7rem', fontSize: '0.9rem' }}
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameBn} ({s.period})
                </option>
              ))}
            </select>
          </div>

          {/* Gauge Blanking Sensor Override Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid #475569' }}>
            <input
              type="checkbox"
              id="gauge-blank-toggle"
              checked={isGaugeBlanked}
              onChange={(e) => setIsGaugeBlanked(e.target.checked)}
            />
            <label htmlFor="gauge-blank-toggle" style={{ fontSize: '0.85rem', color: isGaugeBlanked ? '#f87171' : '#cbd5e1', cursor: 'pointer' }}>
              🔌 গেজ ব্ল্যাকআউট সিমুলেশন (Simulate Gauge Blanked)
            </label>
          </div>
        </div>

        {/* Step Slider & Controls */}
        {activeScenario && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                style={{ background: isPlaying ? '#dc2626' : '#0284c7', color: 'white', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem' }}
              >
                {isPlaying ? '⏸ বিরতি (Pause)' : '▶ চালান (Play)'}
              </button>
              <button
                type="button"
                disabled={currentTickIndex === 0}
                onClick={() => setCurrentTickIndex((prev) => Math.max(0, prev - 1))}
                style={{ background: '#334155', color: '#f8fafc', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}
              >
                ◀ পূর্ববর্তী (Prev)
              </button>
              <button
                type="button"
                disabled={currentTickIndex >= activeScenario.ticks.length - 1}
                onClick={() => setCurrentTickIndex((prev) => Math.min(activeScenario.ticks.length - 1, prev + 1))}
                style={{ background: '#334155', color: '#f8fafc', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}
              >
                পরবর্তী (Next) ▶
              </button>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                ধাপ {currentTickIndex + 1} / {activeScenario.ticks.length} | সময়: <b>{activeTick?.simulatedTime.replace('T', ' ').replace('Z', ' UTC')}</b>
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', fontStyle: 'italic', margin: '0.3rem 0 0' }}>
              📝 ঘটনার বিবরণ: {activeTick?.descriptionBn}
            </p>
          </div>
        )}
      </div>}

      {/* Live Three-Signal Evaluation Card */}
      {evaluation && canApprove && replayEnabled && (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>নির্ধারিত সতর্কতা স্তর (Computed Alert Level):</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem' }}>
                <span
                  style={{
                    background: getAlertBadgeColor(evaluation.computedLevel),
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                  }}
                >
                  {evaluation.computedLevel}
                </span>
                {evaluation.isEscalatedBySilentGauge && (
                  <span style={{ background: '#7f1d1d', color: '#fca5a5', padding: '0.2rem 0.5rem', borderRadius: '3px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    ⚠️ গেজ তথ্যহীনতায় স্তর বৃদ্ধি (GAUGE_SILENT Escalation)
                  </span>
                )}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>আনুমানিক বিপদসীমা পৌঁছানোর সময় (Lead-Time):</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#38bdf8' }}>
                {evaluation.computedLeadTimeHours !== null ? `${evaluation.computedLeadTimeHours} ঘণ্টা (+${evaluation.computedLeadTimeHours}h)` : 'N/A (অজানা)'}
              </div>
            </div>
          </div>

          {/* Three Signals Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {/* Signal A */}
            <div style={{ background: '#0f172a', border: `1px solid ${evaluation.signalsFired.signalA_Gauge ? '#ef4444' : '#334155'}`, padding: '0.8rem', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>সংকেত ক: নদীর গেজ (Signal A)</strong>
                <span style={{ fontSize: '0.7rem', color: evaluation.signalsFired.signalA_Gauge ? '#ef4444' : '#94a3b8', fontWeight: 'bold' }}>
                  {evaluation.signalsFired.signalA_Gauge ? '🔥 সক্রিয় (Active)' : 'নরমাল'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.2rem 0' }}>
                পানির স্তর: <b>{activeTick?.signalA.gaugeLevelM} মি</b> (সতর্কসীমা ১২.০৫ মি)
              </p>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.2rem 0' }}>
                ৩ ঘণ্টায় বৃদ্ধি: <b>{activeTick?.signalA.rise3hCm} সেমি</b> (সীমা ২৫ সেমি)
              </p>
              {isGaugeBlanked && (
                <span style={{ fontSize: '0.7rem', color: '#f87171', display: 'block', marginTop: '0.2rem' }}>
                  * সেন্সর ব্ল্যাকআউট সক্রিয় (&gt;৬০ মিনিট নীরব)
                </span>
              )}
            </div>

            {/* Signal B */}
            <div style={{ background: '#0f172a', border: `1px solid ${evaluation.signalsFired.signalB_Rainfall ? '#ef4444' : '#334155'}`, padding: '0.8rem', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>সংকেত খ: স্যাটেলাইট বৃষ্টি (Signal B)</strong>
                <span style={{ fontSize: '0.7rem', color: evaluation.signalsFired.signalB_Rainfall ? '#ef4444' : '#94a3b8', fontWeight: 'bold' }}>
                  {evaluation.signalsFired.signalB_Rainfall ? '🔥 সক্রিয় (Active)' : 'নরমাল'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.2rem 0' }}>
                উজানে ৩ ঘণ্টার বৃষ্টি: <b>{activeTick?.signalB.rainfallMm} মিমি</b> (সীমা ৭৫ মিমি)
              </p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.2rem 0' }}>
                উৎস: ত্রিপুরা অববাহিকা GSMaP রিকনস্ট্রাকশন
              </p>
            </div>

            {/* Signal C */}
            <div style={{ background: '#0f172a', border: `1px solid ${evaluation.signalsFired.signalC_Volunteer ? '#ef4444' : '#334155'}`, padding: '0.8rem', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>সংকেত গ: স্বেচ্ছাসেবক রিপোর্ট (Signal C)</strong>
                <span style={{ fontSize: '0.7rem', color: evaluation.signalsFired.signalC_Volunteer ? '#ef4444' : '#94a3b8', fontWeight: 'bold' }}>
                  {evaluation.signalsFired.signalC_Volunteer ? '🔥 সক্রিয় (Active)' : 'নরমাল'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.2rem 0' }}>
                ফিল্ড স্টাফ গেজ রিডিং: <b>{activeTick?.signalC.levelM} মি</b>
              </p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.2rem 0' }}>
                দ্রুত বৃদ্ধির তথ্য: {activeTick?.signalC.isRapidRiseReported ? 'হ্যাঁ (Yes)' : 'না (No)'}
              </p>
            </div>
          </div>

          {/* Reasons List */}
          <div style={{ marginTop: '1rem', background: '#0f172a', padding: '0.75rem', borderRadius: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 'bold' }}>নির্ধারণের কারণ ও প্রমাণ (Evidence Reasons):</span>
            <ul style={{ margin: '0.3rem 0 0', paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#94a3b8' }}>
              {evaluation.reasonsBn.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          {/* Create Draft Button */}
          {evaluation.computedLevel !== 'NORMAL' && (
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <button
                type="button"
                onClick={handleCreateDraftFromAlert}
                style={{ background: '#0284c7', color: 'white', border: 'none', padding: '0.4rem 0.9rem', borderRadius: '4px', fontSize: '0.85rem' }}
              >
                📝 এই সংকেতের ভিত্তিতে সতর্কতা খসড়া তৈরি করুন (Create Draft Warning)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Warnings & Approvals Register */}
      {canApprove && replayEnabled && <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '0.75rem' }}>
          📢 অফিসিয়াল সতর্কতা অনুমোদন তালিকা / Official Warnings Approval Register
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>
          * এআই কেবল খসড়া প্রস্তুত করতে পারে। সতর্কতা প্রচারের জন্য উপযুক্ত সরকারি কর্মকর্তার (Authority) অনুমোদন বাধ্যতামূলক।
        </p>

        {warnings.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>কোনো সতর্কতা খসড়া নেই।</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {warnings.map((w) => (
              <div
                key={w.id}
                style={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    আইডি: <b>{w.id}</b>
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background:
                        w.state === 'APPROVED'
                          ? '#065f46'
                          : w.state === 'SENT_SIMULATED'
                          ? '#1e3a8a'
                          : w.state === 'REJECTED'
                          ? '#7f1d1d'
                          : '#854d0e',
                      color: 'white',
                    }}
                  >
                    {w.state}
                  </span>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#f1f5f9', margin: '0.2rem 0' }}>{w.body_bn}</p>

                {w.approval_note && (
                  <p style={{ fontSize: '0.8rem', color: '#a7f3d0', margin: 0 }}>
                    কর্মকর্তার মন্তব্য: <i>{w.approval_note}</i>
                  </p>
                )}

                {/* Authority Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {w.state === 'PENDING_APPROVAL' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApproveWarning(w.id)}
                        style={{ background: '#10b981', color: 'black', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}
                      >
                        ✓ অনুমোদন করুন (Approve as Authority)
                      </button>
                    </>
                  )}

                  {w.state === 'APPROVED' && (
                    <button
                      type="button"
                      onClick={() => handleSimulateBroadcast(w.id)}
                      style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '4px', fontSize: '0.8rem' }}
                    >
                      📡 সিমুলেটেড ব্রডকাস্ট পাঠান (Send Simulated Broadcast)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>}
    </div>
  );
}
