import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit,
  Clock,
  AlertCircle,
  Calendar,
  UserCheck,
  Check,
} from 'lucide-react';
import { maintenanceService, equipmentService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const MAINTENANCE_TYPES = [
  'All',
  'Routine Inspection',
  'Preventive Overhaul',
  'Emergency Repair',
  'Signal Calibration',
  'Track Circuit Test',
  'Point Machine Lubrication',
];

const MAINTENANCE_STATUSES = ['All', 'Scheduled', 'In Progress', 'Completed', 'Overdue'];

const Maintenance = () => {
  const [records, setRecords] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form State
  const initialForm = {
    equipmentId: '',
    equipmentName: '',
    station: '',
    maintenanceType: 'Routine Inspection',
    scheduledDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    technicianName: 'Senior Technician M. Ramesh',
    description: '',
    status: 'Scheduled',
    remarks: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMaintenance = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (typeFilter !== 'All') params.type = typeFilter;

      const res = await maintenanceService.getAll(params);
      setRecords(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch maintenance:', error);
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
    fetchMaintenance();
    fetchEquipmentOptions();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMaintenance();
  };

  const handleEquipmentSelect = (equipId) => {
    const selected = equipmentList.find((e) => e.equipmentId === equipId);
    setFormData({
      ...formData,
      equipmentId: equipId,
      equipmentName: selected ? selected.name : '',
      station: selected ? selected.station : '',
    });
  };

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

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await maintenanceService.create(formData);
      setIsAddModalOpen(false);
      fetchMaintenance();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to schedule maintenance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      equipmentId: item.equipmentId,
      equipmentName: item.equipmentName,
      station: item.station,
      maintenanceType: item.maintenanceType,
      scheduledDate: item.scheduledDate ? item.scheduledDate.slice(0, 10) : '',
      technicianName: item.technicianName,
      description: item.description,
      status: item.status,
      remarks: item.remarks || '',
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await maintenanceService.update(selectedItem._id, formData);
      setIsEditModalOpen(false);
      fetchMaintenance();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to update maintenance record');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Action: Mark as Completed
  const handleMarkComplete = async (item) => {
    if (window.confirm(`Mark maintenance "${item.maintenanceId}" on ${item.equipmentName} as Completed?`)) {
      try {
        await maintenanceService.update(item._id, {
          status: 'Completed',
          completedDate: new Date(),
        });
        fetchMaintenance();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to mark as completed');
      }
    }
  };

  const handleDelete = async (id, mntId) => {
    if (window.confirm(`Delete maintenance record "${mntId}"?`)) {
      try {
        await maintenanceService.delete(id);
        fetchMaintenance();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete record');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl flex items-center gap-2.5">
            <Wrench className="h-7 w-7 text-amber-500" />
            Maintenance Operations & Work Orders
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Schedule routine inspections, track lubrications, point calibrations, and prevent safety outages.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition"
        >
          <Plus className="h-4 w-4" />
          Schedule Maintenance
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, Equipment, Technician, Description..."
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
              {MAINTENANCE_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              {MAINTENANCE_TYPES.map((tp) => (
                <option key={tp} value={tp}>
                  {tp}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Maintenance Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/60 uppercase tracking-wider text-[11px] text-slate-400 font-bold">
              <tr>
                <th className="py-3.5 px-4">Maintenance ID</th>
                <th className="py-3.5 px-4">Equipment</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Scheduled Date</th>
                <th className="py-3.5 px-4">Assigned Technician</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mx-auto mb-2"></div>
                    Loading maintenance schedule...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No maintenance records found.
                  </td>
                </tr>
              ) : (
                records.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-800/50 transition-colors duration-150"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {item.maintenanceId}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-200">{item.equipmentName}</p>
                      <p className="font-mono text-[11px] text-blue-400">{item.equipmentId}</p>
                      {item.station && (
                        <p className="text-[11px] text-slate-400">{item.station}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="font-medium">{item.maintenanceType}</span>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{item.description}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-200">
                        {new Date(item.scheduledDate).toLocaleDateString()}
                      </p>
                      {item.completedDate && (
                        <p className="text-[10px] text-emerald-400">
                          Done: {new Date(item.completedDate).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 flex items-center gap-1.5 mt-2">
                      <UserCheck className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      <span>{item.technicianName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {item.status !== 'Completed' && (
                          <button
                            onClick={() => handleMarkComplete(item)}
                            className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-white transition"
                            title="Mark as Completed"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Complete</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition"
                          title="Edit Record"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.maintenanceId)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400 transition"
                          title="Delete Record"
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

      {/* Schedule Maintenance Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Signaling Equipment Maintenance"
      >
        {formError && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateSubmit} className="space-y-4">
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
                Maintenance Type *
              </label>
              <select
                value={formData.maintenanceType}
                onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                {MAINTENANCE_TYPES.filter((t) => t !== 'All').map((tp) => (
                  <option key={tp} value={tp}>
                    {tp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Scheduled Execution Date *
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assigned Technician *
              </label>
              <input
                type="text"
                value={formData.technicianName}
                onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
                placeholder="e.g. Senior Tech M. Ramesh"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Workflow Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Maintenance Task Description & Checklist
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Clean track relay contacts, measure shunt resistance, inspect cable terminals..."
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
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500 transition disabled:opacity-50"
            >
              {submitting ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Maintenance Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Maintenance Order: ${selectedItem?.maintenanceId}`}
      >
        {formError && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {formError}
          </div>
        )}
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Technician Name
              </label>
              <input
                type="text"
                value={formData.technicianName}
                onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Scheduled Date
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Inspection Remarks / Outcome Notes
            </label>
            <textarea
              rows="2"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="e.g. All test values within IRSE specifications..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500 transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Update Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Maintenance;
