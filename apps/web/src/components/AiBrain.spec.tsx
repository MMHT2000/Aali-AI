import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AiBrain } from './AiBrain';
import { brainAreas, latestBrain, personalBrain, reviewBrain, runBrain } from '../lib/brain-client';
import type { BrainPlan } from '../lib/brain-client';
vi.mock('../lib/brain-client', () => ({ brainAreas: vi.fn(), latestBrain: vi.fn(), runBrain: vi.fn(), reviewBrain: vi.fn(), personalBrain: vi.fn() }));
vi.mock('./BrainMap', () => ({ default: () => <section aria-label="Area intelligence map">Area map</section> }));
const result: BrainPlan = {
  id: 'run', areaId: 'feni', mode: 'EXERCISE', createdAt: new Date().toISOString(), risk: { level: 'UNKNOWN', reasons: ['Data missing'], rain24hMm: null, dischargeRisePercent: null, label: 'Experimental rules' }, environment: { grid: null, days: [], evidence: [], imagery: [] }, operations: { provenance: 'SYNTHETIC_EXERCISE', reports: [], shelters: [], relief: [] }, agent: { provider: 'LOCAL_PLANNER', status: 'NO_OPENAI_KEY_LOCAL_PLANNER', summary: 'Unknown is not safe.', focusActionIds: [], trace: [] }, limitations: ['No auto dispatch'], actions: [{ id: 'action', kind: 'VERIFY_DATA', title: 'Verify missing sources', detail: 'Get field verification.', sourceIds: [], priority: 80, requiredRole: 'AUTHORITY', state: 'PENDING_REVIEW' }],
};
beforeEach(() => {
  vi.clearAllMocks(); vi.mocked(brainAreas).mockResolvedValue([{ id: 'feni', name: 'Feni', basin: 'Muhuri', latitude: 23.22, longitude: 91.44, bounds: [91.2, 22.9, 91.65, 23.4], rainWatchMm: 60, rainHighMm: 120 }]);
  vi.mocked(latestBrain).mockResolvedValue(null); vi.mocked(runBrain).mockResolvedValue(structuredClone(result));
});
describe('AI Brain workspace', () => {
  it('loads and runs an analysis with honest unknown and fallback labels', async () => {
    render(<AiBrain role="AUTHORITY" mode="EXERCISE" districtCode="FENI_DIST" />);
    await screen.findByText('Start with the evidence'); fireEvent.click(screen.getByRole('button', { name: 'Run area analysis' }));
    await screen.findByText('Unknown is not safe.'); expect(screen.getByText('NO_OPENAI_KEY_LOCAL_PLANNER', { exact: false })).toBeInTheDocument(); expect(screen.getByText('Unknown', { exact: true })).toBeInTheDocument();
  });
  it('never mixes current forecasts with historical replay', () => {
    render(<AiBrain role="AUTHORITY" mode="HISTORICAL" districtCode="FENI_DIST" />); expect(screen.getByRole('button', { name: 'Run area analysis' })).toBeDisabled(); expect(latestBrain).not.toHaveBeenCalled();
  });
  it('requires a reason and the matching role to acknowledge review', async () => {
    vi.mocked(latestBrain).mockResolvedValue(structuredClone(result)); vi.mocked(reviewBrain).mockResolvedValue(structuredClone(result));
    render(<AiBrain role="AUTHORITY" mode="EXERCISE" districtCode="FENI_DIST" />);
    const button = await screen.findByRole('button', { name: 'Acknowledge review' }); expect(button).toBeDisabled(); fireEvent.change(screen.getByPlaceholderText(/What did you verify/), { target: { value: 'Checked official source' } }); fireEvent.click(button);
    await waitFor(() => expect(reviewBrain).toHaveBeenCalledWith('run', 'action', 'ACKNOWLEDGED', 'Checked official source'));
  });
  it('does not show authority review controls to a responder', async () => {
    vi.mocked(latestBrain).mockResolvedValue(structuredClone(result)); render(<AiBrain role="RESPONDER" mode="EXERCISE" districtCode="FENI_DIST" />); await screen.findByText('Verify missing sources'); expect(screen.queryByRole('button', { name: 'Acknowledge review' })).not.toBeInTheDocument();
  });
  it('supports household guidance without requesting GPS', async () => {
    vi.mocked(latestBrain).mockResolvedValue(structuredClone(result)); vi.mocked(personalBrain).mockResolvedValue({ preparation: ['Prepare medicines'], shelterCandidates: [], shelterStatus: 'Location unknown', locationStatus: 'LOCATION_UNKNOWN', aidStatus: 'No delivery booked' });
    render(<AiBrain role="AUTHORITY" mode="EXERCISE" districtCode="FENI_DIST" />); fireEvent.click(await screen.findByRole('button', { name: 'Without GPS' })); await screen.findByText('Location unknown'); expect(personalBrain).toHaveBeenCalledWith({ areaId: 'feni', mode: 'EXERCISE', people: 1 });
  });
  it('shows provider errors without fabricating a plan', async () => {
    vi.mocked(runBrain).mockRejectedValue(new Error('Database unavailable')); render(<AiBrain role="AUTHORITY" mode="LIVE" districtCode="FENI_DIST" />); await screen.findByText('Start with the evidence'); fireEvent.click(screen.getByRole('button', { name: 'Run area analysis' })); await screen.findByRole('alert'); expect(screen.queryByText('Agent briefing')).not.toBeInTheDocument();
  });
});
