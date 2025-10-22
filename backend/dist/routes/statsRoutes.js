"use strict";
const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');
router.get('/', authMiddleware, getDashboardStats);
module.exports = router;
