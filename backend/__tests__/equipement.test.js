const request = require('supertest');
const { app } = require('../app');

let createdEquipementId;

describe('Equipement API', () => {
  it('devrait récupérer la liste des équipements', async () => {
    const res = await request(app).get('/api/equipements');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('devrait créer un nouvel équipement', async () => {
    const newEquipement = {
      nom: 'PC Test',
      type: 'Ordinateur',
      statut: 'Disponible',
      numeroSerie: '123456',
      dateAchat: '2025-01-01',
      createdBy: '683b72fd4d58c33aa8e465b0' // ID valide admin
    };

    const res = await request(app)
      .post('/api/equipements')
      .send(newEquipement);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    createdEquipementId = res.body._id;
  });

  it('devrait supprimer l’équipement créé', async () => {
    const res = await request(app).delete(`/api/equipements/${createdEquipementId}`);
    expect(res.status).toBe(200);
  });
});
