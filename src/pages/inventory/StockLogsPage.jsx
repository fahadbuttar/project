import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import orderService from '../../api/orderService.js';
import productService from '../../api/productService.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import Table from '../../components/common/Table.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import { formatDate } from '../../utils/formatters.js';

export const StockLogsPage = () => {
  const [page, setPage] = useState(1);
  const [productId, setProductId] = useState('');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch product list for filtering
  const { data: productData } = useQuery({
    queryKey: ['filterProducts'],
    queryFn: () => productService.searchProducts(),
  });
  const products = productData?.products || [];

  // Fetch paginated stock logs from backend
  const {
    data: logsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['stockLogs', page, productId, reason, startDate, endDate],
    queryFn: () =>
      orderService.getStockLogs({
        page,
        limit: 10,
        productId: productId || undefined,
        reason: reason || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const logs = logsData?.logs || [];
  const pagination = logsData?.pagination || {
    currentPage: 1,
    totalPages: 1,
    logCount: 0,
  };

  const handleResetFilters = () => {
    setProductId('');
    setReason('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const columns = [
    {
      key: 'productId',
      header: 'Product Item',
      render: (val) => {
        if (!val) return <span className="text-slate-400">Unknown Product</span>;
        return (
          <div>
            <span className="font-bold text-slate-900">{val.name}</span>
            {val.brand && <div className="text-xs text-slate-500">{val.brand}</div>}
          </div>
        );
      },
    },
    {
      key: 'quantityDelta',
      header: 'Quantity Change',
      render: (val) => {
        const isPositive = val > 0;
        return (
          <span
            className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2.5 py-1 rounded-full border ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {isPositive ? `+${val}` : val}
          </span>
        );
      },
    },
    {
      key: 'reason',
      header: 'Audit Reason',
      render: (val) => <span className="text-xs font-semibold text-slate-700">{val}</span>,
    },
    {
      key: 'invoiceNo',
      header: 'Invoice #',
      render: (val) => (
        <span className="font-mono text-xs font-medium text-slate-600">
          {val || '—'}
        </span>
      ),
    },
    {
      key: 'saleType',
      header: 'Sale Type',
      render: (val) => (val ? <Badge size="sm">{val}</Badge> : '—'),
    },
    {
      key: 'createdAt',
      header: 'Recorded At',
      render: (val) => (
        <span className="text-xs text-slate-500">{formatDate(val)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-amber-500" />
          Stock Audit Logs & History
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable audit trail for all inventory movements, sales deductions, order cancellations, and manual adjustments.
        </p>
      </div>

      {/* Filter controls */}
      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Select
            label="Product"
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Products</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.brand})
              </option>
            ))}
          </Select>

          <Input
            label="Audit Reason"
            placeholder="e.g. Ordered Created, Damaged..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setPage(1);
            }}
          />

          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
          />

          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
          />

          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleResetFilters}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={() => refetch()}
            >
              Apply
            </Button>
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <div className="space-y-3">
        <Table
          columns={columns}
          data={logs}
          isLoading={isLoading}
          emptyMessage="No stock logs found matching your filters."
        />

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.logCount}
          onPageChange={(p) => setPage(p)}
        />
      </div>
    </div>
  );
};

export default StockLogsPage;
