import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Cpu,
  AlertTriangle,
  Wrench,
  ShieldCheck,
} from 'lucide-react';
import { reportService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';

const REPORT_TABS = [
  { id: 'equipment', label: 'Equipment Summary', icon: Cpu },
  { id: 'faults', label: 'Fault Incidents Summary', icon: AlertTriangle },
  { id: 'maintenance', label: 'Maintenance Execution Report', icon: Wrench },
  { id: 'compliance', label: 'Regulatory Compliance Audit', icon: ShieldCheck },
];

const Reports = () => {
  const [activeTab, setActiveTab] = useState('equipment');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportResult, setReportResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = { type: activeTab };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await reportService.getData(params);
      setReportResult(res.data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    setTimeout(fetchReport, 50);
  };

  // Trigger CSV Download via backend download route or browser trigger
  const handleDownloadCSV = () => {
    const params = { type: activeTab };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const url = reportService.getDownloadUrl(params);
    window.open(url, '_blank');
  };

  const { summary = {}, data = [] } = reportResult || {};

  return (
    <div className="space-y-6">
      {/* Header and Download Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl flex items-center gap-2.5">
            <FileText className="h-7 w-7 text-blue-500" />
            Audit Reports & Data Export
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Generate and export signaling equipment summaries, failure analyses, work orders & compliance reports.
          </p>
        </div>

        <button
          onClick={handleDownloadCSV}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition"
        >
          <Download className="h-4 w-4" />
          Export CSV Report
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {REPORT_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Date Filters Bar */}
      <form
        onSubmit={handleApplyFilter}
        className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg flex flex-wrap items-center gap-4"
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-300">Date Range:</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">From:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 py-1.5 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">To:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 py-1.5 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition"
          >
            Apply Filter
          </button>
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={handleResetFilter}
              className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {/* Summary KPI Cards Row for Current Report */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {activeTab === 'equipment' && (
          <>
            <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Assets</span>
              <p className="mt-1 text-2xl font-black text-white">{summary.totalEquipment || 0}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Working</span>
              <p className="mt-1 text-2xl font-black text-emerald-400">{summary.workingEquipment || 0}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Faulty</span>
              <p className="mt-1 text-2xl font-black text-red-400">{summary.faultyEquipment || 0}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Operational Rate</span>
              <p className="mt-1 text-2xl font-black text-blue-400">{summary.operationalRate || '100%'}</p>
            </div>
          </>
        )}

        {activeTab === 'faults' && (
          <>
            <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Faults</span>
              <p className="mt-1 text-2xl font-black text-white">{summary.totalFaults || 0}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Open / In Progress</span>
              <p className="mt-1 text-2xl font-black text-amber-400">
                {(summary.openFaults || 0) + (summary.inProgressFaults || 0)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Resolved</span>
              <p className="mt-1 text-2xl font-black text-emerald-400">{summary.resolvedFaults || 0}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Resolution Rate</span>
              <p className="mt-1 text-2xl font-black text-blue-400">{summary.resolutionRate || '0%'}</p>
            </div>
          </>
        )}

        {activeTab === 'maintenance' && (
          <>
            <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Orders</span>
              <p className="mt-1 text-2xl font-black text-white">{summary.totalMaintenance || 0}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Completed</span>
              <p className="mt-1 text-2xl font-black text-emerald-400">{summary.completed || 0}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Overdue</span>
              <p className="mt-1 text-2xl font-black text-red-400">{summary.overdue || 0}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Completion Rate</span>
              <p className="mt-1 text-2xl font-black text-blue-400">{summary.completionRate || '0%'}</p>
            </div>
          </>
        )}

        {activeTab === 'compliance' && (
          <>
            <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Audited</span>
              <p className="mt-1 text-2xl font-black text-white">{summary.totalEquipment || 0}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Compliant</span>
              <p className="mt-1 text-2xl font-black text-emerald-400">{summary.compliant || 0}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Non-Compliant</span>
              <p className="mt-1 text-2xl font-black text-red-400">{summary.nonCompliant || 0}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Fleet Compliance %</span>
              <p className="mt-1 text-2xl font-black text-emerald-400">{summary.compliancePercentage || '100%'}</p>
            </div>
          </>
        )}
      </div>

      {/* Report Records Table Preview */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
        <div className="border-b border-slate-800 p-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            {REPORT_TABS.find((t) => t.id === activeTab)?.label} Data Records ({data.length})
          </h2>
          <span className="text-xs text-slate-400">Ready for CSV export</span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950 uppercase tracking-wider text-[11px] text-slate-400 font-bold">
              {activeTab === 'equipment' && (
                <tr>
                  <th className="py-3 px-4">Equipment ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Station</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Health %</th>
                  <th className="py-3 px-4">Next Maint.</th>
                </tr>
              )}
              {activeTab === 'faults' && (
                <tr>
                  <th className="py-3 px-4">Fault ID</th>
                  <th className="py-3 px-4">Equipment</th>
                  <th className="py-3 px-4">Station</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Reported By</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              )}
              {activeTab === 'maintenance' && (
                <tr>
                  <th className="py-3 px-4">Maintenance ID</th>
                  <th className="py-3 px-4">Equipment</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4">Scheduled Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              )}
              {activeTab === 'compliance' && (
                <tr>
                  <th className="py-3 px-4">Equipment ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Station</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Next Inspection</th>
                  <th className="py-3 px-4">Compliance Status</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
                    Preparing report export dataset...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No data records found for selected period.
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-slate-800/40">
                    {activeTab === 'equipment' && (
                      <>
                        <td className="py-2.5 px-4 font-mono font-bold text-white">{item.equipmentId}</td>
                        <td className="py-2.5 px-4 text-slate-200">{item.name}</td>
                        <td className="py-2.5 px-4 text-slate-400">{item.type}</td>
                        <td className="py-2.5 px-4 text-slate-300">{item.station}</td>
                        <td className="py-2.5 px-4"><StatusBadge status={item.status} /></td>
                        <td className="py-2.5 px-4 font-mono">{item.healthPercentage}%</td>
                        <td className="py-2.5 px-4">{new Date(item.nextMaintenanceDate).toLocaleDateString()}</td>
                      </>
                    )}
                    {activeTab === 'faults' && (
                      <>
                        <td className="py-2.5 px-4 font-mono font-bold text-white">{item.faultId}</td>
                        <td className="py-2.5 px-4 text-slate-200">{item.equipmentName} ({item.equipmentId})</td>
                        <td className="py-2.5 px-4 text-slate-300">{item.station}</td>
                        <td className="py-2.5 px-4"><SeverityBadge severity={item.severity} /></td>
                        <td className="py-2.5 px-4">{item.reportedBy}</td>
                        <td className="py-2.5 px-4">{new Date(item.reportedAt).toLocaleDateString()}</td>
                        <td className="py-2.5 px-4"><StatusBadge status={item.status} /></td>
                      </>
                    )}
                    {activeTab === 'maintenance' && (
                      <>
                        <td className="py-2.5 px-4 font-mono font-bold text-white">{item.maintenanceId}</td>
                        <td className="py-2.5 px-4 text-slate-200">{item.equipmentName} ({item.equipmentId})</td>
                        <td className="py-2.5 px-4 text-slate-300">{item.maintenanceType}</td>
                        <td className="py-2.5 px-4">{item.technicianName}</td>
                        <td className="py-2.5 px-4">{new Date(item.scheduledDate).toLocaleDateString()}</td>
                        <td className="py-2.5 px-4"><StatusBadge status={item.status} /></td>
                      </>
                    )}
                    {activeTab === 'compliance' && (
                      <>
                        <td className="py-2.5 px-4 font-mono font-bold text-white">{item.equipmentId}</td>
                        <td className="py-2.5 px-4 text-slate-200">{item.name}</td>
                        <td className="py-2.5 px-4 text-slate-300">{item.station}</td>
                        <td className="py-2.5 px-4 text-slate-400">{item.type}</td>
                        <td className="py-2.5 px-4">{new Date(item.nextMaintenanceDate).toLocaleDateString()}</td>
                        <td className="py-2.5 px-4"><StatusBadge status={item.complianceStatus} /></td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
