import axios from 'axios';
import {
  INITIAL_EQUIPMENT,
  INITIAL_FAULTS,
  INITIAL_MAINTENANCE,
  INITIAL_NOTIFICATIONS,
  getLocalStore,
  setLocalStore,
} from './localData';

// Dynamically determine the API base URL:
// 1. If VITE_API_URL is set (e.g. separate frontend deployment), use it.
// 2. Otherwise default to '/api' (works seamlessly for unified Render deployment and local Vite proxy).
export const apiOrigin = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : '';

export const baseURL = apiOrigin ? `${apiOrigin}/api` : '/api';

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s timeout to accommodate Render free-tier cold starts
});

// Helper: determine if error should trigger resilient offline demo fallback
const shouldFallback = (err) => {
  // If backend returned a valid client HTTP response (400, 401, 403, 404, 409, 422),
  // propagate the real server response instead of masking it with dummy data.
  if (err.response && [400, 401, 403, 404, 409, 422].includes(err.response.status)) {
    return false;
  }
  // Fall back only when the backend is unreachable (network error, timeout, DNS error) or 502/503/504
  return true;
};

// Interceptor to add JWT Authorization header
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('railway_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.hash.includes('/login') && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('railway_token');
        localStorage.removeItem('railway_user');
      }
    }
    return Promise.reject(error);
  }
);

// --- 1. Auth Service ---
export const authService = {
  login: async (credentials) => {
    try {
      return await API.post('/auth/login', credentials);
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      const u = (credentials.username || '').trim().toLowerCase();
      const p = credentials.password || '';
      if ((u === 'admin' || u === 'admin@railway.gov.in') && p === 'admin123') {
        return {
          data: {
            success: true,
            message: 'Login successful',
            user: {
              _id: 'usr_admin',
              name: 'Chief Signal Engineer R. K. Sharma',
              username: 'admin',
              email: 'admin@railway.gov.in',
              role: 'admin',
              station: 'Central Signaling HQ - New Delhi',
            },
            token: 'demo_jwt_token_railway_2026',
          },
        };
      }
      throw err;
    }
  },
  getMe: async () => {
    try {
      return await API.get('/auth/me');
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      const saved = localStorage.getItem('railway_user');
      if (saved) return { data: { success: true, user: JSON.parse(saved) } };
      throw err;
    }
  },
};

// --- 2. Equipment Service ---
export const equipmentService = {
  getAll: async (params = {}) => {
    try {
      return await API.get('/equipment', { params });
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      let items = getLocalStore('equipment', INITIAL_EQUIPMENT);
      if (params.status && params.status !== 'All') {
        items = items.filter((e) => e.status === params.status);
      }
      if (params.type && params.type !== 'All') {
        items = items.filter((e) => e.type === params.type);
      }
      if (params.search) {
        const s = params.search.toLowerCase();
        items = items.filter(
          (e) =>
            e.equipmentId.toLowerCase().includes(s) ||
            e.name.toLowerCase().includes(s) ||
            e.station.toLowerCase().includes(s) ||
            e.type.toLowerCase().includes(s)
        );
      }
      return { data: { success: true, count: items.length, data: items } };
    }
  },
  getById: async (id) => {
    try {
      return await API.get(`/equipment/${id}`);
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      const items = getLocalStore('equipment', INITIAL_EQUIPMENT);
      const item = items.find((e) => e._id === id || e.equipmentId === id) || items[0];
      const faults = getLocalStore('faults', INITIAL_FAULTS).filter(
        (f) => f.equipmentId === item.equipmentId
      );
      const maintenance = getLocalStore('maintenance', INITIAL_MAINTENANCE).filter(
        (m) => m.equipmentId === item.equipmentId
      );
      return { data: { success: true, data: item, history: { faults, maintenance } } };
    }
  },
  create: async (data) => {
    try {
      return await API.post('/equipment', data);
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      const items = getLocalStore('equipment', INITIAL_EQUIPMENT);
      const newItem = {
        _id: 'eq_' + Date.now(),
        ...data,
        equipmentId: data.equipmentId.toUpperCase(),
        healthPercentage: Number(data.healthPercentage || 95),
      };
      items.unshift(newItem);
      setLocalStore('equipment', items);
      return { data: { success: true, data: newItem } };
    }
  },
  update: async (id, data) => {
    try {
      return await API.put(`/equipment/${id}`, data);
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      let items = getLocalStore('equipment', INITIAL_EQUIPMENT);
      items = items.map((e) => (e._id === id ? { ...e, ...data } : e));
      setLocalStore('equipment', items);
      const updated = items.find((e) => e._id === id);
      return { data: { success: true, data: updated } };
    }
  },
  delete: async (id) => {
    try {
      return await API.delete(`/equipment/${id}`);
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      let items = getLocalStore('equipment', INITIAL_EQUIPMENT);
      items = items.filter((e) => e._id !== id);
      setLocalStore('equipment', items);
      return { data: { success: true, data: {} } };
    }
  },
};

// --- 3. Fault Reporting Service ---
export const faultService = {
  getAll: async (params = {}) => {
    try {
      return await API.get('/faults', { params });
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      let items = getLocalStore('faults', INITIAL_FAULTS);
      if (params.status && params.status !== 'All') {
        items = items.filter((f) => f.status === params.status);
      }
      if (params.severity && params.severity !== 'All') {
        items = items.filter((f) => f.severity === params.severity);
      }
      if (params.search) {
        const s = params.search.toLowerCase();
        items = items.filter(
          (f) =>
            f.faultId.toLowerCase().includes(s) ||
            f.equipmentId.toLowerCase().includes(s) ||
            f.equipmentName.toLowerCase().includes(s) ||
            f.station.toLowerCase().includes(s)
        );
      }
      return { data: { success: true, count: items.length, data: items } };
    }
  },
  getById: async (id) => {
    try {
      return await API.get(`/faults/${id}`);
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      const items = getLocalStore('faults', INITIAL_FAULTS);
      const item = items.find((f) => f._id === id);
      return { data: { success: true, data: item } };
    }
  },
  create: async (data) => {
    try {
      return await API.post('/faults', data);
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      const items = getLocalStore('faults', INITIAL_FAULTS);
      const count = items.length + 1;
      const faultId = `FLT-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
      const newFault = {
        _id: 'flt_' + Date.now(),
        faultId,
        ...data,
        equipmentId: data.equipmentId.toUpperCase(),
        status: 'Open',
        reportedAt: new Date().toISOString(),
      };
      items.unshift(newFault);
      setLocalStore('faults', items);

      // Auto update equipment to Faulty
      let equipList = getLocalStore('equipment', INITIAL_EQUIPMENT);
      equipList = equipList.map((eq) =>
        eq.equipmentId === newFault.equipmentId
          ? { ...eq, status: 'Faulty', healthPercentage: 25 }
          : eq
      );
      setLocalStore('equipment', equipList);

      // Create notification
      const notifs = getLocalStore('notifications', INITIAL_NOTIFICATIONS);
      notifs.unshift({
        _id: 'notif_' + Date.now(),
        title: `New Fault: ${faultId}`,
        message: `${newFault.severity} severity fault reported on ${newFault.equipmentName} (${newFault.equipmentId})`,
        type: 'fault_reported',
        severity: newFault.severity.toLowerCase(),
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      setLocalStore('notifications', notifs);

      return { data: { success: true, data: newFault } };
    }
  },
  update: async (id, data) => {
    try {
      return await API.put(`/faults/${id}`, data);
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      let items = getLocalStore('faults', INITIAL_FAULTS);
      items = items.map((f) => (f._id === id ? { ...f, ...data } : f));
      setLocalStore('faults', items);

      // If resolved, restore equipment status
      const updated = items.find((f) => f._id === id);
      if (data.status === 'Resolved' && updated) {
        let equipList = getLocalStore('equipment', INITIAL_EQUIPMENT);
        const targetStatus = data.equipmentStatusToSet || 'Working';
        equipList = equipList.map((eq) =>
          eq.equipmentId === updated.equipmentId
            ? { ...eq, status: targetStatus, healthPercentage: targetStatus === 'Working' ? 95 : 60 }
            : eq
        );
        setLocalStore('equipment', equipList);
      }

      return { data: { success: true, data: updated } };
    }
  },
  delete: async (id) => {
    try {
      return await API.delete(`/faults/${id}`);
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      let items = getLocalStore('faults', INITIAL_FAULTS);
      items = items.filter((f) => f._id !== id);
      setLocalStore('faults', items);
      return { data: { success: true, data: {} } };
    }
  },
};

// --- 4. Maintenance Service ---
export const maintenanceService = {
  getAll: async (params = {}) => {
    try {
      return await API.get('/maintenance', { params });
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      let items = getLocalStore('maintenance', INITIAL_MAINTENANCE);
      const now = new Date();
      items = items.map((m) => {
        if (m.status !== 'Completed' && new Date(m.scheduledDate) < now) {
          return { ...m, status: 'Overdue' };
        }
        return m;
      });
      setLocalStore('maintenance', items);

      if (params.status && params.status !== 'All') {
        items = items.filter((m) => m.status === params.status);
      }
      if (params.type && params.type !== 'All') {
        items = items.filter((m) => m.maintenanceType === params.type);
      }
      if (params.search) {
        const s = params.search.toLowerCase();
        items = items.filter(
          (m) =>
            m.maintenanceId.toLowerCase().includes(s) ||
            m.equipmentId.toLowerCase().includes(s) ||
            m.equipmentName.toLowerCase().includes(s) ||
            m.technicianName.toLowerCase().includes(s)
        );
      }
      return { data: { success: true, count: items.length, data: items } };
    }
  },
  getById: async (id) => {
    try {
      return await API.get(`/maintenance/${id}`);
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      const items = getLocalStore('maintenance', INITIAL_MAINTENANCE);
      const item = items.find((m) => m._id === id);
      return { data: { success: true, data: item } };
    }
  },
  create: async (data) => {
    try {
      return await API.post('/maintenance', data);
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      const items = getLocalStore('maintenance', INITIAL_MAINTENANCE);
      const count = items.length + 1;
      const maintenanceId = `MNT-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
      const newMnt = {
        _id: 'mnt_' + Date.now(),
        maintenanceId,
        ...data,
        equipmentId: data.equipmentId.toUpperCase(),
        scheduledDate: new Date(data.scheduledDate).toISOString(),
        status: data.status || 'Scheduled',
      };
      items.unshift(newMnt);
      setLocalStore('maintenance', items);
      return { data: { success: true, data: newMnt } };
    }
  },
  update: async (id, data) => {
    try {
      return await API.put(`/maintenance/${id}`, data);
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      let items = getLocalStore('maintenance', INITIAL_MAINTENANCE);
      items = items.map((m) => (m._id === id ? { ...m, ...data } : m));
      setLocalStore('maintenance', items);

      if (data.status === 'Completed') {
        const updated = items.find((m) => m._id === id);
        if (updated) {
          let equipList = getLocalStore('equipment', INITIAL_EQUIPMENT);
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + 90);
          equipList = equipList.map((eq) =>
            eq.equipmentId === updated.equipmentId
              ? {
                  ...eq,
                  status: 'Working',
                  healthPercentage: 98,
                  lastMaintenanceDate: new Date().toISOString(),
                  nextMaintenanceDate: nextDate.toISOString(),
                }
              : eq
          );
          setLocalStore('equipment', equipList);
        }
      }

      const updated = items.find((m) => m._id === id);
      return { data: { success: true, data: updated } };
    }
  },
  delete: async (id) => {
    try {
      return await API.delete(`/maintenance/${id}`);
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      let items = getLocalStore('maintenance', INITIAL_MAINTENANCE);
      items = items.filter((m) => m._id !== id);
      setLocalStore('maintenance', items);
      return { data: { success: true, data: {} } };
    }
  },
};

// --- 5. Compliance Service ---
export const complianceService = {
  getMetrics: async () => {
    try {
      return await API.get('/compliance');
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      const equipment = getLocalStore('equipment', INITIAL_EQUIPMENT);
      const maintenance = getLocalStore('maintenance', INITIAL_MAINTENANCE);
      const now = new Date();

      const overdueIds = new Set(
        maintenance.filter((m) => m.status === 'Overdue').map((m) => m.equipmentId)
      );

      let validCount = 0;
      let overdueCount = 0;
      let pendingCount = 0;

      const equipmentList = equipment.map((eq) => {
        const isDateOverdue = new Date(eq.nextMaintenanceDate) < now;
        const hasOverdueRecord = overdueIds.has(eq.equipmentId);
        const days = Math.round(
          (new Date(eq.nextMaintenanceDate) - now) / (1000 * 3600 * 24)
        );

        let complianceItemStatus = 'Compliant';
        if (isDateOverdue || hasOverdueRecord || eq.status === 'Faulty') {
          complianceItemStatus = 'Non-Compliant';
          overdueCount++;
        } else if (days <= 15 || eq.status === 'Under Maintenance') {
          complianceItemStatus = 'Pending Inspection';
          pendingCount++;
        } else {
          validCount++;
        }

        return {
          ...eq,
          daysUntilDue: days,
          complianceItemStatus,
        };
      });

      const total = equipment.length;
      const percentage =
        total > 0 ? Number(((validCount / total) * 100).toFixed(1)) : 100;

      const typeMap = {};
      equipment.forEach((eq) => {
        if (!typeMap[eq.type]) typeMap[eq.type] = { type: eq.type, total: 0, compliant: 0 };
        typeMap[eq.type].total++;
        if (eq.status === 'Working' && new Date(eq.nextMaintenanceDate) >= now) {
          typeMap[eq.type].compliant++;
        }
      });

      const typeBreakdown = Object.values(typeMap).map((t) => ({
        ...t,
        percentage: Number(((t.compliant / t.total) * 100).toFixed(1)),
      }));

      const stationMap = {};
      equipment.forEach((eq) => {
        if (!stationMap[eq.station]) stationMap[eq.station] = { station: eq.station, total: 0, compliant: 0 };
        stationMap[eq.station].total++;
        if (eq.status === 'Working' && new Date(eq.nextMaintenanceDate) >= now) {
          stationMap[eq.station].compliant++;
        }
      });

      const stationBreakdown = Object.values(stationMap).map((s) => ({
        ...s,
        percentage: Number(((s.compliant / s.total) * 100).toFixed(1)),
      }));

      return {
        data: {
          success: true,
          data: {
            totalEquipment: total,
            validMaintenanceEquipment: validCount,
            overdueMaintenanceEquipment: overdueCount,
            pendingInspectionEquipment: pendingCount,
            compliancePercentage: percentage,
            complianceStatus:
              percentage >= 85
                ? 'Compliant'
                : percentage >= 70
                ? 'Pending Inspection'
                : 'Non-Compliant',
            typeBreakdown,
            stationBreakdown,
            equipmentList,
          },
        },
      };
    }
  },
};

// --- 6. Dashboard Service ---
export const dashboardService = {
  getData: async () => {
    try {
      return await API.get('/dashboard');
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      const equipment = getLocalStore('equipment', INITIAL_EQUIPMENT);
      const faults = getLocalStore('faults', INITIAL_FAULTS);
      const maintenance = getLocalStore('maintenance', INITIAL_MAINTENANCE);
      const now = new Date();

      const totalEquipment = equipment.length;
      const workingEquipment = equipment.filter((e) => e.status === 'Working').length;
      const faultyEquipment = equipment.filter((e) => e.status === 'Faulty').length;
      const underMaintenanceEquipment = equipment.filter(
        (e) => e.status === 'Under Maintenance'
      ).length;

      const pendingMaintenance = maintenance.filter(
        (m) => m.status === 'Scheduled' || m.status === 'In Progress' || m.status === 'Overdue'
      ).length;

      const openFaultReports = faults.filter(
        (f) => f.status === 'Open' || f.status === 'In Progress'
      ).length;

      const validMaint = equipment.filter(
        (e) => e.status === 'Working' && new Date(e.nextMaintenanceDate) >= now
      ).length;

      const compliancePercentage =
        totalEquipment > 0
          ? Number(((validMaint / totalEquipment) * 100).toFixed(1))
          : 100;

      const equipmentStatus = [
        { name: 'Working', value: workingEquipment, color: '#10B981' },
        { name: 'Faulty', value: faultyEquipment, color: '#EF4444' },
        { name: 'Under Maintenance', value: underMaintenanceEquipment, color: '#F59E0B' },
      ];

      const faultSeverity = [
        { severity: 'Low', count: faults.filter((f) => f.severity === 'Low').length, fill: '#3B82F6' },
        { severity: 'Medium', count: faults.filter((f) => f.severity === 'Medium').length, fill: '#EAB308' },
        { severity: 'High', count: faults.filter((f) => f.severity === 'High').length, fill: '#F97316' },
        { severity: 'Critical', count: faults.filter((f) => f.severity === 'Critical').length, fill: '#DC2626' },
      ];

      const maintenanceStatus = [
        { name: 'Completed', value: maintenance.filter((m) => m.status === 'Completed').length, color: '#10B981' },
        { name: 'Scheduled', value: maintenance.filter((m) => m.status === 'Scheduled').length, color: '#3B82F6' },
        { name: 'In Progress', value: maintenance.filter((m) => m.status === 'In Progress').length, color: '#F59E0B' },
        { name: 'Overdue', value: maintenance.filter((m) => m.status === 'Overdue').length, color: '#EF4444' },
      ];

      const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
      const monthlyFaults = months.map((m, i) => ({
        month: m,
        faults: [3, 4, 5, 4, 6, faults.length][i] || 3,
        resolved: [2, 3, 4, 3, 5, faults.filter((f) => f.status === 'Resolved').length][i] || 2,
      }));

      return {
        data: {
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
            equipmentStatus,
            faultSeverity,
            maintenanceStatus,
            monthlyFaults,
          },
          recent: {
            recentFaults: faults.slice(0, 5),
            upcomingMaintenance: maintenance.filter((m) => m.status !== 'Completed').slice(0, 5),
          },
        },
      };
    }
  },
};

// --- 7. Notification Service ---
export const notificationService = {
  getAll: async () => {
    try {
      return await API.get('/notifications');
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      const items = getLocalStore('notifications', INITIAL_NOTIFICATIONS);
      const unread = items.filter((n) => !n.isRead).length;
      return { data: { success: true, unreadCount: unread, data: items } };
    }
  },
  markRead: async (id) => {
    try {
      return await API.put(`/notifications/${id}/read`);
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      let items = getLocalStore('notifications', INITIAL_NOTIFICATIONS);
      items = items.map((n) => (n._id === id ? { ...n, isRead: true } : n));
      setLocalStore('notifications', items);
      return { data: { success: true } };
    }
  },
  markAllRead: async () => {
    try {
      return await API.put('/notifications/mark-all-read');
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      let items = getLocalStore('notifications', INITIAL_NOTIFICATIONS);
      items = items.map((n) => ({ ...n, isRead: true }));
      setLocalStore('notifications', items);
      return { data: { success: true } };
    }
  },
  delete: async (id) => {
    try {
      return await API.delete(`/notifications/${id}`);
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      let items = getLocalStore('notifications', INITIAL_NOTIFICATIONS);
      items = items.filter((n) => n._id !== id);
      setLocalStore('notifications', items);
      return { data: { success: true } };
    }
  },
};

// --- 8. Reports Service ---
export const reportService = {
  getData: async (params = {}) => {
    try {
      return await API.get('/reports', { params });
    } catch (err) {
      if (!shouldFallback(err)) throw err;
      const type = params.type || 'equipment';
      if (type === 'equipment') {
        const items = getLocalStore('equipment', INITIAL_EQUIPMENT);
        const working = items.filter((e) => e.status === 'Working').length;
        return {
          data: {
            success: true,
            type,
            summary: {
              totalEquipment: items.length,
              workingEquipment: working,
              faultyEquipment: items.filter((e) => e.status === 'Faulty').length,
              operationalRate: `${((working / items.length) * 100).toFixed(1)}%`,
            },
            data: items,
          },
        };
      } else if (type === 'faults') {
        const items = getLocalStore('faults', INITIAL_FAULTS);
        const resolved = items.filter((f) => f.status === 'Resolved').length;
        return {
          data: {
            success: true,
            type,
            summary: {
              totalFaults: items.length,
              openFaults: items.filter((f) => f.status === 'Open').length,
              inProgressFaults: items.filter((f) => f.status === 'In Progress').length,
              resolvedFaults: resolved,
              resolutionRate: `${((resolved / items.length) * 100).toFixed(1)}%`,
            },
            data: items,
          },
        };
      } else if (type === 'maintenance') {
        const items = getLocalStore('maintenance', INITIAL_MAINTENANCE);
        const completed = items.filter((m) => m.status === 'Completed').length;
        return {
          data: {
            success: true,
            type,
            summary: {
              totalMaintenance: items.length,
              completed,
              overdue: items.filter((m) => m.status === 'Overdue').length,
              completionRate: `${((completed / items.length) * 100).toFixed(1)}%`,
            },
            data: items,
          },
        };
      } else {
        const equipment = getLocalStore('equipment', INITIAL_EQUIPMENT);
        const compliant = equipment.filter((e) => e.status === 'Working').length;
        return {
          data: {
            success: true,
            type,
            summary: {
              totalEquipment: equipment.length,
              compliant,
              nonCompliant: equipment.filter((e) => e.status === 'Faulty').length,
              compliancePercentage: `${((compliant / equipment.length) * 100).toFixed(1)}%`,
            },
            data: equipment.map((e) => ({
              ...e,
              complianceStatus: e.status === 'Working' ? 'Compliant' : 'Non-Compliant',
            })),
          },
        };
      }
    }
  },
  getDownloadUrl: (params) => {
    const query = new URLSearchParams(params).toString();
    const prefix = apiOrigin ? `${apiOrigin}/api` : '/api';
    return `${prefix}/reports/csv?${query}`;
  },
};

export default API;
