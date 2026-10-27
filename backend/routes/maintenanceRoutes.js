const express = require('express');
const router = express.Router();
const {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
} = require('../controllers/maintenanceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAllMaintenance)
  .post(protect, createMaintenance);

router.route('/:id')
  .get(getMaintenanceById)
  .put(protect, updateMaintenance)
  .delete(protect, deleteMaintenance);

module.exports = router;
