import React, { useState, useEffect } from 'react';
import {
  Receipt,
  CheckCircle2,
  XCircle,
  Printer,
  Search,
  RefreshCw,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import orderService from '../../api/orderService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import Table from '../../components/common/Table.jsx';
import Badge from '../../components/common/Badge.jsx';
import Card from '../../components/common/Card.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import PrintableInvoice from '../../components/ui/PrintableInvoice.jsx';
import { formatCurrency, formatDate, getErrorMessage } from '../../utils/formatters.js';
import { useNavigate } from 'react-router-dom';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const loadOrders = () => {
    const cached = orderService.getCachedOrders();
    setOrders(cached);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleMarkDelivered = async (orderId) => {
    setIsProcessing(true);
    try {
      const response = await orderService.updateOrderStatus(orderId);
      const updatedOrder = response.data?.order || response.data;
      toast.success('Order marked as DELIVERED successfully!');

      // Update cached orders
      const updatedList = orders.map((o) =>
        o._id === orderId ? { ...o, status: 'DELIVERED' } : o
      );
      orderService.setCachedOrders(updatedList);
      setOrders(updatedList);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update order status'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    setIsProcessing(true);
    try {
      const response = await orderService.cancelOrder(orderToCancel._id);
      const updatedOrder = response.data?.orderInDb || response.data;
      toast.success('Order cancelled and inventory products restocked safely!');

      const updatedList = orders.map((o) =>
        o._id === orderToCancel._id ? { ...o, status: 'CANCELLED' } : o
      );
      orderService.setCachedOrders(updatedList);
      setOrders(updatedList);
      setOrderToCancel(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to cancel order'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter logic
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      !search ||
      (o.invoiceNo && o.invoiceNo.toLowerCase().includes(search.toLowerCase())) ||
      (o.customerId?.name && o.customerId.name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = !statusFilter || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'invoiceNo',
      header: 'Invoice #',
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-slate-900">
            {val || 'INV-SALES'}
          </span>
          <div className="text-[11px] text-slate-400">
            {formatDate(row.createdAt)}
          </div>
        </div>
      ),
    },
    {
      key: 'customerId',
      header: 'Customer',
      render: (val) => (
        <span className="font-medium text-slate-700">
          {val?.name || 'Walk-in Customer'}
        </span>
      ),
    },
    {
      key: 'saleType',
      header: 'Type',
      render: (val) => (
        <Badge variant={val === 'WHOLESALE' ? 'purple' : 'neutral'} size="sm">
          {val || 'RETAIL'}
        </Badge>
      ),
    },
    {
      key: 'totalPrice',
      header: 'Total Bill',
      render: (val) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: 'paidAmount',
      header: 'Paid',
      render: (val) => (
        <span className="font-mono text-slate-600">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: 'amountDue',
      header: 'Credit Due',
      render: (val) => (
        <span
          className={`font-mono font-bold ${
            val > 0 ? 'text-rose-600' : 'text-emerald-600'
          }`}
        >
          {val > 0 ? formatCurrency(val) : 'PAID'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => {
        const variants = {
          DELIVERED: 'success',
          PENDING: 'warning',
          CANCELLED: 'danger',
        };
        return <Badge variant={variants[val] || 'neutral'}>{val}</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (_, row) => (
        <div className="inline-flex items-center gap-1.5">
          <button
            onClick={() => setSelectedOrderForPrint(row)}
            title="Print Receipt"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>

          {row.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleMarkDelivered(row._id)}
                disabled={isProcessing}
                title="Mark as Delivered"
                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOrderToCancel(row)}
                disabled={isProcessing}
                title="Cancel Order & Restock"
                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-500" />
            Invoices & Sales Orders
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage official customer invoices, track delivery fulfillment, or cancel pending orders.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/pos')}
        >
          New Sale
        </Button>
      </div>

      {/* Filters */}
      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by invoice number or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </Select>

          <Button
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={loadOrders}
          >
            Refresh List
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredOrders}
        emptyMessage="No sales invoices found. Open POS terminal to create new sales orders."
      />

      {/* Printable Invoice Modal */}
      {selectedOrderForPrint && (
        <PrintableInvoice
          isOpen={!!selectedOrderForPrint}
          order={selectedOrderForPrint}
          onClose={() => setSelectedOrderForPrint(null)}
        />
      )}

      {/* Confirm Cancellation Dialog */}
      <ConfirmDialog
        isOpen={!!orderToCancel}
        title="Cancel Sales Order"
        message={`Are you sure you want to cancel order ${orderToCancel?.invoiceNo}? This will restock all products back into inventory.`}
        confirmText="Cancel & Restock"
        confirmVariant="danger"
        isLoading={isProcessing}
        onConfirm={handleCancelOrder}
        onClose={() => setOrderToCancel(null)}
      />
    </div>
  );
};

export default OrdersPage;
