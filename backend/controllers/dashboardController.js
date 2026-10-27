const Equipment = require('../models/Equipment');
const FaultReport = require('../models/FaultReport');
const Maintenance = require('../models/Maintenance');

// @desc    Get all dashboard summary metrics & chart datasets
// @route   GET /api/dashboard
// @access  Public / Protected
const getDashboardData = async (req, res) => {
  try {
    const now = new Date();

    // Dynamically flag overdue maintenance before aggregating
    await Maintenance.updateMany(
      {
        status: { $in: ['Scheduled', 'In Progress'] },
        scheduledDate: { $lt: now },
      },
      { status: 'Overdue' }
    );

    // 1. Core Counts
    const totalEquipment = await Equipment.countDocuments();
    const workingEquipment = await Equipment.countDocuments({ status: 'Working' });
    const faultyEquipment = await Equipment.countDocuments({ status: 'Faulty' });
    const underMaintenanceEquipment = await Equipment.countDocuments({ status: 'Under Maintenance' });

    // Pending maintenance includes Scheduled + In Progress + Overdue
    const pendingMaintenance = await Maintenance.countDocuments({
      status: { $in: ['Scheduled', 'In Progress', 'Overdue'] },
    });

    // Open fault reports include Open + In Progress
    const openFaultReports = await FaultReport.countDocuments({
      status: { $in: ['Open', 'In Progress'] },
    });

    // Valid maintenance calculation for Compliance %
    const validMaintenanceEquipment = await Equipment.countDocuments({
      status: 'Working',
      nextMaintenanceDate: { $gte: now },
    });

    const compliancePercentage =
      totalEquipment > 0
        ? Number(((validMaintenanceEquipment / totalEquipment) * 100).toFixed(1))
        : 100;

    // 2. Chart 1: Equipment Status (Pie Chart)
    const equipmentStatusChart = [
      { name: 'Working', value: workingEquipment, color: '#10B981' }, // emerald green
      { name: 'Faulty', value: faultyEquipment, color: '#EF4444' }, // red
      { name: 'Under Maintenance', value: underMaintenanceEquipment, color: '#F59E0B' }, // amber/orange
    ];

    // 3. Chart 2: Fault Severity (Bar Chart)
    const severityLow = await FaultReport.countDocuments({ severity: 'Low' });
    const severityMedium = await FaultReport.countDocuments({ severity: 'Medium' });
    const severityHigh = await FaultReport.countDocuments({ severity: 'High' });
    const severityCritical = await FaultReport.countDocuments({ severity: 'Critical' });

    const faultSeverityChart = [
      { severity: 'Low', count: severityLow, fill: '#3B82F6' },
      { severity: 'Medium', count: severityMedium, fill: '#EAB308' },
      { severity: 'High', count: severityHigh, fill: '#F97316' },
      { severity: 'Critical', count: severityCritical, fill: '#DC2626' },
    ];

    // 4. Chart 3: Maintenance Status (Doughnut Chart)
    const mScheduled = await Maintenance.countDocuments({ status: 'Scheduled' });
    const mInProgress = await Maintenance.countDocuments({ status: 'In Progress' });
    const mCompleted = await Maintenance.countDocuments({ status: 'Completed' });
    const mOverdue = await Maintenance.countDocuments({ status: 'Overdue' });

    const maintenanceStatusChart = [
      { name: 'Completed', value: mCompleted, color: '#10B981' },
      { name: 'Scheduled', value: mScheduled, color: '#3B82F6' },
      { name: 'In Progress', value: mInProgress, color: '#F59E0B' },
      { name: 'Overdue', value: mOverdue, color: '#EF4444' },
    ];

    // 5. Chart 4: Monthly Fault Reports (Line Chart for past 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = now.getMonth();
    const monthlyFaultsChart = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), currentMonthIndex - i, 1);
      const nextD = new Date(now.getFullYear(), currentMonthIndex - i + 1, 1);
      const monthName = months[d.getMonth()];

      const count = await FaultReport.countDocuments({
        reportedAt: { $gte: d, $lt: nextD },
      });

      const resolvedCount = await FaultReport.countDocuments({
        resolvedAt: { $gte: d, $lt: nextD },
      });

      monthlyFaultsChart.push({
        month: monthName,
        faults: count,
        resolved: resolvedCount,
      });
    }

    // 6. Recent activities for quick overview
    const recentFaults = await FaultReport.find()
      .sort({ reportedAt: -1 })
      .limit(5);

    const upcomingMaintenance = await Maintenance.find({
      status: { $in: ['Scheduled', 'In Progress'] },
    })
      .sort({ scheduledDate: 1 })
      .limit(5);

    res.json({
      success: true,
      statistics: {
        totalEquipment,
        workingEquipment,
        faultyEquipment,
        underMaintenanceEquipment,
        pendingMaintenance,
        openFaultReports,
        compliancePercentage,
      },
      charts: {
        equipmentStatus: equipmentStatusChart,
        faultSeverity: faultSeverityChart,
        maintenanceStatus: maintenanceStatusChart,
        monthlyFaults: monthlyFaultsChart,
      },
      recent: {
        recentFaults,
        upcomingMaintenance,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardData,
};
