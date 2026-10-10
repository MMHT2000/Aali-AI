import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { UserRole } from './modules/users/entities/user-role.enum';

describe('API authorization boundary', () => {
  let app: INestApplication;
  let jwt: JwtService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    await app.init();
    jwt = app.get(JwtService);
  });

  afterAll(async () => app.close());

  it('keeps liveness and login public while protecting operational reads', async () => {
    await request(app.getHttpServer()).get('/health').expect(200);
    await request(app.getHttpServer()).post('/api/v1/auth/login')
      .send({ username: 'missing-user', password: 'invalid' }).expect(401);
    await request(app.getHttpServer()).get('/api/v1/incidents').expect(401);
  });

  it('rejects a responder from warning approval and permits an authority', async () => {
    const responderToken = jwt.sign({ sub: 'responder-id', username: 'responder', role: UserRole.RESPONDER, displayName: 'Responder' });
    const authorityToken = jwt.sign({ sub: 'authority-id', username: 'authority', role: UserRole.AUTHORITY, displayName: 'Authority' });

    await request(app.getHttpServer()).post('/api/v1/warnings/warn-001/approve')
      .set('Authorization', `Bearer ${responderToken}`).send({ note: 'test' }).expect(403);
    await request(app.getHttpServer()).post('/api/v1/warnings/warn-001/approve')
      .set('Authorization', `Bearer ${authorityToken}`).send({ note: 'test' }).expect(201);
  });

  it('forbids VIEWER from mutate operations but allows read snapshot', async () => {
    const viewerToken = jwt.sign({ sub: 'viewer-id', username: 'viewer_guest', role: UserRole.VIEWER, displayName: 'Viewer' });

    await request(app.getHttpServer()).post('/api/v1/warnings/warn-001/approve')
      .set('Authorization', `Bearer ${viewerToken}`).send({ note: 'test' }).expect(403);
    await request(app.getHttpServer()).post('/api/v1/field-readings')
      .set('Authorization', `Bearer ${viewerToken}`).send({ areaId: '22222222-2222-2222-2222-222222222204', levelM: 5.2 }).expect(403);
    await request(app.getHttpServer()).post('/api/v1/recovery/reports')
      .set('Authorization', `Bearer ${viewerToken}`).send({ areaId: '22222222-2222-2222-2222-222222222204', damageLevel: 'MODERATE' }).expect(403);

    // Reading snapshot is allowed for viewer
    await request(app.getHttpServer()).get('/api/v1/operations/snapshot')
      .set('Authorization', `Bearer ${viewerToken}`).expect(200);
    await request(app.getHttpServer()).get('/api/v1/assets')
      .set('Authorization', `Bearer ${viewerToken}`).expect(403);
  });

  it('forbids VOLUNTEER from warning approval and boat review, allows field-readings', async () => {
    const volunteerToken = jwt.sign({ sub: 'volunteer-id', username: 'volunteer_parshuram', role: UserRole.VOLUNTEER, displayName: 'Volunteer' });

    await request(app.getHttpServer()).post('/api/v1/warnings/warn-001/approve')
      .set('Authorization', `Bearer ${volunteerToken}`).send({ note: 'test' }).expect(403);
    await request(app.getHttpServer()).post('/api/v1/incidents/inc-feni-001/boat-recommendation/review')
      .set('Authorization', `Bearer ${volunteerToken}`).send({ decision: 'ACCEPT' }).expect(403);

    // Volunteer is authorized for field readings
    await request(app.getHttpServer()).post('/api/v1/field-readings')
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send({ areaId: '22222222-2222-2222-2222-222222222204', levelM: 4.85, note: 'Water mark check' })
      .expect(201);
  });

  it('forbids RECOVERY_COORDINATOR from warning approval and simulation control, allows recovery delivery', async () => {
    const recoveryToken = jwt.sign({ sub: 'recovery-id', username: 'recovery_coord', role: UserRole.RECOVERY_COORDINATOR, displayName: 'Recovery Officer' });

    await request(app.getHttpServer()).post('/api/v1/warnings/warn-001/approve')
      .set('Authorization', `Bearer ${recoveryToken}`).send({ note: 'test' }).expect(403);
    await request(app.getHttpServer()).post('/api/v1/simulation/start')
      .set('Authorization', `Bearer ${recoveryToken}`).expect(403);

    // Authorized to record delivery
    await request(app.getHttpServer()).post('/api/v1/recovery/deliveries')
      .set('Authorization', `Bearer ${recoveryToken}`)
      .send({
        areaId: '22222222-2222-2222-2222-222222222204',
        organizationLabel: 'BDRCS Field Unit',
        itemCode: 'CLEAN_WATER',
        quantity: 500,
        unit: 'LITRES',
        idempotencyKey: `test-del-${Date.now()}`,
      })
      .expect(201);
  });

  it('allows RESPONDER to review duplicate candidates and boat recommendations', async () => {
    const responderToken = jwt.sign({ sub: 'responder-id', username: 'responder_feni', role: UserRole.RESPONDER, displayName: 'Responder' });

    await request(app.getHttpServer()).post('/api/v1/incidents/inc-feni-001/duplicate-candidates/dup-cand-001/review')
      .set('Authorization', `Bearer ${responderToken}`)
      .send({ decision: 'ACCEPT', reason: 'Same roof location confirmed by phone' })
      .expect(201);

    await request(app.getHttpServer()).post('/api/v1/incidents/inc-feni-001/boat-recommendation/review')
      .set('Authorization', `Bearer ${responderToken}`)
      .send({ decision: 'ACCEPT', reason: 'Engine boat dispatched by volunteer unit' })
      .expect(201);
  });

  it('makes endpoint role lists authoritative for ADMIN and limits reference assets to rescue roles', async () => {
    const adminToken = jwt.sign({ sub: 'admin-id', username: 'admin', role: UserRole.ADMIN, displayName: 'System Admin' });
    const authorityToken = jwt.sign({ sub: 'authority-id', username: 'authority', role: UserRole.AUTHORITY, displayName: 'Authority' });
    const residentToken = jwt.sign({ sub: 'resident-id', username: 'resident', role: UserRole.RESIDENT, displayName: 'Resident' });

    // Admin keeps explicit system oversight and safe reference access.
    await request(app.getHttpServer()).get('/api/v1/users/demo-accounts')
      .set('Authorization', `Bearer ${adminToken}`).expect(200);
    await request(app.getHttpServer()).get('/api/v1/areas')
      .set('Authorization', `Bearer ${adminToken}`).expect(200);
    await request(app.getHttpServer()).get('/api/v1/assets')
      .set('Authorization', `Bearer ${adminToken}`).expect(403);

    // Operational records and human warning authority are not implied by ADMIN.
    await request(app.getHttpServer()).get('/api/v1/sos')
      .set('Authorization', `Bearer ${adminToken}`).expect(403);
    await request(app.getHttpServer()).get('/api/v1/incidents')
      .set('Authorization', `Bearer ${adminToken}`).expect(403);
    await request(app.getHttpServer()).get('/api/v1/recovery/reports')
      .set('Authorization', `Bearer ${adminToken}`).expect(403);
    await request(app.getHttpServer()).post('/api/v1/warnings/warn-001/approve')
      .set('Authorization', `Bearer ${adminToken}`).send({ note: 'admin approval attempt' }).expect(403);
    await request(app.getHttpServer()).post('/api/v1/incidents/inc-feni-001/boat-recommendation/review')
      .set('Authorization', `Bearer ${adminToken}`).send({ decision: 'ACCEPT', reason: 'admin review attempt' }).expect(403);

    // A resident needs village/shelter references, but never the response asset register.
    await request(app.getHttpServer()).get('/api/v1/areas')
      .set('Authorization', `Bearer ${residentToken}`).expect(200);
    await request(app.getHttpServer()).get('/api/v1/shelters')
      .set('Authorization', `Bearer ${residentToken}`).expect(200);
    await request(app.getHttpServer()).get('/api/v1/assets')
      .set('Authorization', `Bearer ${residentToken}`).expect(403);

    await request(app.getHttpServer()).get('/api/v1/assets')
      .set('Authorization', `Bearer ${authorityToken}`).expect(200);
  });

  it('keeps warning approval Authority-only while preserving explicit Admin simulation controls', async () => {
    const adminToken = jwt.sign({ sub: 'admin-id', username: 'admin', role: UserRole.ADMIN, displayName: 'System Admin' });

    await request(app.getHttpServer()).post('/api/v1/simulation/start')
      .set('Authorization', `Bearer ${adminToken}`).expect(201);
    await request(app.getHttpServer()).post('/api/v1/warnings/warn-001/approve')
      .set('Authorization', `Bearer ${adminToken}`).send({ note: 'admin must not approve' }).expect(403);
  });
});
