import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminLoginPage: React.FC = () => {
  const { user, loginAdminWithCredentials, signInWithGoogle } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('tarunpediredla9966@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const profile = await loginAdminWithCredentials(email, password);
      if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        setError('Access Denied: Account does not hold administrator privileges.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Administrator login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAdmin = async () => {
    if (googleSubmitting) return;
    setError(null);
    setGoogleSubmitting(true);
    try {
      const profile = await signInWithGoogle();
      if (profile) {
        if (profile.role === 'admin') {
          navigate('/admin');
        } else {
          setError(
            `Access Denied: ${profile.email} is registered with the standard 'user' role and cannot access /admin.`
          );
        }
      }
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0B192C] text-[#FAF8F5] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono-tabular text-[#FAF8F5]/70 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Storefront</span>
          </Link>
          <Link
            to="/dashboard"
            className="text-xs font-mono-tabular text-[#5EEAD4] hover:underline"
          >
            User Login (/dashboard) →
          </Link>
        </div>

        <div className="rounded-2xl bg-[#112239] border border-white/15 p-5 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3.5 border-b border-white/10 pb-5">
            <img
              src="/assets/aistudio/image_42ebc6e4.png"
              alt="Satya's Education Logo"
              className="w-12 h-12 rounded-xl bg-white p-0.5 object-contain shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-mono-tabular uppercase tracking-wider text-[#C59B27] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Restricted Portal · /admin/login</span>
              </p>
              <h1 className="font-serif-display text-xl sm:text-2xl font-bold text-white truncate">
                Administrator Sign In
              </h1>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            disabled={googleSubmitting}
            onClick={handleGoogleAdmin}
            className="w-full py-3 px-4 rounded-xl bg-white text-[#0B192C] text-xs sm:text-sm font-bold hover:bg-[#FAF8F5] transition-colors flex items-center justify-center gap-2.5 disabled:opacity-60"
          >
            {googleSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#0D6E6E]" />
                <span>Verifying Admin Google Account...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#EA4335"
                    d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.3-2 3l3.2 2.5c1.9-1.7 3-4.3 3-7.4 0-.7-.1-1.4-.2-2H12z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.9v2.6C4.6 19.8 8 22 12 22z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M6.2 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.6H2.9C2.3 8.9 2 10.4 2 12s.3 3.1.9 4.4l3.3-2.6z"
                  />
                  <path
                    fill="#4285F4"
                    d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9C16.9 2.9 14.7 2 12 2 8 2 4.6 4.2 2.9 7.6l3.3 2.6c.8-2.5 3.1-4.3 5.8-4.3z"
                  />
                </svg>
                <span>Continue with Admin Google Account</span>
              </>
            )}
          </button>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-white/10" />
            <span className="shrink mx-3 text-xs text-[#FAF8F5]/50">
              or sign in with admin credentials
            </span>
            <div className="grow border-t border-white/10" />
          </div>

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-login-email"
                className="block text-xs font-semibold text-[#FAF8F5]/90 mb-1.5"
              >
                Administrator Email *
              </label>
              <input
                id="admin-login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tarunpediredla9966@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B192C] border border-white/20 text-sm text-white font-mono-tabular focus:outline-none focus:border-[#C59B27]"
              />
            </div>

            <div>
              <label
                htmlFor="admin-login-password"
                className="block text-xs font-semibold text-[#FAF8F5]/90 mb-1.5"
              >
                Administrator Password *
              </label>
              <div className="relative">
                <input
                  id="admin-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#0B192C] border border-white/20 text-sm text-white focus:outline-none focus:border-[#C59B27]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-[#C59B27] text-[#0B192C] text-sm font-bold hover:bg-[#d6ad33] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{submitting ? 'Verifying Admin Role...' : 'Sign In to Admin Panel'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-white/10">
            <div className="p-3.5 rounded-xl bg-[#0B192C]/90 border border-white/10 text-[11px] text-[#FAF8F5]/75 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono-tabular uppercase text-[#C59B27] flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Admin Role Verification</span>
                </span>
              </div>
              <p className="leading-relaxed">
                Admin access requires either signing in with the verified owner Google/Firebase account or setting <code>role: &quot;admin&quot;</code> in the Cloud Firestore <code>users/&#123;uid&#125;</code> collection. Standard accounts receive the <code>user</code> role and are blocked from <code>/admin</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
