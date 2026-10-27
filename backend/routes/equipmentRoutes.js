const express = require('express');
const router = express.Router();
const {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} = require('../controllers/equipmentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAllEquipment)
  .post(protect, createEquipment);

router.route('/:id')
  .get(getEquipmentById)
  .put(protect, updateEquipment)
  .delete(protect, deleteEquipment);

module.exports = router;
