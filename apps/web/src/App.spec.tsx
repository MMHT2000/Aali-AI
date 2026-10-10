import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import * as apiClient from './lib/api-client';

describe('App Shell', () => {
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
