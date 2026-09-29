import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import CreateCategoryModal from './CreateCategoryModal.jsx';
import productService from '../../api/productService.js';
import categoryService from '../../api/categoryService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getErrorMessage } from '../../utils/formatters.js';
import { Plus } from 'lucide-react';

export const CreateProductModal = ({ isOpen, onClose, onCreated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      brand: '',
      category: '',
      unit: 'pcs',
      costPrice: '',
      retailPrice: '',
      wholesalePrice: '',
      stockQuantity: '',
      minStockThreshold: '5',
      description: '',
    },
  });

  const loadCategories = () => {
    const cached = categoryService.getCachedCategories();
    setCategories(cached);
  };

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const handleCategoryCreated = (newCat) => {
    loadCategories();
    if (newCat?._id) {
      setValue('category', newCat._id);
    }
  };

  const onSubmit = async (data) => {
    if (!data.category) {
      toast.error('Please select a category or create a new one');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: data.name.trim(),
        brand: data.brand.trim(),
        category: data.category,
        unit: data.unit.trim().toLowerCase(),
        costPrice: Number(data.costPrice),
        retailPrice: Number(data.retailPrice),
        wholesalePrice: data.wholesalePrice ? Number(data.wholesalePrice) : 0,
        stockQuantity: Number(data.stockQuantity),
        minStockThreshold: Number(data.minStockThreshold),
        description: data.description ? data.description.trim() : '',
      };

      const response = await productService.createProduct(payload);
      const newProduct = response.data?.product || response.data;
      toast.success('Product created successfully!');
      reset();
      onClose();
      if (onCreated) onCreated(newProduct);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create product'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Add New Inventory Product"
        description="Add a new electrical hardware item with cost, retail, and wholesale pricing."
        size="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              placeholder="e.g. 7/29 Copper Wire Cable"
              error={errors.name?.message}
              {...register('name', { required: 'Product name is required' })}
            />

            <Input
              label="Brand / Manufacturer"
              placeholder="e.g. Pakistan Cables, Pak Fans, Clipsal"
              error={errors.brand?.message}
              {...register('brand', { required: 'Brand is required' })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Category <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New Category
                </button>
              </div>
              <Select
                placeholder="-- Select Category --"
                error={errors.category?.message}
                {...register('category', { required: 'Category is required' })}
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <Select
              label="Measuring Unit"
              {...register('unit', { required: 'Unit is required' })}
            >
              <option value="pcs">Pieces (pcs)</option>
              <option value="meter">Meters (m)</option>
              <option value="coil">Coil (coil)</option>
              <option value="box">Box (box)</option>
              <option value="packet">Packet (pkt)</option>
              <option value="feet">Feet (ft)</option>
              <option value="set">Set (set)</option>
            </Select>
          </div>

          {/* Pricing Grid */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Pricing Structure (PKR)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Cost Price (Buy)"
                type="number"
                step="any"
                placeholder="0"
                error={errors.costPrice?.message}
                {...register('costPrice', {
                  required: 'Cost price is required',
                  min: { value: 0, message: 'Cannot be negative' },
                })}
              />

              <Input
                label="Retail Price (Sell)"
                type="number"
                step="any"
                placeholder="0"
                error={errors.retailPrice?.message}
                {...register('retailPrice', {
                  required: 'Retail price is required',
                  min: { value: 0, message: 'Cannot be negative' },
                })}
              />

              <Input
                label="Wholesale Price"
                type="number"
                step="any"
                placeholder="Optional"
                error={errors.wholesalePrice?.message}
                {...register('wholesalePrice', {
                  min: { value: 0, message: 'Cannot be negative' },
                })}
              />
            </div>
          </div>

          {/* Inventory Stock Levels */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Stock & Thresholds
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Initial Stock Quantity"
                type="number"
                placeholder="0"
                error={errors.stockQuantity?.message}
                {...register('stockQuantity', {
                  required: 'Stock quantity is required',
                  min: { value: 0, message: 'Cannot be negative' },
                })}
              />

              <Input
                label="Low Stock Alert Threshold"
                type="number"
                placeholder="5"
                error={errors.minStockThreshold?.message}
                helperText="Triggers low stock alert when inventory reaches this level"
                {...register('minStockThreshold', {
                  required: 'Threshold is required',
                  min: { value: 0, message: 'Cannot be negative' },
                })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-2">
            <label className="text-xs font-semibold text-slate-700">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 99.9% pure copper, 250/440V grade"
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
              {...register('description')}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Create Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* Embedded Sub-Modal to quickly create Category if missing */}
      <CreateCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCreated={handleCategoryCreated}
      />
    </>
  );
};

export default CreateProductModal;
