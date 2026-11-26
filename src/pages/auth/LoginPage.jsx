import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { VedavyasLogo } from '../../components/VedavyasLogo.jsx';
import { loginSchema } from '../../schemas/auth.schema.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { Button } from '../../components/Button.jsx';
import { Input } from '../../components/Input.jsx';
import { getErrorMessage } from '../../config/api.js';
import { ROLE_HOME } from '../../config/constants.js';
import { authApi } from '../../services/auth.service.js';

export default function LoginPage() {
  const { user, login } = useAuth();
  const { institutionName, appSubtitle } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [accountInactive, setAccountInactive] = useState(false);

  // Forgot password notification state
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [greenMessage, setGreenMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const greenTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (greenTimerRef.current) clearTimeout(greenTimerRef.current);
    };
  }, []);

  const {
    register, handleSubmit, getValues, formState: { errors, isSubmitting },
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
      if (code === 'ACCOUNT_INACTIVE') {
        setAccountInactive(true);
      } else {
        setServerError(getErrorMessage(err, 'Invalid username or password.'));
      }
    }
  }

  async function handleInitiateReset() {
    setResetError('');
    setIsSendingLink(true);
    const enteredUsername = getValues('username') || 'VEDAVYAS';
    try {
      await authApi.forgotPassword({ username: enteredUsername });
      setGreenMessage('Password reset link has been sent to your registered email');
      if (greenTimerRef.current) clearTimeout(greenTimerRef.current);
      greenTimerRef.current = setTimeout(() => {
        setGreenMessage('');
      }, 6000);
    } catch (err) {
      setResetError(getErrorMessage(err, 'Could not send reset link. Check admin username.'));
    } finally {
      setIsSendingLink(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-600/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <VedavyasLogo className="w-12 h-12 shrink-0 drop-shadow-lg" />
            <div>
              <p className="font-bold text-lg leading-tight">{institutionName}</p>
              <p className="text-xs text-slate-400">{appSubtitle}</p>
            </div>
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
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center text-center">
            <VedavyasLogo className="w-11 h-11 shrink-0" />
            <p className="font-bold text-lg text-navy-900">{institutionName}</p>
          </div>

          <div className="card p-7">
            <h1 className="text-xl font-bold text-navy-900 mb-1">Welcome back</h1>
            <p className="text-sm text-slate-500 mb-5">Sign in to manage fee collections</p>

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

            {/* Small green text notification when reset link is sent */}
            {greenMessage && (
              <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-xs font-medium text-emerald-800 flex items-start gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{greenMessage}</span>
              </div>
            )}

            {resetError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">
                {resetError}
              </div>
            )}

            {/* Normal Clean Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label="Username or Email"
                placeholder="e.g. VEDAVYAS"
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
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between text-sm pt-0.5">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300" {...register('rememberMe')} />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={handleInitiateReset}
                  disabled={isSendingLink}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-colors"
                >
                  {isSendingLink ? 'Sending link...' : 'Reset Password?'}
                </button>
              </div>

              <Button type="submit" className="w-full mt-2" loading={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Login'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
