import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  AlertTriangle,
  Wrench,
  ShieldCheck,
  FileBarChart,
  X,
  PhoneCall,
  TrainTrack,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Equipment Management', path: '/equipment', icon: Cpu },
  { name: 'Fault Reporting', path: '/faults', icon: AlertTriangle },
  { name: 'Maintenance', path: '/maintenance', icon: Wrench },
  { name: 'Compliance Monitoring', path: '/compliance', icon: ShieldCheck },
  { name: 'Reports & Analytics', path: '/reports', icon: FileBarChart },
];

const Sidebar = ({ isOpen, closeSidebar }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo Section */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20">
              <TrainTrack className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-wider text-white uppercase">
                Rail<span className="text-blue-400">Signal</span>
              </h2>
              <span className="text-[10px] tracking-wide text-slate-400 uppercase font-medium">
                Signaling Monitor
              </span>
            </div>
          </div>

          <button
            onClick={closeSidebar}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Monitoring Modules
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer - Railway Emergency info */}
        <div className="border-t border-slate-800 p-4 bg-slate-950/40">
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
            <div className="flex items-center gap-2 text-blue-400">
              <PhoneCall className="h-4 w-4" />
              <span className="text-xs font-bold">Signal Control Desk</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Emergency Hot-Wire: <strong className="text-white">139 (Ext 4)</strong>
            </p>
            <span className="mt-1.5 inline-block text-[10px] text-emerald-400 font-medium">
              ● All Feeds Synced
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
