const FaultReport = require('../models/FaultReport');
const Equipment = require('../models/Equipment');
const Notification = require('../models/Notification');

// Helper to generate sequential Fault ID
const generateFaultId = async () => {
  const count = await FaultReport.countDocuments();
  const year = new Date().getFullYear();
  return `FLT-${year}-${String(count + 1).padStart(4, '0')}`;
};

// @desc    Get all fault reports with filters and search
// @route   GET /api/faults
// @access  Public / Protected
const getAllFaults = async (req, res) => {
  try {
    const { status, severity, station, search } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (severity && severity !== 'All') {
      query.severity = severity;
    }

    if (station && station !== 'All') {
      query.station = station;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { faultId: searchRegex },
        { equipmentId: searchRegex },
        { equipmentName: searchRegex },
        { station: searchRegex },
        { reportedBy: searchRegex },
        { description: searchRegex },
      ];
    }

    const faults = await FaultReport.find(query).sort({ reportedAt: -1 });
    res.json({ success: true, count: faults.length, data: faults });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get fault report by ID
// @route   GET /api/faults/:id
// @access  Public / Protected
const getFaultById = async (req, res) => {
  try {
    const fault = await FaultReport.findById(req.params.id);
    if (!fault) {
      return res.status(404).json({ success: false, message: 'Fault report not found' });
    }
    res.json({ success: true, data: fault });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new fault report
// @route   POST /api/faults
// @access  Protected
const createFaultReport = async (req, res) => {
  try {
    const {
      equipmentId,
      equipmentName,
      station,
      description,
      severity,
      reportedBy,
      reportedAt,
    } = req.body;

    if (!equipmentId || !description || !reportedBy) {
      return res.status(400).json({
        success: false,
        message: 'Please provide equipment ID, description and reporter name',
      });
    }

    // Lookup equipment details if not fully provided
    const equipment = await Equipment.findOne({ equipmentId: equipmentId.toUpperCase() });
    const finalEquipName = equipmentName || (equipment ? equipment.name : equipmentId);
    const finalStation = station || (equipment ? equipment.station : 'Unassigned');

    const faultId = await generateFaultId();

    const newFault = await FaultReport.create({
      faultId,
      equipment: equipment ? equipment._id : null,
      equipmentId: equipmentId.toUpperCase(),
      equipmentName: finalEquipName,
      station: finalStation,
      description,
      severity: severity || 'Medium',
      reportedBy,
      reportedAt: reportedAt || new Date(),
      status: 'Open',
    });

    // Automatically update the corresponding equipment status to Faulty
    if (equipment) {
      equipment.status = 'Faulty';
      equipment.healthPercentage = Math.min(equipment.healthPercentage, severity === 'Critical' ? 15 : 30);
      await equipment.save();
    } else {
      await Equipment.findOneAndUpdate(
        { equipmentId: equipmentId.toUpperCase() },
        { status: 'Faulty', healthPercentage: 30 }
      );
    }

    // Automatically create a notification
    await Notification.create({
      title: `New Fault Reported: ${faultId}`,
      message: `${severity} severity fault on ${finalEquipName} (${equipmentId.toUpperCase()}) at ${finalStation}: "${description}"`,
      type: 'fault_reported',
      severity: severity.toLowerCase() === 'critical' ? 'critical' : severity.toLowerCase() === 'high' ? 'high' : 'medium',
      referenceId: faultId,
    });

    res.status(201).json({
      success: true,
      message: 'Fault report submitted successfully. Equipment status set to Faulty.',
      data: newFault,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update fault report status and resolution
// @route   PUT /api/faults/:id
// @access  Protected
const updateFaultReport = async (req, res) => {
  try {
    const fault = await FaultReport.findById(req.params.id);
    if (!fault) {
      return res.status(404).json({ success: false, message: 'Fault report not found' });
    }

    const { status, resolutionNotes, equipmentStatusToSet } = req.body;

    if (status) fault.status = status;
    if (resolutionNotes !== undefined) fault.resolutionNotes = resolutionNotes;

    if (status === 'Resolved' && !fault.resolvedAt) {
      fault.resolvedAt = new Date();

      // If user resolved the fault and specified equipment status to restore
      const targetEquipmentStatus = equipmentStatusToSet || 'Working';
      const eq = await Equipment.findOne({ equipmentId: fault.equipmentId });
      if (eq) {
        eq.status = targetEquipmentStatus;
        if (targetEquipmentStatus === 'Working') {
          eq.healthPercentage = 95;
          eq.lastMaintenanceDate = new Date();
        }
        await eq.save();
      }

      // Generate resolved notification
      await Notification.create({
        title: `Fault Resolved: ${fault.faultId}`,
        message: `Fault on equipment ${fault.equipmentName} (${fault.equipmentId}) at ${fault.station} has been marked as Resolved. Equipment restored to ${targetEquipmentStatus}.`,
        type: 'fault_resolved',
        severity: 'success',
        referenceId: fault.faultId,
      });
    }

    await fault.save();

    res.json({
      success: true,
      message: 'Fault report updated successfully',
      data: fault,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete fault report
// @route   DELETE /api/faults/:id
// @access  Protected
const deleteFaultReport = async (req, res) => {
  try {
    const fault = await FaultReport.findById(req.params.id);
    if (!fault) {
      return res.status(404).json({ success: false, message: 'Fault report not found' });
    }

    await fault.deleteOne();
    res.json({
      success: true,
      message: 'Fault report deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllFaults,
  getFaultById,
  createFaultReport,
  updateFaultReport,
  deleteFaultReport,
};
