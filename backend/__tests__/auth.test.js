const request = require('supertest');
const { app } = require('../app');

describe('Auth API', () => {
  it('devrait connecter un utilisateur valide', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'admin@gmail.com', password: 'admin' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('devrait refuser un mot de passe incorrect', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'admin@gmail.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
});
