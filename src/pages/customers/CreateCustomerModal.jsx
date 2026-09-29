import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import customerService from '../../api/customerService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getErrorMessage } from '../../utils/formatters.js';
import { User, Phone, MapPin } from 'lucide-react';

export const CreateCustomerModal = ({ isOpen, onClose, onCreated }) => {
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
      phoneNo: '',
      address: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name.trim(),
        phoneNo: data.phoneNo.trim(),
        address: data.address ? data.address.trim() : '',
      };

      const response = await customerService.createCustomer(payload);
      const newCustomer = response.data?.customer || response.data;
      toast.success('Customer registered successfully!');
      reset();
      onClose();
      if (onCreated) onCreated(newCustomer);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create customer'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Customer"
      description="Record customer profile for invoicing, credit balance ledger, and delivery records."
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Customer Full Name"
          placeholder="e.g. Haji Muhammad Aslam"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.name?.message}
          {...register('name', {
            required: 'Customer name is required',
            minLength: { value: 3, message: 'Minimum 3 characters' },
          })}
        />

        <Input
          label="Mobile Number (11 Digits)"
          placeholder="e.g. 03001234567"
          leftIcon={<Phone className="w-4 h-4" />}
          error={errors.phoneNo?.message}
          helperText="Must be exactly 11 digits numeric"
          {...register('phoneNo', {
            required: 'Phone number is required',
            pattern: {
              value: /^[0-9]{11}$/,
              message: 'Must be exactly 11 digits (e.g. 03001234567)',
            },
          })}
        />

        <Input
          label="Address (Optional)"
          placeholder="e.g. Street 4, Bilal Town, Lahore"
          leftIcon={<MapPin className="w-4 h-4" />}
          error={errors.address?.message}
          {...register('address')}
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Save Customer
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateCustomerModal;
