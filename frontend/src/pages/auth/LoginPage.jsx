import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Zap, Lock, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';

export const LoginPage = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');

    // Backend takes { username, email, password }
    // Determine whether identifier is email or username
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.identifier.trim());
    const credentials = {
      password: data.password,
      ...(isEmail
        ? { email: data.identifier.trim() }
        : { username: data.identifier.trim() }),
    };

    const result = await login(credentials);
    setIsLoading(false);

    if (result.success) {
      toast.success(result.message || 'Welcome back!');
      navigate(from, { replace: true });
    } else {
      setServerError(result.error);
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        {/* Brand Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-amber-500 items-center justify-center text-slate-950 font-black shadow-xl shadow-amber-500/20 mb-4 animate-in zoom-in duration-300">
            <Zap className="w-8 h-8 fill-slate-950 stroke-slate-950" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            VoltManage POS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Electric Store Inventory & Billing System
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Sign In</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your credentials to access your store terminal.
            </p>
          </div>

          {serverError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div className="leading-snug">{serverError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Username or Email"
              placeholder="e.g. store_owner or user@gmail.com"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.identifier?.message}
              {...register('identifier', {
                required: 'Username or email is required',
              })}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 4,
                  message: 'Password must be at least 4 characters',
                },
              })}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Store
            </Button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New store owner?{' '}
              <Link
                to="/register"
                className="font-bold text-amber-600 hover:text-amber-700 transition-colors"
              >
                Register Your Shop
              </Link>
            </p>
          </div>
        </div>

        {/* Rate limit note */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          Protected by Rate Limiter & JWT Session Auth &bull; 15-minute lock on 5 failed attempts
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
