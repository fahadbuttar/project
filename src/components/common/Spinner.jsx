import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 'md', className = '', label = null }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`inline-flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`${sizes[size] || sizes.md} animate-spin text-amber-500`} />
      {label && <span className="text-sm font-medium text-slate-600">{label}</span>}
    </div>
  );
};

export default Spinner;
