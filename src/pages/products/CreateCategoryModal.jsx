import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import categoryService from '../../api/categoryService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getErrorMessage } from '../../utils/formatters.js';
import { Tags } from 'lucide-react';

export const CreateCategoryModal = ({ isOpen, onClose, onCreated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await categoryService.createCategory({
        name: data.name.trim(),
        description: data.description.trim(),
      });
      const newCat = response.data?.category || response.data;
      toast.success('Category created successfully!');
      reset();
      onClose();
      if (onCreated) onCreated(newCat);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create category'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Product Category"
      description="Organize your electric store items by categories (e.g. Cables, Fans, Switches, Breakers)"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Category Name"
          placeholder="e.g. Copper Cables"
          leftIcon={<Tags className="w-4 h-4" />}
          error={errors.name?.message}
          {...register('name', {
            required: 'Category name is required',
            minLength: { value: 2, message: 'Minimum 2 characters' },
          })}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Description (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Heavy duty and domestic wiring electrical cables"
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
            {...register('description')}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Save Category
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateCategoryModal;
