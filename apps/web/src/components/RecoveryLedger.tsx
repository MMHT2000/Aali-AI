import { useState, useEffect } from 'react';
import { apiFetch as fetch, safeJson } from '../lib/authenticated-fetch';
import { OperationsMode } from '../lib/operations-client';

export interface VillageRankItem {
  villageId: string;
  villageName: string;
  priorityScore: number;
  urgencyLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  factorBreakdown: {
    damageFactor: number;
    tubeWellFactor: number;
    roadCutOffFactor: number;
    healthFactor: number;
  };
  reasonsBn: string[];
  waterCoverageRatio: number;
  foodCoverageRatio: number;
  overallCoveragePercentage: number;
  coordinates?: { lat: number; lng: number };
  stagingSuggestionBn?: string;
  disclaimer: string;
}

export interface AidDeliveryItem {
  id: string;
  area_id: string;
  organization_label: string;
  item_code: string;
  quantity: number;
  unit: string;
  delivered_at: string;
  idempotency_key: string;
}

export function RecoveryLedger({
  mode = 'EXERCISE',
  eventId,
  districtCode = 'FENI_DIST',
  role = 'RECOVERY_COORDINATOR',
}: {
  mode?: OperationsMode;
  eventId?: string;
  districtCode?: string;
  role?: string;
}) {
  const isSylhet = districtCode === 'SYLHET_DIST';
  const [rankings, setRankings] = useState<VillageRankItem[]>([]);
  const [deliveries, setDeliveries] = useState<AidDeliveryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form states for delivery entry
  const [selectedVillageId, setSelectedVillageId] = useState<string>(
    isSylhet ? '22222222-2222-2222-2222-222222222207' : '22222222-2222-2222-2222-222222222205'
  );
  const [orgLabel, setOrgLabel] = useState<string>('Bangladesh Red Crescent Society');
  const [itemCode, setItemCode] = useState<string>('CLEAN_WATER');
  const [quantity, setQuantity] = useState<number>(1000);
  const [unit, setUnit] = useState<string>('LITRES');
  const [idempotencyKey, setIdempotencyKey] = useState<string>(`del-${Date.now()}`);
  const [showFootprint, setShowFootprint] = useState<boolean>(false);
  const [scopeNotice, setScopeNotice] = useState<string | null>(null);
  const exerciseEvent = isSylhet ? '11111111-1111-1111-1111-111111111106' : '11111111-1111-1111-1111-111111111103';
  useEffect(() => { setSelectedVillageId(isSylhet ? '22222222-2222-2222-2222-222222222207' : '22222222-2222-2222-2222-222222222205'); }, [isSylhet]);

  const fetchData = async () => {
    setLoading(true);
    if (mode === 'LIVE') {
      setRankings([]);
      setDeliveries([]);
      setScopeNotice('Recovery records have no active Live event context yet. No exercise data is substituted.');
      setLoading(false);
      return;
    }
    const defaultEvent = exerciseEvent;
    const selectedEventId = eventId ?? defaultEvent;
    setScopeNotice(mode === 'HISTORICAL' ? 'No recovery records are linked to this reconstructed event.' : null);
    try {
      const [sumRes, delRes] = await Promise.all([
        fetch(`/api/v1/recovery/summary?eventId=${encodeURIComponent(selectedEventId)}`),
        fetch(`/api/v1/recovery/deliveries?eventId=${encodeURIComponent(selectedEventId)}`),
      ]);
      const sumData = await safeJson<{ villagesRanking?: VillageRankItem[] }>(sumRes);
      if (sumData?.villagesRanking) {
        setRankings(sumData.villagesRanking);
      }
      const delData = await safeJson<AidDeliveryItem[]>(delRes);
      if (Array.isArray(delData)) {
        setDeliveries(delData);
      }
    } catch {
      // offline / mock mode
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [eventId, mode, districtCode]);

  const handleRecordDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (mode !== 'EXERCISE' || role !== 'RECOVERY_COORDINATOR') {
      setFeedback('Recording deliveries is enabled for the synthetic exercise only.');
      return;
    }
    try {
      const res = await fetch('/api/v1/recovery/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: eventId ?? exerciseEvent,
          areaId: selectedVillageId,
          organizationLabel: orgLabel,
          itemCode,
          quantity,
          unit,
          idempotencyKey,
          recordedBy: '00000000-0000-0000-0000-000000000003', // Recovery Coordinator
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isDuplicateIgnored) {
          setFeedback(`⚠️ ডুপ্লিকেট রসিদ সনাক্ত: এই ট্র্যাকিং কোডটি (${idempotencyKey}) ইতিমধ্যে নিবন্ধিত। পুনরায় যোগ করা হয়নি।`);
        } else {
          setFeedback(`✓ ত্রাণ বিতরণ সফলভাবে নথিভুক্ত হয়েছে: ${quantity} ${unit} (${itemCode})`);
          setIdempotencyKey(`del-${Date.now()}`);
          fetchData();
        }
      }
    } catch {
      setFeedback('Failed to submit aid delivery.');
    }
  };

  const getUrgencyBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return { bg: '#7f1d1d', text: '#fca5a5', label: 'জরুরি (Critical)' };
      case 'HIGH':
        return { bg: '#c2410c', text: '#ffedd5', label: 'উচ্চ প্রয়োজন (High)' };
      case 'MEDIUM':
        return { bg: '#a16207', text: '#fef08a', label: 'মাঝারি (Medium)' };
      default:
        return { bg: '#15803d', text: '#dcfce7', label: 'স্বাভাবিক (Low)' };
    }
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '1.25rem', marginTop: '1.5rem', color: '#f8fafc' }}>
      {/* Honesty & Decision Support Disclaimer */}
      <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #0284c7', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem' }}>
        <strong style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          🤝 পুনর্বাসন সমন্বয় ও ত্রাণ খতিয়ান / Recovery Coordination & Aid Ledger
        </strong>
        <p style={{ fontSize: '0.82rem', color: '#bae6fd', margin: '0.25rem 0 0' }}>
          * Rankings support logistical coordination and relief transparency, not beneficiary eligibility. Aali AI never algorithmically decides who deserves aid.
        </p>
      </div>

      <p role="status" style={{ color: '#cbd5e1', fontSize: '0.78rem' }}>{mode} · event {eventId ?? (mode === 'EXERCISE' ? 'Active Demo Exercise 2026' : 'none selected')}</p>
      {scopeNotice && <p role="status" style={{ color: '#f0cd85', fontSize: '0.78rem' }}>{scopeNotice}</p>}

      {feedback && (
        <div style={{ background: feedback.startsWith('✓') ? '#064e3b' : '#7f1d1d', border: '1px solid #10b981', color: '#f8fafc', padding: '0.5rem 0.8rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem' }}>
          {feedback}
        </div>
      )}

      {/* Village Unmet-Needs Priority Ranking */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: 0 }}>
            🏘️ গ্রাম-ভিত্তিক অপূর্ণ চাহিদার তালিকা / Unmet-Needs Coordination Ranking
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowFootprint(!showFootprint)}
              style={{ background: showFootprint ? '#0284c7' : '#334155', color: '#f8fafc', border: '1px solid #475569', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              🛰️ {showFootprint ? 'স্যাটেলাইট ওভারলে লুকান (Hide Overlay)' : 'সেন্টিনেল-১ প্লাবন ওভারলে (Sentinel-1 Flood Overlay)'}
            </button>
            <button
              type="button"
              onClick={fetchData}
              style={{ background: '#334155', color: '#f8fafc', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              🔄 রিফ্রেশ (Refresh)
            </button>
          </div>
        </div>

        {/* Sentinel-1 Flood Footprint Static Overlay (Phase 10 Stretch Item) */}
        {showFootprint && (
          <div style={{ background: '#091528', border: '1px dashed #38bdf8', borderRadius: '6px', padding: '0.8rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 'bold' }}>
                🛰️ সেন্টিনেল-১ এসএআর প্লাবন মানচিত্র / Sentinel-1 SAR Flood Inundation Footprint ({isSylhet ? 'Sylhet Basin' : 'Feni Basin'})
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>
                * Static reconstructed backdrop fixture (No live satellite pipeline)
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 0.5rem 0' }}>
              {isSylhet
                ? 'Reference SAR observation: June 2022 Sylhet Surma-Kushiyara flood crest. Blue highlighted regions indicate standing inundation extent across Companiganj and Gowainghat.'
                : 'Reference SAR observation: 21 August 2024 Feni Parshuram-Fulgazi flood crest. Blue highlighted regions indicate standing inundation extent.'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
              {isSylhet ? (
                <>
                  <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #0284c7', borderRadius: '4px', padding: '0.5rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>কোম্পানীগঞ্জ (Companiganj)</span>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fca5a5' }}>৮৪% প্লাবিত (84% Inundated)</div>
                    <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Lat: 25.080, Lng: 91.752</span>
                  </div>
                  <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #0284c7', borderRadius: '4px', padding: '0.5rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>গোয়াইনঘাট (Gowainghat)</span>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fca5a5' }}>৭৮% প্লাবিত (78% Inundated)</div>
                    <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Lat: 25.056, Lng: 91.971</span>
                  </div>
                  <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #0284c7', borderRadius: '4px', padding: '0.5rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>কুমাড়গাঁও সাবস্টেশন (Kumargaon Grid)</span>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fef08a' }}>৬২% নিমজ্জিত (62% Submerged)</div>
                    <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Lat: 24.908, Lng: 91.831</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #0284c7', borderRadius: '4px', padding: '0.5rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>চিথলিয়া ইউনিয়ন (Chitholia)</span>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fca5a5' }}>৮২% প্লাবিত (82% Inundated)</div>
                    <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Lat: 23.235, Lng: 91.415</span>
                  </div>
                  <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #0284c7', borderRadius: '4px', padding: '0.5rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>মির্জানগর ইউনিয়ন (Mirzanagar)</span>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fef08a' }}>৬৪% প্লাবিত (64% Inundated)</div>
                    <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Lat: 23.218, Lng: 91.432</span>
                  </div>
                  <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #0284c7', borderRadius: '4px', padding: '0.5rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>ফুলগাজী সদর (Fulgazi)</span>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fef08a' }}>৪৯% প্লাবিত (49% Inundated)</div>
                    <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Lat: 23.165, Lng: 91.410</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <p style={{ color: '#94a3b8' }}>লোড হচ্ছে...</p>
        ) : rankings.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>কোনো মূল্যায়ন পাওয়া যায়নি।</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {rankings.map((v) => {
              const badge = getUrgencyBadge(v.urgencyLevel);
              return (
                <div
                  key={v.villageId}
                  style={{
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '1rem', color: '#38bdf8' }}>{v.villageName}</strong>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                        <span style={{ fontSize: '0.75rem', background: badge.bg, color: badge.text, padding: '0.15rem 0.5rem', borderRadius: '3px', fontWeight: 'bold' }}>
                          {badge.label}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          অপূর্ণ চাহিদা স্কোর: <b style={{ color: 'white' }}>{v.priorityScore}/১০০</b>
                        </span>
                      </div>
                    </div>

                    {/* Relief Coverage Progress */}
                    <div style={{ textAlign: 'right', minWidth: '160px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ত্রাণ কভারেজ (Relief Coverage):</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: v.overallCoveragePercentage >= 75 ? '#34d399' : '#fbbf24' }}>
                        {v.overallCoveragePercentage}%
                      </div>
                      <div style={{ background: '#334155', borderRadius: '4px', height: '6px', width: '100%', marginTop: '0.2rem', overflow: 'hidden' }}>
                        <div style={{ background: '#3b82f6', height: '100%', width: `${v.overallCoveragePercentage}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Reasons & Evidence */}
                  <div style={{ marginTop: '0.6rem', borderTop: '1px solid #1e293b', paddingTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>প্রমাণ ও মূল সংকট:</span>
                    <ul style={{ margin: '0.2rem 0 0', paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                      {v.reasonsBn.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Pre-positioning & Staging Point Recommendation */}
                  {v.stagingSuggestionBn && (
                    <div style={{ marginTop: '0.5rem', background: '#1e293b', border: '1px solid #0369a1', borderRadius: '4px', padding: '0.4rem 0.6rem', fontSize: '0.78rem', color: '#7dd3fc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>📍 <b>ত্রাণ সংরক্ষণ ও রিলে-পয়েন্ট (Staging Point):</b></span>
                      <span>{v.stagingSuggestionBn}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Record Aid Delivery Form (Idempotent Ledger) */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '1rem' }}>
        <h3 style={{ fontSize: '1rem', color: '#f8fafc', marginBottom: '0.75rem' }}>
          📦 ত্রাণ বিতরণ রসিদ এন্ট্রি / Record Aid Delivery (Idempotent Ledger)
        </h3>

        <form onSubmit={handleRecordDelivery} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>গ্রাম নির্বাচন (Target Village):</label>
            <select
              value={selectedVillageId}
              onChange={(e) => setSelectedVillageId(e.target.value)}
              style={{ width: '100%', background: '#0f172a', color: '#f8fafc', border: '1px solid #475569', borderRadius: '4px', padding: '0.35rem' }}
            >
              {isSylhet ? (
                <>
                  <option value="22222222-2222-2222-2222-222222222207">কোম্পানীগঞ্জ (Companiganj)</option>
                  <option value="22222222-2222-2222-2222-222222222208">গোয়াইনঘাট (Gowainghat)</option>
                  <option value="22222222-2222-2222-2222-222222222209">রুস্তমপুর (Rustampur)</option>
                </>
              ) : (
                <>
                  <option value="22222222-2222-2222-2222-222222222205">চিথলিয়া (Chitholia)</option>
                  <option value="22222222-2222-2222-2222-222222222204">মির্জানগর (Mirzanagar)</option>
                  <option value="22222222-2222-2222-2222-222222222203">ফুলগাজী (Fulgazi)</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>সংস্থা / ব্যক্তি (Organization):</label>
            <input
              type="text"
              value={orgLabel}
              onChange={(e) => setOrgLabel(e.target.value)}
              style={{ width: '100%', background: '#0f172a', color: '#f8fafc', border: '1px solid #475569', borderRadius: '4px', padding: '0.35rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>ত্রাণের ধরন (Item):</label>
            <select
              value={itemCode}
              onChange={(e) => {
                setItemCode(e.target.value);
                setUnit(e.target.value === 'CLEAN_WATER' ? 'LITRES' : e.target.value === 'MEDICINE_KIT' ? 'KITS' : 'PACKS');
              }}
              style={{ width: '100%', background: '#0f172a', color: '#f8fafc', border: '1px solid #475569', borderRadius: '4px', padding: '0.35rem' }}
            >
              <option value="CLEAN_WATER">নিরাপদ পানি (Clean Water)</option>
              <option value="FOOD_PACK">শুকনো খাবার প্যাকেট (Food Pack)</option>
              <option value="MEDICINE_KIT">জরুরি ওষুধ কিট (Medicine Kit)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>পরিমাণ (Quantity):</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={{ width: '100%', background: '#0f172a', color: '#f8fafc', border: '1px solid #475569', borderRadius: '4px', padding: '0.35rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>আইডেমপোটেন্সি কি (Unique Key):</label>
            <input
              type="text"
              value={idempotencyKey}
              onChange={(e) => setIdempotencyKey(e.target.value)}
              style={{ width: '100%', background: '#0f172a', color: '#94a3b8', border: '1px solid #475569', borderRadius: '4px', padding: '0.35rem', fontSize: '0.75rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={mode !== 'EXERCISE' || role !== 'RECOVERY_COORDINATOR' || !Number.isFinite(quantity) || quantity <= 0 || !orgLabel.trim() || !idempotencyKey.trim()}
              style={{ width: '100%', background: '#0284c7', color: 'white', border: 'none', padding: '0.45rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              ত্রাণ জমা দিন (Submit Receipt)
            </button>
          </div>
        </form>

        {/* Recent Deliveries Trace */}
        <div style={{ marginTop: '1rem', borderTop: '1px solid #334155', paddingTop: '0.8rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
            সর্বশেষ বিতরণ রসিদ (Recent Delivery Ledger - {deliveries.length} Records):
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {deliveries.slice(0, 4).map((d) => (
              <span key={d.id} style={{ fontSize: '0.75rem', background: '#0f172a', padding: '0.2rem 0.5rem', borderRadius: '3px', border: '1px solid #334155', color: '#cbd5e1' }}>
                {d.organization_label}: <b>{d.quantity} {d.unit}</b> ({d.item_code})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

