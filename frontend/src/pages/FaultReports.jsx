import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Trash2,
  Edit3,
  Calendar,
  User,
  MapPin,
  Clock,
  Cpu,
} from 'lucide-react';
import { faultService, equipmentService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import Modal from '../components/Modal';

const SEVERITIES = ['All', 'Low', 'Medium', 'High', 'Critical'];
const FAULT_STATUSES = ['All', 'Open', 'In Progress', 'Resolved'];

const FaultReports = () => {
  const [faults, setFaults] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedFault, setSelectedFault] = useState(null);

  // Form State for Submit
  const initialForm = {
    equipmentId: '',
    equipmentName: '',
    station: '',
    description: '',
    severity: 'Medium',
    reportedBy: 'Signal Operator',
    reportedAt: new Date().toISOString().slice(0, 16),
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State for Status Update / Resolve
  const [updateStatusData, setUpdateStatusData] = useState({
    status: 'In Progress',
    resolutionNotes: '',
    equipmentStatusToSet: 'Working',
  });

  const fetchFaults = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (severityFilter !== 'All') params.severity = severityFilter;

      const res = await faultService.getAll(params);
      setFaults(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch faults:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipmentOptions = async () => {
    try {
      const res = await equipmentService.getAll({});
      setEquipmentList(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFaults();
    fetchEquipmentOptions();
  }, [statusFilter, severityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFaults();
  };

  // When equipment is selected from dropdown, autofill name & station
  const handleEquipmentSelect = (equipId) => {
    const selected = equipmentList.find((e) => e.equipmentId === equipId);
    setFormData({
      ...formData,
      equipmentId: equipId,
      equipmentName: selected ? selected.name : '',
      station: selected ? selected.station : '',
    });
  };

  // Open Submit Fault Modal
  const handleOpenAdd = () => {
    setFormData(initialForm);
    if (equipmentList.length > 0) {
      setFormData({
        ...initialForm,
        equipmentId: equipmentList[0].equipmentId,
        equipmentName: equipmentList[0].name,
        station: equipmentList[0].station,
      });
    }
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Submit New Fault Report
  const handleSubmitFault = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await faultService.create(formData);
      setIsAddModalOpen(false);
      fetchFaults();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to submit fault report');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Update / Resolve Modal
  const handleOpenUpdate = (fault) => {
    setSelectedFault(fault);
    setUpdateStatusData({
      status: fault.status === 'Open' ? 'In Progress' : 'Resolved',
      resolutionNotes: fault.resolutionNotes || '',
      equipmentStatusToSet: 'Working',
    });
    setFormError('');
    setIsUpdateModalOpen(true);
  };

  // Save Status Update
  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await faultService.update(selectedFault._id, updateStatusData);
      setIsUpdateModalOpen(false);
      fetchFaults();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to update fault status');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Fault Report
  const handleDeleteFault = async (id, faultId) => {
    if (window.confirm(`Delete fault ticket "${faultId}"?`)) {
      try {
        await faultService.delete(id);
        fetchFaults();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete fault report');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl flex items-center gap-2.5">
            <AlertTriangle className="h-7 w-7 text-red-500" />
            Signaling Fault Incident Desk
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Log telemetry anomalies, track circuit drops, lamp failures, and monitor repair workflows.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-500 transition"
        >
          <Plus className="h-4 w-4" />
          Log New Fault
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Fault ID, Equipment, Station, Reporter..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </form>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              {FAULT_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              {SEVERITIES.map((sv) => (
                <option key={sv} value={sv}>
                  {sv}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Faults Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/60 uppercase tracking-wider text-[11px] text-slate-400 font-bold">
              <tr>
                <th className="py-3.5 px-4">Fault ID</th>
                <th className="py-3.5 px-4">Equipment & Location</th>
                <th className="py-3.5 px-4">Fault Description</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Reported By & Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-500 border-t-transparent mx-auto mb-2"></div>
                    Loading fault telemetry records...
                  </td>
                </tr>
              ) : faults.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No fault incidents matching search or filter criteria.
                  </td>
                </tr>
              ) : (
                faults.map((f) => (
                  <tr
                    key={f._id}
                    className="hover:bg-slate-800/50 transition-colors duration-150"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {f.faultId}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-200">{f.equipmentName}</p>
                      <p className="font-mono text-[11px] text-blue-400">{f.equipmentId}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        {f.station}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-300 line-clamp-2">{f.description}</p>
                      {f.resolutionNotes && (
                        <p className="mt-1 text-[11px] text-emerald-400 italic">
                          Resolution: {f.resolutionNotes}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <SeverityBadge severity={f.severity} />
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-slate-200 font-medium">{f.reportedBy}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(f.reportedAt).toLocaleDateString()} {new Date(f.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={f.status} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenUpdate(f)}
                          className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:border-blue-500 hover:text-white transition"
                          title="Update Status & Resolution"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-blue-400" />
                          <span>Status</span>
                        </button>
                        <button
                          onClick={() => handleDeleteFault(f._id, f.faultId)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400 transition"
                          title="Delete Ticket"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Submit New Fault Report */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Submit New Signaling Fault Report"
      >
        {formError && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmitFault} className="space-y-4">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>
              Submitting this report will automatically update the selected equipment status to <strong>Faulty</strong>.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Equipment *
              </label>
              <select
                value={formData.equipmentId}
                onChange={(e) => handleEquipmentSelect(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                {equipmentList.map((eq) => (
                  <option key={eq.equipmentId} value={eq.equipmentId}>
                    {eq.equipmentId} - {eq.name} ({eq.station})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fault Severity *
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="Low">Low - Minor warning, no delay</option>
                <option value="Medium">Medium - Degraded functionality</option>
                <option value="High">High - Speed restriction triggered</option>
                <option value="Critical">Critical - Block section closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Railway Station
              </label>
              <input
                type="text"
                value={formData.station}
                onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reported By (Officer / Technician) *
              </label>
              <input
                type="text"
                value={formData.reportedBy}
                onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                placeholder="e.g. Signal Inspector R. Verma"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Fault Description & Diagnostic Observations *
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Red aspect lamp filament alarm active. Impedance bond terminal showing 2.8 ohms shunt leakage..."
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-500 transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Dispatch Fault Ticket'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Update Fault Status & Resolve */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={`Update Fault Incident: ${selectedFault?.faultId}`}
      >
        {formError && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {formError}
          </div>
        )}
        <form onSubmit={handleSaveUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Workflow Status
            </label>
            <select
              value={updateStatusData.status}
              onChange={(e) => setUpdateStatusData({ ...updateStatusData, status: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {updateStatusData.status === 'Resolved' && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                <span>Restore Equipment Operational Status</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Upon resolving this fault, what status should equipment{' '}
                <strong className="text-white">{selectedFault?.equipmentId}</strong> be set to?
              </p>
              <select
                value={updateStatusData.equipmentStatusToSet}
                onChange={(e) => setUpdateStatusData({ ...updateStatusData, equipmentStatusToSet: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Working">Working (Fully Operational, Health restored to 95%)</option>
                <option value="Under Maintenance">Under Maintenance (Pending post-repair audit)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Resolution Notes / Action Taken
            </label>
            <textarea
              rows="3"
              value={updateStatusData.resolutionNotes}
              onChange={(e) => setUpdateStatusData({ ...updateStatusData, resolutionNotes: e.target.value })}
              placeholder="e.g. Spliced bonding wire, replaced current sensor transformer, aspect tested satisfactory..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(false)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500 transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Ticket Status'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FaultReports;
