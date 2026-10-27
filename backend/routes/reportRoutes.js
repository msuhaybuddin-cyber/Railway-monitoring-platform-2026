const express = require('express');
const router = express.Router();
const { getReportsData, downloadReportCSV } = require('../controllers/reportController');

router.get('/', getReportsData);
router.get('/csv', downloadReportCSV);

module.exports = router;
