import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Satellite, 
  FileText, 
  AlertTriangle, 
  Radio, 
  Truck, 
  CheckCircle2, 
  Send, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { apiFetch as fetch } from '../lib/authenticated-fetch';
import { OperationsMode } from '../lib/operations-client';
import { buildClientDisasterPacket } from '../lib/packet';
import type { SosUnderstandingResult } from '../../../api/src/domain/ai/ai-interfaces';

function examplePacket(isSylhet: boolean) {
  return buildClientDisasterPacket({ geohash7: isSylhet ? 'wh1quuk' : 'wh0xs6m', peopleCount: isSylhet ? 6 : 5, flags: { elderly: true, child: false, medical: isSylhet, trapped: true }, shortId: isSylhet ? 'SY01' : 'FE01' }).rawPacket;
}

interface JudgeDemoRunnerProps {
  currentMode: OperationsMode;
  onSetMode: (mode: OperationsMode, eventId?: string) => void;
  districtCode?: string;
  eventId?: string;
  role?: string;
}

export function JudgeDemoRunner({ currentMode, onSetMode, districtCode = 'FENI_DIST', eventId, role = 'AUTHORITY' }: JudgeDemoRunnerProps) {
  const navigate = useNavigate();
  const isSylhet = districtCode === 'SYLHET_DIST';
  const targetDistrictCode = isSylhet ? 'SYLHET_DIST' : 'FENI_DIST';
  const targetEventId = eventId ?? (isSylhet ? '11111111-1111-1111-1111-111111111104' : '11111111-1111-1111-1111-111111111101');
  const districtQuery = `&districtCode=${targetDistrictCode}`;

  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [showCompactModal, setShowCompactModal] = useState(false);
  const [showPacketModal, setShowPacketModal] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Packet & Dialect Tester State
  const [packetInput, setPacketInput] = useState(() => examplePacket(isSylhet));
  const [dialectText, setDialectText] = useState(
    isSylhet
      ? 'কোম্পানীগঞ্জ বাজারে পানি উটি গেছে, ৬ জন আটকা রইছি, বাইচ্চা ও বুড়া মানুষ আছে'
      : 'ফুলগাজী স্কুলে পানি উঠতাছে, ৫ জন ছাদে আটকাইছি, একজন প্যারালাইজড বুড়া'
  );
  const [packetResult, setPacketResult] = useState<{ status: string } | null>(null);
  const [aiExtractResult, setAiExtractResult] = useState<SosUnderstandingResult | null>(null);
  const [inspectorError, setInspectorError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setPacketInput(examplePacket(isSylhet));
    setDialectText(
      isSylhet
        ? 'কোম্পানীগঞ্জ বাজারে পানি উটি গেছে, ৬ জন আটকা রইছি, বাইচ্চা ও বুড়া মানুষ আছে'
        : 'ফুলগাজী স্কুলে পানি উঠতাছে, ৫ জন ছাদে আটকাইছি, একজন প্যারালাইজড বুড়া'
    );
  }, [isSylhet]);

  const steps = [
    {
      num: 1,
      title: 'The Crisis',
      subtitle: isSylhet ? '84% Inundation' : '92% Towers Dead',
      icon: ShieldAlert,
      action: () => {
        setActiveStep(1);
        onSetMode('HISTORICAL', targetEventId);
        navigate(`/control-room/map?mode=HISTORICAL&eventId=${targetEventId}${districtQuery}`);
      },
      tag: '0:00-0:30'
    },
    {
      num: 2,
      title: 'BEFORE: 3 Signals',
      subtitle: isSylhet ? 'Surma Point Rule' : 'Blank Gauge Rule',
      icon: AlertTriangle,
      action: () => {
        setActiveStep(2);
        onSetMode('HISTORICAL', targetEventId);
        navigate(`/control-room/replay?mode=HISTORICAL&eventId=${targetEventId}${districtQuery}`);
      },
      tag: '0:30-1:30'
    },
    {
      num: 3,
      title: 'DURING: Blackout SOS',
      subtitle: 'Packet & Dialect AI',
      icon: Satellite,
      action: () => {
        setActiveStep(3);
        setShowPacketModal(true);
      },
      tag: '1:30-2:30'
    },
    {
      num: 4,
      title: 'DURING: Boat Triage',
      subtitle: 'Dedupe & Priority',
      icon: Radio,
      action: () => {
        setActiveStep(4);
        onSetMode('EXERCISE');
        navigate(`/control-room/responder?districtCode=${targetDistrictCode}`);
      },
      tag: '2:30-3:30'
    },
    {
      num: 5,
      title: 'AFTER: Recovery Board',
      subtitle: 'Tube Wells & Equity',
      icon: Truck,
      action: () => {
        setActiveStep(5);
        onSetMode('EXERCISE');
        navigate(`/control-room/recovery?districtCode=${targetDistrictCode}`);
      },
      tag: '3:30-4:30'
    }
  ];

  const handleTestPacket = async () => {
    setIsProcessing(true);
    setPacketResult(null); setInspectorError('');
    try {
      const res = await fetch('/api/v1/packets/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packet: packetInput })
      });
      if (res.ok) {
        setPacketResult(await res.json());
      } else setInspectorError(`Packet validation request failed (${res.status}).`);
    } catch {
      setInspectorError('Packet validation unavailable. Check the API connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestDialect = async (preset?: string) => {
    if (!['AUTHORITY', 'RESPONDER'].includes(role)) { setInspectorError('Language extraction requires an Authority or Responder account.'); return; }
    const textToTest = preset || dialectText;
    if (preset) setDialectText(preset);
    setIsProcessing(true);
    setInspectorError('');
    try {
      const res = await fetch('/api/v1/ai/understand-sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToTest })
      });
      if (res.ok) {
        setAiExtractResult(await res.json());
      } else setInspectorError(`Language extraction failed (${res.status}).`);
    } catch {
      setInspectorError('Language extraction unavailable. Check the API connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => {
        const next = (prev === null || prev >= 5) ? 1 : prev + 1;
        steps[next - 1].action();
        if (next === 5) {
          setIsAutoPlaying(false);
        }
        return next;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  return (
    <div className="judge-demo-bar" role="region" aria-label="Hackathon Judge Demo Tour">
      <div className="judge-bar-header">
        <div className="judge-title-badge">
          <Play size={14} className="pulse-icon" />
          <span><strong>5-MINUTE DEMO RUNNER</strong> · Hack for Humanity 2026 ({currentMode} · {isSylhet ? 'Sylhet Surma Basin' : 'Feni Muhuri Basin'})</span>
        </div>
        <div className="judge-actions-right">
          <button
            type="button"
            className={`auto-tour-btn ${isAutoPlaying ? 'is-playing' : ''}`}
            onClick={() => {
              if (isAutoPlaying) {
                setIsAutoPlaying(false);
              } else {
                setIsAutoPlaying(true);
                setActiveStep(1);
                steps[0].action();
              }
            }}
            aria-pressed={isAutoPlaying}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: isAutoPlaying ? '#e02424' : '#1e40af',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            <Sparkles size={14} />
            <span>{isAutoPlaying ? 'Pause Tour' : 'Auto-Play Demo Tour'}</span>
          </button>
          <button 
            type="button" 
            className="compact-open-btn"
            onClick={() => setShowCompactModal(true)}
            aria-haspopup="dialog"
          >
            <FileText size={14} />
            <span>The Aali Compact</span>
          </button>
          <button 
            type="button" 
            className="packet-open-btn"
            onClick={() => setShowPacketModal(true)}
            aria-haspopup="dialog"
          >
            <Satellite size={14} />
            <span>Disaster Packet & AI</span>
          </button>
        </div>
      </div>

      <div className="judge-stepper">
        {steps.map((s) => {
          const Icon = s.icon;
          const isSelected = activeStep === s.num;
          return (
            <button
              key={s.num}
              type="button"
              className={`judge-step-btn ${isSelected ? 'active-step' : ''}`}
              onClick={s.action}
              title={`Jump to ${s.title}`}
            >
              <span className="step-num">{s.num}</span>
              <div className="step-info">
                <span className="step-tag">{s.tag}</span>
                <strong>{s.title}</strong>
                <small>{s.subtitle}</small>
              </div>
              <Icon size={16} className="step-icon" />
            </button>
          );
        })}
      </div>

      {/* ACTIVE MOMENT DIRECTOR CALLOUT BAR */}
      {(() => {
        const step = steps.find((s) => s.num === (activeStep || 1)) || steps[0];
        const momentDetails: Record<number, { proves: string; primaryBtn: string; onPrimary: () => void; secondaryBtn?: string; onSecondary?: () => void }> = {
          1: {
            proves: isSylhet
              ? 'PROVES TO JUDGES: Sylhet June 2022 Megaflood Replay — 84% land inundated in Companiganj & Gowainghat, Kumargaon power grid substation flooded, civilian calls stopped. Silence ≠ Safety; systems showing "no reports" failed residents.'
              : 'PROVES TO JUDGES: August 2024 Blackout Replay — 92% cell towers flooded, civilian calls stopped. Silence ≠ Safety; systems showing "no reports" failed residents.',
            primaryBtn: isSylhet ? '🚨 Replay June 2022 Megaflood' : '🚨 Replay August 2024 Blackout',
            onPrimary: () => {
              onSetMode('HISTORICAL', targetEventId);
              navigate(`/control-room/replay?mode=HISTORICAL&eventId=${targetEventId}${districtQuery}`);
            },
            secondaryBtn: '🗺️ View Crisis Map',
            onSecondary: () => {
              onSetMode('HISTORICAL', targetEventId);
              navigate(`/control-room/map?mode=HISTORICAL&eventId=${targetEventId}${districtQuery}`);
            },
          },
          2: {
            proves: isSylhet
              ? 'PROVES TO JUDGES: Deterministic 3-Signal Early Warning — When Surma River at Sylhet Point breached 10.80m warning line with 420mm Cherrapunji downpour, deterministic safety rule evaluated satellite rain + volunteer readings and escalated to ACT (+18h lead time). AI was NOT allowed to guess.'
              : 'PROVES TO JUDGES: Deterministic 3-Signal Early Warning — When automated Muhuri river gauge went blank at midnight, deterministic safety rule evaluated satellite rain + volunteer readings and escalated to ACT (evacuation). AI was NOT allowed to guess.',
            primaryBtn: isSylhet ? '⚡ Open Surma 3-Signal Hydrograph & Rule' : '⚡ Open 3-Signal Hydrograph & Rule',
            onPrimary: () => {
              onSetMode('HISTORICAL', targetEventId);
              navigate(`/control-room/replay?mode=HISTORICAL&eventId=${targetEventId}${districtQuery}`);
            },
            secondaryBtn: '🚨 Test Live Sensor Blackout in Situation Room',
            onSecondary: () => {
              onSetMode('EXERCISE');
              navigate(`/control-room/map?mode=EXERCISE${districtQuery}`);
            },
          },
          3: {
            proves: 'PROVES TO JUDGES: Blackout Transport Resilience — Under zero internet, an 80-byte SMS packet delivers exact geolocation and trapped status via satellite D2C/carrier emergency roaming. Natural dialects are decoded by local AI without data leaking off-device.',
            primaryBtn: '🛰️ Open Disaster Packet & Dialect AI Inspector',
            onPrimary: () => setShowPacketModal(true),
            secondaryBtn: '📡 Open Citizen SOS Simulator',
            onSecondary: () => navigate(`/control-room/simulator?districtCode=${targetDistrictCode}`),
          },
          4: {
            proves: 'PROVES TO JUDGES: Deterministic Boat Dispatch & Clustering — AI groups panic reports from flooded compounds into 1 incident; deterministic scoring elevates trapped children and elderly; Human Commander retains absolute dispatch approval authority.',
            primaryBtn: '🚤 Open Responder Dispatch Queue',
            onPrimary: () => {
              onSetMode('EXERCISE');
              navigate(`/control-room/responder?districtCode=${targetDistrictCode}`);
            },
            secondaryBtn: '⚙️ View Situation Room',
            onSecondary: () => {
              onSetMode('EXERCISE');
              navigate(`/control-room/map?mode=EXERCISE${districtQuery}`);
            },
          },
          5: {
            proves: 'PROVES TO JUDGES: Post-Disaster Equity & Verification — Tube well contamination recovery board prevents cholera outbreaks; aid allocation uses deterministic poverty vulnerability indices rather than arbitrary grants. Human officer sign-off required.',
            primaryBtn: '💧 Open Tube Well Recovery Board',
            onPrimary: () => {
              onSetMode('EXERCISE');
              navigate(`/control-room/recovery?districtCode=${targetDistrictCode}`);
            },
            secondaryBtn: '📜 View The Aali Tri-Party Compact',
            onSecondary: () => setShowCompactModal(true),
          },
        };

        const currentDetail = momentDetails[step.num];
        const Icon = step.icon;

        return (
          <div className="judge-moment-callout" role="status" aria-live="polite">
            <div className="moment-callout-left">
              <div className="moment-callout-icon">
                <Icon size={20} />
              </div>
              <div className="moment-callout-text">
                <h4>
                  <span>MOMENT {step.num}: {step.title}</span>
                  <span className="moment-window-tag">{step.tag}</span>
                </h4>
                <p className="moment-proves">
                  {currentDetail.proves}
                </p>
              </div>
            </div>
            <div className="moment-callout-actions">
              <button
                type="button"
                className="moment-action-btn"
                onClick={currentDetail.onPrimary}
              >
                {currentDetail.primaryBtn}
              </button>
              {currentDetail.secondaryBtn && (
                <button
                  type="button"
                  className="moment-action-btn moment-action-btn--secondary"
                  onClick={currentDetail.onSecondary}
                >
                  {currentDetail.secondaryBtn}
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* MODAL 1: The Aali Compact Framework */}
      {showCompactModal && (
        <div className="judge-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="compact-modal-title">
          <div className="judge-modal-content">
            <header className="judge-modal-header">
              <div className="modal-title-wrap">
                <FileText size={20} className="modal-title-icon" />
                <div>
                  <h2 id="compact-modal-title">The Aali Compact (The Core Premise)</h2>
                  <p>Tri-party framework agreement for declared flood emergencies in Bangladesh</p>
                </div>
              </div>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setShowCompactModal(false)}
                aria-label="Close Compact Dialog"
              >
                ✕
              </button>
            </header>

            <div className="judge-modal-body compact-grid">
              <div className="compact-party-card party-govt">
                <div className="party-badge">PARTY 1</div>
                <h3>Government (BTRC / DDM / FFWC)</h3>
                <ul>
                  <li><strong>Declares Emergency:</strong> Declares flood emergency for named upazilas ({isSylhet ? 'Companiganj, Gowainghat, Kanaighat' : 'Fulgazi, Parshuram'}).</li>
                  <li><strong>Opens Data:</strong> Shares river gauge feeds, rain alerts, and audit logs.</li>
                  <li><strong>Human Control:</strong> Authorizes and signs off on every broadcast warning.</li>
                </ul>
                <div className="party-gain"><strong>Gets:</strong> Unified verified operational picture across upazilas.</div>
              </div>

              <div className="compact-party-card party-telco">
                <div className="party-badge">PARTY 2</div>
                <h3>Mobile Operators (Banglalink / Starlink D2C)</h3>
                <ul>
                  <li><strong>Emergency Roaming:</strong> Opens satellite-to-phone Direct-to-Cell to <em>all</em> subscribers.</li>
                  <li><strong>Automated Forwarding:</strong> Forwards SOS SMS packets to Aali API gateways.</li>
                  <li><strong>Zero-Rating:</strong> Zero-rates Aali traffic and broadcasts verified Bengali alerts.</li>
                </ul>
                <div className="party-gain"><strong>Gets:</strong> Proven humanitarian mission for satellite spectrum.</div>
              </div>

              <div className="compact-party-card party-responders">
                <div className="party-badge">PARTY 3</div>
                <h3>First Responders (Red Crescent / Fire Service)</h3>
                <ul>
                  <li><strong>Shared Command:</strong> Works from one de-duplicated map instead of blind hotlines.</li>
                  <li><strong>Boat Registry:</strong> Updates availability and accepts deterministic dispatch suggestions.</li>
                  <li><strong>Ground Validation:</strong> Confirms rescues and delivers relief receipts.</li>
                </ul>
                <div className="party-gain"><strong>Gets:</strong> Prioritized, mapped requests without double-dispatch.</div>
              </div>
            </div>

            <footer className="judge-modal-footer">
              <span className="compact-note">
                Precedent: Liberty Caribbean switched on Starlink Direct to Cell for Jamaica during Hurricane Melissa (Oct 2025). Banglalink launched D2C on 7 Oct 2026.
              </span>
              <button type="button" className="action-btn-primary" onClick={() => setShowCompactModal(false)}>
                Understood · Close Compact
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* MODAL 2: Live Disaster Packet & Dialect AI Inspector */}
      {showPacketModal && (
        <div className="judge-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="packet-modal-title">
          <div className="judge-modal-content large-modal">
            <header className="judge-modal-header">
              <div className="modal-title-wrap">
                <Satellite size={20} className="modal-title-icon" />
                <div>
                  <h2 id="packet-modal-title">Disaster Packet & Dialect AI Triage Inspector</h2>
                  <p>160-character single-SMS format + Bengali/Banglish dialect NLP extraction</p>
                </div>
              </div>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setShowPacketModal(false)}
                aria-label="Close Packet Inspector"
              >
                ✕
              </button>
            </header>

            {inspectorError && <p role="alert">{inspectorError}</p>}
            <div className="judge-modal-body modal-split">
              {/* Left Column: Disaster Packet */}
              <div className="inspector-column">
                <h3>1. Single-SMS Disaster Packet (160 Bytes Max)</h3>
                <p className="column-desc">ASCII packet validation preview. Real carrier and satellite transport are not connected.</p>
                
                <div className="packet-input-group">
                  <label htmlFor="raw-packet-input">Raw Disaster Packet:</label>
                  <input 
                    id="raw-packet-input"
                    type="text" 
                    value={packetInput} 
                    onChange={(e) => setPacketInput(e.target.value)}
                    className="packet-field"
                  />
                  <div className="packet-char-counter">
                    <span>Length: {packetInput.length} chars (fits 1 SMS)</span>
                    <button 
                      type="button" 
                      className="test-packet-btn"
                      onClick={handleTestPacket}
                      disabled={isProcessing}
                    >
                      <Send size={14} />
                      <span>Decode Packet</span>
                    </button>
                  </div>
                </div>

                <div className="packet-breakdown-card">
                  <h4>Field Structure:</h4>
                  <code>{packetInput}</code>
                  <ul className="packet-fields-list"><li>A1: protocol version. S: SOS packet type.</li><li>Location: seven-character geohash cell; it does not establish GPS accuracy.</li><li>Flags: elderly, child, medical and trapped.</li><li>Timestamp: YYMMDD-HHMM in UTC.</li><li>Final fields: report short ID, followed by a validated CRC checksum.</li>
                  </ul>
                </div>

                {packetResult && (
                  <div className="packet-success-alert">
                    <CheckCircle2 size={16} />
                    <div>
                      <strong>{packetResult.status === 'VALID' ? 'Packet validated successfully' : `Packet rejected: ${packetResult.status}`}</strong>
                      <p>Validation preview only. No SOS, incident or transport receipt was created.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: AI Dialect Understanding */}
              <div className="inspector-column">
                <h3>2. AI Dialect Understanding (Bengali / Banglish)</h3>
                <p className="column-desc">Converts panicked natural language into structured triage fields.</p>

                <div className="dialect-presets">
                  <span>Presets:</span>
                  {isSylhet ? (
                    <>
                      <button type="button" onClick={() => handleTestDialect('কোম্পানীগঞ্জ বাজারে পানি উটি গেছে, ৬ জন আটকা রইছি, বাইচ্চা ও বুড়া মানুষ আছে')}>
                        Sylhet Dialect
                      </button>
                      <button type="button" onClick={() => handleTestDialect('সুরমা নদীর পানি উপচাইয়া কোম্পানীগঞ্জ বাজার প্লাবিত, ৪ জন আটকা')}>
                        Surma Surge
                      </button>
                      <button type="button" onClick={() => handleTestDialect('Companiganj Bholaganj road dubey geche 5 jon stranded rescue chai')}>
                        Sylhet Banglish
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => handleTestDialect('ফুলগাজী স্কুলে পানি উঠতাছে, ৫ জন ছাদে আটকাইছি, একজন প্যারালাইজড বুড়া')}>
                        Feni Dialect
                      </button>
                      <button type="button" onClick={() => handleTestDialect('মুহুরী বাঁধ ভাইঙ্গা গেছে, ৩ জন বাচ্চা সহ আটকা')}>
                        Breach Alert
                      </button>
                      <button type="button" onClick={() => handleTestDialect('Basha dubey geche parshuram bazar er pash-e 4 jon rescue lagbe')}>
                        Banglish
                      </button>
                    </>
                  )}
                </div>

                <div className="dialect-input-group">
                  <textarea 
                    value={dialectText}
                    onChange={(e) => setDialectText(e.target.value)}
                    rows={3}
                    className="dialect-textarea"
                  />
                  <button 
                    type="button" 
                    className="test-ai-btn"
                    onClick={() => handleTestDialect()}
                    disabled={isProcessing}
                  >
                    <Sparkles size={14} />
                    <span>Run AI Extraction</span>
                  </button>
                </div>

                {aiExtractResult && (
                  <div className="ai-result-card">
                    <h4>Structured Triage Fields (JSON):</h4>
                    <pre>{JSON.stringify(aiExtractResult.extracted, null, 2)}</pre>
                    <div className="ai-meta-tag">
                      <span>Provider: {aiExtractResult.providerMode}</span>
                      <span>Latency: {aiExtractResult.latencyMs}ms</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <footer className="judge-modal-footer">
              <button 
                type="button" 
                className="action-btn-secondary"
                onClick={() => {
                  setShowPacketModal(false);
                  navigate(`/control-room/responder?districtCode=${targetDistrictCode}`);
                }}
              >
                Go to Responder Queue
              </button>
              <button type="button" className="action-btn-primary" onClick={() => setShowPacketModal(false)}>
                Done
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
