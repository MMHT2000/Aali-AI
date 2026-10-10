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

export function FloodReplayWarning({ mode, eventId, districtCode, session }: { mode: OperationsMode; eventId?: string; districtCode?: string; session: UserSession }) {
  const [scenarios, setScenarios] = useState<ReplayScenarioView[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [currentTickIndex, setCurrentTickIndex] = useState<number>(0);
  const [isGaugeBlanked, setIsGaugeBlanked] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<ReplayEvaluationView | null>(null);
  const [warnings, setWarnings] = useState<WarningView[]>([]);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

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
    if (!replayEnabled) return;
    const isDistrictSylhet = districtCode === 'SYLHET_DIST';
    const defaultEvent = isDistrictSylhet
      ? '11111111-1111-1111-1111-111111111104'
      : '11111111-1111-1111-1111-111111111101';
    const targetEventId = eventId || defaultEvent;

    fetch('/api/v1/replay/scenarios')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ReplayScenarioView[]) => {
        const selected = data.filter((scenario) => scenario.id === targetEventId);
        const toUse = selected.length > 0 ? selected : data;
        setScenarios(toUse);
        if (toUse.length > 0) setSelectedScenarioId(toUse[0].id);
      })
      .catch(() => {});

    if (canApprove) fetch(`/api/v1/warnings?districtCode=${districtCode}${eventId ? `&eventId=${eventId}` : ''}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: WarningView[]) => {
        const sylhetEventIds = ['11111111-1111-1111-1111-111111111104', '11111111-1111-1111-1111-111111111105'];
        const feniEventIds = ['11111111-1111-1111-1111-111111111101', '11111111-1111-1111-1111-111111111102', '11111111-1111-1111-1111-111111111103'];
        const filtered = data.filter((warning) => {
          if (warning.event_id === targetEventId) return true;
          if (isDistrictSylhet) {
            return sylhetEventIds.includes(warning.event_id) || warning.body_bn?.includes('সুরমা') || warning.body_bn?.includes('কোম্পানীগঞ্জ');
          } else {
            return feniEventIds.includes(warning.event_id) || warning.body_bn?.includes('মুহুরী') || warning.body_bn?.includes('পরশুরাম');
          }
        });
        setWarnings(filtered);
      })
      .catch(() => {});
  }, [canApprove, eventId, replayEnabled, districtCode]);

  // Update evaluation when tick, scenario, or gauge blanking changes
  useEffect(() => {
    const sc = scenarios.find((s) => s.id === selectedScenarioId);
    if (!replayEnabled || !canApprove || !sc || !sc.ticks[currentTickIndex]) return;

    const tick = sc.ticks[currentTickIndex];
    const isSylhetScenario =
      districtCode === 'SYLHET_DIST' ||
      selectedScenarioId.includes('11111111-1111-1111-1111-111111111104') ||
      selectedScenarioId.includes('11111111-1111-1111-1111-111111111105');

    fetch('/api/v1/alerts/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        areaId: isSylhetScenario ? '22222222-2222-2222-2222-222222222204' : '22222222-2222-2222-2222-222222222202',
        areaName: isSylhetScenario ? 'Companiganj' : 'Parshuram',
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
  }, [canApprove, replayEnabled, selectedScenarioId, currentTickIndex, isGaugeBlanked, scenarios, districtCode]);

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

  // Detect whether Sylhet or Feni scenario is active
  const isSylhet =
    districtCode === 'SYLHET_DIST' ||
    selectedScenarioId.includes('11111111-1111-1111-1111-111111111104') ||
    selectedScenarioId.includes('11111111-1111-1111-1111-111111111105');

  const handleCreateDraftFromAlert = async () => {
    if (!canApprove || !replayEnabled || !eventId || !evaluation || !activeTick) return;

    const areaName = isSylhet ? 'কোম্পানীগঞ্জ / গোয়াইনঘাট' : 'পরশুরাম';
    const shelterName = isSylhet
      ? 'কোম্পানীগঞ্জ থানা সদর সরকারি প্রাথমিক বিদ্যালয় আশ্রয়কেন্দ্র'
      : 'পরশুরাম সরকারি মডেল উচ্চ বিদ্যালয় আশ্রয়কেন্দ্র';

    // Natural, dignified Bengali announcement copy without technical English reason codes
    let bodyBn = '';
    if (isSylhet) {
      if (evaluation.computedLevel === 'ACT') {
        bodyBn = `জরুরি বন্যা সতর্কতা: মেঘালয় ও চেরাপুঞ্জির অতিবৃষ্টি এবং পাহাড়ি ঢলের কারণে সুরমা নদীর পানি বিপদসীমার উপর দিয়ে তীব্র বেগে প্রবাহিত হচ্ছে। নদী তীরবর্তী ও নিম্নাঞ্চলের সকল বাসিন্দাদের অবিলম্বে নিকটস্থ ${shelterName} আশ্রয়কেন্দ্রে আশ্রয় নেওয়ার জন্য অনুরোধ করা হচ্ছে।`;
      } else if (evaluation.computedLevel === 'WARNING') {
        bodyBn = `বন্যা সতর্কতা: সুরমা নদীর পানি দ্রুত বৃদ্ধি পাচ্ছে এবং নিম্নাঞ্চল প্লাবিত হওয়ার আশঙ্কা রয়েছে। স্থানীয় বাসিন্দাদের প্রয়োজনীয় প্রস্তুতি নিয়ে প্রস্তুত থাকার এবং ঝুঁকিপূর্ণ পরিবারগুলোকে আশ্রয়কেন্দ্রে যাওয়ার অনুরোধ করা হচ্ছে।`;
      } else {
        bodyBn = `বন্যা নজরদারি বার্তা: পাহাড়ি ঢল ও বৃষ্টির কারণে সুরমা নদীর পানি পর্যবেক্ষণ করা হচ্ছে। নদী তীরবর্তী এলাকার বাসিন্দাদের সতর্ক থাকার অনুরোধ করা হচ্ছে।`;
      }
    } else {
      if (evaluation.computedLevel === 'ACT') {
        bodyBn = `জরুরি বন্যা সতর্কতা: অতিবৃষ্টি ও উজানের ঢলের কারণে মুহুরী নদীর বাঁধ উপচে তীব্র পানি প্রবেশ করছে। পরশুরাম এলাকার সকল বাসিন্দাদের দ্রুত প্রয়োজনীয় সামগ্রীসহ নিকটস্থ ${shelterName} আশ্রয়কেন্দ্রে যাওয়ার জন্য বিনীত অনুরোধ করা হচ্ছে।`;
      } else if (evaluation.computedLevel === 'WARNING') {
        bodyBn = `বন্যা সতর্কতা: মুহুরী নদীর পানি বিপদসীমার নিকটবর্তী হয়েছে। নদী তীরবর্তী পরশুরাম ও ফুলগাজী এলাকার বাসিন্দাদের আশ্রয়কেন্দ্র ও উঁচু স্থানে যাওয়ার প্রস্তুতি নেওয়ার অনুরোধ করা হচ্ছে।`;
      } else {
        bodyBn = `বন্যা নজরদারি বার্তা: মুহুরী নদীর পানি বৃদ্ধি পর্যবেক্ষণ করা হচ্ছে। স্থানীয় জনসাধারণকে সতর্ক অবস্থানে থাকার অনুরোধ করা হচ্ছে।`;
      }
    }

    try {
      const res = await fetch('/api/v1/warnings/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          areaId: isSylhet ? '22222222-2222-2222-2222-222222222204' : '22222222-2222-2222-2222-222222222202',
          areaName,
          alertLevel: evaluation.computedLevel,
          supportingSignals: evaluation.reasonCodes,
          shelterName,
          bodyBn,
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
        body: JSON.stringify({ note: isSylhet ? 'Approved by Sylhet District Disaster Authority Officer' : 'Approved by Feni District Disaster Authority Officer' }),
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

  // Dedicated Audio instance for pre-recorded authentic mosque announcements
  const [currentAudioElement, setCurrentAudioElement] = useState<HTMLAudioElement | null>(null);

  const handlePlayLoudspeakerAudio = (w: WarningView) => {
    // If already playing this warning, stop it
    if (playingAudioId === w.id) {
      if (currentAudioElement) {
        currentAudioElement.pause();
        currentAudioElement.currentTime = 0;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingAudioId(null);
      setActionFeedback('⏹️ অডিও সম্প্রচার বন্ধ করা হয়েছে।');
      return;
    }

    // Stop any previous playing audio
    if (currentAudioElement) {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const audioFile = isSylhet ? '/audio/sylhet-evacuation-warning.mp3' : '/audio/feni-evacuation-warning.mp3';
    const audio = new Audio(audioFile);
    setCurrentAudioElement(audio);

    audio.onended = () => {
      setPlayingAudioId(null);
      setActionFeedback('🔊 অডিও ঘোষণা সম্পন্ন হয়েছে।');
    };

    audio.onerror = () => {
      // Fallback to browser TTS if audio file cannot be loaded
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const textToSpeak = `মনোযোগ দিন! বিশেষ জরুরি ঘোষণা। ${w.body_bn}`;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'bn-BD';
        utterance.rate = 0.9;
        utterance.onend = () => setPlayingAudioId(null);
        utterance.onerror = () => setPlayingAudioId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setPlayingAudioId(null);
      }
    };

    audio.play().then(() => {
      setPlayingAudioId(w.id);
      const basinLabel = isSylhet ? 'সুরমা অববাহিকা (সিলেট)' : 'মুহুরী অববাহিকা (ফেনী)';
      setActionFeedback(`🔊 মসজিদ ও মাইক লাউডস্পিকার অডিও সম্প্রচার চালু রয়েছে (${basinLabel})...`);
    }).catch(() => {
      // Fallback if browser autoplay policies block direct audio
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const textToSpeak = `মনোযোগ দিন! বিশেষ জরুরি ঘোষণা। ${w.body_bn}`;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'bn-BD';
        utterance.rate = 0.9;
        utterance.onend = () => setPlayingAudioId(null);
        utterance.onerror = () => setPlayingAudioId(null);
        window.speechSynthesis.speak(utterance);
        setPlayingAudioId(w.id);
      }
    });
  };

  const handleDownloadAudio = (w: WarningView) => {
    const audioFile = isSylhet ? '/audio/sylhet-evacuation-warning.mp3' : '/audio/feni-evacuation-warning.mp3';
    const link = document.createElement('a');
    link.href = audioFile;
    link.download = isSylhet ? `aali-sylhet-loudspeaker-${w.id}.mp3` : `aali-feni-loudspeaker-${w.id}.mp3`;
    link.click();
    setActionFeedback(`📥 স্টুডিও-রেকর্ডেড লাউডস্পিকার MP3 অডিও ফাইল ডাউনলোড সম্পন্ন হয়েছে (${w.id})।`);
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

      {mode === 'EXERCISE' && (
        <div style={{ background: '#1e293b', border: '1px solid #38bdf8', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: '#38bdf8', margin: '0 0 0.5rem', fontSize: '1.1rem' }}>
            🌊 Run Historical Flood Replay ({isSylhet ? 'সিলেট জুনের ঐতিহাসিক বন্যা রিপ্লে' : 'ফেনী আগস্টের ঐতিহাসিক বন্যা রিপ্লে'})
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 1rem' }}>
            {isSylhet
              ? 'You are currently in synthetic Exercise mode. To inspect and step through the June 2022 Sylhet megaflood reconstruction (Surma-Kushiyara deluge), click below:'
              : 'You are currently in synthetic Exercise mode. To inspect and step through the full August 2024 or July 2025 Feni flood reconstruction with deterministic 3-signal rules, click below:'}
          </p>
          <a
            href={isSylhet ? '?mode=HISTORICAL&eventId=11111111-1111-1111-1111-111111111104&districtCode=SYLHET_DIST' : '?mode=HISTORICAL&eventId=11111111-1111-1111-1111-111111111101&districtCode=FENI_DIST'}
            style={{
              display: 'inline-block',
              background: '#0284c7',
              color: '#ffffff',
              padding: '0.6rem 1.4rem',
              borderRadius: '6px',
              fontWeight: 'bold',
              textDecoration: 'none',
              fontSize: '0.9rem',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)',
            }}
          >
            {isSylhet
              ? '▶ Load June 2022 Sylhet Megaflood Replay / সিলেট ঐতিহাসিক রিপ্লে লোড করুন →'
              : '▶ Load August 2024 Feni Flood Replay / ফেনী ঐতিহাসিক রিপ্লে লোড করুন →'}
          </a>
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
                পানির স্তর: <b>{activeTick?.signalA.gaugeLevelM} মি</b> (সতর্কসীমা {isSylhet ? '১০.৮০' : '১২.০৫'} মি)
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
                উৎস: {isSylhet ? 'মেঘালয় ও চেরাপুঞ্জি অববাহিকা GSMaP রিকনস্ট্রাকশন' : 'ত্রিপুরা অববাহিকা GSMaP রিকনস্ট্রাকশন'}
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

                {/* Ready-to-Air Mosque / PA Loudspeaker Broadcast (ACT-07) */}
                {(w.state === 'APPROVED' || w.state === 'SENT_SIMULATED') && (
                  <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.8rem', background: '#0b1329', borderRadius: '4px', border: '1px solid #1e3a8a' }}>
                    <p style={{ fontSize: '0.82rem', color: '#38bdf8', margin: '0 0 0.4rem', fontWeight: 'bold' }}>
                      🔊 মসজিদ ও ইউনিয়ন মাইক লাউডস্পিকার সম্প্রচার (Ready-to-Air Loudspeaker Broadcast)
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handlePlayLoudspeakerAudio(w)}
                        style={{ background: playingAudioId === w.id ? '#dc2626' : '#0284c7', color: 'white', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}
                      >
                        {playingAudioId === w.id ? '⏹️ অডিও থামান (Stop)' : '▶️ মাইক টেস্ট ও অডিও চালান (Play Audio)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadAudio(w)}
                        style={{ background: '#1e293b', color: '#cbd5e1', border: '1px solid #475569', padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem' }}
                      >
                        📥 অডিও স্ক্রিপ্ট ফাইল ডাউনলোড (Download Script)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>}
    </div>
  );
}
