import React from 'react';
import { Menu, LogOut, Train, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 sm:px-6 backdrop-blur">
      {/* Left side: Hamburger toggle + Brand/System Status */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden transition"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/30">
            <Train className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base">
                RailSignal <span className="text-blue-400">360</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                SIL-4 Network Online
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400">
              Centralized Railway Signaling & Compliance Platform
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Station badge, Notifications, Profile, Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Active Station indicator */}
        <div className="hidden xl:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-300">
          <ShieldCheck className="h-4 w-4 text-blue-400" />
          <span>HQ: <strong className="text-white">{user?.station || 'Central HQ'}</strong></span>
        </div>

        {/* Live Notification Dropdown */}
        <NotificationDropdown />

        {/* User Profile Pill */}
        <div className="flex items-center gap-3 border-l border-slate-800 pl-3 sm:pl-4">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-white leading-tight">
              {user?.name || 'Administrator'}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-blue-400">
              {user?.role || 'Admin'}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-200">
            <User className="h-4 w-4" />
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500 hover:text-white transition shadow-sm"
            title="Log out of system"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
