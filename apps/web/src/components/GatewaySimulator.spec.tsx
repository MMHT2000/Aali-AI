import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GatewaySimulator } from './GatewaySimulator';

describe('GatewaySimulator Component', () => {
  it('renders simulator header and simulation warning banner', () => {
    render(<GatewaySimulator />);
    expect(screen.getByText(/Carrier SMS Gateway Simulator/i)).toBeInTheDocument();
    expect(screen.getByText(/DEMO SIMULATION ONLY/i)).toBeInTheDocument();
  });

  it('allows loading example packet and submitting to simulated gateway', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        simulation: true,
        reportId: 'sos-mock-id-123',
        packetChecksum: '1G90',
        gatewayId: 'FENI-TOWER-GATEWAY-01',
        isIdempotentDuplicate: false,
        status: 'ACCEPTED',
      }),
    }));

    render(<GatewaySimulator />);

    const loadExampleBtn = screen.getByRole('button', { name: /নমুনা প্যাকেট লোড করুন/i });
    fireEvent.click(loadExampleBtn);

    const submitBtn = screen.getByRole('button', { name: /প্যাকেট ফরওয়ার্ড করুন/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Packet Ingested/i)).toBeInTheDocument();
    expect(screen.getByText(/ACCEPTED/i)).toBeInTheDocument();
  });
});
