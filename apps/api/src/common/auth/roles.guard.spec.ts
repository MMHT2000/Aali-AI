import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../modules/users/entities/user-role.enum';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (userRole?: UserRole): ExecutionContext => {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user: userRole ? { role: userRole } : undefined,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow access if no roles are required on route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext(UserRole.VIEWER);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow ADMIN supervisor access even if route requires AUTHORITY', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.AUTHORITY]);
    const context = createMockContext(UserRole.ADMIN);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow user with matching role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.AUTHORITY]);
    const context = createMockContext(UserRole.AUTHORITY);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user lacks required role (e.g. VOLUNTEER attempting AUTHORITY action)', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.AUTHORITY]);
    const context = createMockContext(UserRole.VOLUNTEER);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user context is missing', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.AUTHORITY]);
    const context = createMockContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
