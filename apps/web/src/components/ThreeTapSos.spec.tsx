import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThreeTapSos } from './ThreeTapSos';

describe('ThreeTapSos Component', () => {
  it('allows 3-tap SOS progression through people count, flags, and location', async () => {
    render(<ThreeTapSos />);

    // Step 1: Check Step 1 title and increment people count
    expect(screen.getByText(/Step 1: People Count/i)).toBeInTheDocument();
    const plusBtn = screen.getByRole('button', { name: /Increase people count/i });
    fireEvent.click(plusBtn); // count becomes 2

    const nextToFlagsBtn = screen.getByRole('button', { name: /Next: Urgency Flags/i });
    fireEvent.click(nextToFlagsBtn);

    // Step 2: Check Step 2 title and select flags
    expect(screen.getByText(/Step 2: Urgency Flags/i)).toBeInTheDocument();
    const childCheckbox = screen.getByLabelText(/Infant \/ Child present/i);
    fireEvent.click(childCheckbox);

    const nextToLocationBtn = screen.getByRole('button', { name: /Next: Location/i });
    fireEvent.click(nextToLocationBtn);

    // Step 3: Check Step 3 title and manual village fallback
    expect(screen.getByText(/Step 3: Location/i)).toBeInTheDocument();
    expect(screen.getByText(/GPS permission is optional/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Submit SOS/i });
    expect(submitBtn).toBeInTheDocument();
  });

  it('generates an ASCII Disaster Packet and displays copy/SMS buttons upon submission', async () => {
    // Mock global fetch
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success' }),
    }));

    render(<ThreeTapSos />);

    // Move to step 2 then step 3
    fireEvent.click(screen.getByRole('button', { name: /Next: Urgency Flags/i }));
    fireEvent.click(screen.getByRole('button', { name: /Next: Location/i }));

    // Click submit
    const submitBtn = screen.getByRole('button', { name: /Submit SOS/i });
    fireEvent.click(submitBtn);

    // Verify confirmation and packet display
    expect(await screen.findByText(/ASCII Disaster Packet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copy/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open SMS/i })).toBeInTheDocument();
  });

  it('preserves the selected Sylhet exercise and village in public SOS submission', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: 'success' }) });
    vi.stubGlobal('fetch', request);
    render(<ThreeTapSos districtCode="SYLHET_DIST" />);
    fireEvent.click(screen.getByRole('button', { name: /Next: Urgency Flags/i }));
    fireEvent.click(screen.getByRole('button', { name: /Next: Location/i }));
    fireEvent.click(screen.getByRole('button', { name: /Submit SOS/i }));
    await waitFor(() => expect(request).toHaveBeenCalled());
    const body = JSON.parse(request.mock.calls[0][1].body);
    expect(body.eventId).toBe('11111111-1111-1111-1111-111111111104');
    expect(body.village).toContain('Companiganj');
  });
});

