export type ControlRoomTab =
  | 'overview'
  | 'triage'
  | 'alerts'
  | 'replay'
  | 'recovery'
  | 'ai'
  | 'audit'
  | 'settings'
  | 'simulator';

const ROLE_TABS: Record<string, readonly ControlRoomTab[]> = {
  ADMIN: ['overview', 'triage', 'alerts', 'replay', 'recovery', 'ai', 'audit', 'settings', 'simulator'],
  AUTHORITY: ['overview', 'triage', 'alerts', 'replay', 'recovery', 'ai', 'audit', 'settings', 'simulator'],
  RESPONDER: ['overview', 'triage', 'replay', 'simulator'],
  VOLUNTEER: ['simulator'],
  RECOVERY_COORDINATOR: ['recovery'],
  VIEWER: ['overview', 'replay'],
};

export const CONTROL_ROOM_ROUTES: readonly { path: string; roles: readonly string[] }[] = [
  { path: '/control-room/map', roles: ['AUTHORITY', 'ADMIN', 'RESPONDER', 'VOLUNTEER', 'RECOVERY_COORDINATOR', 'VIEWER'] },
  { path: '/control-room/responder', roles: ['AUTHORITY', 'ADMIN', 'RESPONDER'] },
  { path: '/control-room/alerts', roles: ['AUTHORITY', 'ADMIN'] },
  { path: '/control-room/replay', roles: ['AUTHORITY', 'ADMIN', 'RESPONDER', 'VIEWER'] },
  { path: '/control-room/recovery', roles: ['AUTHORITY', 'ADMIN', 'RECOVERY_COORDINATOR'] },
  { path: '/control-room/field', roles: ['VOLUNTEER', 'ADMIN'] },
  { path: '/control-room/simulator', roles: ['AUTHORITY', 'ADMIN', 'RESPONDER'] },
  { path: '/control-room/language', roles: ['AUTHORITY', 'ADMIN'] },
  { path: '/control-room/audit', roles: ['AUTHORITY', 'ADMIN'] },
  { path: '/control-room/settings', roles: ['ADMIN'] },
];

export function canAccessControlRoomRoute(path: string, role: string): boolean {
  return CONTROL_ROOM_ROUTES.find((route) => route.path === path)?.roles.includes(role) ?? false;
}

export function getRoleTabs(role: string): readonly ControlRoomTab[] {
  return ROLE_TABS[role] ?? [];
}
