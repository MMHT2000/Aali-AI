import { useState } from 'react';
import { buildClientDisasterPacket } from '../lib/packet';
import { OutboxSosItem, saveToOutbox, updateOutboxStatus } from '../lib/offline-outbox';

interface ThreeTapSosProps {
  onReportCreated?: (item: OutboxSosItem) => void;
}

export function ThreeTapSos({ onReportCreated }: ThreeTapSosProps) {
  const [isBlackoutMode, setIsBlackoutMode] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [elderlyCount, setElderlyCount] = useState<number>(0);
  const [hasChild, setHasChild] = useState<boolean>(false);
  const [hasMedicalNeed, setHasMedicalNeed] = useState<boolean>(false);
  const [isTrapped, setIsTrapped] = useState<boolean>(false);

  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<string>('Parshuram / পরশুরাম');
  const [gpsStatus, setGpsStatus] = useState<string>('Not requested');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [createdItem, setCreatedItem] = useState<OutboxSosItem | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const requestGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported by device');
      return;
    }
    setGpsStatus('Requesting GPS permission...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus(`GPS acquired: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      (err) => {
        setGpsStatus(`GPS Denied/Unavailable: ${err.message}. Using village fallback.`);
      },
      { timeout: 8000 },
    );
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    const clientReportId = `SOS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const shortId = clientReportId.slice(-4).toUpperCase();

    const { rawPacket, checksum } = buildClientDisasterPacket({
      peopleCount,
      flags: {
        elderly: elderlyCount > 0,
        child: hasChild,
        medical: hasMedicalNeed,
        trapped: isTrapped,
      },
      shortId,
    });

    const outboxItem: OutboxSosItem = {
      clientReportId,
      peopleCount,
      elderlyCount,
      hasChild,
      hasMedicalNeed,
      isTrapped,
      locationLat: gpsCoords?.lat || null,
      locationLng: gpsCoords?.lng || null,
      areaId: null,
      areaName: selectedVillage,
      rawPacket,
      checksum,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      lastAttemptAt: null,
      errorNote: null,
    };

    // 1. Always persist to offline outbox first
    await saveToOutbox(outboxItem);
    setCreatedItem(outboxItem);
    if (onReportCreated) onReportCreated(outboxItem);

    // 2. Try immediate online submission if NOT in blackout mode
    if (isBlackoutMode) {
      setCreatedItem(outboxItem);
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientReportId,
          peopleCount,
          elderlyCount,
          hasChild,
          hasMedicalNeed,
          isTrapped,
          locationLat: gpsCoords?.lat,
          locationLng: gpsCoords?.lng,
          sourceType: 'NEW_USER',
        }),
      });

      if (res.ok) {
        await updateOutboxStatus(clientReportId, 'SENT');
        setCreatedItem({ ...outboxItem, status: 'SENT' });
      } else {
        await updateOutboxStatus(clientReportId, 'FAILED', `Server returned status ${res.status}`);
        setCreatedItem({ ...outboxItem, status: 'FAILED' });
      }
    } catch {
      // Offline / network failure: keep PENDING in outbox
      setCreatedItem(outboxItem);
    } finally {
      setSubmitting(false);
    }
  };

  const copyPacket = () => {
    if (createdItem) {
      navigator.clipboard.writeText(createdItem.rawPacket);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const openSmsComposer = () => {
    if (createdItem) {
      const emergencyNumber = '1090'; // Flood emergency helpline in Bangladesh
      const uri = `sms:${emergencyNumber}?body=${encodeURIComponent(createdItem.rawPacket)}`;
      window.open(uri, '_blank');
    }
  };

  return (
    <div className="sos-flow-container" style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '8px', border: '1px solid #475569' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#f87171', margin: 0 }}>
          🚨 জরুরি উদ্ধার অনুরোধ / 3-Tap SOS
        </h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: isBlackoutMode ? '#f59e0b' : '#94a3b8', cursor: 'pointer', background: '#0f172a', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #475569' }}>
          <input
            type="checkbox"
            checked={isBlackoutMode}
            onChange={(e) => setIsBlackoutMode(e.target.checked)}
          />
          <span>টেলিকম ব্ল্যাকআউট সিমুলেশন / Blackout Mode</span>
        </label>
      </div>

      {!createdItem ? (
        <div>
          {/* STEP 1 */}
          {step === 1 && (
            <div className="sos-step">
              <h4 style={{ color: '#38bdf8', marginBottom: '0.5rem' }}>ধাপ ১: কতজন মানুষ আছেন? / Step 1: People Count</h4>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                Select total number of stranded persons requiring boat or high-ground rescue:
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  style={{ padding: '0.5rem 1rem', fontSize: '1.25rem', background: '#334155', color: 'white', border: 'none', borderRadius: '4px' }}
                  onClick={() => setPeopleCount((c) => Math.max(1, c - 1))}
                  aria-label="Decrease people count"
                >
                  -
                </button>
                <span style={{ fontSize: '1.75rem', fontWeight: 'bold', minWidth: '40px', textAlign: 'center' }}>
                  {peopleCount}
                </span>
                <button
                  type="button"
                  style={{ padding: '0.5rem 1rem', fontSize: '1.25rem', background: '#334155', color: 'white', border: 'none', borderRadius: '4px' }}
                  onClick={() => setPeopleCount((c) => Math.min(99, c + 1))}
                  aria-label="Increase people count"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="btn-retry"
                style={{ width: '100%', background: '#0284c7' }}
                onClick={() => setStep(2)}
              >
                পরবর্তী: ঝুঁকিপূর্ণ অবস্থা / Next: Urgency Flags →
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="sos-step">
              <h4 style={{ color: '#38bdf8', marginBottom: '0.5rem' }}>ধাপ ২: জরুরি অবস্থা চিহ্নিত করুন / Step 2: Urgency Flags</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={hasChild}
                    onChange={(e) => setHasChild(e.target.checked)}
                  />
                  <span>শিশু আছে (Infant / Child present)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={elderlyCount > 0}
                    onChange={(e) => setElderlyCount(e.target.checked ? 1 : 0)}
                  />
                  <span>বৃদ্ধ মানুষ আছেন (Elderly person present)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={hasMedicalNeed}
                    onChange={(e) => setHasMedicalNeed(e.target.checked)}
                  />
                  <span>চিকিৎসা / ঔষধ প্রয়োজন (Urgent medical need)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isTrapped}
                    onChange={(e) => setIsTrapped(e.target.checked)}
                  />
                  <span>পানিবন্দী / ছাদে বা গাছে আটকা (Trapped on roof/tree)</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  style={{ flex: 1, background: '#334155', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px' }}
                  onClick={() => setStep(1)}
                >
                  ← পূর্বে / Back
                </button>
                <button
                  type="button"
                  className="btn-retry"
                  style={{ flex: 2, background: '#0284c7' }}
                  onClick={() => setStep(3)}
                >
                  পরবর্তী: অবস্থান / Next: Location →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="sos-step">
              <h4 style={{ color: '#38bdf8', marginBottom: '0.5rem' }}>ধাপ ৩: আপনার অবস্থান / Step 3: Location</h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                GPS permission is optional. If denied or indoors, select your nearest village.
              </p>

              <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={requestGps}
                  style={{ background: '#0369a1', color: 'white', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', textAlign: 'left' }}
                >
                  📍 জিপিএস অবস্থান সনাক্ত করুন / Auto-Detect GPS
                </button>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{gpsStatus}</span>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  অথবা গ্রাম নির্বাচন করুন / Or Select Village:
                </label>
                <select
                  value={selectedVillage}
                  onChange={(e) => {
                    setSelectedVillage(e.target.value);
                  }}
                  style={{ width: '100%', padding: '0.5rem', background: '#0f172a', color: 'white', border: '1px solid #475569', borderRadius: '4px' }}
                >
                  <option value="Parshuram / পরশুরাম">Parshuram / পরশুরাম</option>
                  <option value="Chitholia / চিথলিয়া">Chitholia / চিথলিয়া</option>
                  <option value="Mirzanagar / মির্জানগর">Mirzanagar / মির্জানগর</option>
                  <option value="Fulgazi / ফুলগাজী">Fulgazi / ফুলগাজী</option>
                  <option value="Munshirhat / মুন্সিরহাট">Munshirhat / মুন্সিরহাট</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  style={{ flex: 1, background: '#334155', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px' }}
                  onClick={() => setStep(2)}
                >
                  ← পূর্বে / Back
                </button>
                <button
                  type="button"
                  className="btn-retry"
                  style={{ flex: 2, background: '#dc2626', fontWeight: 'bold' }}
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'পাঠানো হচ্ছে...' : 'উদ্ধার পাঠান / Submit SOS 🚨'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* CONFIRMATION & OFFLINE OUTBOX HANDOFF */
        <div className="sos-result" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>স্ট্যাটাস / Status:</strong>
            <span
              style={{
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                background: createdItem.status === 'SENT' ? '#10b981' : '#f59e0b',
                color: 'black',
                fontWeight: 'bold',
              }}
            >
              {createdItem.status === 'SENT' ? '✓ সার্ভারে গৃহীত / DELIVERED' : '⏳ অফলাইন সারিতে জমা / QUEUED'}
            </span>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            {createdItem.status === 'SENT'
              ? 'আপনার এসওএস সার্ভারে সংরক্ষিত হয়েছে। রেসপন্ডার ড্যাশবোর্ডে প্রদর্শিত হচ্ছে।'
              : 'ইন্টারনেট বিচ্ছিন্ন থাকলে আপনার এসওএস স্থানীয় ব্রাউজারে সংরক্ষিত হয়েছে। নিচে কমপ্যাক্ট প্যাকেটটি এসএমএস হিসেবে পাঠান:'}
          </p>

          <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '4px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
              ASCII Disaster Packet (1 Segment SMS, Checksum {createdItem.checksum}):
            </span>
            <code style={{ fontSize: '0.85rem', color: '#38bdf8', wordBreak: 'break-all' }}>
              {createdItem.rawPacket}
            </code>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={copyPacket}
              style={{ flex: 1, padding: '0.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              {copied ? '✓ কপি হয়েছে!' : '📋 প্যাকেট কপি করুন (Copy)'}
            </button>
            <button
              type="button"
              onClick={openSmsComposer}
              style={{ flex: 1, padding: '0.5rem', background: '#10b981', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '4px' }}
            >
              📱 SMS কম্পোজার খুলুন (Open SMS)
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setCreatedItem(null);
              setStep(1);
            }}
            style={{ marginTop: '0.5rem', background: 'transparent', border: '1px solid #64748b', color: '#94a3b8', padding: '0.4rem', borderRadius: '4px' }}
          >
            নতুন এসওএস তৈরি করুন / Create Another SOS
          </button>
        </div>
      )}
    </div>
  );
}
