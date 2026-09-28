import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { Zap, Printer, X } from 'lucide-react';
import Button from '../common/Button.jsx';
import Modal from '../common/Modal.jsx';

export const PrintableInvoice = ({
  isOpen,
  onClose,
  order,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const isQuotation = order.type === 'QUOTATION';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" showClose={false}>
      {/* Top action toolbar (hidden on print) */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 no-print">
        <span className="text-sm font-bold text-slate-700">
          {isQuotation ? 'Quotation Preview' : 'Sales Invoice Preview'}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Print Receipt
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>

      {/* Actual Printable Invoice Document */}
      <div id="printable-slip" className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl text-slate-900 font-sans">
        {/* Invoice Header */}
        <div className="flex items-start justify-between border-b pb-6 mb-6 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
              <Zap className="w-6 h-6 fill-slate-950 stroke-slate-950" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-950 tracking-tight">
                VOLT ELECTRIC STORE
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Hardware, Switchboards, Cables, Fans & Motors
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isQuotation ? 'ESTIMATION QUOTATION' : 'TAX / SALES INVOICE'}
            </div>
            <div className="text-lg font-black text-slate-900 font-mono">
              {order.invoiceNo || (isQuotation ? 'QUOTATION' : 'INV-DRAFT')}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Date: {formatDate(order.createdAt || new Date())}
            </div>
          </div>
        </div>

        {/* Customer & Sale Info */}
        <div className="grid grid-cols-2 gap-4 pb-6 mb-6 border-b border-slate-200 text-xs">
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Billed To:
            </span>
            <div className="font-bold text-sm text-slate-800">
              {order.customerId?.name || 'Walk-in Customer'}
            </div>
            {order.customerId?.phoneNo && (
              <div className="text-slate-600">Tel: {order.customerId.phoneNo}</div>
            )}
            {order.customerId?.address && (
              <div className="text-slate-500">{order.customerId.address}</div>
            )}
          </div>

          <div className="text-right">
            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Transaction Details:
            </span>
            <div>Sale Type: <span className="font-semibold uppercase">{order.saleType || 'RETAIL'}</span></div>
            <div>Status: <span className="font-bold uppercase text-amber-600">{order.status || 'PENDING'}</span></div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-left text-xs mb-6">
          <thead>
            <tr className="border-b border-slate-300 text-slate-500 font-bold uppercase tracking-wider">
              <th className="py-2">Item Description</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Rate</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {order.items?.map((item, idx) => {
              const pName = item.productId?.name || item.name || `Product #${idx + 1}`;
              const pBrand = item.productId?.brand || '';
              const lineTotal = (item.unitPrice || 0) * (item.quantity || 1);

              return (
                <tr key={idx} className="py-2">
                  <td className="py-2.5">
                    <span className="font-bold text-slate-800">{pName}</span>
                    {pBrand && <span className="text-[11px] text-slate-500 ml-1">({pBrand})</span>}
                  </td>
                  <td className="py-2.5 text-center">{item.quantity}</td>
                  <td className="py-2.5 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2.5 text-right font-mono font-bold">{formatCurrency(lineTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pricing Summary */}
        <div className="flex justify-end mb-6">
          <div className="w-64 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-medium">{formatCurrency(order.subtotal)}</span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount ({order.discountType}):</span>
                <span className="font-mono">-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Price:</span>
              <span className="font-mono">{formatCurrency(order.totalPrice)}</span>
            </div>

            {!isQuotation && (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>Paid Amount:</span>
                  <span className="font-mono">{formatCurrency(order.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-bold pt-1 border-t border-dashed border-slate-200">
                  <span>Remaining Due:</span>
                  <span className="font-mono">{formatCurrency(order.amountDue)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-400">
          <p>Thank you for your business! Goods once sold can be exchanged within 3 days with this invoice.</p>
          <p className="mt-0.5">Volt Electric Store Management System &bull; Powered by VoltManage</p>
        </div>
      </div>
    </Modal>
  );
};

export default PrintableInvoice;
