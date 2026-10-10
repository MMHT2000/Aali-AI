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

interface JudgeDemoRunnerProps {
  currentMode: OperationsMode;
  onSetMode: (mode: OperationsMode, eventId?: string) => void;
}

export function JudgeDemoRunner({ currentMode, onSetMode }: JudgeDemoRunnerProps) {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [showCompactModal, setShowCompactModal] = useState(false);
  const [showPacketModal, setShowPacketModal] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Packet & Dialect Tester State
  const [packetInput, setPacketInput] = useState('A1|S|wh0r2q8|05|E1M0|0821-1430|7Q2K');
  const [dialectText, setDialectText] = useState('ফুলগাজী স্কুলে পানি উঠতাছে, ৫ জন ছাদে আটকাইছি, একজন প্যারালাইজড বুড়া');
  const [packetResult, setPacketResult] = useState<any>(null);
  const [aiExtractResult, setAiExtractResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'The Crisis',
      subtitle: '92% Towers Dead',
      icon: ShieldAlert,
      action: () => {
        setActiveStep(1);
        onSetMode('HISTORICAL', '11111111-1111-1111-1111-111111111101');
        navigate('/control-room/map?mode=HISTORICAL&eventId=11111111-1111-1111-1111-111111111101');
      },
      tag: '0:00-0:30'
    },
    {
      num: 2,
      title: 'BEFORE: 3 Signals',
      subtitle: 'Blank Gauge Rule',
      icon: AlertTriangle,
      action: () => {
        setActiveStep(2);
        onSetMode('HISTORICAL', '11111111-1111-1111-1111-111111111101');
        navigate('/control-room/replay?mode=HISTORICAL&eventId=11111111-1111-1111-1111-111111111101');
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
        navigate('/control-room/responder');
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
        navigate('/control-room/recovery');
      },
      tag: '3:30-4:30'
    }
  ];

  const handleTestPacket = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/v1/gateway/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawMessage: packetInput, sender: '+8801812345678' })
      });
      if (res.ok) {
        setPacketResult(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestDialect = async (preset?: string) => {
    const textToTest = preset || dialectText;
    if (preset) setDialectText(preset);
    setIsProcessing(true);
    try {
      const res = await fetch('/api/v1/ai/understand-sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToTest })
      });
      if (res.ok) {
        setAiExtractResult(await res.json());
      }
    } catch (e) {
      console.error(e);
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
          <span><strong>5-MINUTE DEMO RUNNER</strong> · Hack for Humanity 2026 ({currentMode})</span>
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
                  <li><strong>Declares Emergency:</strong> Declares flood emergency for named upazilas (Fulgazi, Parshuram).</li>
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

            <div className="judge-modal-body modal-split">
              {/* Left Column: Disaster Packet */}
              <div className="inspector-column">
                <h3>1. Single-SMS Disaster Packet (160 Bytes Max)</h3>
                <p className="column-desc">Works over 2G GSM, satellite SMS (D2C), or local store-and-forward queue.</p>
                
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
                  <code>A1 | S | wh0r2q8 | 05 | E1M0 | 0821-1430 | 7Q2K</code>
                  <ul className="packet-fields-list">
                    <li><code>A1</code>: Protocol Version 1</li>
                    <li><code>S</code>: Type = SOS (Distress)</li>
                    <li><code>wh0r2q8</code>: 7-char Geohash (~150m accuracy in Fulgazi)</li>
                    <li><code>05</code>: 5 people requiring rescue</li>
                    <li><code>E1M0</code>: Urgent Flags (Elderly: 1, Medical: 0)</li>
                    <li><code>0821-1430</code>: Timestamp 21 Aug, 14:30 BST</li>
                    <li><code>7Q2K</code>: Integrity Checksum</li>
                  </ul>
                </div>

                {packetResult && (
                  <div className="packet-success-alert">
                    <CheckCircle2 size={16} />
                    <div>
                      <strong>Packet Ingested Successfully!</strong>
                      <p>Mapped to incident in Fulgazi. Server acknowledgement: {packetResult.reportId || 'ACK_ACCEPTED'}</p>
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
                  <button type="button" onClick={() => handleTestDialect('ফুলগাজী স্কুলে পানি উঠতাছে, ৫ জন ছাদে আটকাইছি, একজন প্যারালাইজড বুড়া')}>
                    Feni Dialect
                  </button>
                  <button type="button" onClick={() => handleTestDialect('মুহুরী বাঁধ ভাইঙ্গা গেছে, ৩ জন বাচ্চা সহ আটকা')}>
                    Breach Alert
                  </button>
                  <button type="button" onClick={() => handleTestDialect('Basha dubey geche parshuram bazar er pash-e 4 jon rescue lagbe')}>
                    Banglish
                  </button>
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
                  navigate('/control-room/responder');
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
