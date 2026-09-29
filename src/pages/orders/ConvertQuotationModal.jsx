import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import orderService from '../../api/orderService.js';
import customerService from '../../api/customerService.js';
import CreateCustomerModal from '../customers/CreateCustomerModal.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatCurrency, getErrorMessage } from '../../utils/formatters.js';
import { ArrowRight, User } from 'lucide-react';

export const ConvertQuotationModal = ({
  isOpen,
  onClose,
  quotation,
  onConverted,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      paidAmount: '0',
      customerId: '',
    },
  });

  useEffect(() => {
    setCustomers(customerService.getCachedCustomers());
    if (quotation) {
      setValue('paidAmount', quotation.totalPrice.toString());
    }
  }, [quotation, setValue]);

  if (!quotation) return null;

  const watchPaid = Number(watch('paidAmount')) || 0;
  const due = Math.max(0, quotation.totalPrice - watchPaid);

  const onSubmit = async (data) => {
    const paid = Number(data.paidAmount);
    if (paid < 0 || paid > quotation.totalPrice) {
      toast.error(`Paid amount must be between 0 and ${quotation.totalPrice}`);
      return;
    }

    if (due > 0 && !data.customerId) {
      toast.error('Customer is required when there is a remaining balance due.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        paidAmount: paid,
        customerId: data.customerId || undefined,
      };

      const response = await orderService.convertQuotationToInvoice(quotation._id, payload);
      const createdOrder = response.data?.createOrder || response.data;
      toast.success('Quotation converted to official Sales Invoice successfully!');
      reset();
      onClose();
      if (onConverted) onConverted(createdOrder);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to convert quotation'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Convert Quotation to Official Invoice"
        description="This will finalize the sale, verify stock, deduct inventory quantities, and issue a sales invoice."
        size="md"
      >
        <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-center justify-between text-xs text-amber-900 font-medium">
            <span>Quotation Total:</span>
            <span className="text-base font-black font-mono">
              {formatCurrency(quotation.totalPrice)}
            </span>
          </div>
          <div className="text-[11px] text-amber-800 mt-1">
            Items: {quotation.items?.length || 0} products &bull; Sale Type: {quotation.saleType}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Paid Amount (PKR)"
            type="number"
            min="0"
            max={quotation.totalPrice}
            step="any"
            error={errors.paidAmount?.message}
            {...register('paidAmount', {
              required: 'Paid amount is required',
              min: { value: 0, message: 'Cannot be negative' },
            })}
          />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Customer {due > 0 && <span className="text-rose-500 font-bold">* (Credit Due)</span>}
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
              placeholder="Walk-in Customer (Paid in Full)"
              error={errors.customerId?.message}
              {...register('customerId', {
                validate: (val) => {
                  if (due > 0 && !val) {
                    return 'Customer is mandatory for credit balances';
                  }
                  return true;
                },
              })}
            >
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.phoneNo})
                </option>
              ))}
            </Select>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border text-xs space-y-1">
            <div className="flex justify-between font-bold text-slate-700">
              <span>Total Price:</span>
              <span className="font-mono">{formatCurrency(quotation.totalPrice)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-700">
              <span>Paid:</span>
              <span className="font-mono">{formatCurrency(watchPaid)}</span>
            </div>
            <div className={`flex justify-between font-bold pt-1 border-t ${due > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              <span>Remaining Due:</span>
              <span className="font-mono">{formatCurrency(due)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Generate Official Invoice
            </Button>
          </div>
        </form>
      </Modal>

      <CreateCustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onCreated={(cust) => {
          setCustomers(customerService.getCachedCustomers());
          setValue('customerId', cust._id);
        }}
      />
    </>
  );
};

export default ConvertQuotationModal;
