import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ControlRoom } from './ControlRoom';
import { UserSession } from './Login';

vi.mock('../lib/api-client', () => ({
  checkApiHealth: vi.fn().mockResolvedValue({
    status: 'ok',
    modes: { aiProvider: 'deterministic', demoDataOnly: true },
  }),
}));

vi.mock('./OperationsOverview', () => ({
  OperationsOverview: () => <section>Situation room content</section>,
}));

vi.mock('../lib/operations-client', () => ({
  getOperationsSnapshot: vi.fn().mockResolvedValue({
    role: 'VIEWER', generatedAt: '2026-10-10T00:00:00.000Z',
    context: { mode: 'EXERCISE', event: { id: 'event-1', name: 'Synthetic Feni exercise' }, sources: [] },
    mapLayers: { areas: [], gauges: [], shelters: [], assets: [], incidents: [], sos: [] },
    queue: {}, visibility: { sos: false, incidents: false, assets: false, simulationControls: false, aggregateOnly: true },
  }),
  sendSimulationControl: vi.fn(),
}));

const authoritySession: UserSession = {
  id: 'authority-id',
  username: 'authority_dc',
  displayName: 'Duty Officer',
  role: 'AUTHORITY',
  accessToken: 'test-token',
};

const viewerSession: UserSession = {
  ...authoritySession,
  id: 'viewer-id',
  username: 'viewer_guest',
  role: 'VIEWER',
};

describe('ControlRoom command frame', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('shows the role, current workspace and API state', async () => {
    render(
      <MemoryRouter initialEntries={['/control-room/map']}>
        <ControlRoom session={authoritySession} onLogout={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByText('AUTHORITY')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Shared data mode' })).toHaveValue('EXERCISE');
    expect(screen.getByRole('navigation', { name: 'Operations workspaces' })).toContainElement(
      screen.getByRole('link', { name: /SOS & incidents/ }),
    );
    expect(screen.getByText('Situation room content')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByRole('status', { name: 'API connected' })).toBeInTheDocument());
  });

  it('keeps the selected mode in shared route query state and exposes historical event selection', async () => {
    render(
      <MemoryRouter initialEntries={['/control-room/map']}>
        <ControlRoom session={authoritySession} onLogout={vi.fn()} />
      </MemoryRouter>,
    );
    act(() => fireEvent.change(screen.getByRole('combobox', { name: 'Shared data mode' }), { target: { value: 'HISTORICAL' } }));
    expect(screen.getByRole('combobox', { name: 'Shared data mode' })).toHaveValue('HISTORICAL');
    expect(screen.getByRole('combobox', { name: 'Historical event' })).toHaveValue('11111111-1111-1111-1111-111111111101');
    act(() => fireEvent.change(screen.getByRole('combobox', { name: 'Historical event' }), { target: { value: '11111111-1111-1111-1111-111111111102' } }));
    expect(screen.getByRole('combobox', { name: 'Historical event' })).toHaveValue('11111111-1111-1111-1111-111111111102');
    expect(screen.getByRole('link', { name: /Replay & exercise/ })).toHaveAttribute('href', '/control-room/replay?mode=HISTORICAL&eventId=11111111-1111-1111-1111-111111111102');
  });

  it('keeps Authority-only destinations out of the Viewer navigation', async () => {
    render(
      <MemoryRouter initialEntries={['/control-room/map']}>
        <ControlRoom session={viewerSession} onLogout={vi.fn()} />
      </MemoryRouter>,
    );

    const navigation = screen.getByRole('navigation', { name: 'Operations workspaces' });
    expect(navigation).toHaveTextContent('Situation summary');
    expect(navigation).not.toHaveTextContent('Situation room');
    expect(navigation).toHaveTextContent('Replay & exercise');
    expect(navigation).not.toHaveTextContent('Warnings & approvals');
    expect(navigation).not.toHaveTextContent('Configuration');
    expect(await screen.findByRole('heading', { name: 'Feni situation summary' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('status', { name: 'API connected' })).toBeInTheDocument());
  });

  it('lands responders on the rescue desk instead of the Authority map', async () => {
    const responderSession: UserSession = { ...authoritySession, role: 'RESPONDER' };
    render(
      <MemoryRouter initialEntries={['/control-room/map']}>
        <ControlRoom session={responderSession} onLogout={vi.fn()} />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /Responder desk/i })).toBeInTheDocument();
    expect(screen.queryByText('Situation room content')).not.toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Operations workspaces' })).not.toHaveTextContent('Situation room');
  });
});
