import { useState, useEffect } from 'react';
import { apiFetch as fetch } from '../lib/authenticated-fetch';
import { checkApiHealth, ApiHealthResponse } from '../lib/api-client';

interface ProviderStatusData {
  activeProvider: string;
  primaryProvider: { name: string; status: string; type: string };
  backupProvider: { name: string; status: string; type: string };
  failoverPolicy: { timeoutMs: number; safeFallbackAvailable: boolean };
}

export function SettingsPanel() {
  const [providerStatus, setProviderStatus] = useState<ProviderStatusData | null>(null);
  const [health, setHealth] = useState<ApiHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [aiRes, h] = await Promise.all([
        fetch('/api/v1/ai/status').then((r) => (r.ok ? r.json() : null)),
        checkApiHealth().catch(() => null),
      ]);
      setProviderStatus(aiRes);
      setHealth(h);
    } catch {
      // offline / mock
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', color: '#f8fafc' }}>
      <h2 style={{ fontSize: '1.25rem', color: '#38bdf8', marginBottom: '0.5rem' }}>
        ⚙️ সিস্টেম কনফিগারেশন ও এলএলএম প্রোভাইডার সেটিংস / System & LLM Settings
      </h2>
      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
        প্রাইমারি ও ব্যাকআপ এলএলএম ফেইলওভার পলিসি, পিআইআই সুরক্ষা এবং স্থানীয় ডিটারমিনিস্টিক রুল স্ট্যাটাস
      </p>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>লোড হচ্ছে...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* LLM Failover & Seam Policy */}
          <section style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#facc15', marginTop: 0 }}>
              🤖 ভাষা মডেল কনফিগারেশন (LLM Primary & Backup Seam)
            </h3>

            {providerStatus ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
                <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>বর্তমান সক্রিয় প্রোভাইডার:</span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#38bdf8' }}>
                    {providerStatus.activeProvider}
                  </div>
                </div>

                <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>প্রাইমারি প্রোভাইডার:</span>
                  <div style={{ fontSize: '0.9rem', color: '#4ade80' }}>
                    {providerStatus.primaryProvider?.name} ({providerStatus.primaryProvider?.status})
                  </div>
                </div>

                <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ব্যাকআপ স্ট্যান্ডবাই:</span>
                  <div style={{ fontSize: '0.9rem', color: '#a78bfa' }}>
                    {providerStatus.backupProvider?.name} ({providerStatus.backupProvider?.status})
                  </div>
                </div>

                <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ফেইলওভার টাইমআউট:</span>
                  <div style={{ fontSize: '0.9rem', color: '#fbbf24' }}>
                    {providerStatus.failoverPolicy?.timeoutMs} ms
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: '#94a3b8' }}>প্রোভাইডার তথ্য উপলব্ধ নয়</p>
            )}

            <div style={{ marginTop: '1rem', padding: '0.6rem', background: '#0f172a', borderRadius: '4px', border: '1px dashed #475569', fontSize: '0.78rem', color: '#94a3b8' }}>
              🔒 <strong>কঠোর পিআইআই নীতি:</strong> কোনো রেসিডেন্ট ফোন নম্বর, এনআইডি, সুনির্দিষ্ট জিপিএস লোকেশন বা কাঁচা ব্যক্তিগত টেক্সট রিমোট এলএলএম-এ পাঠানো হয় না। সকল প্রোভাইডার রিকোয়েস্টে রিডাকশন নিশ্চিত করা হয়।
            </div>
          </section>

          {/* Operational Environment Modes */}
          <section style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#38bdf8', marginTop: 0 }}>
              🌐 দুর্যোগ প্ল্যাটফর্ম অপারেশনাল মোড (Platform Modes)
            </h3>

            {health && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem', marginTop: '0.75rem' }}>
                <div style={{ background: '#0f172a', padding: '0.6rem', borderRadius: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>পরিবেশ (Environment):</span>
                  <div style={{ fontWeight: 'bold' }}>{health.environment}</div>
                </div>
                <div style={{ background: '#0f172a', padding: '0.6rem', borderRadius: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>এসএমএস গেটওয়ে মোড:</span>
                  <div style={{ fontWeight: 'bold', color: '#fbbf24' }}>{health.modes.smsGateway} (simulated)</div>
                </div>
                <div style={{ background: '#0f172a', padding: '0.6rem', borderRadius: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>স্যাটেলাইট মোড:</span>
                  <div style={{ fontWeight: 'bold', color: '#fbbf24' }}>{health.modes.satellite}</div>
                </div>
                <div style={{ background: '#0f172a', padding: '0.6rem', borderRadius: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>অফিসিয়াল ডেটা মোড:</span>
                  <div style={{ fontWeight: 'bold' }}>{health.modes.officialData}</div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

