import { INestApplication } from '@nestjs/common';
import { createTestingApp, getRequest } from './test-utils';
import { UserResponseDto } from '../src/users/dto/user-response.dto';
import { DataSource } from 'typeorm';
import { Event } from '../src/events/entities/event.entity';

describe('EventsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userId: string;

  beforeAll(async () => {
    const testApp = await createTestingApp();
    app = testApp.app;
    dataSource = testApp.dataSource;

    const userResponse = await getRequest(app)
      .post('/users')
      .send({ email: 'events-test@example.com' });

    userId = (userResponse.body as UserResponseDto).id;
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  it('should create an event with consents', async () => {
    const eventData = {
      user: { id: userId },
      consents: [
        { id: 'email_notifications', enabled: true },
        { id: 'sms_notifications', enabled: false },
      ],
    };
    await getRequest(app).post('/events').send(eventData).expect(201);
  });

  it('should update consents with a new event', async () => {
    const eventData = {
      user: { id: userId },
      consents: [{ id: 'email_notifications', enabled: false }],
    };

    await getRequest(app).post('/events').send(eventData).expect(201);

    const userResponse = await getRequest(app)
      .get(`/users/${userId}`)
      .expect(200);

    const userResponseBody = userResponse.body as unknown as UserResponseDto;

    const emailConsent = userResponseBody.consents.find(
      (c) => c.id === 'email_notifications',
    ) as UserResponseDto['consents'][number];
    const smsConsent = userResponseBody.consents.find(
      (c) => c.id === 'sms_notifications',
    ) as UserResponseDto['consents'][number];

    expect(emailConsent).toBeDefined();
    expect(emailConsent.enabled).toBe(false);
    expect(smsConsent).toBeDefined();
    expect(smsConsent.enabled).toBe(false);
  });

  it('should reject invalid consent types', async () => {
    const eventData = {
      user: { id: userId },
      consents: [{ id: 'invalid_consent_type', enabled: true }],
    };

    await getRequest(app).post('/events').send(eventData).expect(422);
  });

  it('should reject duplicate consent IDs in the same event', async () => {
    const eventData = {
      user: { id: userId },
      consents: [
        { id: 'email_notifications', enabled: true },
        { id: 'email_notifications', enabled: false },
      ],
    };

    await getRequest(app).post('/events').send(eventData).expect(422);
  });

  it('should reject events for non-existent users', async () => {
    const eventData = {
      user: { id: '00000000-0000-0000-0000-000000000000' },
      consents: [{ id: 'email_notifications', enabled: true }],
    };

    await getRequest(app).post('/events').send(eventData).expect(404);
  });

  it('should maintain audit trail', async () => {
    await dataSource.getRepository(Event).delete({});

    // Create multiple events
    await getRequest(app)
      .post('/events')
      .send({
        user: { id: userId },
        consents: [{ id: 'email_notifications', enabled: true }],
      })
      .expect(201);
    await getRequest(app)
      .post('/events')
      .send({
        user: { id: userId },
        consents: [{ id: 'email_notifications', enabled: false }],
      })
      .expect(201);
    await getRequest(app)
      .post('/events')
      .send({
        user: { id: userId },
        consents: [{ id: 'sms_notifications', enabled: true }],
      })
      .expect(201);
    await getRequest(app)
      .post('/events')
      .send({
        user: { id: userId },
        consents: [
          { id: 'sms_notifications', enabled: false },
          { id: 'email_notifications', enabled: true },
        ],
      })
      .expect(201);
    await getRequest(app)
      .post('/events')
      .send({
        user: { id: userId },
        consents: [{ id: 'sms_notifications', enabled: false }],
      })
      .expect(201);
    await getRequest(app)
      .post('/events')
      .send({
        user: { id: userId },
        consents: [
          { id: 'sms_notifications', enabled: false },
          { id: 'email_notifications', enabled: true },
        ],
      })
      .expect(201);

    const events = await dataSource.getRepository(Event).find({
      relations: {
        consents: true,
      },
      order: {
        createdAt: 'ASC',
        consents: {
          consentId: 'ASC',
        },
      },
    });
    expect(events).toHaveLength(6);
    expect(events[0].consents[0].enabled).toBe(true);
    expect(events[1].consents[0].enabled).toBe(false);
    expect(events[2].consents[0].enabled).toBe(true);
    expect(events[3].consents[0].enabled).toBe(true);
    expect(events[3].consents[1].enabled).toBe(false);
    expect(events[4].consents[0].enabled).toBe(false);
    expect(events[5].consents[0].enabled).toBe(true);
    expect(events[5].consents[1].enabled).toBe(false);
  });
});
