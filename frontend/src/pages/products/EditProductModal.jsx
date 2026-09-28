import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import productService from '../../api/productService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getErrorMessage } from '../../utils/formatters.js';

export const EditProductModal = ({ isOpen, onClose, product, onUpdated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (product) {
      reset({
        retailPrice: product.retailPrice,
        wholesalePrice: product.wholesalePrice || '',
        costPrice: product.costPrice,
        stockQuantity: product.stockQuantity,
        minStockThreshold: product.minStockThreshold,
      });
    }
  }, [product, reset]);

  if (!product) return null;

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        retailPrice: Number(data.retailPrice),
        wholesalePrice: data.wholesalePrice ? Number(data.wholesalePrice) : 0,
        costPrice: Number(data.costPrice),
        stockQuantity: Number(data.stockQuantity),
        minStockThreshold: Number(data.minStockThreshold),
      };

      const response = await productService.updateProduct(product._id, payload);
      const updated = response.data?.updatedProduct || response.data;
      toast.success('Product updated successfully!');
      onClose();
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update product'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Product Details"
      description={`Update pricing and inventory settings for ${product.name}`}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Cost Price (PKR)"
            type="number"
            step="any"
            error={errors.costPrice?.message}
            {...register('costPrice', {
              required: 'Cost price is required',
              min: { value: 0, message: 'Cannot be negative' },
            })}
          />

          <Input
            label="Retail Price (PKR)"
            type="number"
            step="any"
            error={errors.retailPrice?.message}
            {...register('retailPrice', {
              required: 'Retail price is required',
              min: { value: 0, message: 'Cannot be negative' },
            })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Wholesale Price"
            type="number"
            step="any"
            error={errors.wholesalePrice?.message}
            {...register('wholesalePrice', {
              min: { value: 0, message: 'Cannot be negative' },
            })}
          />

          <Input
            label="Stock Quantity"
            type="number"
            error={errors.stockQuantity?.message}
            {...register('stockQuantity', {
              required: 'Stock quantity is required',
              min: { value: 0, message: 'Cannot be negative' },
            })}
          />
        </div>

        <Input
          label="Low Stock Alert Threshold"
          type="number"
          error={errors.minStockThreshold?.message}
          {...register('minStockThreshold', {
            required: 'Threshold is required',
            min: { value: 0, message: 'Cannot be negative' },
          })}
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProductModal;
