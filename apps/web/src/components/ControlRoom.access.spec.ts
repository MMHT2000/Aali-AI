import { describe, expect, it } from 'vitest';
import { canAccessControlRoomRoute, getRoleTabs } from '../lib/control-room-access';

describe('role workspace navigation policy', () => {
  it('keeps authority actions out of responder, recovery and viewer navigation', () => {
    expect(getRoleTabs('RESPONDER')).not.toContain('alerts');
    expect(getRoleTabs('RECOVERY_COORDINATOR')).toEqual(['recovery']);
    expect(getRoleTabs('VIEWER')).not.toContain('triage');
  });

  it('shows distinct workspaces for each operational role', () => {
    expect(canAccessControlRoomRoute('/control-room/map', 'AUTHORITY')).toBe(true);
    expect(canAccessControlRoomRoute('/control-room/alerts', 'RESPONDER')).toBe(false);
    expect(canAccessControlRoomRoute('/control-room/responder', 'RESPONDER')).toBe(true);
    expect(canAccessControlRoomRoute('/control-room/field', 'VOLUNTEER')).toBe(true);
    expect(canAccessControlRoomRoute('/control-room/recovery', 'RECOVERY_COORDINATOR')).toBe(true);
    expect(canAccessControlRoomRoute('/control-room/alerts', 'VIEWER')).toBe(false);
    expect(canAccessControlRoomRoute('/control-room/settings', 'ADMIN')).toBe(true);
  });
});
