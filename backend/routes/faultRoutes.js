const express = require('express');
const router = express.Router();
const {
  getAllFaults,
  getFaultById,
  createFaultReport,
  updateFaultReport,
  deleteFaultReport,
} = require('../controllers/faultController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAllFaults)
  .post(protect, createFaultReport);

router.route('/:id')
  .get(getFaultById)
  .put(protect, updateFaultReport)
  .delete(protect, deleteFaultReport);

module.exports = router;
