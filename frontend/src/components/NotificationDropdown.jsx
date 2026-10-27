import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Trash2, AlertTriangle, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { notificationService } from '../services/api';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.delete(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type, severity) => {
    if (type === 'fault_reported' || severity === 'critical') {
      return <AlertTriangle className="h-4 w-4 text-red-400" />;
    }
    if (type === 'maintenance_overdue') {
      return <AlertCircle className="h-4 w-4 text-orange-400" />;
    }
    if (type === 'fault_resolved' || severity === 'success') {
      return <CheckCircle className="h-4 w-4 text-emerald-400" />;
    }
    return <Clock className="h-4 w-4 text-blue-400" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-slate-300 hover:border-slate-500 hover:text-white transition"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 p-4 bg-slate-800/50">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-100">Live Alerts</h4>
              {unreadCount > 0 && (
                <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-400">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No new notifications. All signaling lines operational.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={(e) => !item.isRead && handleMarkAsRead(item._id, e)}
                  className={`p-3.5 transition flex gap-3 cursor-pointer ${
                    item.isRead ? 'bg-slate-900/60 opacity-75' : 'bg-slate-800/40 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="rounded-lg bg-slate-800 p-1.5 border border-slate-700">
                      {getIcon(item.type, item.severity)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className={`text-xs font-semibold truncate ${item.isRead ? 'text-slate-300' : 'text-white'}`}>
                        {item.title}
                      </p>
                      <button
                        onClick={(e) => handleDelete(item._id, e)}
                        className="text-slate-500 hover:text-red-400 p-0.5"
                        title="Delete alert"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400 line-clamp-2">
                      {item.message}
                    </p>
                    <span className="mt-1 block text-[10px] text-slate-500">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
