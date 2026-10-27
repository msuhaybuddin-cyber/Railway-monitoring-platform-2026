import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Award,
  Layers,
  MapPin,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from 'recharts';
import { complianceService } from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

const Compliance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCompliance = async () => {
    try {
      setRefreshing(true);
      const res = await complianceService.getMetrics();
      setData(res.data.data);
    } catch (error) {
      console.error('Failed to fetch compliance metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCompliance();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-sm text-slate-400">Computing Regulatory Compliance Metrics...</p>
        </div>
      </div>
    );
  }

  const {
    totalEquipment = 0,
    validMaintenanceEquipment = 0,
    overdueMaintenanceEquipment = 0,
    pendingInspectionEquipment = 0,
    compliancePercentage = 100,
    complianceStatus = 'Compliant',
    typeBreakdown = [],
    stationBreakdown = [],
    equipmentList = [],
  } = data || {};

  const getStatusTheme = (status) => {
    if (status === 'Compliant') {
      return {
        badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        bar: 'bg-emerald-500',
        text: 'text-emerald-400',
        desc: 'Asset fleet adheres to Railway Safety Directorate standards & scheduled maintenance.',
      };
    }
    if (status === 'Pending Inspection') {
      return {
        badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        bar: 'bg-amber-500',
        text: 'text-amber-400',
        desc: 'Assets nearing inspection window (within 15 days). Schedule inspections promptly.',
      };
    }
    return {
      badge: 'bg-red-500/20 text-red-400 border-red-500/40',
      bar: 'bg-red-500',
      text: 'text-red-400',
      desc: 'Critical safety non-compliance detected. Overdue maintenance orders require intervention.',
    };
  };

  const theme = getStatusTheme(complianceStatus);

  const customTooltipStyle = {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderRadius: '0.75rem',
    color: '#f8fafc',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl flex items-center gap-2.5">
            <ShieldCheck className="h-7 w-7 text-emerald-500" />
            Signaling Compliance & Safety Audits
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real-time compliance rating derived from equipment maintenance logs and inspection schedules.
          </p>
        </div>

        <button
          onClick={fetchCompliance}
          disabled={refreshing}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Recalculating...' : 'Recalculate Audit'}
        </button>
      </div>

      {/* Main Compliance Status Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800/90 to-slate-900 p-6 shadow-2xl backdrop-blur">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${theme.badge}`}>
                <Award className="h-4 w-4" />
                Fleet Status: {complianceStatus}
              </span>
              <span className="text-xs text-slate-400">
                Formula: (Valid Maintenance / Total Assets) × 100
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Overall Compliance Rating:{' '}
              <span className={theme.text}>{compliancePercentage}%</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">{theme.desc}</p>
          </div>

          {/* Large Progress Gauge Visual */}
          <div className="w-full lg:w-72 bg-slate-950/80 rounded-xl p-4 border border-slate-800 text-center">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
              <span>Audit Benchmark (85%)</span>
              <span className="font-bold text-white">{compliancePercentage}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden p-0.5 border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${theme.bar}`}
                style={{ width: `${Math.min(100, compliancePercentage)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-2">
              <span>0% Critical</span>
              <span>70% Minimum</span>
              <span>85%+ Target</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Monitored Equipment"
          value={totalEquipment}
          icon={Layers}
          color="blue"
          subtitle="Signaling Inventory Base"
        />
        <StatCard
          title="Valid Maintenance"
          value={validMaintenanceEquipment}
          icon={CheckCircle2}
          color="green"
          subtitle="Up-to-date Inspections"
        />
        <StatCard
          title="Pending Inspection"
          value={pendingInspectionEquipment}
          icon={Clock}
          color="amber"
          subtitle="Due within 15 days"
        />
        <StatCard
          title="Overdue Maintenance"
          value={overdueMaintenanceEquipment}
          icon={AlertTriangle}
          color="red"
          subtitle="Action Priority Required"
        />
      </div>

      {/* Compliance Breakdown Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Compliance by Equipment Type */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Compliance by Equipment Type (%)
              </h2>
              <p className="text-xs text-slate-400">Audit adherence across technology categories</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={typeBreakdown}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="type"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  width={110}
                />
                <Tooltip contentStyle={customTooltipStyle} formatter={(val) => [`${val}%`, 'Compliance']} />
                <Bar dataKey="percentage" radius={[0, 6, 6, 0]}>
                  {typeBreakdown.map((entry, idx) => (
                    <Cell
                      key={`cell-tb-${idx}`}
                      fill={entry.percentage >= 85 ? '#10b981' : entry.percentage >= 70 ? '#f59e0b' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compliance by Railway Station */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Station Safety Compliance Rating (%)
              </h2>
              <p className="text-xs text-slate-400">Jurisdictional performance across major divisions</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stationBreakdown}
                margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="station"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={customTooltipStyle} formatter={(val) => [`${val}%`, 'Compliance']} />
                <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                  {stationBreakdown.map((entry, idx) => (
                    <Cell
                      key={`cell-sb-${idx}`}
                      fill={entry.percentage >= 85 ? '#10b981' : entry.percentage >= 70 ? '#f59e0b' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Equipment Detailed Compliance Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
        <div className="border-b border-slate-800 p-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Asset-Level Compliance & Maintenance Horizon
          </h2>
          <p className="text-xs text-slate-400">
            Real-time inspection deadlines and safety classifications for each registered unit.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/60 uppercase tracking-wider text-[11px] text-slate-400 font-bold">
              <tr>
                <th className="py-3.5 px-4">Equipment ID</th>
                <th className="py-3.5 px-4">Equipment Name</th>
                <th className="py-3.5 px-4">Station</th>
                <th className="py-3.5 px-4">Next Inspection Date</th>
                <th className="py-3.5 px-4">Days Remaining</th>
                <th className="py-3.5 px-4">Health Index</th>
                <th className="py-3.5 px-4 text-center">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {equipmentList.map((eq) => (
                <tr key={eq._id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {eq.equipmentId}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-200">
                    {eq.name}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {eq.station}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {new Date(eq.nextMaintenanceDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    {eq.daysUntilDue < 0 ? (
                      <span className="font-bold text-red-400">
                        Overdue by {Math.abs(eq.daysUntilDue)} days
                      </span>
                    ) : eq.daysUntilDue <= 15 ? (
                      <span className="font-bold text-amber-400">
                        Due in {eq.daysUntilDue} days
                      </span>
                    ) : (
                      <span className="text-emerald-400">
                        {eq.daysUntilDue} days
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {eq.healthPercentage}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={eq.complianceItemStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Compliance;
