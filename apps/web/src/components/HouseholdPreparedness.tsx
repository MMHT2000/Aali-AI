import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BrainArea, BrainPlan, PersonalGuidance, brainAreas } from '../lib/brain-client';
import './AiBrain.css';
type HouseholdResult = PersonalGuidance & { areaName: string; basin: string; generatedAt: string; risk: BrainPlan['risk']; evidence: BrainPlan['environment']['evidence']; limitations: string[] };

export function HouseholdPreparedness() {
  const [areas, setAreas] = useState<BrainArea[]>([]); const [areaId, setAreaId] = useState('feni');
  const [data, setData] = useState<HouseholdResult | null>(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  useEffect(() => { const controller = new AbortController(); brainAreas(controller.signal).then(setAreas).catch(() => { if (!controller.signal.aborted) setError('Area list unavailable. Please retry.'); }); return () => controller.abort(); }, []);
  useEffect(() => { generation.current++; setData(null); setError(''); setBusy(false); }, [areaId]);
  const load = (gps: boolean) => {
    const current = ++generation.current; setBusy(true); setError(''); setData(null);
    const send = async (location?: { latitude: number; longitude: number }) => {
      try {
        const response = await fetch('/api/v1/brain/household', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ areaId, mode: 'LIVE', people: 1, ...location }) });
        if (!response.ok) { const result = await response.json() as { message?: string }; throw new Error(result.message || 'Guidance unavailable'); }
        const result = await response.json() as HouseholdResult; if (current === generation.current) setData(result);
      } catch (e) { if (current === generation.current) setError(String(e)); }
      finally { if (current === generation.current) setBusy(false); }
    };
    if (!gps) { void send(); return; }
    if (!navigator.geolocation) { setBusy(false); setError('GPS unavailable. Choose guidance without GPS.'); return; }
    navigator.geolocation.getCurrentPosition(p => { if (current === generation.current) void send({ latitude: p.coords.latitude, longitude: p.coords.longitude }); }, () => { if (current === generation.current) { setBusy(false); setError('Location denied or unavailable. Choose guidance without GPS.'); } }, { timeout: 10000, maximumAge: 60000 });
  };
  return <main className="ai-brain" style={{ padding: '24px', minHeight: '100vh', background: '#081522' }}><header className="brain-hero"><div><span className="brain-eyebrow">AALI · COMMUNITY PREPAREDNESS</span><h1>Know your area. Prepare your household.</h1><p>এলাকার তথ্য দেখুন, প্রয়োজনীয় প্রস্তুতি নিন। No account or GPS required.</p></div><Link to="/">Staff sign-in</Link></header><section className="brain-card"><label>Choose your area / এলাকা<select value={areaId} onChange={e => setAreaId(e.target.value)}>{areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label><div className="brain-buttons"><button disabled={busy} onClick={() => load(false)}>{busy ? 'Checking public sources…' : 'Check my area without GPS'}</button><button disabled={busy} onClick={() => load(true)}>Use my location</button></div><p>Location is used only to check the selected area. It is not stored or sent to GPT. This prototype is not an emergency service.</p></section>{error && <p className="brain-error" role="alert">{error}</p>}{data && <><section className="brain-card"><h2>{data.areaName} · {data.risk.level}</h2><p>{data.risk.label}</p><ul>{data.risk.reasons.map(r => <li key={r}>{r}</li>)}</ul><h2>Preparation checklist / প্রস্তুতি</h2><ul>{data.preparation.map(p => <li key={p}>{p}</li>)}</ul><p>{data.shelterStatus}</p><p>{data.aidStatus}</p><small>Checked {new Date(data.generatedAt).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' })} · Asia/Dhaka</small></section><section className="brain-card"><h2>Source status</h2>{data.evidence.map(e => <p key={e.id}><strong>{e.provider}</strong> · {e.status}<br /><small>{e.note}</small></p>)}</section><details className="brain-card"><summary>What this guidance can establish</summary><ul>{data.limitations.map(l => <li key={l}>{l}</li>)}</ul></details></>}</main>;
}
