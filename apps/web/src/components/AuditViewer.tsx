import { useState, useEffect } from 'react';
import { apiFetch as fetch, safeJson } from '../lib/authenticated-fetch';

interface AuditLogRecord {
  id: string;
  occurred_at: string;
  actor_user_id?: string;
  actor?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  reason?: string;
}

export function AuditViewer() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/audit-logs');
      const data = await safeJson<AuditLogRecord[]>(res);
      if (Array.isArray(data)) {
        setLogs(data);
      }
    } catch {
      // offline / mock
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', color: '#f8fafc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#38bdf8', margin: 0 }}>
            📜 সিস্টেম অডিট ট্রেইল / Immutable Operational Audit Logs
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>
            সকল সতর্কবার্তা অনুমোদন, বোট প্রেরণ সিদ্ধান্ত, রিপোর্ট মার্জ/স্প্লিট ও ত্রাণ বিতরণের অপরিবর্তনীয় রেকর্ড
          </p>
        </div>
        <button
          type="button"
          onClick={fetchLogs}
          style={{ background: '#334155', color: '#fff', border: '1px solid #475569', padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
        >
          🔄 রিফ্রেশ (Refresh Logs)
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>অডিট লগ লোড হচ্ছে...</p>
      ) : logs.length === 0 ? (
        <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', color: '#94a3b8' }}>
          কোনো অডিট রেকর্ড এখনও পাওয়া যায়নি।
        </div>
      ) : (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '0.6rem 0.8rem' }}>সময় (UTC / Dhaka)</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>ইউজার / রোল</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>অ্যাকশন</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>এনটিটি</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>কারণ / বিবরণ</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '0.6rem 0.8rem', color: '#cbd5e1' }}>
                    {new Date(log.occurred_at).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', hour12: false })}
                  </td>
                  <td style={{ padding: '0.6rem 0.8rem', fontWeight: 'bold', color: '#38bdf8' }}>
                    {log.actor_user_id || log.actor || 'SYSTEM'}
                  </td>
                  <td style={{ padding: '0.6rem 0.8rem' }}>
                    <span style={{
                      background: log.action.includes('APPROVE') ? '#065f46' : log.action.includes('SPLIT') ? '#7c2d12' : '#1e3a8a',
                      color: '#fff',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '0.6rem 0.8rem', color: '#94a3b8' }}>
                    {log.entity_type}:{log.entity_id?.slice(0, 8)}...
                  </td>
                  <td style={{ padding: '0.6rem 0.8rem', color: '#e2e8f0' }}>
                    {log.reason || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

