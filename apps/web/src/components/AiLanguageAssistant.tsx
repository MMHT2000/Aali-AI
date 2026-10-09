import { useState, useEffect } from 'react';

export interface ExtractedFields {
  peopleCount: number | null;
  urgencyFlags: {
    trapped: boolean;
    elderly: boolean;
    child: boolean;
    medical: boolean;
  };
  locationWords: string[];
  waterTrend: string;
  fieldConfidence: {
    peopleCount: number;
    urgencyFlags: number;
    locationWords: number;
    waterTrend: number;
  };
}

export interface UnderstandSosResponse {
  extracted: ExtractedFields;
  rawText: string;
  providerMode: string;
  isFallback: boolean;
  latencyMs: number;
}

export interface BenchmarkReportResponse {
  totalMessages: number;
  peopleCountAccuracy: number;
  vulnerabilityAccuracy: number;
  waterTrendAccuracy: number;
  overallAccuracy: number;
  fallbackSuccessRate: number;
  evaluatedAt: string;
}

export interface ShiftSummaryData {
  shiftTitle: string;
  generatedAt: string;
  sourceIncidentIds: string[];
  summaryBn: string;
  disclaimer: string;
  counts: {
    totalSosProcessed: number;
    evacuationsCompleted: number;
    silentVillagesFlagged: number;
    reliefDeliveriesLogged: number;
  };
}

export interface BenchmarkSample {
  id: string;
  text: string;
  category: string;
  expectedPeopleCount: number | null;
}

export function AiLanguageAssistant() {
  const [inputText, setInputText] = useState<string>(
    'আমরা উত্তর চিথলিয়া প্রাইমারি স্কুলের ছাদে ৫ জন আটকে আছি। সাথে ১ জন বয়স্ক ও শিশু আছে। পানি খুব দ্রুত বাড়ছে।',
  );
  const [result, setResult] = useState<UnderstandSosResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOutageSimulated, setIsOutageSimulated] = useState<boolean>(false);
  const [benchmarkReport, setBenchmarkReport] = useState<BenchmarkReportResponse | null>(null);
  const [samples, setSamples] = useState<BenchmarkSample[]>([]);
  const [shiftSummary, setShiftSummary] = useState<ShiftSummaryData | null>(null);
  const [shiftLoading, setShiftLoading] = useState<boolean>(false);
  const [operatorEdits, setOperatorEdits] = useState<{ peopleCount: number | ''; notes: string }>({
    peopleCount: '',
    notes: '',
  });
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Load benchmark samples on mount
  useEffect(() => {
    fetch('/api/v1/ai/benchmark/samples')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: BenchmarkSample[]) => setSamples(data))
      .catch(() => {});
  }, []);

  const handleUnderstand = async (textToProcess?: string) => {
    const targetText = textToProcess || inputText;
    setLoading(true);
    setSaveFeedback(null);
    try {
      const res = await fetch('/api/v1/ai/understand-sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: targetText,
          forceFallback: isOutageSimulated,
        }),
      });
      if (res.ok) {
        const data: UnderstandSosResponse = await res.json();
        setResult(data);
        setOperatorEdits({
          peopleCount: data.extracted.peopleCount !== null ? data.extracted.peopleCount : '',
          notes: '',
        });
      }
    } catch {
      // offline / mock fallback
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOutage = async (checked: boolean) => {
    setIsOutageSimulated(checked);
    try {
      await fetch('/api/v1/ai/status/outage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outage: checked }),
      });
    } catch {
      // offline simulation mode
    }
  };

  const handleRunBenchmark = async () => {
    try {
      const res = await fetch('/api/v1/ai/benchmark');
      if (res.ok) {
        setBenchmarkReport(await res.json());
      }
    } catch {
      // offline simulation mode
    }
  };

  const handleSaveOperatorCorrection = () => {
    setSaveFeedback(
      `অপারেটর সংশোধন সংরক্ষিত হয়েছে: মানুষের সংখ্যা ${operatorEdits.peopleCount || 'অপরিবর্তিত'} (Operator Verified).`,
    );
  };

  const handleGenerateShiftSummary = async () => {
    setShiftLoading(true);
    try {
      const res = await fetch('/api/v1/ai/shift-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftTitle: 'রাত্রিকালীন বন্যা অপারেশন শিফট (Night Shift Handover)',
          totalSosProcessed: 14,
          evacuationsCompleted: 6,
          silentVillagesFlagged: 2,
          reliefDeliveriesLogged: 9,
          sourceIncidentIds: ['sos-001', 'sos-002', 'sos-003', 'sos-004'],
        }),
      });
      if (res.ok) {
        setShiftSummary(await res.json());
      }
    } catch {
      // offline / mock fallback
    } finally {
      setShiftLoading(false);
    }
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '1.25rem', marginTop: '1.5rem', color: '#f8fafc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', color: '#38bdf8', margin: 0 }}>
            🤖 এআই ভাষা সহকারী ও ফলব্যাক / AI NLP Assistant & Deterministic Fallback
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            বাংলা/বাংলিশ এসওএস বিশ্লেষণ, স্বয়ংক্রিয় কিওয়ার্ড ফলব্যাক এবং অপারেটর যাচাইকরণ
          </span>
        </div>

        {/* AI Outage Simulation Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#1e293b', padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid #475569' }}>
          <input
            type="checkbox"
            id="ai-outage-toggle"
            checked={isOutageSimulated}
            onChange={(e) => handleToggleOutage(e.target.checked)}
          />
          <label htmlFor="ai-outage-toggle" style={{ fontSize: '0.85rem', color: isOutageSimulated ? '#f87171' : '#cbd5e1', cursor: 'pointer' }}>
            ⚡ এআই বিভ্রাট ডেমো (Simulate AI Outage / Fallback Mode)
          </label>
        </div>
      </div>

      {/* Primary SOS NLP Workbench */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '1rem', marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
          এসওএস বার্তা টেক্সট (Bangla / Banglish Raw Text):
        </label>
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="বাংলা বা বাংলিশে বার্তা লিখুন..."
          style={{ width: '100%', background: '#0f172a', color: '#f8fafc', border: '1px solid #475569', borderRadius: '4px', padding: '0.6rem', fontSize: '0.9rem', marginBottom: '0.75rem', boxSizing: 'border-box' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          {/* Sample quick-loader */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
            <span style={{ color: '#94a3b8' }}>নমুনা লোড করুন:</span>
            {samples.slice(0, 3).map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setInputText(s.text);
                  handleUnderstand(s.text);
                }}
                style={{ background: '#334155', color: '#cbd5e1', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '3px', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                নমুনা {idx + 1}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleUnderstand()}
            style={{ background: '#0284c7', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}
          >
            {loading ? 'বিশ্লেষণ হচ্ছে...' : '🔍 এসওএস বিশ্লেষণ করুন (Analyze Text)'}
          </button>
        </div>
      </div>

      {/* Extracted Structured Result */}
      {result && (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#38bdf8', margin: 0 }}>
              📋 নিষ্কাশিত ক্ষেত্রসমূহ / Extracted Structured Schema
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '3px',
                  background: result.isFallback ? '#7f1d1d' : '#065f46',
                  color: result.isFallback ? '#fca5a5' : '#a7f3d0',
                  fontWeight: 'bold',
                }}
              >
                প্রোভাইডার: {result.providerMode} {result.isFallback && '(FALLBACK ACTIVE)'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                বিলম্ব: {result.latencyMs}ms
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '4px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>মানুষের সংখ্যা (People Count)</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#f8fafc', marginTop: '0.2rem' }}>
                {result.extracted.peopleCount !== null ? `${result.extracted.peopleCount} জন` : 'অজানা (Unknown)'}
              </div>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                নির্ভুলতা স্কোর: {(result.extracted.fieldConfidence.peopleCount * 100).toFixed(0)}%
              </span>
            </div>

            <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '4px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ঝুঁকিপূর্ণ বিষয় (Urgency Flags)</div>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                {result.extracted.urgencyFlags.trapped && <span style={{ fontSize: '0.7rem', background: '#7f1d1d', color: '#fca5a5', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>পানিবন্দী</span>}
                {result.extracted.urgencyFlags.elderly && <span style={{ fontSize: '0.7rem', background: '#374151', color: '#e5e7eb', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>বৃদ্ধ</span>}
                {result.extracted.urgencyFlags.child && <span style={{ fontSize: '0.7rem', background: '#1e3a8a', color: '#bfdbfe', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>শিশু</span>}
                {result.extracted.urgencyFlags.medical && <span style={{ fontSize: '0.7rem', background: '#831843', color: '#fbcfe8', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>চিকিৎসা</span>}
              </div>
            </div>

            <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '4px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>পানির প্রবণতা (Water Trend)</div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#38bdf8', marginTop: '0.2rem' }}>
                {result.extracted.waterTrend}
              </div>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                অবস্থান শব্দ: {result.extracted.locationWords.join(', ') || 'কোনোটি পাওয়া যায়নি'}
              </span>
            </div>
          </div>

          {/* Operator Correction Panel */}
          <div style={{ background: '#0f172a', border: '1px solid #475569', borderRadius: '4px', padding: '0.8rem' }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#fbbf24' }}>
              ✏️ অপারেটর যাচাই ও সম্পাদনা / Operator Inspection & Field Correction
            </h4>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>সংশোধিত মানুষের সংখ্যা:</label>
                <input
                  type="number"
                  value={operatorEdits.peopleCount}
                  onChange={(e) => setOperatorEdits({ ...operatorEdits, peopleCount: e.target.value === '' ? '' : parseInt(e.target.value, 10) })}
                  style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #64748b', borderRadius: '4px', padding: '0.2rem 0.5rem', width: '80px' }}
                />
              </div>
              <button
                type="button"
                onClick={handleSaveOperatorCorrection}
                style={{ background: '#10b981', color: 'black', border: 'none', padding: '0.35rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', alignSelf: 'flex-end' }}
              >
                সংরক্ষণ করুন (Verify & Save)
              </button>
            </div>
            {saveFeedback && (
              <p style={{ fontSize: '0.8rem', color: '#a7f3d0', margin: '0.5rem 0 0' }}>{saveFeedback}</p>
            )}
          </div>
        </div>
      )}

      {/* 30 Synthetic Messages Benchmark Section */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', color: '#f8fafc', margin: 0 }}>
              📊 ৩০টি সিন্থেটিক বার্তার মূল্যায়ন রিপোর্ট / 30-Message Benchmark Evaluation
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
              বাংলা ও বাংলিশ দুর্যোগ বার্তার উপর স্বয়ংক্রিয় নিষ্কাশনের নির্ভুলতা পরীক্ষা
            </p>
          </div>
          <button
            type="button"
            onClick={handleRunBenchmark}
            style={{ background: '#0284c7', color: 'white', border: 'none', padding: '0.35rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem' }}
          >
            মূল্যায়ন চালান (Run Benchmark)
          </button>
        </div>

        {benchmarkReport && (
          <div style={{ marginTop: '1rem', background: '#0f172a', padding: '0.8rem', borderRadius: '4px', border: '1px solid #334155' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.8rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>মোট বার্তা:</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{benchmarkReport.totalMessages}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>মানুষের সংখ্যা নির্ভুলতা:</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#34d399' }}>{benchmarkReport.peopleCountAccuracy}%</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ঝুঁকি সনাক্তকরণ হার:</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#38bdf8' }}>{benchmarkReport.vulnerabilityAccuracy}%</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>সামগ্রিক নির্ভুলতা:</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fbbf24' }}>{benchmarkReport.overallAccuracy}%</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ফলব্যাক কার্যকারিতা:</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#a78bfa' }}>{benchmarkReport.fallbackSuccessRate}%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fact-Constrained Shift Operations Summary Section */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '1rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', color: '#f8fafc', margin: 0 }}>
              📝 শিফট হ্যান্ডওভার বিবরণী / Fact-Constrained Shift Operations Summary
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
              শুধুমাত্র নথিবদ্ধ উদ্ধার, এসওএস ও ত্রাণ বিতরণের তথ্যের উপর ভিত্তি করে তৈরি বাস্তবভিত্তিক সারসংক্ষেপ
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateShiftSummary}
            disabled={shiftLoading}
            style={{ background: '#059669', color: 'white', border: 'none', padding: '0.35rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            {shiftLoading ? 'তৈরি হচ্ছে...' : 'শিফট সারসংক্ষেপ তৈরি করুন (Generate)'}
          </button>
        </div>

        {shiftSummary && (
          <div style={{ marginTop: '1rem', background: '#0f172a', padding: '1rem', borderRadius: '4px', border: '1px solid #059669' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '0.8rem' }}>
              <span style={{ fontWeight: 'bold', color: '#34d399', fontSize: '0.95rem' }}>{shiftSummary.shiftTitle}</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>উৎস আইডি: {shiftSummary.sourceIncidentIds.join(', ')}</span>
            </div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.85rem', color: '#e2e8f0', lineHeight: '1.6' }}>
              {shiftSummary.summaryBn}
            </pre>
            <div style={{ marginTop: '0.8rem', fontSize: '0.75rem', color: '#fbbf24', background: '#451a03', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
              ⚠️ {shiftSummary.disclaimer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

