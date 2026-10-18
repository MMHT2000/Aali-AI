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
  { path: '/control-room/brain', roles: ['AUTHORITY', 'RESPONDER', 'RECOVERY_COORDINATOR', 'ADMIN'] },
  { path: '/control-room/map', roles: ['AUTHORITY', 'ADMIN'] },
  { path: '/control-room/viewer', roles: ['VIEWER'] },
  { path: '/control-room/responder', roles: ['AUTHORITY', 'RESPONDER'] },
  { path: '/control-room/alerts', roles: ['AUTHORITY', 'ADMIN'] },
  { path: '/control-room/replay', roles: ['AUTHORITY', 'ADMIN', 'RESPONDER', 'VIEWER'] },
  { path: '/control-room/recovery', roles: ['AUTHORITY', 'RECOVERY_COORDINATOR'] },
  { path: '/control-room/field', roles: ['VOLUNTEER'] },
  { path: '/control-room/simulator', roles: ['AUTHORITY', 'ADMIN', 'RESPONDER'] },
  { path: '/control-room/language', roles: ['AUTHORITY'] },
  { path: '/control-room/audit', roles: ['AUTHORITY', 'ADMIN'] },
  { path: '/control-room/settings', roles: ['ADMIN'] },
];

export function getRoleHomePath(role: string): string {
  switch (role) {
    case 'AUTHORITY': return '/control-room/map';
    case 'RESPONDER': return '/control-room/responder';
    case 'VOLUNTEER': return '/control-room/field';
    case 'RECOVERY_COORDINATOR': return '/control-room/recovery';
    case 'VIEWER': return '/control-room/viewer';
    case 'ADMIN': return '/control-room/settings';
    default: return '/login';
  }
}

export function canAccessControlRoomRoute(path: string, role: string): boolean {
  return CONTROL_ROOM_ROUTES.find((route) => route.path === path)?.roles.includes(role) ?? false;
}

export function getRoleTabs(role: string): readonly ControlRoomTab[] {
  return ROLE_TABS[role] ?? [];
}
