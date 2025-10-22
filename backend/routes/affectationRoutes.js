const express = require('express');
const router = express.Router();
const Affectation = require('../models/Affectation');

// Lister toutes les affectations, optionnellement filtrer par équipement ou employé
router.get('/', async (req, res) => {
  const { equipementId, employeId } = req.query;
  const filter = {};
  if (equipementId) filter.equipementId = equipementId;
  if (employeId) filter.employeId = employeId;

  try {
    const affectations = await Affectation.find(filter)
      .populate('employeId', 'name email') // charger infos employé
      .populate('equipementId', 'nom type'); // charger infos équipement
    res.json(affectations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Ajouter une affectation
router.post('/', async (req, res) => {
  const { equipementId, employeId, dateAffectation, dateRetour, etat } = req.body;
  const newAffectation = new Affectation({ equipementId, employeId, dateAffectation, dateRetour, etat });

  try {
    const saved = await newAffectation.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Modifier une affectation
router.put('/:id', async (req, res) => {
  try {
    const updated = await Affectation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Affectation non trouvée' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Supprimer une affectation
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Affectation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Affectation non trouvée' });
    res.json({ message: 'Affectation supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
