import { useState, useEffect } from 'react';
import { apiFetch as fetch } from '../lib/authenticated-fetch';

interface GatewayResponse {
  simulation: boolean;
  gatewayId: string;
  reportId: string;
  clientReportId: string;
  packetChecksum: string;
  isIdempotentDuplicate: boolean;
  status: string;
  receivedAt: string;
}

export function GatewaySimulator({ districtCode = 'FENI_DIST' }: { districtCode?: string } = {}) {
  const isSylhet = districtCode === 'SYLHET_DIST';
  const [packetInput, setPacketInput] = useState<string>('');
  const [gatewayId, setGatewayId] = useState<string>(isSylhet ? 'SYLHET-SURMA-GATEWAY-01' : 'FENI-TOWER-GATEWAY-01');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<GatewayResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setGatewayId(isSylhet ? 'SYLHET-SURMA-GATEWAY-01' : 'FENI-TOWER-GATEWAY-01');
  }, [isSylhet]);

  const handleSimulateForward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packetInput.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/v1/gateway/simulated/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packet: packetInput.trim(),
          gatewayId: gatewayId.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Gateway returned HTTP ${res.status}`);
      }
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gateway communication failure');
    } finally {
      setLoading(false);
    }
  };

  const loadExamplePacket = () => {
    // Example valid packet with verified CRC-16 checksum
    setPacketInput(
      isSylhet
        ? 'A1|S|wh1quuk|06|E1C1M1T0|260617-1500|SY01|0GQS'
        : 'A1|S|wh0xs6m|05|E1C0M1T0|261009-1430|7Q2K|0GQS'
    );
  };

  return (
    <div
      className="gateway-simulator-container"
      style={{
        background: '#1e293b',
        border: '2px dashed #a855f7',
        borderRadius: '8px',
        padding: '1.25rem',
        marginTop: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📡 মোবাইল গেটওয়ে সিমুলেটর / Carrier SMS Gateway Simulator
        </h3>
        <span
          style={{
            fontSize: '0.75rem',
            background: 'rgba(168, 85, 247, 0.25)',
            color: '#e9d5ff',
            border: '1px solid #a855f7',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
          }}
        >
          DEMO SIMULATION ONLY
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1rem' }}>
        ব্ল্যাকআউট বা সেলুলার ডাটা বিচ্ছিন্ন অবস্থায় অফলাইন ব্রাউজার থেকে প্রাপ্ত কমপ্যাক্ট ASCII প্যাকেট এখানে প্রবেশ করিয়ে টেলিকম গেটওয়ের মাধ্যমে সিস্টেমে পৌঁছানোর সিমুলেশন দেখুন। (This demonstrates simulated carrier/satellite relay forwarding).
      </p>

      <form onSubmit={handleSimulateForward} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
            ASCII Disaster Packet (One 160-char SMS segment):
          </label>
          <textarea
            rows={2}
            value={packetInput}
            onChange={(e) => setPacketInput(e.target.value)}
            placeholder="A1|S|wh0xs6m|05|E1C0M1T0|261009-1430|7Q2K|1G90"
            style={{
              width: '100%',
              padding: '0.5rem',
              background: '#0f172a',
              color: '#38bdf8',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              border: '1px solid #475569',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
              Simulated Tower / Gateway ID:
            </label>
            <input
              type="text"
              value={gatewayId}
              onChange={(e) => setGatewayId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.4rem',
                background: '#0f172a',
                color: 'white',
                border: '1px solid #475569',
                borderRadius: '4px',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <div style={{ alignSelf: 'flex-end', display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={loadExamplePacket}
              style={{
                background: '#334155',
                color: '#cbd5e1',
                border: 'none',
                padding: '0.45rem 0.8rem',
                borderRadius: '4px',
                fontSize: '0.85rem',
              }}
            >
              নমুনা প্যাকেট লোড করুন
            </button>
            <button
              type="submit"
              disabled={loading || !packetInput.trim()}
              style={{
                background: '#a855f7',
                color: 'white',
                fontWeight: 'bold',
                border: 'none',
                padding: '0.45rem 1rem',
                borderRadius: '4px',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              {loading ? 'ফরওয়ার্ড হচ্ছে...' : 'প্যাকেট ফরওয়ার্ড করুন (Simulate Ingest) 🚀'}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '4px', color: '#fca5a5', fontSize: '0.85rem' }}>
          <strong>ত্রুটি / Gateway Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#0f172a', border: '1px solid #10b981', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <strong style={{ color: '#34d399', fontSize: '0.9rem' }}>
              ✓ প্যাকেট সফলভাবে গৃহীত / Packet Ingested
            </strong>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.15rem 0.4rem',
                borderRadius: '3px',
                background: result.isIdempotentDuplicate ? '#f59e0b' : '#10b981',
                color: 'black',
                fontWeight: 'bold',
              }}
            >
              {result.isIdempotentDuplicate ? 'DUPLICATE IGNORED' : 'ACCEPTED'}
            </span>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div><strong>Report ID:</strong> <code style={{ color: '#38bdf8' }}>{result.reportId}</code></div>
            <div><strong>Checksum:</strong> <code>{result.packetChecksum}</code></div>
            <div><strong>Gateway Station:</strong> {result.gatewayId}</div>
            <div><strong>Mode:</strong> <span style={{ color: '#c084fc' }}>Simulated Carrier Gateway (demo truthfulness enforced)</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
