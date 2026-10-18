import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThreeTapSos } from './ThreeTapSos';

/** Public intake only. Never requests authenticated operational snapshots. */
export function ResidentSos() {
  const [districtCode, setDistrictCode] = useState('FENI_DIST');
  return <main style={{ maxWidth: 850, margin: '0 auto', padding: '24px 16px', color: '#e2e8f0' }}>
    <header><h1>Resident SOS / জরুরি উদ্ধার অনুরোধ</h1><p>No sign-in is required to prepare or submit an SOS. This is a decision-support prototype; transport simulations are labelled.</p></header>
    <label style={{ display: 'block', marginBottom: 16 }}>Your area / এলাকা{' '}
      <select aria-label="SOS area" value={districtCode} onChange={event => setDistrictCode(event.target.value)}>
        <option value="FENI_DIST">Feni / ফেনী</option><option value="SYLHET_DIST">Sylhet / সিলেট</option>
      </select>
    </label>
    <ThreeTapSos key={districtCode} districtCode={districtCode} />
    <nav aria-label="Resident resources" style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 20 }}>
      <Link to="/preparedness">Area preparedness</Link><Link to="/">Staff and observer sign-in</Link>
    </nav>
  </main>;
}
