const request = require('supertest');
const app = require('../src/index');

describe('User Controller', () => {
  test('POST /users should create a user', async () => {
    const userData = { name: 'John Doe', email: 'john@example.com' };
    
    const response = await request(app)
      .post('/users')
      .send(userData)
      .expect(201);
    
    expect(response.body.name).toBe('John Doe');
    expect(response.body.email).toBe('john@example.com');
    expect(response.body.id).toBeDefined();
  });

  test('GET /users should return all users', async () => {
    await request(app)
      .post('/users')
      .send({ name: 'John', email: 'john@example.com' });
    
    const response = await request(app)
      .get('/users')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('GET /users/:id should return specific user', async () => {
    const createResponse = await request(app)
      .post('/users')
      .send({ name: 'Jane', email: 'jane@example.com' });
    
    const userId = createResponse.body.id;
    
    const response = await request(app)
      .get(`/users/${userId}`)
      .expect(200);
    
    expect(response.body.id).toBe(userId);
    expect(response.body.name).toBe('Jane');
  });

  test('GET /users/:id/status should return user status', async () => {
    const createResponse = await request(app)
      .post('/users')
      .send({ name: 'Bob', email: 'bob@example.com' });
    
    const userId = createResponse.body.id;
    
    const response = await request(app)
      .get(`/users/${userId}/status`)
      .expect(200);
    
    expect(response.body.id).toBe(userId);
    expect(response.body.status).toBe('active');
    expect(response.body.isActive).toBe(true);
  });

  test('PUT /users/:id should update user', async () => {
    const createResponse = await request(app)
      .post('/users')
      .send({ name: 'Alice', email: 'alice@example.com' });
    
    const userId = createResponse.body.id;
    
    const response = await request(app)
      .put(`/users/${userId}`)
      .send({ name: 'Alice Updated' })
      .expect(200);
    
    expect(response.body.name).toBe('Alice Updated');
  });

  test('DELETE /users/:id should delete user', async () => {
    const createResponse = await request(app)
      .post('/users')
      .send({ name: 'ToDelete', email: 'delete@example.com' });
    
    const userId = createResponse.body.id;
    
    await request(app)
      .delete(`/users/${userId}`)
      .expect(204);
    
    await request(app)
      .get(`/users/${userId}`)
      .expect(404);
  });

  test('should return 400 for invalid user data', async () => {
    const response = await request(app)
      .post('/users')
      .send({ name: 'J', email: 'invalid-email' })
      .expect(400);
    
    expect(response.body.error).toBeDefined();
  });
});
