import React from 'react';
import { AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

export const SubscriptionBanner = () => {
  const { user, isOwner, isAdmin } = useAuth();

  // If super admin, no shop subscription warning needed
  if (isAdmin) return null;

  // Check if shop subscription is active (or if shop object is populated)
  // When shop is newly created, subscriptionActive is false
  const shop = user?.shopId;
  const isInactive = shop && typeof shop === 'object' && shop.subscriptionActive === false;

  if (!isInactive) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-medium flex flex-wrap items-center justify-between gap-2 shadow-sm border-b border-amber-600 no-print">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0 text-slate-950" />
        <span>
          <strong>Store Subscription Notice:</strong> Your store subscription is currently pending activation. Some write operations (adding products, categories, orders) require active status.
        </span>
      </div>
      <div className="flex items-center gap-3">
        {isOwner && (
          <span className="text-[11px] bg-slate-950 text-white px-2.5 py-1 rounded-lg font-semibold">
            Contact Super Admin to Activate (30-Day License)
          </span>
        )}
      </div>
    </div>
  );
};

export default SubscriptionBanner;
