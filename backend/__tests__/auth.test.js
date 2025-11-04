// // auth.test.js
// const request = require('supertest');
// const mongoose = require('mongoose');
// const { MongoMemoryServer } = require('mongodb-memory-server');
// const app = require('../app'); // ton app Express sans listen
// const User = require('../models/User');

// let mongoServer;

// beforeAll(async () => {
//   // Démarrage d'une base MongoDB in-memory
//   mongoServer = await MongoMemoryServer.create();
//   const uri = mongoServer.getUri();

//   await mongoose.connect(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
// });

// afterAll(async () => {
//   await mongoose.disconnect();
//   await mongoServer.stop();
// });

// afterEach(async () => {
//   // Nettoyage après chaque test
//   await User.deleteMany({});
// });

// describe('Auth API', () => {
//   it('devrait connecter un utilisateur valide', async () => {
//     // Création de l'utilisateur avant le test
//     await User.create({
//       email: 'admin@gmail.com',
//       password: 'admin', // adapter si tu as un hash
//       role: 'admin',
//     });

//     const res = await request(app)
//       .post('/api/users/login')
//       .send({ email: 'admin@gmail.com', password: 'admin' });

//     expect(res.status).toBe(200);
//     expect(res.body).toHaveProperty('token');
//   });

//   it('devrait refuser un mot de passe incorrect', async () => {
//     await User.create({
//       email: 'admin@gmail.com',
//       password: 'admin',
//       role: 'admin',
//     });

//     const res = await request(app)
//       .post('/api/users/login')
//       .send({ email: 'admin@gmail.com', password: 'wrongpass' });

//     expect(res.status).toBe(401);
//     expect(res.body).toHaveProperty('message');
//   });

//   it('devrait refuser un utilisateur inexistant', async () => {
//     const res = await request(app)
//       .post('/api/users/login')
//       .send({ email: 'inexistant@gmail.com', password: 'test' });

//     expect(res.status).toBe(401);
//     expect(res.body).toHaveProperty('message');
//   });
// });
