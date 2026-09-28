import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  CalendarPlus,
  RefreshCw,
  Search,
  Store,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';
import adminService from '../../api/adminService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatDate, formatPhone, getErrorMessage } from '../../utils/formatters.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Table from '../../components/common/Table.jsx';
import Badge from '../../components/common/Badge.jsx';
import Card from '../../components/common/Card.jsx';

export const AdminShopsPage = () => {
  const [search, setSearch] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const toast = useToast();

  const {
    data: shops = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['adminShops'],
    queryFn: () => adminService.getShops(),
  });

  const handleActivateShop = async (shopId) => {
    setIsActionLoading(true);
    try {
      await adminService.activateShop(shopId);
      toast.success('Shop subscription activated for 30 days!');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to activate shop'));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleExtendShop = async (shopId) => {
    setIsActionLoading(true);
    try {
      await adminService.extendSubscription(shopId);
      toast.success('Shop subscription extended by +30 days!');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to extend subscription'));
    } finally {
      setIsActionLoading(false);
    }
  };

  const filtered = shops.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.contactNo && s.contactNo.includes(q)) ||
      (s.ownerId?.email && s.ownerId.email.toLowerCase().includes(q))
    );
  });

  const columns = [
    {
      key: 'name',
      header: 'Store / Shop Details',
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <Store className="w-4 h-4 text-amber-500" />
            {val}
          </span>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            {row.address}
          </div>
        </div>
      ),
    },
    {
      key: 'ownerId',
      header: 'Registered Owner',
      render: (val) => (
        <div>
          <div className="font-semibold text-slate-800">
            {val?.username || 'Owner'}
          </div>
          <div className="text-xs text-slate-500">{val?.email}</div>
        </div>
      ),
    },
    {
      key: 'contactNo',
      header: 'Contact Phone',
      render: (val) => (
        <span className="font-mono text-xs text-slate-700">
          {formatPhone(val)}
        </span>
      ),
    },
    {
      key: 'invoiceCounter',
      header: 'Invoices Issued',
      render: (val) => (
        <span className="font-mono font-bold text-slate-800">
          {val || 0}
        </span>
      ),
    },
    {
      key: 'subscriptionActive',
      header: 'Subscription Status',
      render: (val, row) => {
        const isExpired =
          !val || !row.subscriptionExpiry || new Date(row.subscriptionExpiry) <= new Date();

        return (
          <div>
            <Badge variant={!isExpired ? 'success' : 'danger'}>
              {!isExpired ? 'Active (Licensed)' : 'Inactive / Expired'}
            </Badge>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {row.subscriptionExpiry ? formatDate(row.subscriptionExpiry) : 'No Expiry'}
            </div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'License Controls',
      className: 'text-right',
      render: (_, row) => (
        <div className="inline-flex items-center gap-2">
          {!row.subscriptionActive ? (
            <Button
              size="sm"
              variant="success"
              className="text-xs"
              isLoading={isActionLoading}
              leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
              onClick={() => handleActivateShop(row._id)}
            >
              Activate (30d)
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              isLoading={isActionLoading}
              leftIcon={<CalendarPlus className="w-3.5 h-3.5 text-amber-600" />}
              onClick={() => handleExtendShop(row._id)}
            >
              Extend (+30d)
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            Super Admin: Shop License Manager
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            SaaS multi-tenant control center: Activate, inspect, and renew 30-day subscriptions for all client stores.
          </p>
        </div>

        <Button
          variant="outline"
          leftIcon={<RefreshCw className="w-4 h-4" />}
          onClick={() => refetch()}
        >
          Refresh Shops
        </Button>
      </div>

      <Card bodyClassName="p-4">
        <Input
          placeholder="Search by store name, contact number, or owner email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </Card>

      <Table
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        emptyMessage="No store tenants registered yet."
      />
    </div>
  );
};

export default AdminShopsPage;
