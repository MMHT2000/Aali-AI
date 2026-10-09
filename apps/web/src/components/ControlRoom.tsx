import { useState, useEffect } from 'react';
import { UserSession } from './Login';
import { ResponderDashboard } from './ResponderDashboard';
import { FloodReplayWarning } from './FloodReplayWarning';
import { RecoveryLedger } from './RecoveryLedger';
import { AiLanguageAssistant } from './AiLanguageAssistant';
import { ThreeTapSos } from './ThreeTapSos';
import { GatewaySimulator } from './GatewaySimulator';
import { ResidentSimulator } from './ResidentSimulator';
import { SettingsPanel } from './SettingsPanel';
import { AuditViewer } from './AuditViewer';
import { checkApiHealth, ApiHealthResponse } from '../lib/api-client';

export type ControlRoomTab =
  | 'overview'
  | 'triage'
  | 'alerts'
  | 'replay'
  | 'recovery'
  | 'ai'
  | 'audit'
  | 'settings'
  | 'simulator';

interface ControlRoomProps {
  session: UserSession;
  onLogout: () => void;
}

export function ControlRoom({ session, onLogout }: ControlRoomProps) {
  const [activeTab, setActiveTab] = useState<ControlRoomTab>('overview');
  const [health, setHealth] = useState<ApiHealthResponse | null>(null);

  useEffect(() => {
    checkApiHealth().then(setHealth).catch(() => {});
  }, []);

  const navItems: { id: ControlRoomTab; label: string; icon: string; minRole?: string }[] = [
    { id: 'overview', label: 'সেন্ট্রাল ওভারভিউ (Overview)', icon: '🏛️' },
    { id: 'triage', label: 'এসওএস ও রেসপন্ডার ট্রায়াজ (SOS & Responders)', icon: '🚨' },
    { id: 'alerts', label: 'বন্যা সতর্কতা ও অনুমোদন (Flood Alerts)', icon: '🌊' },
    { id: 'replay', label: 'ঐতিহাসিক মহড়া ও রিলে (Historical Replay)', icon: '⏪' },
    { id: 'recovery', label: 'পুনর্বাসন ও ত্রাণ খতিয়ান (Recovery Ledger)', icon: '🤝' },
    { id: 'ai', label: 'এআই সহকারী ও ফলব্যাক (AI Language Layer)', icon: '🤖' },
    { id: 'audit', label: 'অডিট লগ (Audit Logs)', icon: '📜' },
    { id: 'settings', label: 'এলএলএম ও সিস্টেম সেটিংস (Settings)', icon: '⚙️' },
    { id: 'simulator', label: '🧪 রেসিডেন্ট ক্লায়েন্ট সিমুলেটর (Resident Simulator)', icon: '📱' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Application Bar */}
      <header style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ fontSize: '1.4rem' }}>🌊</span>
          <div>
            <h1 style={{ fontSize: '1.15rem', margin: 0, color: '#38bdf8', fontWeight: 'bold' }}>
              আলি এআই — কেন্দ্রীয় দুর্যোগ কন্ট্রোল রুম
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Feni Disaster Resilience Decision-Support Platform | Asia/Dhaka Local Time
            </span>
          </div>
        </div>

        {/* User Session & Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#f1f5f9' }}>{session.displayName}</div>
            <div style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
              রোল: <span style={{ background: '#1e293b', padding: '0.1rem 0.4rem', borderRadius: '3px', border: '1px solid #334155' }}>{session.role}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            style={{ background: '#334155', color: '#cbd5e1', border: '1px solid #475569', padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.78rem', cursor: 'pointer' }}
          >
            লগআউট (Logout)
          </button>
        </div>
      </header>

      {/* Product Honesty Notice Banner */}
      <aside style={{ background: '#451a03', borderBottom: '1px solid #78350f', padding: '0.4rem 1.5rem', fontSize: '0.78rem', color: '#fde047' }}>
        ⚠️ <strong>সিদ্ধান্ত-সহায়তা প্রোটোটাইপ:</strong> আলি এআই একটি সিদ্ধান্ত-সহায়তা প্ল্যাটফর্ম, কোনো স্বয়ংক্রিয় জরুরি পরিষেবা নয়। সকল অফিশিয়াল সতর্কতা প্রকাশ ও বোট প্রেরণ অনুমোদিত মানুষের স্বাক্ষরে সম্পন্ন হতে হবে।
      </aside>

      {/* Main Control Room Layout (Sidebar Nav + Work Area) */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar Navigation */}
        <nav style={{ width: '260px', background: '#0b1120', borderRight: '1px solid #1e293b', padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: isActive ? '#0284c7' : 'transparent',
                  color: isActive ? '#fff' : '#cbd5e1',
                  fontWeight: isActive ? 'bold' : 'normal',
                  fontSize: '0.82rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <div style={{ marginTop: 'auto', padding: '0.75rem 0.5rem', borderTop: '1px solid #1e293b', fontSize: '0.72rem', color: '#64748b' }}>
            <div>API: {health?.status === 'ok' ? '🟢 অনলাইন (3001)' : '🔴 অফলাইন'}</div>
            <div>AI: {health?.modes?.aiProvider || 'mock'} (Local Failover)</div>
          </div>
        </nav>

        {/* Focused Workspace View */}
        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>চলমান প্লাবন সতর্কতা লেভেল:</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#f87171', marginTop: '0.2rem' }}>
                    ⚠️ ACT (জরুরি স্থানান্তর)
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>মুহুরী নদী (পরশুরাম গেজ স্টেশন)</span>
                </div>

                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>নীরব গ্রাম (Silent Village Flag):</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#fbbf24', marginTop: '0.2rem' }}>
                    ১টি ইউনিয়ন যাচাইাধীন
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>চিথলিয়া ইউনিয়ন (নিরাপদ মাধ্যমে যাচাই)</span>
                </div>

                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>প্রস্তুত রেসকিউ বোট:</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#38bdf8', marginTop: '0.2rem' }}>
                    ৩টি জলযান প্রস্তুত
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>বিডিআরসিএস ও ফায়ার সার্ভিস ট্রলার</span>
                </div>

                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>সিস্টেম মোড:</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#4ade80', marginTop: '0.2rem' }}>
                    ডেমো ও ঐতিহাসিক রিলে
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>আগস্ট ২০২৪ বন্যা ক্রেস্ট ডেটাসেট</span>
                </div>
              </div>

              {/* Quick Launchpad to major features */}
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#38bdf8', marginTop: 0 }}>
                  🚀 কেন্দ্রীয় কন্ট্রোল রুম দ্রুত অ্যাক্সেস / Quick Operations Launchpad
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('triage')}
                    style={{ background: '#0f172a', border: '1px solid #475569', color: '#fff', padding: '0.75rem', borderRadius: '6px', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <strong>🚨 রেসপন্ডার ট্রায়াজ</strong>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>এসওএস ইনবক্স ও বোট বরাদ্দ সিদ্ধান্ত</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('alerts')}
                    style={{ background: '#0f172a', border: '1px solid #475569', color: '#fff', padding: '0.75rem', borderRadius: '6px', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <strong>🌊 সতর্কতা অনুমোদন</strong>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>৩-সংকেত নিয়ম ও অথরিটি স্বাক্ষর</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('simulator')}
                    style={{ background: '#0f172a', border: '1px solid #ca8a04', color: '#fef08a', padding: '0.75rem', borderRadius: '6px', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <strong>📱 ক্লায়েন্ট সিমুলেটর</strong>
                    <div style={{ fontSize: '0.75rem', color: '#ca8a04', marginTop: '0.2rem' }}>মক এনআইডি চেক ও অফলাইন এসওএস টেস্ট</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('recovery')}
                    style={{ background: '#0f172a', border: '1px solid #475569', color: '#fff', padding: '0.75rem', borderRadius: '6px', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <strong>🤝 ত্রাণ সমন্বয়</strong>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>গ্রাম-ভিত্তিক অপূর্ণ চাহিদা ও খতিয়ান</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'triage' && (
            <div>
              <ResponderDashboard />
            </div>
          )}

          {activeTab === 'alerts' && (
            <div>
              <FloodReplayWarning />
            </div>
          )}

          {activeTab === 'replay' && (
            <div>
              <FloodReplayWarning />
            </div>
          )}

          {activeTab === 'recovery' && (
            <div>
              <RecoveryLedger />
            </div>
          )}

          {activeTab === 'ai' && (
            <div>
              <AiLanguageAssistant />
            </div>
          )}

          {activeTab === 'audit' && (
            <div>
              <AuditViewer />
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <SettingsPanel />
            </div>
          )}

          {activeTab === 'simulator' && (
            <div>
              <ResidentSimulator />
              <div style={{ marginTop: '2rem' }}>
                <ThreeTapSos />
                <GatewaySimulator />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

