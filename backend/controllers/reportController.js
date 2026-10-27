const Equipment = require('../models/Equipment');
const FaultReport = require('../models/FaultReport');
const Maintenance = require('../models/Maintenance');

// @desc    Get reports data by type and optional date range
// @route   GET /api/reports
// @access  Public / Protected
const getReportsData = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    const dateQuery = {};

    if (startDate || endDate) {
      dateQuery.$gte = startDate ? new Date(startDate) : new Date('2000-01-01');
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateQuery.$lte = end;
      }
    }

    let reportData = [];
    let summary = {};

    if (type === 'equipment' || !type) {
      const q = startDate || endDate ? { createdAt: dateQuery } : {};
      reportData = await Equipment.find(q).sort({ equipmentId: 1 });
      const total = reportData.length;
      const working = reportData.filter((e) => e.status === 'Working').length;
      const faulty = reportData.filter((e) => e.status === 'Faulty').length;
      const underMaint = reportData.filter((e) => e.status === 'Under Maintenance').length;
      summary = {
        totalEquipment: total,
        workingEquipment: working,
        faultyEquipment: faulty,
        underMaintenance: underMaint,
        operationalRate: total > 0 ? `${((working / total) * 100).toFixed(1)}%` : '100%',
      };
    } else if (type === 'faults') {
      const q = startDate || endDate ? { reportedAt: dateQuery } : {};
      reportData = await FaultReport.find(q).sort({ reportedAt: -1 });
      const total = reportData.length;
      const open = reportData.filter((f) => f.status === 'Open').length;
      const inProgress = reportData.filter((f) => f.status === 'In Progress').length;
      const resolved = reportData.filter((f) => f.status === 'Resolved').length;
      const critical = reportData.filter((f) => f.severity === 'Critical').length;
      summary = {
        totalFaults: total,
        openFaults: open,
        inProgressFaults: inProgress,
        resolvedFaults: resolved,
        criticalFaults: critical,
        resolutionRate: total > 0 ? `${((resolved / total) * 100).toFixed(1)}%` : '0%',
      };
    } else if (type === 'maintenance') {
      const q = startDate || endDate ? { scheduledDate: dateQuery } : {};
      reportData = await Maintenance.find(q).sort({ scheduledDate: -1 });
      const total = reportData.length;
      const completed = reportData.filter((m) => m.status === 'Completed').length;
      const overdue = reportData.filter((m) => m.status === 'Overdue').length;
      const scheduled = reportData.filter((m) => m.status === 'Scheduled').length;
      summary = {
        totalMaintenance: total,
        completed,
        overdue,
        scheduled,
        completionRate: total > 0 ? `${((completed / total) * 100).toFixed(1)}%` : '0%',
      };
    } else if (type === 'compliance') {
      const allEquipment = await Equipment.find().sort({ nextMaintenanceDate: 1 });
      const now = new Date();
      let compliant = 0;
      let nonCompliant = 0;
      let pendingInspection = 0;

      const items = allEquipment.map((eq) => {
        const isPast = new Date(eq.nextMaintenanceDate) < now;
        const days = Math.round((new Date(eq.nextMaintenanceDate) - now) / (1000 * 3600 * 24));
        let cStatus = 'Compliant';
        if (isPast || eq.status === 'Faulty') {
          cStatus = 'Non-Compliant';
          nonCompliant++;
        } else if (days <= 15 || eq.status === 'Under Maintenance') {
          cStatus = 'Pending Inspection';
          pendingInspection++;
        } else {
          compliant++;
        }
        return {
          equipmentId: eq.equipmentId,
          name: eq.name,
          station: eq.station,
          type: eq.type,
          status: eq.status,
          nextMaintenanceDate: eq.nextMaintenanceDate,
          complianceStatus: cStatus,
        };
      });

      reportData = items;
      summary = {
        totalEquipment: allEquipment.length,
        compliant,
        nonCompliant,
        pendingInspection,
        compliancePercentage:
          allEquipment.length > 0
            ? `${((compliant / allEquipment.length) * 100).toFixed(1)}%`
            : '100%',
      };
    }

    res.json({
      success: true,
      type: type || 'equipment',
      summary,
      count: reportData.length,
      data: reportData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export report as CSV download
// @route   GET /api/reports/csv
// @access  Public / Protected
const downloadReportCSV = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    const dateQuery = {};

    if (startDate || endDate) {
      dateQuery.$gte = startDate ? new Date(startDate) : new Date('2000-01-01');
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateQuery.$lte = end;
      }
    }

    let csvContent = '';
    let filename = `railway_report_${type || 'equipment'}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (type === 'equipment' || !type) {
      const q = startDate || endDate ? { createdAt: dateQuery } : {};
      const data = await Equipment.find(q).sort({ equipmentId: 1 });
      csvContent = 'Equipment ID,Equipment Name,Equipment Type,Station,Status,Health %,Last Maintenance,Next Maintenance\n';
      data.forEach((e) => {
        csvContent += `"${e.equipmentId}","${e.name}","${e.type}","${e.station}","${e.status}","${e.healthPercentage}%","${new Date(e.lastMaintenanceDate).toLocaleDateString()}","${new Date(e.nextMaintenanceDate).toLocaleDateString()}"\n`;
      });
    } else if (type === 'faults') {
      const q = startDate || endDate ? { reportedAt: dateQuery } : {};
      const data = await FaultReport.find(q).sort({ reportedAt: -1 });
      csvContent = 'Fault ID,Equipment ID,Equipment Name,Station,Severity,Status,Reported By,Reported Date,Description\n';
      data.forEach((f) => {
        csvContent += `"${f.faultId}","${f.equipmentId}","${f.equipmentName}","${f.station}","${f.severity}","${f.status}","${f.reportedBy}","${new Date(f.reportedAt).toLocaleDateString()}","${(f.description || '').replace(/"/g, '""')}"\n`;
      });
    } else if (type === 'maintenance') {
      const q = startDate || endDate ? { scheduledDate: dateQuery } : {};
      const data = await Maintenance.find(q).sort({ scheduledDate: -1 });
      csvContent = 'Maintenance ID,Equipment ID,Equipment Name,Type,Technician,Scheduled Date,Status,Description\n';
      data.forEach((m) => {
        csvContent += `"${m.maintenanceId}","${m.equipmentId}","${m.equipmentName}","${m.maintenanceType}","${m.technicianName}","${new Date(m.scheduledDate).toLocaleDateString()}","${m.status}","${(m.description || '').replace(/"/g, '""')}"\n`;
      });
    } else if (type === 'compliance') {
      const data = await Equipment.find().sort({ nextMaintenanceDate: 1 });
      const now = new Date();
      csvContent = 'Equipment ID,Equipment Name,Equipment Type,Station,Status,Next Maintenance Date,Compliance Status\n';
      data.forEach((e) => {
        const isPast = new Date(e.nextMaintenanceDate) < now;
        let cStatus = 'Compliant';
        if (isPast || e.status === 'Faulty') cStatus = 'Non-Compliant';
        else if (e.status === 'Under Maintenance') cStatus = 'Pending Inspection';
        csvContent += `"${e.equipmentId}","${e.name}","${e.type}","${e.station}","${e.status}","${new Date(e.nextMaintenanceDate).toLocaleDateString()}","${cStatus}"\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getReportsData,
  downloadReportCSV,
};
