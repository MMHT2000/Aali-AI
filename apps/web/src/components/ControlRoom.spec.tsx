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

  it('shows the role, current workspace, API state and prototype disclosure', async () => {
    render(
      <MemoryRouter initialEntries={['/control-room/map']}>
        <ControlRoom session={authoritySession} onLogout={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByText('AUTHORITY')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Shared data mode' })).toHaveValue('EXERCISE');
    expect(screen.getByRole('note', { name: 'Prototype disclosure' })).toHaveTextContent('Not an emergency service');
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
    expect(navigation).toHaveTextContent('Situation room');
    expect(navigation).toHaveTextContent('Replay & exercise');
    expect(navigation).not.toHaveTextContent('Warnings & approvals');
    expect(navigation).not.toHaveTextContent('Configuration');
    await waitFor(() => expect(screen.getByRole('status', { name: 'API connected' })).toBeInTheDocument());
  });
});
