import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  FileSpreadsheet,
  User,
  Tags,
  AlertCircle,
  CheckCircle,
  Boxes,
  Zap,
} from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import productService from '../../api/productService.js';
import orderService from '../../api/orderService.js';
import customerService from '../../api/customerService.js';
import categoryService from '../../api/categoryService.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import Badge from '../../components/common/Badge.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import PrintableInvoice from '../../components/ui/PrintableInvoice.jsx';
import CreateCustomerModal from '../customers/CreateCustomerModal.jsx';
import { formatCurrency, getErrorMessage } from '../../utils/formatters.js';

export const PosPage = () => {
  const toast = useToast();
  const {
    items,
    saleType,
    discountType,
    discountValue,
    paidAmount,
    selectedCustomer,
    subtotal,
    discountAmount,
    totalPrice,
    amountDue,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setSaleType,
    setDiscountType,
    setDiscountValue,
    setPaidAmount,
    setSelectedCustomer,
  } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Load categories and customers
  useEffect(() => {
    setCategories(categoryService.getCachedCategories());
    setCustomers(customerService.getCachedCustomers());
  }, []);

  // Fetch products based on search and category
  const { data: productData, isLoading: isLoadingProducts, refetch } = useQuery({
    queryKey: ['posProducts', searchQuery, selectedCategory],
    queryFn: () =>
      productService.searchProducts({
        search: searchQuery,
        category: selectedCategory,
      }),
  });

  const products = productData?.products || [];

  const handleCustomerCreated = (newCust) => {
    setCustomers(customerService.getCachedCustomers());
    setSelectedCustomer(newCust);
  };

  // Submit official sale order
  const handleCheckoutSale = async () => {
    if (items.length === 0) {
      toast.error('Cart is empty. Please add products to check out.');
      return;
    }

    if (amountDue > 0 && !selectedCustomer?._id) {
      toast.error('Credit Sale: A customer is required when there is a remaining balance due.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.product._id,
          quantity: i.quantity,
        })),
        saleType,
        discountType,
        discountValue: Number(discountValue) || 0,
        paidAmount: Number(paidAmount) || 0,
        customerId: selectedCustomer?._id || undefined,
      };

      const response = await orderService.createOrder(payload);
      const createdOrder = response.data?.createOrder || response.data;
      toast.success(`Invoice created successfully: ${createdOrder.invoiceNo || 'INV'}`);
      setCompletedOrder(createdOrder);
      clearCart();
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to process sale order'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit estimation quotation
  const handleSaveQuotation = async () => {
    if (items.length === 0) {
      toast.error('Cart is empty. Add products to create quotation.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.product._id,
          quantity: i.quantity,
        })),
        saleType,
        discountType,
        discountValue: Number(discountValue) || 0,
      };

      const response = await orderService.createQuotation(payload);
      const createdQuotation = response.data?.quotation || response.data;
      toast.success('Quotation draft saved successfully!');
      setCompletedOrder(createdQuotation);
      clearCart();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save quotation'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            Point of Sale Terminal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time retail & wholesale checkout with instant receipt printing.
          </p>
        </div>

        {/* Sale Type Switcher */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setSaleType('RETAIL')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              saleType === 'RETAIL'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Retail Sale
          </button>
          <button
            onClick={() => setSaleType('WHOLESALE')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              saleType === 'WHOLESALE'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Wholesale Rate
          </button>
        </div>
      </div>

      {/* Main Terminal Split: Left Products Catalog (60%), Right Cart & Billing (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Product Selector */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search products by name or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                className="py-1.5"
              />
            </div>
            <div>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-1.5"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Product Items Grid */}
          {isLoadingProducts ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 flex items-center justify-center">
              <Spinner size="lg" label="Loading product inventory..." />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <Boxes className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No products found</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Try searching for something else or add new products in the Products page.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[620px] overflow-y-auto pr-1">
              {products.map((prod) => {
                const activePrice =
                  saleType === 'WHOLESALE'
                    ? prod.wholesalePrice || prod.retailPrice
                    : prod.retailPrice;

                const isOutOfStock = prod.stockQuantity <= 0;
                const isLowStock = prod.stockQuantity <= prod.minStockThreshold;

                return (
                  <div
                    key={prod._id}
                    onClick={() => !isOutOfStock && addItem(prod, 1)}
                    className={`bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between transition-all ${
                      isOutOfStock
                        ? 'opacity-60 cursor-not-allowed bg-slate-50'
                        : 'cursor-pointer hover:border-amber-400 hover:shadow-md active:scale-[0.99]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {prod.brand}
                        </span>
                        <Badge
                          size="sm"
                          variant={isOutOfStock ? 'danger' : isLowStock ? 'warning' : 'success'}
                        >
                          {prod.stockQuantity} {prod.unit}
                        </Badge>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {prod.name}
                      </h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-base font-extrabold text-slate-900 font-mono">
                        {formatCurrency(activePrice)}
                        <span className="text-[11px] font-normal text-slate-500 ml-1">
                          /{prod.unit}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold transition-colors disabled:opacity-40"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Cart, Pricing, and Checkout */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-lg p-5 space-y-5 sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Current Cart</h3>
              <p className="text-xs text-slate-500">
                {items.length} item{items.length === 1 ? '' : 's'} added
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Cart is empty. Select products from the catalog to start billing.
              </div>
            ) : (
              items.map((item) => {
                const price =
                  saleType === 'WHOLESALE'
                    ? item.product.wholesalePrice || item.product.retailPrice
                    : item.product.retailPrice;
                const lineTotal = price * item.quantity;

                return (
                  <div key={item.product._id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {item.product.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {formatCurrency(price)} &times; {item.quantity} {item.product.unit}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        className="p-1 rounded bg-white text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stockQuantity}
                        className="p-1 rounded bg-white text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-xs font-bold text-slate-900 font-mono min-w-16 text-right">
                      {formatCurrency(lineTotal)}
                    </div>

                    <button
                      onClick={() => removeItem(item.product._id)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Customer Selection */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Customer {amountDue > 0 && <span className="text-rose-500 font-bold">* (Credit Due)</span>}
              </label>
              <button
                type="button"
                onClick={() => setShowCustomerModal(true)}
                className="text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                + New Customer
              </button>
            </div>

            <Select
              placeholder="Walk-in Customer (Cash Sale)"
              value={selectedCustomer?._id || ''}
              onChange={(e) => {
                const found = customers.find((c) => c._id === e.target.value);
                setSelectedCustomer(found || null);
              }}
              className="py-1.5 text-xs"
            >
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.phoneNo}) - Balance: {formatCurrency(c.remainingMoney)}
                </option>
              ))}
            </Select>
          </div>

          {/* Discount & Payment Controls */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Select
                label="Discount Type"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="py-1 text-xs"
              >
                <option value="NONE">None</option>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (PKR)</option>
              </Select>

              <Input
                label="Discount Value"
                type="number"
                min="0"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                disabled={discountType === 'NONE'}
                className="py-1 text-xs"
              />
            </div>

            <Input
              label="Paid Amount (Cash Received)"
              type="number"
              min="0"
              placeholder="0"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="py-1 text-xs font-mono font-bold"
            />
          </div>

          {/* Financial Totals Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-bold">{formatCurrency(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount ({discountType}):</span>
                <span className="font-mono">-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Grand Total:</span>
              <span className="font-mono text-base text-amber-600">
                {formatCurrency(totalPrice)}
              </span>
            </div>

            <div className="flex justify-between text-xs font-bold pt-1">
              <span className="text-slate-600">Paid:</span>
              <span className="font-mono">{formatCurrency(paidAmount)}</span>
            </div>

            <div
              className={`flex justify-between text-xs font-bold pt-1 border-t border-dashed border-slate-200 ${
                amountDue > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              <span>Balance Due:</span>
              <span className="font-mono">{formatCurrency(amountDue)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
              disabled={items.length === 0}
              onClick={handleCheckoutSale}
              leftIcon={<Receipt className="w-4 h-4 fill-slate-950" />}
            >
              Confirm Sale & Generate Invoice
            </Button>

            <Button
              variant="outline"
              size="md"
              className="w-full"
              isLoading={isSubmitting}
              disabled={items.length === 0}
              onClick={handleSaveQuotation}
              leftIcon={<FileSpreadsheet className="w-4 h-4" />}
            >
              Save as Estimation Quotation
            </Button>
          </div>
        </div>
      </div>

      {/* Customer Registration Modal */}
      <CreateCustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onCreated={handleCustomerCreated}
      />

      {/* Printable Invoice Modal upon successful sale or quotation */}
      {completedOrder && (
        <PrintableInvoice
          isOpen={!!completedOrder}
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
        />
      )}
    </div>
  );
};

export default PosPage;
