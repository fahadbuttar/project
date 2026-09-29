import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default', // 'default', 'warning', 'success', 'danger'
  onClick = null,
}) => {
  const iconVariants = {
    default: 'bg-amber-50 text-amber-600',
    warning: 'bg-yellow-50 text-yellow-600',
    success: 'bg-emerald-50 text-emerald-600',
    danger: 'bg-rose-50 text-rose-600',
    blue: 'bg-sky-50 text-sky-600',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-amber-300' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconVariants[variant] || iconVariants.default}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="text-2xl font-black text-slate-900 tracking-tight">
        {value}
      </div>

      {subtitle && (
        <div className="mt-1 text-xs font-medium text-slate-500">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard;
