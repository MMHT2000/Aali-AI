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
});
