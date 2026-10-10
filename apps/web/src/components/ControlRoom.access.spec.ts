import { describe, expect, it } from 'vitest';
import { canAccessControlRoomRoute, getRoleHomePath, getRoleTabs } from '../lib/control-room-access';

describe('role workspace navigation policy', () => {
  it('keeps authority actions out of responder, recovery and viewer navigation', () => {
    expect(getRoleTabs('RESPONDER')).not.toContain('alerts');
    expect(getRoleTabs('RECOVERY_COORDINATOR')).toEqual(['recovery']);
    expect(getRoleTabs('VIEWER')).not.toContain('triage');
  });

  it('shows distinct workspaces for each operational role', () => {
    expect(canAccessControlRoomRoute('/control-room/map', 'AUTHORITY')).toBe(true);
    expect(canAccessControlRoomRoute('/control-room/map', 'RESPONDER')).toBe(false);
    expect(canAccessControlRoomRoute('/control-room/alerts', 'RESPONDER')).toBe(false);
    expect(canAccessControlRoomRoute('/control-room/responder', 'RESPONDER')).toBe(true);
    expect(canAccessControlRoomRoute('/control-room/field', 'VOLUNTEER')).toBe(true);
    expect(canAccessControlRoomRoute('/control-room/recovery', 'RECOVERY_COORDINATOR')).toBe(true);
    expect(canAccessControlRoomRoute('/control-room/alerts', 'VIEWER')).toBe(false);
    expect(canAccessControlRoomRoute('/control-room/viewer', 'VIEWER')).toBe(true);
    expect(canAccessControlRoomRoute('/control-room/settings', 'ADMIN')).toBe(true);
  });

  it('routes each role to its task-focused home workspace', () => {
    expect(getRoleHomePath('AUTHORITY')).toBe('/control-room/map');
    expect(getRoleHomePath('RESPONDER')).toBe('/control-room/responder');
    expect(getRoleHomePath('VOLUNTEER')).toBe('/control-room/field');
    expect(getRoleHomePath('RECOVERY_COORDINATOR')).toBe('/control-room/recovery');
    expect(getRoleHomePath('VIEWER')).toBe('/control-room/viewer');
    expect(getRoleHomePath('ADMIN')).toBe('/control-room/settings');
  });
});
