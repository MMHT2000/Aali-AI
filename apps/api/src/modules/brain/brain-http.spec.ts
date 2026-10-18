import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { UserRole } from '../users/entities/user-role.enum';

describe('brain HTTP access and validation', () => {
  let app: INestApplication; let jwt: JwtService;
  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile(); app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init(); jwt = app.get(JwtService);
  });
  afterAll(async () => app.close());
  const token = (role: UserRole) => jwt.sign({ sub: 'brain-test-actor', role, username: 'synthetic-test', displayName: 'Synthetic' });
  it('makes only area references public and protects persisted operational plans', async () => {
    await request(app.getHttpServer()).get('/api/v1/brain/areas').expect(200);
    await request(app.getHttpServer()).get('/api/v1/brain/latest?areaId=feni&mode=LIVE').expect(401);
  });
  it.each([UserRole.ADMIN, UserRole.VIEWER, UserRole.VOLUNTEER])('forbids operational runs by %s', async role => {
    await request(app.getHttpServer()).post('/api/v1/brain/run').set('Authorization', `Bearer ${token(role)}`).send({ areaId: 'feni', mode: 'LIVE' }).expect(403);
  });
  it('validates public input before any provider call', async () => {
    await request(app.getHttpServer()).post('/api/v1/brain/household').send({ areaId: 'bad', mode: 'LIVE' }).expect(400);
    await request(app.getHttpServer()).post('/api/v1/brain/household').send({ areaId: 'feni', mode: 'LIVE', latitude: 23 }).expect(400);
    await request(app.getHttpServer()).post('/api/v1/brain/household').send({ areaId: 'feni', mode: 'LIVE', url: 'http://localhost' }).expect(400);
  });
  it('returns database unavailability rather than claiming a run was saved', async () => {
    await request(app.getHttpServer()).post('/api/v1/brain/run').set('Authorization', `Bearer ${token(UserRole.AUTHORITY)}`).send({ areaId: 'feni', mode: 'EXERCISE' }).expect(503);
  });
  it('rejects malformed run IDs and unsupported automatic actions', async () => {
    await request(app.getHttpServer()).post('/api/v1/brain/runs/not-a-uuid/review').set('Authorization', `Bearer ${token(UserRole.AUTHORITY)}`).send({ actionId: 'x', decision: 'ACKNOWLEDGED', reason: 'Verified data' }).expect(400);
    await request(app.getHttpServer()).post('/api/v1/brain/run').set('Authorization', `Bearer ${token(UserRole.AUTHORITY)}`).send({ areaId: 'feni', mode: 'HISTORICAL' }).expect(400);
  });
  it.each([
    ['/api/v1/ai/understand-sos', UserRole.AUTHORITY, {}],
    ['/api/v1/ai/duplicate-similarity', UserRole.AUTHORITY, {}],
    ['/api/v1/ai/draft-communication', UserRole.AUTHORITY, {}],
    ['/api/v1/alerts/evaluate', UserRole.AUTHORITY, {}],
    ['/api/v1/replay/runs', UserRole.AUTHORITY, {}],
    ['/api/v1/recovery/reports', UserRole.RECOVERY_COORDINATOR, {}],
    ['/api/v1/recovery/deliveries', UserRole.RECOVERY_COORDINATOR, {}],
    ['/api/v1/brain/autonomy/control', UserRole.AUTHORITY, { scope: 'ALL', paused: 'false', reason: 'Synthetic test' }],
    ['/api/v1/brain/autonomy/control', UserRole.AUTHORITY, { scope: 'ALL', paused: true, reason: 'x' }],
    ['/api/v1/brain/autonomy/control', UserRole.AUTHORITY, { scope: 'unknown', paused: true, reason: 'Synthetic test' }],
    ['/api/v1/brain/autonomy/control', UserRole.AUTHORITY, { scope: 'ALL', paused: true, reason: 'Synthetic test', dispatch: true }],
  ])('validates workflow input before service execution: %s', async (path, role, body) => {
    await request(app.getHttpServer()).post(path).set('Authorization', `Bearer ${token(role as UserRole)}`).send(body).expect(400);
  });
  it('allows viewing worker health but forbids responder intervention', async () => {
    await request(app.getHttpServer()).get('/api/v1/brain/autonomy/status').set('Authorization', `Bearer ${token(UserRole.RESPONDER)}`).expect(200);
    await request(app.getHttpServer()).post('/api/v1/brain/autonomy/control').set('Authorization', `Bearer ${token(UserRole.RESPONDER)}`).send({ scope: 'ALL', paused: true, reason: 'Synthetic test' }).expect(403);
  });
});
