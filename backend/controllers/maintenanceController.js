const Maintenance = require('../models/Maintenance');
const Equipment = require('../models/Equipment');
const Notification = require('../models/Notification');

// Helper to generate sequential Maintenance ID
const generateMaintenanceId = async () => {
  const count = await Maintenance.countDocuments();
  const year = new Date().getFullYear();
  return `MNT-${year}-${String(count + 1).padStart(4, '0')}`;
};

// @desc    Get all maintenance records with dynamic overdue recalculation
// @route   GET /api/maintenance
// @access  Public / Protected
const getAllMaintenance = async (req, res) => {
  try {
    const { status, type, technician, search } = req.query;

    // Recalculate any records that are past scheduledDate and not completed to Overdue
    const now = new Date();
    await Maintenance.updateMany(
      {
        status: { $in: ['Scheduled', 'In Progress'] },
        scheduledDate: { $lt: now },
      },
      { status: 'Overdue' }
    );

    let query = {};
    if (status && status !== 'All') {
      query.status = status;
    }
    if (type && type !== 'All') {
      query.maintenanceType = type;
    }
    if (technician && technician !== 'All') {
      query.technicianName = technician;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { maintenanceId: searchRegex },
        { equipmentId: searchRegex },
        { equipmentName: searchRegex },
        { technicianName: searchRegex },
        { station: searchRegex },
        { description: searchRegex },
      ];
    }

    const records = await Maintenance.find(query).sort({ scheduledDate: -1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get maintenance record by ID
// @route   GET /api/maintenance/:id
// @access  Public / Protected
const getMaintenanceById = async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Schedule / Add maintenance
// @route   POST /api/maintenance
// @access  Protected
const createMaintenance = async (req, res) => {
  try {
    const {
      equipmentId,
      equipmentName,
      station,
      maintenanceType,
      scheduledDate,
      technicianName,
      description,
      status,
      remarks,
    } = req.body;

    if (!equipmentId || !maintenanceType || !scheduledDate || !technicianName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide equipment, maintenance type, date and technician name',
      });
    }

    const equipment = await Equipment.findOne({ equipmentId: equipmentId.toUpperCase() });
    const finalEquipName = equipmentName || (equipment ? equipment.name : equipmentId);
    const finalStation = station || (equipment ? equipment.station : 'Unassigned');

    const maintenanceId = await generateMaintenanceId();

    const scheduledDateObj = new Date(scheduledDate);
    const isPast = scheduledDateObj < new Date();
    const finalStatus = status || (isPast ? 'Overdue' : 'Scheduled');

    const newRecord = await Maintenance.create({
      maintenanceId,
      equipment: equipment ? equipment._id : null,
      equipmentId: equipmentId.toUpperCase(),
      equipmentName: finalEquipName,
      station: finalStation,
      maintenanceType,
      scheduledDate: scheduledDateObj,
      technicianName,
      description: description || `${maintenanceType} scheduled for ${finalEquipName}`,
      status: finalStatus,
      remarks: remarks || '',
    });

    // If scheduled for today/ongoing, optionally set equipment to Under Maintenance
    if (equipment && (finalStatus === 'In Progress' || (finalStatus === 'Scheduled' && Math.abs(scheduledDateObj - new Date()) < 24 * 3600 * 1000))) {
      if (equipment.status !== 'Faulty') {
        equipment.status = 'Under Maintenance';
        await equipment.save();
      }
    }

    // Create notification if overdue or scheduled
    if (finalStatus === 'Overdue') {
      await Notification.create({
        title: `Maintenance Overdue: ${maintenanceId}`,
        message: `${maintenanceType} for ${finalEquipName} (${equipmentId.toUpperCase()}) was due on ${scheduledDateObj.toLocaleDateString()}.`,
        type: 'maintenance_overdue',
        severity: 'critical',
        referenceId: maintenanceId,
      });
    } else {
      await Notification.create({
        title: `Maintenance Scheduled: ${maintenanceId}`,
        message: `${maintenanceType} scheduled for ${finalEquipName} on ${scheduledDateObj.toLocaleDateString()} assigned to ${technicianName}.`,
        type: 'maintenance_due',
        severity: 'info',
        referenceId: maintenanceId,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Maintenance scheduled successfully',
      data: newRecord,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update maintenance record / Mark Completed
// @route   PUT /api/maintenance/:id
// @access  Protected
const updateMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    const { status, remarks, completedDate, technicianName, description, scheduledDate } = req.body;

    if (scheduledDate) record.scheduledDate = new Date(scheduledDate);
    if (technicianName) record.technicianName = technicianName;
    if (description) record.description = description;
    if (remarks !== undefined) record.remarks = remarks;

    if (status) {
      record.status = status;
      if (status === 'Completed') {
        record.completedDate = completedDate ? new Date(completedDate) : new Date();

        // Update equipment records
        const eq = await Equipment.findOne({ equipmentId: record.equipmentId });
        if (eq) {
          eq.lastMaintenanceDate = record.completedDate;
          // Push next maintenance date 90 days into the future
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + 90);
          eq.nextMaintenanceDate = nextDate;
          eq.healthPercentage = 98;
          if (eq.status === 'Under Maintenance' || eq.status === 'Faulty') {
            eq.status = 'Working';
          }
          await eq.save();
        }
      }
    }

    // Check overdue if not completed
    if (record.status !== 'Completed' && record.scheduledDate < new Date()) {
      record.status = 'Overdue';
    }

    await record.save();

    res.json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete maintenance record
// @route   DELETE /api/maintenance/:id
// @access  Protected
const deleteMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    await record.deleteOne();
    res.json({
      success: true,
      message: 'Maintenance record deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
};
