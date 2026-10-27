import React from 'react';

const SeverityBadge = ({ severity }) => {
  let badgeStyles = 'bg-slate-700/50 text-slate-300 border-slate-600';
  let dotColor = 'bg-slate-400';

  const normalized = (severity || '').toLowerCase();

  switch (normalized) {
    case 'critical':
      badgeStyles = 'bg-red-500/15 text-red-400 border-red-500/40 shadow-sm shadow-red-500/20';
      dotColor = 'bg-red-500 animate-ping';
      break;
    case 'high':
      badgeStyles = 'bg-orange-500/15 text-orange-400 border-orange-500/40';
      dotColor = 'bg-orange-500';
      break;
    case 'medium':
      badgeStyles = 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      dotColor = 'bg-amber-400';
      break;
    case 'low':
      badgeStyles = 'bg-blue-500/15 text-blue-300 border-blue-500/40';
      dotColor = 'bg-blue-400';
      break;
    default:
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${badgeStyles}`}
    >
      <span className="relative flex h-2 w-2">
        {normalized === 'critical' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}></span>
      </span>
      {severity || 'Medium'}
    </span>
  );
};

export default SeverityBadge;
