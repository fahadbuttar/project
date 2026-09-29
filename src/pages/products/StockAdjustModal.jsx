import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import productService from '../../api/productService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getErrorMessage } from '../../utils/formatters.js';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StockAdjustModal = ({ isOpen, onClose, product, onAdjusted }) => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: 'add', // 'add' | 'subtract'
      amount: '',
      reason: '',
    },
  });

  if (!product) return null;

  const watchType = watch('type');
  const watchAmount = Number(watch('amount')) || 0;
  const delta = watchType === 'subtract' ? -watchAmount : watchAmount;
  const projectedStock = (product.stockQuantity || 0) + delta;

  const onSubmit = async (data) => {
    const rawAmount = Number(data.amount);
    if (!rawAmount || rawAmount <= 0) {
      toast.error('Adjustment quantity must be greater than 0');
      return;
    }

    const quantityDelta = data.type === 'subtract' ? -rawAmount : rawAmount;

    if (projectedStock < 0) {
      toast.error(`Cannot reduce stock below 0. Current stock is ${product.stockQuantity}`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await productService.adjustStock(product._id, {
        quantityDelta,
        reason: data.reason.trim(),
      });
      const updated = response.data?.updatestock || response.data;
      toast.success('Stock quantity adjusted successfully!');
      reset();
      onClose();
      if (onAdjusted) onAdjusted(updated);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to adjust stock'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Product Inventory Stock"
      description={`Manually increment or decrement stock units for ${product.name}`}
      size="md"
    >
      <div className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Current In-Stock:</span>
          <span>Projected In-Stock:</span>
        </div>
        <div className="flex items-center justify-between font-mono font-bold">
          <span className="text-lg text-slate-800">
            {product.stockQuantity} {product.unit}
          </span>
          <span
            className={`text-lg ${
              projectedStock < 0
                ? 'text-rose-600'
                : delta > 0
                ? 'text-emerald-600'
                : delta < 0
                ? 'text-amber-600'
                : 'text-slate-800'
            }`}
          >
            {projectedStock} {product.unit}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Adjustment Type"
            {...register('type', { required: true })}
          >
            <option value="add">+ Add Stock (Purchase / Restock)</option>
            <option value="subtract">- Reduce Stock (Damage / Lost / Audit)</option>
          </Select>

          <Input
            label="Quantity"
            type="number"
            min="1"
            placeholder="e.g. 10"
            error={errors.amount?.message}
            {...register('amount', {
              required: 'Quantity is required',
              min: { value: 1, message: 'Minimum 1 unit' },
            })}
          />
        </div>

        <Input
          label="Audit Reason"
          placeholder="e.g. Received shipment #402, or Damaged during unloading"
          error={errors.reason?.message}
          {...register('reason', {
            required: 'Reason is strictly required for stock audit history',
            minLength: { value: 3, message: 'Minimum 3 characters' },
          })}
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={watchType === 'subtract' ? 'danger' : 'primary'}
            isLoading={isLoading}
          >
            Confirm Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StockAdjustModal;
