import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import {
  Zap,
  Store,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Upload,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';

export const RegisterPage = () => {
  const { register: registerOwner } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      shopName: '',
      contactNo: '',
      address: '',
    },
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files (JPEG, PNG, WEBP) are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Avatar file size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    if (!selectedFile) {
      toast.error('Please upload an avatar profile photo');
      return;
    }

    setIsLoading(true);
    setServerError('');

    const formData = new FormData();
    formData.append('username', data.username.trim());
    formData.append('email', data.email.trim());
    formData.append('password', data.password);
    formData.append('shopName', data.shopName.trim());
    formData.append('contactNo', data.contactNo.trim());
    formData.append('address', data.address.trim());
    formData.append('avatar', selectedFile);

    const result = await registerOwner(formData);
    setIsLoading(false);

    if (result.success) {
      toast.success(result.message || 'Store and Owner account created successfully!');
      navigate('/dashboard', { replace: true });
    } else {
      setServerError(result.error);
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 flex items-center justify-center p-4 sm:p-6 py-10">
      <div className="max-w-2xl w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-amber-500 items-center justify-center text-slate-950 font-black shadow-xl shadow-amber-500/20 mb-4">
            <Zap className="w-8 h-8 fill-slate-950 stroke-slate-950" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Register Your Electric Store
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create your store tenant and owner administrative profile.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
          {serverError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div className="leading-snug">{serverError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Section 1: Store Details */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-3 flex items-center gap-1.5">
                <Store className="w-4 h-4" />
                Store Business Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Shop / Business Name"
                  placeholder="e.g. Al-Madina Electric Store"
                  leftIcon={<Store className="w-4 h-4" />}
                  error={errors.shopName?.message}
                  {...register('shopName', {
                    required: 'Shop name is required',
                    minLength: { value: 3, message: 'Minimum 3 characters' },
                  })}
                />

                <Input
                  label="Contact Number (11 Digits)"
                  placeholder="e.g. 03001234567"
                  leftIcon={<Phone className="w-4 h-4" />}
                  error={errors.contactNo?.message}
                  helperText="Must be 11 numeric digits"
                  {...register('contactNo', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9]{11}$/,
                      message: 'Must be exactly 11 digits (e.g. 03001234567)',
                    },
                  })}
                />

                <div className="sm:col-span-2">
                  <Input
                    label="Store Physical Address"
                    placeholder="e.g. Shop #12, Electric Market, Hall Road, Lahore"
                    leftIcon={<MapPin className="w-4 h-4" />}
                    error={errors.address?.message}
                    {...register('address', {
                      required: 'Address is required',
                      minLength: { value: 5, message: 'Please provide full address' },
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Owner Credentials */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-3 flex items-center gap-1.5">
                <User className="w-4 h-4" />
                Store Owner Credentials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Username"
                  placeholder="e.g. tariq_electric"
                  leftIcon={<User className="w-4 h-4" />}
                  error={errors.username?.message}
                  {...register('username', {
                    required: 'Username is required',
                    minLength: { value: 3, message: 'Minimum 3 characters' },
                  })}
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. tariq@gmail.com"
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

                <div className="sm:col-span-2">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    leftIcon={<Lock className="w-4 h-4" />}
                    error={errors.password?.message}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Minimum 6 characters' },
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Profile Avatar Upload */}
            <div className="pt-4 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Owner Profile Avatar <span className="text-rose-500">*</span>
              </label>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 shrink-0">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div className="flex-1">
                  <input
                    type="file"
                    id="avatar-input"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-input"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-sm transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedFile ? 'Change Photo' : 'Upload Photo'}</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Image (JPG, PNG, WEBP), max 5MB. Cloudinary cloud hosted.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Complete Registration & Open Store
            </Button>
          </form>

          {/* Login link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-amber-600 hover:text-amber-700 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
