import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HouseholdPreparedness } from './HouseholdPreparedness';
import { brainAreas } from '../lib/brain-client';
vi.mock('../lib/brain-client', () => ({ brainAreas: vi.fn() }));
const original = global.fetch;
beforeEach(() => { vi.mocked(brainAreas).mockResolvedValue([{ id: 'feni', name: 'Feni', basin: 'Muhuri', latitude: 23, longitude: 91, bounds: [91, 23, 92, 24], rainWatchMm: 60, rainHighMm: 120 }]); });
afterEach(() => { global.fetch = original; });
describe('public household preparedness', () => {
  it('works without an account or coordinates and does not fabricate shelter availability', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ areaName: 'Feni', basin: 'Muhuri', generatedAt: new Date().toISOString(), risk: { level: 'UNKNOWN', label: 'Experimental', reasons: ['Missing data'] }, preparation: ['Keep medicines accessible'], evidence: [], limitations: ['No flood-depth prediction'], shelterStatus: 'Shelter availability unknown', aidStatus: 'No aid booked' })));
    render(<MemoryRouter><HouseholdPreparedness /></MemoryRouter>); fireEvent.click(screen.getByRole('button', { name: 'Check my area without GPS' })); await screen.findByText('Shelter availability unknown');
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string); expect(body).toEqual({ areaId: 'feni', mode: 'LIVE', people: 1 });
  });
  it('shows errors without leaving a loading state', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('offline')); render(<MemoryRouter><HouseholdPreparedness /></MemoryRouter>); fireEvent.click(screen.getByRole('button', { name: 'Check my area without GPS' })); await screen.findByRole('alert'); expect(screen.getByRole('button', { name: 'Check my area without GPS' })).toBeEnabled();
  });
});
