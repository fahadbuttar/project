import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  FileSpreadsheet,
  Receipt,
  History,
  Users,
  Mic,
  UserCheck,
  ShieldAlert,
  UserCog,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const Sidebar = ({ isOpen, onClose }) => {
  const { isOwner, isAdmin, isCashier } = useAuth();

  const navItems = [
    {
      label: 'Main',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/pos', label: 'POS Terminal', icon: ShoppingCart },
        { to: '/products', label: 'Products & Stock', icon: Boxes },
      ],
    },
    {
      label: 'Sales & Invoices',
      items: [
        { to: '/orders', label: 'Invoices & Orders', icon: Receipt },
        { to: '/quotations', label: 'Quotations', icon: FileSpreadsheet },
        { to: '/customers', label: 'Customers & Credit', icon: Users },
      ],
    },
    {
      label: 'Inventory & Intelligence',
      items: [
        { to: '/inventory/logs', label: 'Stock Audit Logs', icon: History },
        { to: '/ai-assistant', label: 'AI Voice Query', icon: Mic, badge: 'AI' },
      ],
    },
  ];

  // Owner specific section
  if (isOwner) {
    navItems.push({
      label: 'Administration',
      items: [
        { to: '/staff', label: 'Staff Management', icon: UserCheck },
      ],
    });
  }

  // Super Admin specific section
  if (isAdmin) {
    navItems.push({
      label: 'Super Admin',
      items: [
        { to: '/admin/shops', label: 'Manage All Shops', icon: ShieldAlert },
      ],
    });
  }

  // Profile link
  navItems.push({
    label: 'Account',
    items: [
      { to: '/profile', label: 'Profile & Security', icon: UserCog },
    ],
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
              <Zap className="w-4 h-4 fill-slate-950 stroke-slate-950" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">
              VoltManage
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navItems.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {group.label}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors duration-150 ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/10'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Electric Store v2.0</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
