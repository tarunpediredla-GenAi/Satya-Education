import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminLoginPage: React.FC = () => {
  const { user, loginAdminWithCredentials, signInWithGoogle } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('tarunpediredla9966@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    setError(null);
    const profile = await signInWithGoogle();
    if (profile) {
      if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        setError(
          `Access Denied: ${profile.email} is registered with the standard 'student' role and cannot access /admin.`
        );
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0B192C] text-[#FAF8F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono-tabular text-[#FAF8F5]/70 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Public Storefront</span>
          </Link>
          <Link
            to="/dashboard"
            className="text-xs font-mono-tabular text-[#5EEAD4] hover:underline"
          >
            Student Login (/dashboard) →
          </Link>
        </div>

        <div className="rounded-2xl bg-[#112239] border border-white/15 p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3.5 border-b border-white/10 pb-5">
            <img
              src="/assets/aistudio/image_42ebc6e4.png"
              alt="Satya's Education Logo"
              className="w-12 h-12 rounded-xl bg-white p-0.5 object-contain shrink-0"
            />
            <div>
              <p className="text-[11px] font-mono-tabular uppercase tracking-wider text-[#C59B27] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Restricted Portal · /admin/login</span>
              </p>
              <h1 className="font-serif-display text-2xl font-bold text-white">
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
                Server Admin Password *
              </label>
              <input
                id="admin-login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter server-bootstrapped admin password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B192C] border border-white/20 text-sm text-white focus:outline-none focus:border-[#C59B27]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-[#C59B27] text-[#0B192C] text-sm font-bold hover:bg-[#d6ad33] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{submitting ? 'Verifying on Backend...' : 'Sign In to Admin Panel'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-white/10 space-y-3">
            <button
              type="button"
              onClick={handleGoogleAdmin}
              className="w-full py-2.5 px-4 rounded-xl border border-white/20 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Continue with Verified Admin Google Account
            </button>

            <div className="p-3.5 rounded-xl bg-[#0B192C]/90 border border-white/10 text-[11px] text-[#FAF8F5]/75 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono-tabular uppercase text-[#C59B27] flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Server-Side First Admin Setup</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('tarunpediredla9966@gmail.com');
                    setPassword('SatyaAdmin@2026');
                  }}
                  className="text-[11px] font-semibold text-[#5EEAD4] hover:underline"
                >
                  Auto-fill Sandbox Admin
                </button>
              </div>
              <p className="leading-relaxed">
                The initial administrator is provisioned on server startup via <code>ADMIN_EMAIL</code> and <code>ADMIN_INITIAL_PASSWORD</code> in environment variables. Standard user signups always receive the <code>student</code> role and are blocked from this login endpoint with HTTP 403.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
