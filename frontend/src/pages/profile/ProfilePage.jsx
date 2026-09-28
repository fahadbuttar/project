import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  UserCog,
  Lock,
  Mail,
  User,
  Shield,
  KeyRound,
  Store,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import authService from '../../api/authService.js';
import { getErrorMessage, formatDate } from '../../utils/formatters.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

export const ProfilePage = () => {
  const { user, isOwner, isAdmin, isCashier } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmitPassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password updated successfully!');
      reset();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update password'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <UserCog className="w-6 h-6 text-amber-500" />
          My Profile & Security
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View your store role credentials and update your account security password.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: User Profile Card */}
        <div className="md:col-span-1 space-y-4">
          <Card bodyClassName="p-6 text-center">
            <div className="relative inline-block mx-auto mb-4">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-400 shadow-md mx-auto"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-2xl uppercase mx-auto shadow-md">
                  {user?.username?.slice(0, 2) || 'US'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900">{user?.username}</h3>
            <p className="text-xs text-slate-500 mb-3">{user?.email}</p>

            <Badge
              variant={isAdmin ? 'danger' : isOwner ? 'primary' : 'info'}
              size="md"
            >
              {user?.role} ACCOUNT
            </Badge>

            <div className="mt-6 pt-4 border-t border-slate-100 text-left text-xs space-y-2 text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Store Tenant:</span>
                <span className="font-semibold text-slate-800">
                  {user?.shopId?.name || (isAdmin ? 'System Master' : 'Assigned Shop')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Account ID:</span>
                <span className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]">
                  {user?._id}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Password Change Form */}
        <div className="md:col-span-2">
          <Card
            title="Change Account Password"
            subtitle="Ensure your account is protected with a secure password"
          >
            <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.oldPassword?.message}
                {...register('oldPassword', {
                  required: 'Current password is required',
                })}
              />

              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<KeyRound className="w-4 h-4" />}
                error={errors.newPassword?.message}
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters' },
                })}
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<KeyRound className="w-4 h-4" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Please confirm new password',
                  validate: (val) =>
                    val === watch('newPassword') || 'Passwords do not match',
                })}
              />

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
