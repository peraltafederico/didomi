import { INestApplication } from '@nestjs/common';
import { createTestingApp, getRequest } from '../../../test/test-utils';
import { UserResponseDto } from '../dto/user-response.dto';
import { DataSource } from 'typeorm';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let userId: string;
  let dataSource: DataSource;

  beforeAll(async () => {
    const testApp = await createTestingApp();
    app = testApp.app;
    dataSource = testApp.dataSource;
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  it('should create a user', async () => {
    const response = await getRequest(app)
      .post('/users')
      .send({ email: 'test@example.com' })
      .expect(201);

    const userResponseBody = response.body as unknown as UserResponseDto;

    expect(userResponseBody).toHaveProperty('id');
    expect(userResponseBody.email).toBe('test@example.com');
    userId = userResponseBody.id;
  });

  it('should not create a user with the same email', async () => {
    await getRequest(app)
      .post('/users')
      .send({ email: 'test@example.com' })
      .expect(409);
  });

  it('should get all users', async () => {
    const response = await getRequest(app).get('/users').expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    const userResponseBody = response.body as unknown as UserResponseDto[];
    expect(userResponseBody.length).toBeGreaterThan(0);
    expect(userResponseBody[0]).toHaveProperty('id');
    expect(userResponseBody[0]).toHaveProperty('email');
    expect(userResponseBody[0]).toHaveProperty('consents');
  });

  it('should get a user by id', async () => {
    const response = await getRequest(app).get(`/users/${userId}`).expect(200);

    const userResponseBody = response.body as unknown as UserResponseDto;
    expect(userResponseBody.id).toBe(userId);
    expect(userResponseBody.email).toBe('test@example.com');
    expect(userResponseBody.consents).toEqual([]);
  });

  it('should return 404 for non-existent user', async () => {
    await getRequest(app)
      .get('/users/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });

  it('should get the current consents for a user', async () => {
    // Send a bunch of events for the user
    await getRequest(app)
      .post('/events')
      .send({
        user: { id: userId },
        consents: [
          { id: 'email_notifications', enabled: true },
          { id: 'sms_notifications', enabled: false },
        ],
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
        consents: [
          { id: 'email_notifications', enabled: true },
          { id: 'sms_notifications', enabled: true },
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
        consents: [{ id: 'email_notifications', enabled: false }],
      })
      .expect(201);

    // Get the user's consents
    const response = await getRequest(app).get(`/users/${userId}`).expect(200);

    const userResponseBody = response.body as unknown as UserResponseDto;

    expect(userResponseBody.consents).toEqual([
      { id: 'email_notifications', enabled: false },
      { id: 'sms_notifications', enabled: false },
    ]);

    // Send a new event for the user
    await getRequest(app)
      .post('/events')
      .send({
        user: { id: userId },
        consents: [
          { id: 'email_notifications', enabled: true },
          { id: 'sms_notifications', enabled: false },
        ],
      })
      .expect(201);

    // Get the user's consents again
    const response2 = await getRequest(app).get(`/users/${userId}`).expect(200);

    const userResponseBody2 = response2.body as unknown as UserResponseDto;

    expect(userResponseBody2.consents).toEqual([
      { id: 'email_notifications', enabled: true },
      { id: 'sms_notifications', enabled: false },
    ]);
  });

  it('should delete a user', async () => {
    await getRequest(app).delete(`/users/${userId}`).expect(204);
    await getRequest(app).get(`/users/${userId}`).expect(404);
  });
});
