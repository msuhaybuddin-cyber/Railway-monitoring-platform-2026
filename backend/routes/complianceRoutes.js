const express = require('express');
const router = express.Router();
const { getComplianceMetrics } = require('../controllers/complianceController');

router.get('/', getComplianceMetrics);

module.exports = router;
