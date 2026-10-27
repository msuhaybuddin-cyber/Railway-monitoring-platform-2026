import React from 'react';

const StatusBadge = ({ status }) => {
  let colorStyles = 'bg-slate-700/50 text-slate-300 border-slate-600';
  let dotColor = 'bg-slate-400';

  const normalized = (status || '').toLowerCase();

  if (normalized === 'working' || normalized === 'compliant' || normalized === 'completed' || normalized === 'resolved') {
    colorStyles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    dotColor = 'bg-emerald-400';
  } else if (normalized === 'faulty' || normalized === 'non-compliant' || normalized === 'overdue' || normalized === 'critical') {
    colorStyles = 'bg-red-500/10 text-red-400 border-red-500/30';
    dotColor = 'bg-red-400 animate-pulse';
  } else if (
    normalized === 'under maintenance' ||
    normalized === 'pending inspection' ||
    normalized === 'in progress' ||
    normalized === 'open'
  ) {
    colorStyles = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    dotColor = 'bg-amber-400';
  } else if (normalized === 'scheduled') {
    colorStyles = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    dotColor = 'bg-blue-400';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorStyles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
