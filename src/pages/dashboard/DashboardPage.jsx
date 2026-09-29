import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Boxes,
  AlertTriangle,
  Receipt,
  ShoppingCart,
  Zap,
  Mic,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import productService from '../../api/productService.js';
import orderService from '../../api/orderService.js';
import StatCard from '../../components/ui/StatCard.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Table from '../../components/common/Table.jsx';
import StockAdjustModal from '../products/StockAdjustModal.jsx';
import CreateProductModal from '../products/CreateProductModal.jsx';
import PrintableInvoice from '../../components/ui/PrintableInvoice.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export const DashboardPage = () => {
  const { user, isOwner, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState(null);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Query low stock items
  const {
    data: lowStockData,
    isLoading: isLoadingLowStock,
    refetch: refetchLowStock,
  } = useQuery({
    queryKey: ['lowStock'],
    queryFn: () => productService.getLowStock(),
  });

  // Query products count
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['productsSummary'],
    queryFn: () => productService.searchProducts(),
  });

  const recentOrders = orderService.getCachedOrders().slice(0, 5);
  const lowStockItems = lowStockData?.products || [];
  const lowStockCount = lowStockData?.count || 0;
  const totalProducts = productsData?.products?.length || 0;

  const handleRefreshAll = () => {
    refetchLowStock();
    refetchProducts();
  };

  const lowStockColumns = [
    {
      key: 'name',
      header: 'Product Name',
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-900">{val}</span>
          <div className="text-xs text-slate-500">{row.brand}</div>
        </div>
      ),
    },
    {
      key: 'stockQuantity',
      header: 'Current Stock',
      render: (val, row) => (
        <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
          {val} {row.unit}
        </span>
      ),
    },
    {
      key: 'minStockThreshold',
      header: 'Threshold',
      render: (val, row) => (
        <span className="font-mono text-slate-600">
          {val} {row.unit}
        </span>
      ),
    },
    {
      key: 'retailPrice',
      header: 'Retail Rate',
      render: (val) => <span className="font-mono">{formatCurrency(val)}</span>,
    },
    {
      key: 'actions',
      header: 'Quick Action',
      className: 'text-right',
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          className="text-xs"
          onClick={() => setSelectedProductForAdjust(row)}
        >
          Adjust Stock
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/80 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{user?.shopId?.name || 'Volt Electric Operations'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Monitor your hardware inventory, execute retail & wholesale POS billing, and review automated stock levels.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={handleRefreshAll}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              leftIcon={<ShoppingCart className="w-4 h-4 fill-slate-950" />}
              onClick={() => navigate('/pos')}
            >
              Open POS
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Products Catalog"
          value={isLoadingProducts ? '...' : totalProducts}
          subtitle="Active SKU inventory items"
          icon={Boxes}
          variant="blue"
          onClick={() => navigate('/products')}
        />

        <StatCard
          title="Low Stock Alerts"
          value={isLoadingLowStock ? '...' : lowStockCount}
          subtitle="Items below safety threshold"
          icon={AlertTriangle}
          variant={lowStockCount > 0 ? 'danger' : 'success'}
        />

        <StatCard
          title="Recent Invoices"
          value={recentOrders.length}
          subtitle="Completed sales in session"
          icon={Receipt}
          variant="default"
          onClick={() => navigate('/orders')}
        />

        <StatCard
          title="AI Assistant"
          value="Urdu / Eng"
          subtitle="Voice stock search active"
          icon={Mic}
          variant="default"
          onClick={() => navigate('/ai-assistant')}
        />
      </div>

      {/* Main Content Split: Low Stock Alerts + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Low Stock Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="Low Stock Inventory Alerts"
            subtitle="Products that have reached or dropped below their minimum threshold"
            action={
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setShowCreateProduct(true)}
              >
                Add Product
              </Button>
            }
          >
            <Table
              columns={lowStockColumns}
              data={lowStockItems}
              isLoading={isLoadingLowStock}
              emptyMessage="All products are well-stocked above their minimum thresholds!"
            />
          </Card>
        </div>

        {/* Right 1 Col: Quick Links & Recent Sales */}
        <div className="space-y-6">
          <Card title="Quick Store Actions" subtitle="Frequently used shortcuts">
            <div className="space-y-2.5">
              <button
                onClick={() => navigate('/pos')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500 text-slate-950 font-bold">
                    <ShoppingCart className="w-4 h-4 fill-slate-950" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">New POS Sale</div>
                    <div className="text-[11px] text-slate-500">Retail & Wholesale billing</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/quotations')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-white font-bold">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Quotations</div>
                    <div className="text-[11px] text-slate-500">Cost estimates & conversion</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/ai-assistant')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sky-600 text-white font-bold">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">AI Voice Assistant</div>
                    <div className="text-[11px] text-slate-500">Speak in Urdu or English</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-sky-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/inventory/logs')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-700 text-white font-bold">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Stock Audit Logs</div>
                    <div className="text-[11px] text-slate-500">Full audit history & trail</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Card>

          {/* Recent Orders Mini Card */}
          <Card title="Recent Invoices" subtitle="Latest session sales">
            {recentOrders.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No orders recorded yet. Open POS to make a sale.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentOrders.map((ord, idx) => (
                  <div
                    key={ord._id || idx}
                    className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 px-2 rounded-lg transition-colors"
                    onClick={() => setSelectedInvoice(ord)}
                  >
                    <div>
                      <div className="text-xs font-bold font-mono text-slate-800">
                        {ord.invoiceNo || 'INV-SALES'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {formatDate(ord.createdAt, false)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900 font-mono">
                        {formatCurrency(ord.totalPrice)}
                      </div>
                      <Badge
                        size="sm"
                        variant={
                          ord.status === 'DELIVERED'
                            ? 'success'
                            : ord.status === 'CANCELLED'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {ord.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Stock Adjust Modal */}
      {selectedProductForAdjust && (
        <StockAdjustModal
          isOpen={!!selectedProductForAdjust}
          product={selectedProductForAdjust}
          onClose={() => setSelectedProductForAdjust(null)}
          onAdjusted={() => {
            refetchLowStock();
            refetchProducts();
          }}
        />
      )}

      {/* Create Product Modal */}
      {showCreateProduct && (
        <CreateProductModal
          isOpen={showCreateProduct}
          onClose={() => setShowCreateProduct(false)}
          onCreated={() => {
            refetchProducts();
            refetchLowStock();
          }}
        />
      )}

      {/* Printable Invoice Modal */}
      {selectedInvoice && (
        <PrintableInvoice
          isOpen={!!selectedInvoice}
          order={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
