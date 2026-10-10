import { useState, useEffect } from 'react';
import { apiFetch as fetch } from '../lib/authenticated-fetch';
import { buildClientDisasterPacket } from '../lib/packet';

export interface ResidentRegistrationResponse {
  residentId: string;
  nidLast4: string;
  phoneNumberRedacted: string;
  registeredAt: string;
  accessToken: string;
  expiresIn: string;
  disclaimer: string;
}

export function ResidentSimulator({ districtCode = 'FENI_DIST' }: { districtCode?: string } = {}) {
  const isSylhet = districtCode === 'SYLHET_DIST';

  // Synthetic Identity State
  const [fullName, setFullName] = useState(isSylhet ? 'রহিম উদ্দিন (Rahim Uddin)' : 'আব্দুর রহিম (Abdur Rahim)');
  const [phoneNumber, setPhoneNumber] = useState('01711223344');
  const [mockNid, setMockNid] = useState('1984261829'); // 10 digits
  const [nidRegistered, setNidRegistered] = useState<ResidentRegistrationResponse | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Connectivity & Simulator Controls
  const [isOnline, setIsOnline] = useState(true);

  // SOS Creation State
  const [peopleCount, setPeopleCount] = useState<number>(4);
  const [flags, setFlags] = useState({
    elderly: true,
    child: true,
    medical: false,
    trapped: true,
  });
  const [selectedVillage, setSelectedVillage] = useState(
    isSylhet ? 'কোম্পানীগঞ্জ সদর (Companiganj)' : 'চিথলিয়া (Chitholia)'
  );
  const [geohash, setGeohash] = useState(isSylhet ? 'wh1quuk' : 'wh0r8vy');

  useEffect(() => {
    if (isSylhet) {
      setSelectedVillage('কোম্পানীগঞ্জ সদর (Companiganj)');
      setGeohash('wh1quuk');
    } else {
      setSelectedVillage('চিথলিয়া (Chitholia)');
      setGeohash('wh0r8vy');
    }
  }, [isSylhet]);

  // SOS Submission & Handoff State
  const [outboxPacket, setOutboxPacket] = useState<string | null>(null);
  const [sosStatus, setSosStatus] = useState<'IDLE' | 'QUEUED_OFFLINE' | 'SENDING' | 'SENT_ONLINE' | 'SIMULATED_GATEWAY_DELIVERED' | 'ERROR'>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleRegisterNid = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationError(null);
    setIsRegistering(true);

    try {
      const res = await fetch('/api/v1/auth/resident-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phoneNumber, mockNid }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setNidRegistered(data);
    } catch (err: unknown) {
      setRegistrationError(err instanceof Error ? err.message : 'Error validating mock NID');
    } finally {
      setIsRegistering(false);
    }
  };

  const generateCompactPacket = () => {
    const { rawPacket } = buildClientDisasterPacket({
      geohash7: geohash,
      peopleCount,
      flags,
      shortId: 'SIM1',
    });
    return rawPacket;
  };

  const handleSubmitSos = async () => {
    const packet = generateCompactPacket();
    setOutboxPacket(packet);

    if (!isOnline) {
      setSosStatus('QUEUED_OFFLINE');
      setStatusMessage('ইন্টারনেট সংযোগ বিচ্ছিন্ন! এসওএস লোকাল আউটবক্সে জমা রাখা হয়েছে (Durable Offline Queue). আপনি নিচের বাটনে ক্লিক করে এসএমএস কম্পোজার ওপেন বা কপি করতে পারেন।');
      return;
    }

    setSosStatus('SENDING');
    setStatusMessage('অনলাইন সার্ভারে এসওএস পাঠানো হচ্ছে...');

    try {
      const clientReportId = `sim-rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const res = await fetch('/api/v1/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientReportId,
          peopleCount,
          elderlyCount: flags.elderly ? 1 : 0,
          hasChild: flags.child,
          hasMedicalNeed: flags.medical,
          isTrapped: flags.trapped,
          messageOriginal: `${selectedVillage} এলাকায় আমরা ${peopleCount} জন পানিবন্দী।`,
          messageLanguage: 'bn',
          transportKind: 'APP_DIRECT',
        }),
      });

      if (res.ok) {
        setSosStatus('SENT_ONLINE');
        setStatusMessage('✅ ইন্টারনেট মাধ্যমে এসওএস সফলভাবে সেন্ট্রাল সার্ভারে নিবন্ধিত হয়েছে! রেসপন্ডার ড্যাশবোর্ডে এটি পর্যালোচনা করা যাবে।');
      } else {
        throw new Error('API server returned error');
      }
    } catch {
      setSosStatus('QUEUED_OFFLINE');
      setStatusMessage('সার্ভার রেসপন্স পাওয়া যায়নি। এসওএস অফলাইন আউটবক্সে সংরক্ষণ করা হয়েছে।');
    }
  };

  const handleSimulateGatewayIngest = async () => {
    if (!outboxPacket) return;

    setSosStatus('SENDING');
    setStatusMessage('সিমুলেটেড টেলিকম গেটওয়ে দিয়ে প্যাকেট প্রেরণ করা হচ্ছে...');

    try {
      const res = await fetch('/api/v1/gateway/simulated/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packet: outboxPacket,
          gatewayId: isSylhet ? 'SIMULATOR-SYLHET-GW-01' : 'SIMULATOR-FENI-GW-01',
        }),
      });

      if (res.ok) {
        setSosStatus('SIMULATED_GATEWAY_DELIVERED');
        setStatusMessage('📡 সিমুলেটেড গেটওয়ে প্যাকেট গ্রহণ করেছে এবং সেন্ট্রাল সার্ভার আইডি নিশ্চিত করেছে (Demo-only Gateway Delivery)!');
      } else {
        throw new Error('Gateway ingestion failed');
      }
    } catch {
      setStatusMessage('গেটওয়ে সিমুলেটরে পাঠাতে ত্রুটি হয়েছে।');
    }
  };

  const handleCopyPacket = () => {
    if (outboxPacket) {
      navigator.clipboard.writeText(outboxPacket);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', color: '#f8fafc' }}>
      {/* Simulator Disclosure Banner */}
      <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid #ca8a04', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem' }}>
        <strong style={{ color: '#facc15' }}>🧪 ড্যাশবোর্ড রেসিডেন্ট ক্লায়েন্ট সিমুলেটর (Resident Client Simulator):</strong>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#fef08a' }}>
          বিচারক বা পরীক্ষকগণ মোবাইল অ্যাপ ইন্সটল না করেই এই সিমুলেটরের মাধ্যমে রেসিডেন্ট আইডি ভ্যালিডেশন, ৩-ট্যাপ এসওএস তৈরি, অনলাইন/অফলাইন কিউয়িং এবং এসএমএস গেটওয়ে হ্যান্ডঅফ পরীক্ষা করতে পারেন।
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Step 1: Resident Registration & Mock NID Check */}
        <section style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#38bdf8', marginTop: 0 }}>
            ১. রেসিডেন্ট অনবোর্ডিং ও মক এনআইডি চেক (Mock NID Check)
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 1rem' }}>
            * Demo NID format check — not identity verification. ১০ বা ১৭ সংখ্যার অনন্য ডিজিট গ্রহণ করা হয়; প্লেইনটেক্সট সার্ভারে সংরক্ষণ বা কোনো এলএলএম-এ পাঠানো হয় না।
          </p>

          <form onSubmit={handleRegisterNid} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block', marginBottom: '0.2rem' }}>
                পূর্ণ নাম (Full Name):
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ width: '100%', padding: '0.4rem', background: '#0f172a', border: '1px solid #475569', borderRadius: '4px', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block', marginBottom: '0.2rem' }}>
                মোবাইল নম্বর (Phone Number):
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{ width: '100%', padding: '0.4rem', background: '#0f172a', border: '1px solid #475569', borderRadius: '4px', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block', marginBottom: '0.2rem' }}>
                মক জাতীয় পরিচয়পত্র নম্বর (Mock NID - 10 or 17 digits):
              </label>
              <input
                type="text"
                value={mockNid}
                onChange={(e) => setMockNid(e.target.value)}
                placeholder="उदा. 1984261829"
                style={{ width: '100%', padding: '0.4rem', background: '#0f172a', border: '1px solid #475569', borderRadius: '4px', color: '#fff' }}
              />
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              style={{ background: '#0284c7', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.25rem' }}
            >
              {isRegistering ? 'যাচাই হচ্ছে...' : 'অনবোর্ড করুন (Register & Validate NID)'}
            </button>
          </form>

          {registrationError && (
            <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '4px', color: '#fca5a5', fontSize: '0.8rem' }}>
              ❌ {registrationError}
            </div>
          )}

          {nidRegistered && (
            <div style={{ marginTop: '0.75rem', padding: '0.6rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '4px', fontSize: '0.8rem' }}>
              <div style={{ color: '#4ade80', fontWeight: 'bold' }}>✅ এনআইডি ফরম্যাট ও ইউনিকনেস সফলভাবে যাচাইকৃত!</div>
              <div style={{ color: '#cbd5e1', marginTop: '0.25rem' }}>রেসিডেন্ট আইডি: <code>{nidRegistered.residentId}</code></div>
              <div style={{ color: '#cbd5e1' }}>এনআইডি লাস্ট-৪: <code>****{nidRegistered.nidLast4}</code></div>
              <div style={{ color: '#cbd5e1' }}>রিডাক্টেড ফোন: <code>{nidRegistered.phoneNumberRedacted}</code></div>
              <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '0.25rem' }}>{nidRegistered.disclaimer}</div>
            </div>
          )}
        </section>

        {/* Step 2: Connectivity & 3-Tap SOS Submission */}
        <section style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#38bdf8', marginTop: 0 }}>
            ২. সংযোগ ও ৩-ট্যাপ এসওএস প্রেরণ (SOS Simulation)
          </h2>

          {/* Connectivity toggle */}
          <div style={{ background: '#0f172a', padding: '0.6rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem' }}>
              ইন্টারনেট সংযোগ অবস্থা: <strong>{isOnline ? '🟢 অনলাইন (Online)' : '🔴 অফলাইন (Offline)'}</strong>
            </span>
            <button
              type="button"
              onClick={() => setIsOnline(!isOnline)}
              style={{ background: isOnline ? '#ef4444' : '#22c55e', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              {isOnline ? 'ইন্টারনেট বিচ্ছিন্ন করুন (Simulate Offline)' : 'ইন্টারনেট চালু করুন (Simulate Online)'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>আটকে থাকা মানুষের সংখ্যা: <strong>{peopleCount} জন</strong></label>
              <input
                type="range"
                min="1"
                max="25"
                value={peopleCount}
                onChange={(e) => setPeopleCount(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.8rem' }}>
              <label><input type="checkbox" checked={flags.trapped} onChange={(e) => setFlags({ ...flags, trapped: e.target.checked })} /> পানিবন্দী / ছাদে আটকা</label>
              <label><input type="checkbox" checked={flags.elderly} onChange={(e) => setFlags({ ...flags, elderly: e.target.checked })} /> বয়স্ক সদস্য</label>
              <label><input type="checkbox" checked={flags.child} onChange={(e) => setFlags({ ...flags, child: e.target.checked })} /> শিশু সদস্য</label>
              <label><input type="checkbox" checked={flags.medical} onChange={(e) => setFlags({ ...flags, medical: e.target.checked })} /> জরুরি চিকিৎসা প্রয়োজন</label>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block', marginBottom: '0.2rem' }}>গ্রাম / এলাকা:</label>
              <select
                value={selectedVillage}
                onChange={(e) => {
                  setSelectedVillage(e.target.value);
                  if (isSylhet) {
                    if (e.target.value.includes('Companiganj')) setGeohash('wh1quuk');
                    else if (e.target.value.includes('Gowainghat')) setGeohash('wh1r75k');
                    else if (e.target.value.includes('Rustampur')) setGeohash('wh1qebg');
                    else setGeohash('wh1qw2b');
                  } else {
                    if (e.target.value.includes('Chitholia')) setGeohash('wh0r8vy');
                    else if (e.target.value.includes('Mirzanagar')) setGeohash('wh0rc0z');
                    else setGeohash('wh0pt3u');
                  }
                }}
                style={{ width: '100%', padding: '0.35rem', background: '#0f172a', border: '1px solid #475569', borderRadius: '4px', color: '#fff' }}
              >
                {isSylhet ? (
                  <>
                    <option value="কোম্পানীগঞ্জ সদর (Companiganj)">কোম্পানীগঞ্জ সদর (Companiganj)</option>
                    <option value="গোয়াইনঘাট (Gowainghat)">গোয়াইনঘাট (Gowainghat)</option>
                    <option value="রুস্তমপুর (Rustampur)">রুস্তমপুর (Rustampur)</option>
                    <option value="ভোলাগঞ্জ (Bholaganj)">ভোলাগঞ্জ (Bholaganj)</option>
                  </>
                ) : (
                  <>
                    <option value="চিথলিয়া (Chitholia)">চিথলিয়া (Chitholia, Parshuram)</option>
                    <option value="মির্জানগর (Mirzanagar)">মির্জানগর (Mirzanagar, Parshuram)</option>
                    <option value="ফুলগাজী সদর (Fulgazi)">ফুলগাজী সদর (Fulgazi)</option>
                  </>
                )}
              </select>
            </div>

            <button
              type="button"
              onClick={handleSubmitSos}
              style={{ background: '#e11d48', color: 'white', border: 'none', padding: '0.6rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.5rem' }}
            >
              🚨 এসওএস পাঠান / SUBMIT SOS
            </button>
          </div>
        </section>
      </div>

      {/* Step 3: Outbox & Handoff Panel */}
      {outboxPacket && (
        <section style={{ marginTop: '1.25rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1.05rem', color: '#fbbf24', marginTop: 0 }}>
            ৩. আউটবক্স স্ট্যাটাস ও ট্রান্সপোর্ট হ্যান্ডঅফ (Outbox & Handoff State)
          </h2>

          <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
              প্রস্তুতকৃত কমপ্যাক্ট ডিজাস্টার প্যাকেট (ASCII Compact Packet - &lt;60 chars):
            </span>
            <code style={{ fontSize: '0.9rem', color: '#38bdf8', wordBreak: 'break-all' }}>{outboxPacket}</code>
          </div>

          <p style={{ fontSize: '0.85rem', color: sosStatus === 'SENT_ONLINE' || sosStatus === 'SIMULATED_GATEWAY_DELIVERED' ? '#4ade80' : '#f87171', margin: '0 0 0.75rem' }}>
            {statusMessage}
          </p>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleCopyPacket}
              style={{ background: '#334155', color: '#fff', border: '1px solid #475569', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              {copied ? '✅ প্যাকেট কপি হয়েছে!' : '📋 প্যাকেট কপি করুন (Copy Packet)'}
            </button>

            <a
              href={`sms:16604?body=${encodeURIComponent(outboxPacket)}`}
              style={{ background: '#0284c7', color: '#fff', textDecoration: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center' }}
            >
              ✉️ অ্যান্ড্রয়েড এসএমএস কম্পোজার ওপেন করুন (Open SMS Composer)
            </a>

            <button
              type="button"
              onClick={handleSimulateGatewayIngest}
              style={{ background: '#d97706', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              📡 গেটওয়ে ট্রানজিট ডেমো চালান (Simulate Gateway Ingest)
            </button>
          </div>

          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            * বিচারক নোট: এসএমএস কম্পোজার ওপেন হওয়া ডেলিভারির প্রমাণ নয়। কেবল সার্ভার বা গেটওয়ে একনলেজমেন্ট পেলেই স্ট্যাটাস নিশ্চিত হয়।
          </div>
        </section>
      )}
    </div>
  );
}

