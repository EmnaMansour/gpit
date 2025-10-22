"use strict";
exports.getStats = (req, res) => {
    res.json({
        utilisateurs: 12,
        equipements: 34,
        incidents: 6,
        maintenances: 3
    });
};
exports.getRecentIncidents = (req, res) => {
    res.json([
        { id: 1, titre: 'Problème réseau', date: '2025-05-01' },
        { id: 2, titre: 'PC bloqué', date: '2025-05-04' }
    ]);
};
