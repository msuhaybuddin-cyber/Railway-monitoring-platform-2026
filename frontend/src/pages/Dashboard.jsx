import React, { useState, useEffect } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileWarning,
  ShieldCheck,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Wrench,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import { dashboardService } from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      setRefreshing(true);
      const res = await dashboardService.getData();
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-sm text-slate-400">Loading Railway Monitoring Feeds...</p>
        </div>
      </div>
    );
  }

  const { statistics, charts, recent } = data || {
    statistics: {},
    charts: {},
    recent: {},
  };

  // Tooltip custom style for dark mode
  const customTooltipStyle = {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderRadius: '0.75rem',
    color: '#f8fafc',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Live Signaling Operations Center
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real-time telemetry, track circuit health, fault telemetry and compliance index.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          disabled={refreshing}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Telemetry'}
        </button>
      </div>

      {/* 6 Key Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Equipment"
          value={statistics.totalEquipment || 0}
          icon={Cpu}
          color="blue"
          subtitle="Monitored Assets"
        />
        <StatCard
          title="Working"
          value={statistics.workingEquipment || 0}
          icon={CheckCircle2}
          color="green"
          subtitle="Fully Operational"
          trend="Normal"
        />
        <StatCard
          title="Faulty"
          value={statistics.faultyEquipment || 0}
          icon={AlertTriangle}
          color="red"
          subtitle="Action Required"
          trend="High Alert"
        />
        <StatCard
          title="Pending Maint."
          value={statistics.pendingMaintenance || 0}
          icon={Clock}
          color="amber"
          subtitle="Scheduled / Overdue"
        />
        <StatCard
          title="Open Faults"
          value={statistics.openFaultReports || 0}
          icon={FileWarning}
          color="purple"
          subtitle="Active Tickets"
        />
        <StatCard
          title="Compliance %"
          value={`${statistics.compliancePercentage || 0}%`}
          icon={ShieldCheck}
          color={statistics.compliancePercentage >= 85 ? 'green' : statistics.compliancePercentage >= 70 ? 'amber' : 'red'}
          subtitle={statistics.compliancePercentage >= 85 ? 'Compliant' : 'Needs Review'}
          trend="Safety Index"
        />
      </div>

      {/* 4 Interactive Recharts Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Equipment Status – Pie Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Equipment Operational Status
              </h2>
              <p className="text-xs text-slate-400">Distribution across active signaling inventory</p>
            </div>
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-400">
              Pie Chart
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.equipmentStatus || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(charts.equipmentStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Fault Severity – Bar Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Fault Severity Breakdown
              </h2>
              <p className="text-xs text-slate-400">Incidents categorized by railway safety impact</p>
            </div>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400">
              Bar Chart
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.faultSeverity || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="severity" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Bar dataKey="count" name="Fault Count" radius={[6, 6, 0, 0]}>
                  {(charts.faultSeverity || []).map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Maintenance Status – Doughnut Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Maintenance Schedule Status
              </h2>
              <p className="text-xs text-slate-400">Inspection orders by workflow execution state</p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
              Doughnut Chart
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.maintenanceStatus || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {(charts.maintenanceStatus || []).map((entry, index) => (
                    <Cell key={`cell-m-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Monthly Fault Reports – Line Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Monthly Fault Incident Trends
              </h2>
              <p className="text-xs text-slate-400">Reported vs resolved faults over the past 6 months</p>
            </div>
            <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-400">
              Line Chart
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.monthlyFaults || []} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend verticalAlign="bottom" height={36} />
                <Line
                  type="monotone"
                  dataKey="faults"
                  name="Faults Reported"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#ef4444' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Faults Resolved"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dual Activity Panels: Recent Faults & Upcoming Maintenance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Fault Alerts */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Recent Fault Dispatches
              </h2>
            </div>
            <Link
              to="/faults"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
            >
              View All Faults →
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recent.recentFaults?.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">No recent fault tickets.</p>
            ) : (
              recent.recentFaults?.map((fault) => (
                <div key={fault._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">
                        {fault.faultId}
                      </span>
                      <SeverityBadge severity={fault.severity} />
                    </div>
                    <p className="mt-1 text-xs text-slate-300 truncate">
                      {fault.equipmentName} ({fault.equipmentId})
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {fault.station} • Reported by {fault.reportedBy}
                    </p>
                  </div>
                  <StatusBadge status={fault.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Maintenance Orders */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Scheduled Maintenance Orders
              </h2>
            </div>
            <Link
              to="/maintenance"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
            >
              View Maintenance →
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recent.upcomingMaintenance?.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">No scheduled maintenance tasks.</p>
            ) : (
              recent.upcomingMaintenance?.map((item) => (
                <div key={item._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">
                        {item.maintenanceId}
                      </span>
                      <span className="text-xs text-blue-400 font-medium">
                        {item.maintenanceType}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-300 truncate">
                      {item.equipmentName} ({item.equipmentId})
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Due: {new Date(item.scheduledDate).toLocaleDateString()} • {item.technicianName}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
