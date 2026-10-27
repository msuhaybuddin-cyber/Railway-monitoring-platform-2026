const Equipment = require('../models/Equipment');
const Maintenance = require('../models/Maintenance');

// @desc    Get compliance metrics and breakdown
// @route   GET /api/compliance
// @access  Public / Protected
const getComplianceMetrics = async (req, res) => {
  try {
    const totalEquipment = await Equipment.countDocuments();
    const now = new Date();

    // Equipment with overdue maintenance (either nextMaintenanceDate has passed OR there's an overdue maintenance record)
    const overdueMaintenanceDocs = await Maintenance.find({
      status: 'Overdue',
    }).select('equipmentId');
    const overdueIds = new Set(overdueMaintenanceDocs.map((m) => m.equipmentId));

    const allEquipment = await Equipment.find().sort({ nextMaintenanceDate: 1 });

    let validMaintenanceCount = 0;
    let overdueMaintenanceCount = 0;
    let pendingInspectionCount = 0;

    const categorizedEquipment = allEquipment.map((item) => {
      const isDateOverdue = new Date(item.nextMaintenanceDate) < now;
      const hasOverdueRecord = overdueIds.has(item.equipmentId);
      const daysUntilDue = Math.round((new Date(item.nextMaintenanceDate) - now) / (1000 * 60 * 60 * 24));

      let complianceItemStatus = 'Compliant';
      if (isDateOverdue || hasOverdueRecord || item.status === 'Faulty') {
        complianceItemStatus = 'Non-Compliant';
        overdueMaintenanceCount++;
      } else if (daysUntilDue <= 15 || item.status === 'Under Maintenance') {
        complianceItemStatus = 'Pending Inspection';
        pendingInspectionCount++;
      } else {
        complianceItemStatus = 'Compliant';
        validMaintenanceCount++;
      }

      return {
        _id: item._id,
        equipmentId: item.equipmentId,
        name: item.name,
        type: item.type,
        station: item.station,
        status: item.status,
        healthPercentage: item.healthPercentage,
        lastMaintenanceDate: item.lastMaintenanceDate,
        nextMaintenanceDate: item.nextMaintenanceDate,
        daysUntilDue,
        complianceItemStatus,
      };
    });

    const compliancePercentage =
      totalEquipment > 0
        ? Number(((validMaintenanceCount / totalEquipment) * 100).toFixed(1))
        : 100;

    let overallComplianceStatus = 'Compliant';
    if (compliancePercentage < 70) {
      overallComplianceStatus = 'Non-Compliant';
    } else if (compliancePercentage < 85) {
      overallComplianceStatus = 'Pending Inspection';
    }

    // Breakdown by equipment type
    const typeMap = {};
    allEquipment.forEach((eq) => {
      if (!typeMap[eq.type]) {
        typeMap[eq.type] = { type: eq.type, total: 0, compliant: 0, faulty: 0 };
      }
      typeMap[eq.type].total++;
      if (eq.status === 'Working' && new Date(eq.nextMaintenanceDate) >= now) {
        typeMap[eq.type].compliant++;
      }
      if (eq.status === 'Faulty') {
        typeMap[eq.type].faulty++;
      }
    });

    const typeBreakdown = Object.values(typeMap).map((t) => ({
      ...t,
      percentage: Number(((t.compliant / t.total) * 100).toFixed(1)),
    }));

    // Breakdown by station
    const stationMap = {};
    allEquipment.forEach((eq) => {
      if (!stationMap[eq.station]) {
        stationMap[eq.station] = { station: eq.station, total: 0, compliant: 0 };
      }
      stationMap[eq.station].total++;
      if (eq.status === 'Working' && new Date(eq.nextMaintenanceDate) >= now) {
        stationMap[eq.station].compliant++;
      }
    });

    const stationBreakdown = Object.values(stationMap).map((s) => ({
      ...s,
      percentage: Number(((s.compliant / s.total) * 100).toFixed(1)),
    }));

    res.json({
      success: true,
      data: {
        totalEquipment,
        validMaintenanceEquipment: validMaintenanceCount,
        overdueMaintenanceEquipment: overdueMaintenanceCount,
        pendingInspectionEquipment: pendingInspectionCount,
        compliancePercentage,
        complianceStatus: overallComplianceStatus,
        typeBreakdown,
        stationBreakdown,
        equipmentList: categorizedEquipment,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getComplianceMetrics,
};
