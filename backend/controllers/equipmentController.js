const Equipment = require('../models/Equipment');
const FaultReport = require('../models/FaultReport');
const Maintenance = require('../models/Maintenance');

// @desc    Get all equipment with optional search & filter
// @route   GET /api/equipment
// @access  Public / Protected
const getAllEquipment = async (req, res) => {
  try {
    const { search, status, type, station } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    if (station && station !== 'All') {
      query.station = station;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { equipmentId: searchRegex },
        { name: searchRegex },
        { station: searchRegex },
        { type: searchRegex },
      ];
    }

    const equipment = await Equipment.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: equipment.length, data: equipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single equipment by ID
// @route   GET /api/equipment/:id
// @access  Public / Protected
const getEquipmentById = async (req, res) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    // Fetch related faults and maintenance history
    const faults = await FaultReport.find({ equipmentId: item.equipmentId }).sort({ reportedAt: -1 });
    const maintenance = await Maintenance.find({ equipmentId: item.equipmentId }).sort({ scheduledDate: -1 });

    res.json({
      success: true,
      data: item,
      history: {
        faults,
        maintenance,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new equipment
// @route   POST /api/equipment
// @access  Protected
const createEquipment = async (req, res) => {
  try {
    const {
      equipmentId,
      name,
      type,
      station,
      installationDate,
      lastMaintenanceDate,
      nextMaintenanceDate,
      status,
      healthPercentage,
      description,
    } = req.body;

    if (!equipmentId || !name || !type || !station || !nextMaintenanceDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required equipment fields',
      });
    }

    // Check if ID already exists
    const existing = await Equipment.findOne({ equipmentId: equipmentId.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Equipment with ID ${equipmentId} already exists`,
      });
    }

    // Default health calculation if omitted
    let computedHealth = healthPercentage;
    if (computedHealth === undefined || computedHealth === null || computedHealth === '') {
      if (status === 'Working') computedHealth = 95;
      else if (status === 'Under Maintenance') computedHealth = 60;
      else computedHealth = 25;
    }

    const newEquipment = await Equipment.create({
      equipmentId: equipmentId.toUpperCase(),
      name,
      type,
      station,
      installationDate: installationDate || new Date(),
      lastMaintenanceDate: lastMaintenanceDate || new Date(),
      nextMaintenanceDate: nextMaintenanceDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: status || 'Working',
      healthPercentage: Number(computedHealth),
      description: description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Equipment registered successfully',
      data: newEquipment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Protected
const updateEquipment = async (req, res) => {
  try {
    let item = await Equipment.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    // Adjust health percentage dynamically if status changed and health not explicitly specified
    if (req.body.status && req.body.healthPercentage === undefined) {
      if (req.body.status === 'Working' && item.healthPercentage < 70) {
        req.body.healthPercentage = 95;
      } else if (req.body.status === 'Faulty' && item.healthPercentage > 40) {
        req.body.healthPercentage = 25;
      } else if (req.body.status === 'Under Maintenance') {
        req.body.healthPercentage = 60;
      }
    }

    item = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: item,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete equipment
// @route   DELETE /api/equipment/:id
// @access  Protected
const deleteEquipment = async (req, res) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    await item.deleteOne();

    res.json({
      success: true,
      message: 'Equipment deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};
