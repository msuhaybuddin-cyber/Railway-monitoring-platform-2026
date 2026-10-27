import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { equipmentService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const EQUIPMENT_TYPES = [
  'All',
  'Railway Signal Lights',
  'Track Circuits',
  'Point Machines',
  'Axle Counters',
  'Signal Control Units',
  'Interlocking Systems',
];

const STATUS_OPTIONS = ['All', 'Working', 'Faulty', 'Under Maintenance'];

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState(null);

  // Form State
  const initialForm = {
    equipmentId: '',
    name: '',
    type: 'Railway Signal Lights',
    station: 'New Delhi Central',
    installationDate: new Date().toISOString().slice(0, 10),
    lastMaintenanceDate: new Date().toISOString().slice(0, 10),
    nextMaintenanceDate: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    status: 'Working',
    healthPercentage: 95,
    description: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (typeFilter !== 'All') params.type = typeFilter;

      const res = await equipmentService.getAll(params);
      setEquipment(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEquipment();
  };

  // Open View Modal with history
  const handleView = async (item) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
    try {
      const res = await equipmentService.getById(item._id);
      setSelectedHistory(res.data.history);
    } catch (err) {
      console.error(err);
    }
  };

  // Open Edit Modal
  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      equipmentId: item.equipmentId,
      name: item.name,
      type: item.type,
      station: item.station,
      installationDate: item.installationDate ? item.installationDate.slice(0, 10) : '',
      lastMaintenanceDate: item.lastMaintenanceDate ? item.lastMaintenanceDate.slice(0, 10) : '',
      nextMaintenanceDate: item.nextMaintenanceDate ? item.nextMaintenanceDate.slice(0, 10) : '',
      status: item.status,
      healthPercentage: item.healthPercentage,
      description: item.description || '',
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData(initialForm);
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Submit Add Equipment
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await equipmentService.create(formData);
      setIsAddModalOpen(false);
      fetchEquipment();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to create equipment');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Equipment
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await equipmentService.update(selectedItem._id, formData);
      setIsEditModalOpen(false);
      fetchEquipment();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to update equipment');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Equipment
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete equipment "${name}"?`)) {
      try {
        await equipmentService.delete(id);
        fetchEquipment();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete equipment');
      }
    }
  };

  // Helper for health percentage color
  const getHealthColor = (pct) => {
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl flex items-center gap-2.5">
            <Cpu className="h-7 w-7 text-blue-500" />
            Equipment Inventory & Tracking
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Monitor, inspect and maintain track circuits, point machines, signal lights & interlockings.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition"
        >
          <Plus className="h-4 w-4" />
          Add Equipment
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
              placeholder="Search by ID, Name, Station, Type..."
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
              {STATUS_OPTIONS.map((st) => (
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
              {EQUIPMENT_TYPES.map((tp) => (
                <option key={tp} value={tp}>
                  {tp}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/60 uppercase tracking-wider text-[11px] text-slate-400 font-bold">
              <tr>
                <th className="py-3.5 px-4">Equipment ID</th>
                <th className="py-3.5 px-4">Equipment Name</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Station / Location</th>
                <th className="py-3.5 px-4">Next Maint. Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Health %</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
                    Loading equipment records...
                  </td>
                </tr>
              ) : equipment.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    No equipment found matching criteria.
                  </td>
                </tr>
              ) : (
                equipment.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-800/50 transition-colors duration-150"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {item.equipmentId}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {item.type}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 flex items-center gap-1.5 mt-2">
                      <MapPin className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      <span>{item.station}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(item.nextMaintenanceDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-700/80 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${getHealthColor(item.healthPercentage)}`}
                            style={{ width: `${item.healthPercentage}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-xs font-semibold text-slate-300">
                          {item.healthPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleView(item)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-blue-400 transition"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition"
                          title="Edit Equipment"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.name)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400 transition"
                          title="Delete Equipment"
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

      {/* Add Equipment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Signaling Equipment"
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
                Equipment ID *
              </label>
              <input
                type="text"
                value={formData.equipmentId}
                onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                placeholder="e.g. SIG-NDLS-105"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Equipment Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Platform 2 Home Signal"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Equipment Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                {EQUIPMENT_TYPES.filter((t) => t !== 'All').map((tp) => (
                  <option key={tp} value={tp}>
                    {tp}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Railway Station / Location *
              </label>
              <input
                type="text"
                value={formData.station}
                onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                placeholder="e.g. New Delhi Central"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Installation Date
              </label>
              <input
                type="date"
                value={formData.installationDate}
                onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Next Maintenance Date *
              </label>
              <input
                type="date"
                value={formData.nextMaintenanceDate}
                onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
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
                <option value="Working">Working</option>
                <option value="Faulty">Faulty</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Health Percentage (0 - 100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.healthPercentage}
                onChange={(e) => setFormData({ ...formData, healthPercentage: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Technical Description / Specifications
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. 4-aspect LED signal, 110V AC current detection relay..."
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
              {submitting ? 'Registering...' : 'Register Equipment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Equipment Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Equipment: ${selectedItem?.equipmentId}`}
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
                Equipment Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Station
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
                Equipment Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="Working">Working</option>
                <option value="Faulty">Faulty</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Health Percentage
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.healthPercentage}
                onChange={(e) => setFormData({ ...formData, healthPercentage: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Next Maintenance Date
              </label>
              <input
                type="date"
                value={formData.nextMaintenanceDate}
                onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
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
              {submitting ? 'Saving...' : 'Update Equipment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal with History */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Asset Specifications: ${selectedItem?.equipmentId}`}
      >
        {selectedItem && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-slate-800/40 p-4 text-xs">
              <div>
                <p className="text-slate-400">Equipment Name:</p>
                <p className="font-bold text-white mt-0.5">{selectedItem.name}</p>
              </div>
              <div>
                <p className="text-slate-400">Type:</p>
                <p className="font-bold text-white mt-0.5">{selectedItem.type}</p>
              </div>
              <div>
                <p className="text-slate-400">Railway Station:</p>
                <p className="font-bold text-white mt-0.5">{selectedItem.station}</p>
              </div>
              <div>
                <p className="text-slate-400">Current Status:</p>
                <div className="mt-1"><StatusBadge status={selectedItem.status} /></div>
              </div>
              <div>
                <p className="text-slate-400">Health Index:</p>
                <p className="font-mono font-bold text-emerald-400 mt-0.5">{selectedItem.healthPercentage}%</p>
              </div>
              <div>
                <p className="text-slate-400">Next Scheduled Maintenance:</p>
                <p className="font-medium text-white mt-0.5">
                  {new Date(selectedItem.nextMaintenanceDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedItem.description && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-xs">
                <p className="text-slate-400 font-semibold mb-1">Specifications & Location Notes:</p>
                <p className="text-slate-200">{selectedItem.description}</p>
              </div>
            )}

            {/* Related Faults */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                Logged Fault Incident Records
              </h4>
              <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/50 p-2 text-xs divide-y divide-slate-800">
                {selectedHistory?.faults?.length === 0 ? (
                  <p className="p-3 text-slate-500 text-center">No fault tickets recorded on this asset.</p>
                ) : (
                  selectedHistory?.faults?.map((f) => (
                    <div key={f._id} className="py-2 px-1 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-white">{f.faultId}</span> - {f.description}
                        <p className="text-[10px] text-slate-500">{new Date(f.reportedAt).toLocaleDateString()} • {f.reportedBy}</p>
                      </div>
                      <StatusBadge status={f.status} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Equipment;
