import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';
import { loginSchema } from '../../schemas/auth.schema.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { Button } from '../../components/Button.jsx';
import { Input } from '../../components/Input.jsx';
import { getErrorMessage } from '../../services/api.js';
import { ROLE_HOME } from '../../config/constants.js';

export default function LoginPage() {
  const { user, login } = useAuth();
  const { institutionName, appName, appSubtitle } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [accountInactive, setAccountInactive] = useState(false);

  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  if (user) {
    const redirectTo = location.state?.from?.pathname || ROLE_HOME[user.role];
    return <Navigate to={redirectTo} replace />;
  }

  async function onSubmit(values) {
    setServerError('');
    setAccountInactive(false);
    try {
      const loggedInUser = await login(values);
      navigate(ROLE_HOME[loggedInUser.role], { replace: true });
    } catch (err) {
      const code = err?.response?.data?.errorCode;
      if (code === 'ACCOUNT_INACTIVE') setAccountInactive(true);
      else setServerError(getErrorMessage(err, 'Invalid username or password'));
    }
  }

  return (
    <div className="min-h-screen flex bg-navy-950">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-navy-900 to-navy-950 text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-lg leading-tight">{institutionName}</p>
            <p className="text-xs text-slate-400 leading-tight">{appSubtitle}</p>
          </div>
        </div>
        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight mb-4">
            One place to track every rupee collected.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Record cash and UPI fee payments, print receipts instantly, and know exactly
            how the school and tuition centre are doing financially — every single day.
          </p>
        </div>
        <p className="relative text-xs text-slate-500">© {new Date().getFullYear()} {institutionName}. All rights reserved.</p>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center text-center">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <p className="font-bold text-lg text-navy-900">{institutionName}</p>
          </div>

          <div className="card p-7">
            <h1 className="text-xl font-bold text-navy-900 mb-1">Welcome back</h1>
            <p className="text-sm text-slate-500 mb-6">Sign in to manage fee collections</p>

            {accountInactive && (
              <div className="mb-4 rounded-lg bg-orange-50 border border-orange-100 px-3 py-2.5 text-sm text-orange-700">
                This account has been deactivated. Please contact the administrator.
              </div>
            )}
            {serverError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label="Username or Email"
                placeholder="e.g. admin"
                autoComplete="username"
                error={errors.username?.message}
                {...register('username')}
              />
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`input pr-10 ${errors.password ? 'border-red-400' : ''}`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="rounded border-slate-300" {...register('rememberMe')} />
                Remember me
              </label>

              <Button type="submit" className="w-full" loading={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Login'}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Demo: admin / school.accountant / tuition.accountant
          </p>
        </div>
      </div>
    </div>
  );
}
