import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import * as apiClient from './lib/api-client';

describe('App Shell', () => {
  beforeEach(() => { localStorage.clear(); window.history.replaceState({}, '', '/'); vi.restoreAllMocks(); });

  it('routes anonymous emergency entry to a public SOS page rather than a fake viewer session', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /Zero-Install Emergency SOS PWA/ })).toHaveAttribute('href', '/sos');
    expect(localStorage.getItem('aali_session')).toBeNull();
  });

  it('opens public SOS without requesting protected operations snapshots', () => {
    window.history.replaceState({}, '', '/sos');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Unexpected protected request'));
    render(<App />);
    expect(screen.getByRole('heading', { name: /Resident SOS/ })).toBeInTheDocument();
    expect(screen.getByText(/Step 1: People Count/)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('discards an older tokenless viewer session instead of requesting a snapshot with no credentials', () => {
    localStorage.setItem('aali_session', JSON.stringify({ id: 'citizen-pwa-guest', username: 'citizen_guest', displayName: 'Resident', role: 'VIEWER', accessToken: '' }));
    window.history.replaceState({}, '', '/control-room/viewer');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Unexpected protected request'));
    render(<App />);
    expect(screen.getByText(/আলি এআই কন্ট্রোল রুম লগইন/)).toBeInTheDocument();
    expect(localStorage.getItem('aali_session')).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('renders the Aali AI title and disclaimer banner', async () => {
    vi.spyOn(apiClient, 'checkApiHealth').mockResolvedValueOnce({
      status: 'ok',
      version: '0.1.0',
      timestamp: '2026-10-09T14:00:00Z',
      uptime: 10,
      environment: 'development',
      modes: {
        aiProvider: 'mock',
        smsGateway: 'simulated',
        satellite: 'simulated',
        officialData: 'fixtures',
        demoDataOnly: true,
      },
    });

    vi.spyOn(apiClient, 'checkApiReadiness').mockResolvedValueOnce({
      status: 'ready',
      timestamp: '2026-10-09T14:00:00Z',
      checks: {
        database: { status: 'up' },
      },
    });

    render(<App />);

    expect(
      screen.getByText(/আলি এআই কন্ট্রোল রুম লগইন/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Aali AI Central Control Room/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/লগইন করুন \(Enter Operations\)/i),
    ).toBeInTheDocument();
  });
});
