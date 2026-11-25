import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { Button } from '../../components/Button.jsx';
import { getErrorMessage } from '../../config/api.js';
import { authApi } from '../../services/auth.service.js';

export default function ResetPasswordPage() {
  const { institutionName, appSubtitle } = useSettings();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!token || !token.trim()) {
      setError('Missing or invalid reset link. Please click the reset link sent to your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        token: token.trim(),
        newPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2500);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not reset password. The link may have expired.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-600/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center font-bold text-white shadow-lg">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">{institutionName}</p>
              <p className="text-xs text-slate-400">{appSubtitle}</p>
            </div>
          </div>
        </div>
        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight mb-4">
            Security & Account Access
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Create a secure new password for your administrator account.
            Once updated, you can log in immediately with your new credentials.
          </p>
        </div>
        <p className="relative text-xs text-slate-500">© {new Date().getFullYear()} {institutionName}. All rights reserved.</p>
      </div>

      {/* Right reset form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center text-center">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <p className="font-bold text-lg text-navy-900">{institutionName}</p>
          </div>

          <div className="card p-7 shadow-sm border border-slate-200">
            {!success ? (
              <>
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-navy-900 mb-1">Set New Password</h1>
                  <p className="text-sm text-slate-500">
                    Enter and confirm your new administrator password.
                  </p>
                </div>

                {!token ? (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-800 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-0.5">Missing Reset Link</p>
                        <p>No valid reset link token was provided. Please click the reset link sent to your email or request a new one from the login page.</p>
                      </div>
                    </div>
                    <Button onClick={() => navigate('/login')} className="w-full">
                      Back to Login
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {error && (
                      <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div>
                      <label className="label">New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="input pr-10"
                          autoFocus
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="label">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="input pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full mt-2" loading={loading}>
                      {loading ? 'Updating Password...' : 'Reset Password'}
                    </Button>

                    <div className="text-center pt-2">
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Login
                      </Link>
                    </div>
                  </form>
                )}
              </>
            ) : (
              /* Success State */
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-navy-900 mb-1">Password Reset Successful!</h2>
                  <p className="text-xs text-slate-500">
                    Your password has been securely updated. Redirecting to login...
                  </p>
                </div>
                <Button onClick={() => navigate('/login')} className="w-full">
                  Login Now
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
