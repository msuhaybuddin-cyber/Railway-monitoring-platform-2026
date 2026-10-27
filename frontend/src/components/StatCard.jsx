import React from 'react';

const StatCard = ({ title, value, icon: Icon, subtitle, color = 'blue', trend }) => {
  const colorMap = {
    green: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
    },
    red: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      iconBg: 'bg-red-500/20 text-red-400',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      iconBg: 'bg-amber-500/20 text-amber-400',
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      iconBg: 'bg-blue-500/20 text-blue-400',
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      iconBg: 'bg-cyan-500/20 text-cyan-400',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      iconBg: 'bg-purple-500/20 text-purple-400',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${scheme.border} bg-slate-800/80 p-5 shadow-lg backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:border-slate-500 hover:shadow-xl`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h3 className={`mt-2 text-3xl font-extrabold tracking-tight ${scheme.text}`}>
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${scheme.iconBg}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-700/60 pt-3 text-xs text-slate-400">
          <span>{subtitle}</span>
          {trend && (
            <span className="font-medium text-slate-300">
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
