import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  UserCheck,
  UserPlus,
  Mail,
  Lock,
  User,
  Upload,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import authService from '../../api/authService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getErrorMessage, formatDate } from '../../utils/formatters.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Modal from '../../components/common/Modal.jsx';
import Table from '../../components/common/Table.jsx';
import Badge from '../../components/common/Badge.jsx';
import Card from '../../components/common/Card.jsx';

export const StaffPage = () => {
  const [staffList, setStaffList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('volt_staff') || '[]');
    } catch {
      return [];
    }
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    if (!selectedFile) {
      toast.error('Please upload an avatar image for the cashier staff member');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', data.username.trim());
      formData.append('email', data.email.trim());
      formData.append('password', data.password);
      formData.append('avatar', selectedFile);

      const response = await authService.registerStaff(formData);
      const cashier = response.data?.cashier || response.data;
      toast.success('Cashier account created successfully!');

      const updated = [cashier, ...staffList];
      setStaffList(updated);
      localStorage.setItem('volt_staff', JSON.stringify(updated));

      reset();
      setSelectedFile(null);
      setAvatarPreview(null);
      setShowCreateModal(false);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create staff member'));
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: 'username',
      header: 'Cashier Staff Member',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          {row.avatar ? (
            <img
              src={row.avatar}
              alt={val}
              className="w-9 h-9 rounded-xl object-cover border border-slate-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs uppercase">
              {val?.slice(0, 2) || 'CS'}
            </div>
          )}
          <div>
            <div className="font-bold text-slate-900">{val}</div>
            <div className="text-xs text-slate-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Assigned Role',
      render: (val) => <Badge variant="info">{val || 'CASHIER'}</Badge>,
    },
    {
      key: 'createdAt',
      header: 'Created On',
      render: (val) => (
        <span className="text-xs text-slate-500">{formatDate(val)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Access Status',
      render: () => (
        <Badge variant="success" size="sm">
          Active Store Access
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-amber-500" />
            Cashier Staff Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Owner Portal: Onboard store cashiers with individual login credentials linked to your shop.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          Create Cashier Account
        </Button>
      </div>

      <Card bodyClassName="p-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Shield className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Cashiers have permissions to search products, process POS sales invoices, manage customer credit accounts, and query the AI voice assistant. Only Owners can onboard staff.
          </span>
        </div>
      </Card>

      <Table
        columns={columns}
        data={staffList}
        emptyMessage="No cashier accounts registered yet. Click 'Create Cashier Account' to onboard staff."
      />

      {/* Staff creation modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Onboard Store Cashier"
        description="Provide login credentials and profile photo for the new store attendant."
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Cashier Username"
            placeholder="e.g. bilal_cashier"
            leftIcon={<User className="w-4 h-4" />}
            error={errors.username?.message}
            {...register('username', {
              required: 'Username is required',
              minLength: { value: 3, message: 'Minimum 3 characters' },
            })}
          />

          <Input
            label="Cashier Email"
            type="email"
            placeholder="e.g. bilal@gmail.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email address',
              },
            })}
          />

          <Input
            label="Initial Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' },
            })}
          />

          {/* Avatar file upload */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Staff Profile Photo <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload className="w-5 h-5 text-slate-400" />
                )}
              </div>

              <div>
                <input
                  type="file"
                  id="staff-avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <label
                  htmlFor="staff-avatar"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-sm transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedFile ? 'Change Photo' : 'Upload Avatar'}</span>
                </label>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Images under 5MB only
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Create Cashier Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffPage;
