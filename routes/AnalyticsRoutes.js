const express = require('express');
const AnalyticsController = require('../controllers/AnalyticsController');

const router = express.Router();

// Analytics routes
router.get('/dashboard', AnalyticsController.getDashboard);

module.exports = router;
