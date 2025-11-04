// // equipement.test.js
// const request = require('supertest');
// const mongoose = require('mongoose');
// const { MongoMemoryServer } = require('mongodb-memory-server');
// const jwt = require('jsonwebtoken');
// const app = require('../app'); // app.js sans listen
// const Equipement = require('../models/Equipement');
// const User = require('../models/User');

// let mongoServer;
// let token; // token JWT pour tests

// beforeAll(async () => {
//   // Démarrage d'une base MongoDB in-memory
//   mongoServer = await MongoMemoryServer.create();
//   const uri = mongoServer.getUri();

//   await mongoose.connect(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });

//   // Créer un utilisateur admin pour les tests
//   const adminUser = await User.create({
//     email: 'admin@test.com',
//     password: 'admin', // adapter si tu as un hash
//     role: 'admin',
//   });

//   // Génération du token JWT
//   token = jwt.sign(
//     { id: adminUser._id, role: adminUser.role },
//     process.env.JWT_SECRET || 'secret',
//     { expiresIn: '1h' }
//   );
// });

// afterAll(async () => {
//   await mongoose.disconnect();
//   await mongoServer.stop();
// });

// afterEach(async () => {
//   // Nettoyage après chaque test
//   await Equipement.deleteMany({});
//   await User.deleteMany({});
// });

// describe('API Equipements', () => {
//   it('devrait créer un équipement', async () => {
//     const res = await request(app)
//       .post('/api/equipements')
//       .set('Authorization', `Bearer ${token}`)
//       .send({
//         name: 'Ordinateur Test',
//         type: 'Laptop',
//         serialNumber: '123456',
//       });

//     expect(res.statusCode).toBe(201);
//     expect(res.body.name).toBe('Ordinateur Test');
//   });

//   it('devrait lister les équipements', async () => {
//     // Ajouter un équipement pour tester la liste
//     await Equipement.create({
//       name: 'Ordinateur Liste',
//       type: 'Desktop',
//       serialNumber: '654321',
//     });

//     const res = await request(app)
//       .get('/api/equipements')
//       .set('Authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(200);
//     expect(Array.isArray(res.body)).toBe(true);
//     expect(res.body.length).toBeGreaterThan(0);
//   });

//   it('devrait supprimer un équipement', async () => {
//     const equip = await Equipement.create({
//       name: 'Test Delete',
//       type: 'PC',
//       serialNumber: 'DEL123',
//     });

//     const res = await request(app)
//       .delete(`/api/equipements/${equip._id}`)
//       .set('Authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body.message).toMatch(/supprimé/i);
//   });
// });
