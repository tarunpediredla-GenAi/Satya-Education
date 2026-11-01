import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  PlayCircle,
  Download,
  Package,
  LogOut,
  Shield,
  Clock,
  CheckCircle2,
  ShoppingBag,
  CreditCard,
  Settings,
  LayoutDashboard,
  RefreshCw,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  MailCheck,
  KeyRound,
  Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BookCoverArt } from '../components/BookCoverArt';
import { CourseCoverArt } from '../components/CourseCoverArt';

type UserPanelSection =
  | 'overview'
  | 'my_courses'
  | 'my_books'
  | 'browse_store'
  | 'orders_payments'
  | 'profile_settings';

export const StudentDashboardPage: React.FC = () => {
  const {
    user,
    authToken,
    authLoading,
    signUpWithEmail,
    loginWithEmail,
    signInWithGoogle,
    resetPassword,
    resendVerificationEmail,
    signOut,
    updateUserProfile,
    courses,
    books,
    orders,
    enrollments,
    progressMap,
    addToCart,
    verifyCashfreeOrder,
    showToast,
  } = useApp();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<UserPanelSection>('overview');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);

  // Unauthenticated User Panel Sign Up / Log In / Forgot Password state
  const [authTab, setAuthTab] = useState<'login' | 'signup' | 'reset'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [authFormError, setAuthFormError] = useState<string | null>(null);
  const [authFormSuccess, setAuthFormSuccess] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  // Profile Settings state
  const [profileName, setProfileName] = useState(user?.displayName || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.photoURL || '');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Store filter inside User Panel
  const [storeFilter, setStoreFilter] = useState<'all' | 'courses' | 'books'>('all');
  const [storeQuery, setStoreQuery] = useState('');

  React.useEffect(() => {
    if (user) {
      setProfileName(user.displayName || '');
      setProfilePhone(user.phone || '');
      setProfileBio(user.bio || '');
      setProfilePhoto(user.photoURL || '');
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-6">
        <div className="h-10 w-64 bg-[#0B192C]/10 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-[#0B192C]/10 rounded-2xl animate-pulse" />
          <div className="h-48 bg-[#0B192C]/10 rounded-2xl animate-pulse" />
          <div className="h-48 bg-[#0B192C]/10 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthFormError(null);
    setAuthFormSuccess(null);
    setAuthSubmitting(true);
    try {
      if (authTab === 'reset') {
        await resetPassword(emailInput);
        setAuthFormSuccess(
          `Password reset instructions have been sent to ${emailInput.trim()}. Please check your email inbox and spam folder.`
        );
      } else if (authTab === 'signup') {
        await signUpWithEmail({
          email: emailInput,
          password: passwordInput,
          displayName: nameInput,
          phone: phoneInput,
        });
      } else {
        await loginWithEmail(emailInput, passwordInput);
      }
    } catch (err: unknown) {
      setAuthFormError(err instanceof Error ? err.message : 'Authentication error');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleGoogleSignInClick = async () => {
    if (googleSubmitting) return;
    setAuthFormError(null);
    setAuthFormSuccess(null);
    setGoogleSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setAuthFormError(err instanceof Error ? err.message : 'Google sign-in error');
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    try {
      await resendVerificationEmail();
    } catch {
      // Toast already handled in context
    } finally {
      setResendingVerification(false);
    }
  };

  // Unauthenticated View: Dedicated User Panel Sign Up, Log In & Password Reset Screen
  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden bg-white border border-[#0B192C]/15 shadow-sm">
          {/* Left Column: Brand Context */}
          <div className="lg:col-span-5 bg-[#0B192C] text-[#FAF8F5] p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/aistudio/image_42ebc6e4.png"
                  alt="Satya's Education Logo"
                  className="w-11 h-11 rounded-lg bg-white p-0.5 object-contain shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-mono-tabular uppercase text-[#C59B27]">
                    Student Portal · /dashboard
                  </p>
                  <h1 className="font-serif-display text-xl font-bold text-white truncate">
                    Satya’s Education
                  </h1>
                </div>
              </div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-bold leading-snug text-white pt-2">
                Your Personal Learning & Book Library
              </h2>
              <p className="text-xs sm:text-sm text-[#FAF8F5]/75 leading-relaxed">
                Create a student account or sign in with Google or Email & Password to access your purchased courses, recorded video lessons, downloadable e-books, and payment receipts.
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-white/15 text-xs text-[#FAF8F5]/80">
              <p className="font-mono-tabular text-[#5EEAD4]">Security & Privacy Guarantees:</p>
              <ul className="space-y-1.5 list-disc list-inside text-[#FAF8F5]/75">
                <li>Powered by Firebase Authentication & Cloud Firestore</li>
                <li>New accounts automatically receive the standard User role</li>
                <li>Strict isolation: you only see your own orders & recordings</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Sign Up / Log In / Reset Form */}
          <div className="lg:col-span-7 p-5 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0B192C]/10 pb-4">
              <div className="flex flex-wrap gap-1.5 p-1 bg-[#FAF8F5] rounded-xl border border-[#0B192C]/10 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setAuthFormError(null);
                    setAuthFormSuccess(null);
                  }}
                  className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    authTab === 'login'
                      ? 'bg-[#0B192C] text-white'
                      : 'text-[#0B192C]/70 hover:text-[#0B192C]'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('signup');
                    setAuthFormError(null);
                    setAuthFormSuccess(null);
                  }}
                  className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    authTab === 'signup'
                      ? 'bg-[#0B192C] text-white'
                      : 'text-[#0B192C]/70 hover:text-[#0B192C]'
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('reset');
                    setAuthFormError(null);
                    setAuthFormSuccess(null);
                  }}
                  className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    authTab === 'reset'
                      ? 'bg-[#0B192C] text-white'
                      : 'text-[#0B192C]/70 hover:text-[#0B192C]'
                  }`}
                >
                  Forgot Password
                </button>
              </div>

              <Link
                to="/admin/login"
                className="text-xs font-mono-tabular text-[#0D6E6E] hover:underline"
              >
                Admin Login →
              </Link>
            </div>

            {authFormError && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{authFormError}</span>
              </div>
            )}

            {authFormSuccess && (
              <div
                role="status"
                className="p-3.5 rounded-xl bg-[#0D6E6E]/10 border border-[#0D6E6E]/25 text-[#0B192C] text-xs flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0D6E6E] mt-0.5" />
                <span>{authFormSuccess}</span>
              </div>
            )}

            {/* Google Sign-In Button at Top for 1-Tap Access */}
            <button
              type="button"
              disabled={googleSubmitting}
              onClick={handleGoogleSignInClick}
              className="w-full py-3 px-4 rounded-xl border border-[#0B192C]/20 bg-[#FAF8F5] text-xs sm:text-sm font-semibold text-[#0B192C] hover:bg-[#0B192C] hover:text-white transition-colors flex items-center justify-center gap-2.5 disabled:opacity-60"
            >
              {googleSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0D6E6E]" />
                  <span>Connecting to Google...</span>
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
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-[#0B192C]/10" />
              <span className="shrink mx-3 text-xs text-[#0B192C]/50">
                {authTab === 'reset' ? 'or reset password via email' : 'or use email & password'}
              </span>
              <div className="grow border-t border-[#0B192C]/10" />
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authTab === 'signup' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="up-name"
                      className="block text-xs font-semibold text-[#0B192C] mb-1"
                    >
                      Full Name *
                    </label>
                    <input
                      id="up-name"
                      type="text"
                      required
                      placeholder="Aarav Sharma"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="up-phone"
                      className="block text-xs font-semibold text-[#0B192C] mb-1"
                    >
                      Phone Number (Optional)
                    </label>
                    <input
                      id="up-phone"
                      type="tel"
                      placeholder="9876543210"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="up-email"
                  className="block text-xs font-semibold text-[#0B192C] mb-1"
                >
                  Email Address *
                </label>
                <input
                  id="up-email"
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                />
              </div>

              {authTab !== 'reset' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="up-password"
                      className="block text-xs font-semibold text-[#0B192C]"
                    >
                      Password (min. 6 characters) *
                    </label>
                    {authTab === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('reset');
                          setAuthFormError(null);
                          setAuthFormSuccess(null);
                        }}
                        className="text-xs font-medium text-[#0D6E6E] hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="up-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#0B192C]/60 hover:text-[#0B192C]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#0B192C] text-white text-sm font-semibold hover:bg-[#0D6E6E] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {authSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      {authTab === 'reset'
                        ? 'Sending Reset Link...'
                        : 'Authenticating...'}
                    </span>
                  </>
                ) : authTab === 'reset' ? (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Send Password Reset Email</span>
                  </>
                ) : authTab === 'signup' ? (
                  'Create Student Account'
                ) : (
                  'Log In to User Panel'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Filter strictly to the authenticated user's own unlocked enrollments
  const enrolledCourseIds = new Set(
    enrollments.filter((e) => e.itemType === 'course').map((e) => e.itemId)
  );
  const myCourses = courses.filter((c) => enrolledCourseIds.has(c.id));

  const purchasedBookIds = new Set(
    enrollments
      .filter((e) => e.itemType === 'ebook' || e.itemType === 'physical_book')
      .map((e) => e.itemId)
  );
  const myBooks = books.filter((b) => purchasedBookIds.has(b.id));

  const savedLessonsList = Object.values(progressMap)
    .filter((p) => p.userId === user.uid || p.userId === 'guest')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const handleSecureEbookDownload = async (bookId: string, title: string) => {
    setDownloadingId(bookId);
    try {
      const book = books.find((b) => b.id === bookId);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;
      const res = await fetch('/api/access/media', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          itemId: bookId,
          itemType: 'ebook',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.authorized) {
        throw new Error(data.error || 'Access denied: Verified purchase required.');
      }

      const content = `# ${title}\nAuthor: ${book?.author}\nISBN: ${book?.isbn}\nSigned Download Token: ${data.signedToken}\n\n## Overview\n${book?.description}\n\n## Excerpt\n${book?.previewExcerpt}\n\n## Table of Contents\n${book?.tableOfContents.join('\n')}\n`;
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${bookId}-ebook.md`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Downloaded "${title}"`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCompletePendingOrFailedOrder = async (orderId: string) => {
    setVerifyingOrderId(orderId);
    try {
      const res = await verifyCashfreeOrder(orderId, 'PAID');
      if (res.verified) {
        showToast(`Order ${orderId} verified as PAID! Purchases unlocked.`);
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Could not verify order');
    } finally {
      setVerifyingOrderId(null);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateUserProfile({
        displayName: profileName,
        phone: profilePhone,
        bio: profileBio,
        photoURL: profilePhoto,
        newPassword: newPassword.trim() ? newPassword.trim() : undefined,
      });
      setNewPassword('');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Profile update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const navItems: { id: UserPanelSection; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'overview', label: 'Overview & Progress', icon: LayoutDashboard },
    { id: 'my_courses', label: 'My Courses & Recordings', icon: PlayCircle, count: myCourses.length },
    { id: 'my_books', label: 'My Books & E-Books', icon: BookOpen, count: myBooks.length },
    { id: 'browse_store', label: 'Browse & Purchase', icon: ShoppingBag },
    { id: 'orders_payments', label: 'Orders & Payments', icon: CreditCard, count: orders.length },
    { id: 'profile_settings', label: 'Profile Settings', icon: Settings },
  ];

  const filteredStoreCourses = courses.filter(
    (c) =>
      storeFilter !== 'books' &&
      (!storeQuery.trim() ||
        c.title.toLowerCase().includes(storeQuery.toLowerCase()) ||
        c.subject.toLowerCase().includes(storeQuery.toLowerCase()))
  );

  const filteredStoreBooks = books.filter(
    (b) =>
      storeFilter !== 'courses' &&
      (!storeQuery.trim() ||
        b.title.toLowerCase().includes(storeQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(storeQuery.toLowerCase()) ||
        b.subcategory.toLowerCase().includes(storeQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* DEDICATED USER PANEL SIDEBAR NAVIGATION */}
        <aside className="lg:col-span-3 rounded-2xl bg-white border border-[#0B192C]/12 overflow-hidden shadow-2xs">
          <div className="p-5 bg-[#F3EDE0] border-b border-[#0B192C]/10 flex items-center gap-3.5">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border border-[#0B192C]/15 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#0D6E6E] text-white flex items-center justify-center text-lg font-bold shrink-0">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[11px] font-mono-tabular uppercase text-[#0D6E6E]">
                User Panel · {user.role === 'admin' ? 'Admin' : 'Student'}
              </p>
              <h1 className="font-serif-display text-base font-bold text-[#0B192C] truncate">
                {user.displayName}
              </h1>
              <p className="text-xs text-[#0B192C]/65 truncate">{user.email}</p>
            </div>
          </div>

          <nav aria-label="User Panel Navigation" className="p-2.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-colors ${
                    active
                      ? 'bg-[#0B192C] text-[#FAF8F5] font-semibold'
                      : 'text-[#0B192C]/80 hover:bg-[#FAF8F5] hover:text-[#0B192C]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-[#C59B27]' : 'text-[#0D6E6E]'}`} />
                    <span>{item.label}</span>
                  </span>
                  {item.count !== undefined && (
                    <span
                      className={`text-xs font-mono-tabular ${
                        active ? 'text-[#C59B27]' : 'text-[#0B192C]/55'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-[#0B192C]/10 space-y-2 bg-[#FAF8F5]/60">
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="w-full px-3.5 py-2 rounded-xl bg-[#B48327]/15 text-[#0B192C] text-xs font-semibold hover:bg-[#B48327] hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>Switch to Admin Panel (/admin)</span>
              </Link>
            )}
            <button
              type="button"
              onClick={signOut}
              className="w-full px-3.5 py-2 rounded-xl border border-[#0B192C]/15 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* USER PANEL MAIN WORKSPACE */}
        <div className="lg:col-span-9 space-y-8 min-w-0">
          {/* Email Verification Notice if email is not verified yet */}
          {user.emailVerified === false && (
            <div className="p-4 rounded-2xl bg-[#F3EDE0] border border-[#C59B27]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <MailCheck className="w-5 h-5 text-[#B48327] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[#0B192C]">
                    Verify your email address ({user.email})
                  </p>
                  <p className="text-xs text-[#0B192C]/70">
                    Check your inbox for the verification link to secure your account and password recovery.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={resendingVerification}
                onClick={handleResendVerification}
                className="px-3.5 py-2 rounded-xl bg-[#0B192C] text-white text-xs font-semibold hover:bg-[#0D6E6E] transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                {resendingVerification ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          )}

          {/* SECTION 1: OVERVIEW & CONTINUE LEARNING */}
          {activeSection === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-[#0B192C]/10">
                  <span className="text-xs font-mono-tabular uppercase text-[#0B192C]/60">
                    Unlocked Courses
                  </span>
                  <p className="font-serif-display text-3xl font-bold text-[#0B192C] mt-1">
                    {myCourses.length}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSection('my_courses')}
                    className="text-xs font-semibold text-[#0D6E6E] hover:underline mt-2 inline-block"
                  >
                    Access Recordings →
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#0B192C]/10">
                  <span className="text-xs font-mono-tabular uppercase text-[#0B192C]/60">
                    Purchased Books
                  </span>
                  <p className="font-serif-display text-3xl font-bold text-[#0B192C] mt-1">
                    {myBooks.length}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSection('my_books')}
                    className="text-xs font-semibold text-[#0D6E6E] hover:underline mt-2 inline-block"
                  >
                    Open E-Book Library →
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#0B192C]/10">
                  <span className="text-xs font-mono-tabular uppercase text-[#0B192C]/60">
                    My Orders
                  </span>
                  <p className="font-serif-display text-3xl font-bold text-[#0B192C] mt-1">
                    {orders.length}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSection('orders_payments')}
                    className="text-xs font-semibold text-[#0D6E6E] hover:underline mt-2 inline-block"
                  >
                    View Payment History →
                  </button>
                </div>
              </div>

              {/* Continue Learning */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif-display text-xl font-bold text-[#0B192C]">
                    Continue Learning & Saved Timestamps
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveSection('browse_store')}
                    className="text-xs font-semibold text-[#0D6E6E] hover:underline"
                  >
                    Browse Catalog →
                  </button>
                </div>

                {savedLessonsList.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-white border border-[#0B192C]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-sm text-[#0B192C]/70">
                      You have not started any recorded lessons yet. Watch a free Lesson 1 preview or open an unlocked course to save your progress.
                    </p>
                    <Link
                      to="/recorded-classes"
                      className="px-4 py-2 rounded-xl bg-[#0B192C] text-white text-xs font-semibold hover:bg-[#0D6E6E] whitespace-nowrap shrink-0"
                    >
                      Explore Recorded Classes
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {savedLessonsList.map((prog) => {
                      const c = courses.find((course) => course.id === prog.courseId);
                      const l = c?.modules
                        .flatMap((m) => m.lessons)
                        .find((les) => les.id === prog.lessonId);
                      if (!c || !l) return null;

                      return (
                        <div
                          key={prog.id}
                          className="p-5 rounded-xl bg-white border border-[#0B192C]/10 flex flex-col justify-between gap-4"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-mono-tabular text-[#0D6E6E]">
                              <span>{c.subject}</span>
                              <span className="flex items-center gap-1">
                                {prog.completed ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3.5 h-3.5" />{' '}
                                    {Math.floor(prog.playbackSeconds / 60)}m{' '}
                                    {prog.playbackSeconds % 60}s
                                  </>
                                )}
                              </span>
                            </div>
                            <h3 className="font-serif-display text-base font-semibold text-[#0B192C]">
                              {l.title}
                            </h3>
                            <p className="text-xs text-[#0B192C]/60 truncate">{c.title}</p>
                            {prog.notes && (
                              <p className="text-xs italic text-[#0B192C]/75 bg-[#FAF8F5] p-2.5 rounded-lg border border-[#0B192C]/10 line-clamp-2 mt-2">
                                Note: “{prog.notes}”
                              </p>
                            )}
                          </div>
                          <Link
                            to={`/learn/${c.id}/${l.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D6E6E] hover:underline"
                          >
                            <PlayCircle className="w-4 h-4" />
                            <span>Resume Lesson →</span>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* SECTION 2: MY PURCHASED COURSES & RECORDINGS ONLY */}
          {activeSection === 'my_courses' && (
            <section className="space-y-5">
              <div className="border-b border-[#0B192C]/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-mono-tabular uppercase text-[#0D6E6E]">
                    Verified Paid Enrollments Only
                  </p>
                  <h2 className="font-serif-display text-2xl font-bold text-[#0B192C]">
                    My Purchased Courses & Recordings ({myCourses.length})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('browse_store')}
                  className="px-4 py-2 rounded-xl bg-[#0B192C] text-white text-xs font-semibold hover:bg-[#0D6E6E]"
                >
                  Browse More Courses
                </button>
              </div>

              {myCourses.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white border border-[#0B192C]/10 text-center space-y-4">
                  <Lock className="w-8 h-8 text-[#0D6E6E] mx-auto" />
                  <div className="space-y-1">
                    <h3 className="font-serif-display text-lg font-semibold text-[#0B192C]">
                      No Purchased Courses Yet
                    </h3>
                    <p className="text-xs sm:text-sm text-[#0B192C]/70 max-w-md mx-auto">
                      Full course curricula and paid video recordings are restricted to verified enrollments. Purchase a course via Cashfree Sandbox to unlock all lessons here.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection('browse_store')}
                    className="px-5 py-2.5 rounded-xl bg-[#0B192C] text-white text-xs font-semibold hover:bg-[#0D6E6E]"
                  >
                    Shop Courses in User Panel
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myCourses.map((course) => {
                    const allLessons = course.modules.flatMap((m) => m.lessons);
                    const firstLesson = allLessons[0];
                    return (
                      <div
                        key={course.id}
                        className="rounded-2xl bg-white border border-[#0B192C]/10 overflow-hidden flex flex-col justify-between"
                      >
                        <CourseCoverArt course={course} className="h-40" />
                        <div className="p-5 space-y-4">
                          <div>
                            <p className="text-xs font-mono-tabular text-[#0D6E6E]">
                              Unlocked · {allLessons.length} Recorded Lessons
                            </p>
                            <h3 className="font-serif-display text-lg font-semibold text-[#0B192C] mt-0.5">
                              {course.title}
                            </h3>
                            <p className="text-xs text-[#0B192C]/65">{course.instructor}</p>
                          </div>

                          <div className="space-y-1.5 border-t border-[#0B192C]/10 pt-3">
                            <p className="text-[11px] font-mono-tabular uppercase text-[#0B192C]/60">
                              Included Recordings:
                            </p>
                            {allLessons.slice(0, 3).map((les) => (
                              <Link
                                key={les.id}
                                to={`/learn/${course.id}/${les.id}`}
                                className="flex items-center justify-between text-xs py-1 text-[#0B192C]/85 hover:text-[#0D6E6E]"
                              >
                                <span className="truncate flex items-center gap-1.5">
                                  <PlayCircle className="w-3.5 h-3.5 text-[#0D6E6E] shrink-0" />
                                  <span className="truncate">{les.title}</span>
                                </span>
                                <span className="font-mono-tabular text-[11px] text-[#0B192C]/55">
                                  {les.durationMinutes}m
                                </span>
                              </Link>
                            ))}
                          </div>

                          {firstLesson && (
                            <Link
                              to={`/learn/${course.id}/${firstLesson.id}`}
                              className="w-full py-2.5 px-4 rounded-xl bg-[#0D6E6E] text-white text-xs font-semibold hover:bg-[#0B192C] flex items-center justify-center gap-2"
                            >
                              <PlayCircle className="w-4 h-4" />
                              <span>Open Course Player & Recordings</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* SECTION 3: MY PURCHASED BOOKS & E-BOOKS */}
          {activeSection === 'my_books' && (
            <section className="space-y-5">
              <div className="border-b border-[#0B192C]/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-mono-tabular uppercase text-[#0D6E6E]">
                    Protected Digital Downloads
                  </p>
                  <h2 className="font-serif-display text-2xl font-bold text-[#0B192C]">
                    My Purchased Books & E-Books ({myBooks.length})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('browse_store')}
                  className="px-4 py-2 rounded-xl bg-[#0B192C] text-white text-xs font-semibold hover:bg-[#0D6E6E]"
                >
                  Shop More Books
                </button>
              </div>

              {myBooks.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white border border-[#0B192C]/10 text-center space-y-3">
                  <BookOpen className="w-8 h-8 text-[#0D6E6E] mx-auto" />
                  <p className="text-sm text-[#0B192C]/70">
                    You have not purchased any books yet. Purchased books include instant signed E-Book download access.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSection('browse_store')}
                    className="px-5 py-2.5 rounded-xl bg-[#0B192C] text-white text-xs font-semibold hover:bg-[#0D6E6E]"
                  >
                    Browse 40 Books
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myBooks.map((book) => (
                    <div
                      key={book.id}
                      className="p-4 rounded-xl bg-white border border-[#0B192C]/10 flex flex-col justify-between gap-4"
                    >
                      <div>
                        <BookCoverArt book={book} className="h-52 w-full mb-3" compact />
                        <h3 className="font-serif-display text-sm font-semibold text-[#0B192C]">
                          {book.title}
                        </h3>
                        <p className="text-xs text-[#0B192C]/65">{book.author}</p>
                      </div>
                      <button
                        type="button"
                        disabled={downloadingId === book.id}
                        onClick={() => handleSecureEbookDownload(book.id, book.title)}
                        className="w-full py-2.5 px-3 rounded-lg bg-[#0D6E6E] text-white text-xs font-semibold hover:bg-[#0B192C] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>
                          {downloadingId === book.id ? 'Verifying Token...' : 'Download E-Book'}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* SECTION 4: BROWSE & PURCHASE BOOKS AND COURSES */}
          {activeSection === 'browse_store' && (
            <section className="space-y-6">
              <div className="border-b border-[#0B192C]/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-mono-tabular uppercase text-[#0D6E6E]">
                    Quick Storefront Inside User Panel
                  </p>
                  <h2 className="font-serif-display text-2xl font-bold text-[#0B192C]">
                    Browse & Purchase Courses and Books
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {(['all', 'courses', 'books'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setStoreFilter(tab)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize ${
                        storeFilter === tab
                          ? 'bg-[#0B192C] text-white'
                          : 'bg-white border border-[#0B192C]/15 text-[#0B192C]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="panel-store-search" className="sr-only">
                  Search courses and books
                </label>
                <input
                  id="panel-store-search"
                  type="search"
                  value={storeQuery}
                  onChange={(e) => setStoreQuery(e.target.value)}
                  placeholder="Filter courses or books by title, subject, or author..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#0B192C]/15 text-sm"
                />
              </div>

              {filteredStoreCourses.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-serif-display text-lg font-semibold text-[#0B192C]">
                    Online Courses ({filteredStoreCourses.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredStoreCourses.map((c) => {
                      const alreadyEnrolled = enrolledCourseIds.has(c.id);
                      return (
                        <div
                          key={c.id}
                          className="p-5 rounded-2xl bg-white border border-[#0B192C]/10 flex flex-col justify-between gap-4"
                        >
                          <div className="space-y-1.5">
                            <p className="text-xs font-mono-tabular text-[#0D6E6E]">
                              {c.subject} · {c.level} · {c.duration}
                            </p>
                            <Link
                              to={`/courses/${c.id}`}
                              className="font-serif-display text-base font-bold text-[#0B192C] hover:text-[#0D6E6E]"
                            >
                              {c.title}
                            </Link>
                            <p className="text-xs text-[#0B192C]/70 line-clamp-2">{c.description}</p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-[#0B192C]/10">
                            <span className="font-mono-tabular text-base font-bold text-[#0B192C]">
                              ₹{c.priceInr.toLocaleString('en-IN')}
                            </span>
                            {alreadyEnrolled ? (
                              <Link
                                to={`/learn/${c.id}/${c.modules[0]?.lessons[0]?.id}`}
                                className="px-3.5 py-2 rounded-lg bg-[#0D6E6E] text-white text-xs font-semibold"
                              >
                                Already Unlocked →
                              </Link>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  addToCart({
                                    cartItemId: c.id,
                                    itemId: c.id,
                                    itemType: 'course',
                                    title: c.title,
                                    subtitleOrAuthor: c.instructor,
                                    unitPriceInr: c.priceInr,
                                  });
                                  navigate('/checkout');
                                }}
                                className="px-3.5 py-2 rounded-lg bg-[#0B192C] text-white text-xs font-semibold hover:bg-[#0D6E6E]"
                              >
                                Buy Course
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {filteredStoreBooks.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-serif-display text-lg font-semibold text-[#0B192C]">
                    Books & E-Books ({filteredStoreBooks.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredStoreBooks.slice(0, 12).map((b) => (
                      <div
                        key={b.id}
                        className="p-4 rounded-2xl bg-white border border-[#0B192C]/10 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0 space-y-1">
                          <p className="text-[11px] font-mono-tabular text-[#0D6E6E]">
                            {b.category} · {b.subcategory}
                          </p>
                          <Link
                            to={`/books/${b.id}`}
                            className="font-serif-display text-sm font-bold text-[#0B192C] hover:text-[#0D6E6E] block truncate"
                          >
                            {b.title}
                          </Link>
                          <p className="text-xs text-[#0B192C]/65">{b.author}</p>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              addToCart({
                                cartItemId: `${b.id}_E-Book`,
                                itemId: b.id,
                                itemType: 'ebook',
                                title: `${b.title} (E-Book)`,
                                subtitleOrAuthor: b.author,
                                unitPriceInr: b.ebookPriceInr,
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-[#0D6E6E] text-white text-xs font-semibold hover:bg-[#0B192C]"
                          >
                            E-Book ₹{b.ebookPriceInr}
                          </button>
                          <button
                            type="button"
                            disabled={b.stock <= 0}
                            onClick={() =>
                              addToCart({
                                cartItemId: `${b.id}_Hardcover`,
                                itemId: b.id,
                                itemType: 'physical_book',
                                title: `${b.title} (Hardcover)`,
                                subtitleOrAuthor: b.author,
                                unitPriceInr: b.priceInr,
                                maxStock: b.stock,
                              })
                            }
                            className="px-3 py-1.5 rounded-lg border border-[#0B192C]/20 text-[#0B192C] text-xs font-semibold hover:bg-[#FAF8F5] disabled:opacity-40"
                          >
                            {b.stock > 0 ? `Print ₹${b.priceInr}` : 'Out of Stock'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* SECTION 5: MY ORDERS & PAYMENT HISTORY */}
          {activeSection === 'orders_payments' && (
            <section className="space-y-5">
              <div className="border-b border-[#0B192C]/10 pb-4">
                <p className="text-xs font-mono-tabular uppercase text-[#0D6E6E]">
                  Cashfree Payment History · Private to {user.email}
                </p>
                <h2 className="font-serif-display text-2xl font-bold text-[#0B192C]">
                  My Orders & Payment Status ({orders.length})
                </h2>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white border border-[#0B192C]/10 text-center space-y-3">
                  <CreditCard className="w-8 h-8 text-[#0D6E6E] mx-auto" />
                  <p className="text-sm text-[#0B192C]/70">
                    You have not placed any orders yet.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-white border border-[#0B192C]/10 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-[#0B192C]/10 bg-[#FAF8F5] font-semibold text-[#0B192C]">
                        <th className="py-3.5 px-4">Order & Cashfree ID</th>
                        <th className="py-3.5 px-4">Items</th>
                        <th className="py-3.5 px-4">Amount (INR)</th>
                        <th className="py-3.5 px-4">Payment Status</th>
                        <th className="py-3.5 px-4">Delivery / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0B192C]/10">
                      {orders.map((ord) => (
                        <tr key={ord.id}>
                          <td className="py-3.5 px-4 font-mono-tabular font-medium text-[#0B192C]">
                            {ord.id}
                            <span className="block text-[11px] text-[#0B192C]/55">
                              {new Date(ord.createdAt).toLocaleString()}
                            </span>
                            {ord.cashfreeOrderId && (
                              <span className="block text-[10px] text-[#0D6E6E]">
                                CF: {ord.cashfreeOrderId}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 max-w-xs text-[#0B192C]/80">
                            {ord.itemsSummary}
                          </td>
                          <td className="py-3.5 px-4 font-mono-tabular font-semibold text-[#0B192C]">
                            ₹{ord.totalInr.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 font-mono-tabular">
                            <span
                              className={`font-semibold uppercase ${
                                ord.status === 'paid'
                                  ? 'text-[#0D6E6E]'
                                  : ord.status === 'pending'
                                  ? 'text-amber-700'
                                  : 'text-red-700'
                              }`}
                            >
                              {ord.status}
                            </span>
                            <span className="block text-[11px] text-[#0B192C]/55">
                              {ord.status === 'paid'
                                ? 'Verified & Unlocked'
                                : 'Purchases Locked'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {ord.status === 'paid' ? (
                              <div>
                                <span className="inline-flex items-center gap-1.5 font-medium text-[#0B192C]">
                                  <Package className="w-3.5 h-3.5 text-[#0D6E6E]" />
                                  <span className="capitalize">
                                    {ord.shippingStatus.replace('_', ' ')}
                                  </span>
                                </span>
                                <span className="block text-[11px] text-[#0B192C]/60 truncate max-w-[190px]">
                                  {ord.shippingAddressSummary}
                                </span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled={verifyingOrderId === ord.id}
                                onClick={() => handleCompletePendingOrFailedOrder(ord.id)}
                                className="px-3 py-1.5 rounded-lg bg-[#0D6E6E] text-white text-xs font-semibold hover:bg-[#0B192C] inline-flex items-center gap-1.5"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>
                                  {verifyingOrderId === ord.id
                                    ? 'Verifying...'
                                    : 'Complete Sandbox Payment'}
                                </span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* SECTION 6: PROFILE SETTINGS */}
          {activeSection === 'profile_settings' && (
            <section className="max-w-2xl space-y-6">
              <div className="border-b border-[#0B192C]/10 pb-4">
                <p className="text-xs font-mono-tabular uppercase text-[#0D6E6E]">
                  Account Preferences & Security
                </p>
                <h2 className="font-serif-display text-2xl font-bold text-[#0B192C]">
                  Profile Settings
                </h2>
              </div>

              <form
                onSubmit={handleProfileSave}
                className="p-6 rounded-2xl bg-white border border-[#0B192C]/10 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="prof-email" className="block text-xs font-semibold text-[#0B192C] mb-1">
                      Registered Email (Read-only)
                    </label>
                    <input
                      id="prof-email"
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#0B192C]/15 bg-[#FAF8F5] text-[#0B192C]/60"
                    />
                  </div>
                  <div>
                    <label htmlFor="prof-role" className="block text-xs font-semibold text-[#0B192C] mb-1">
                      Server-Enforced Role (Read-only)
                    </label>
                    <input
                      id="prof-role"
                      type="text"
                      disabled
                      value={user.role === 'admin' ? 'admin' : 'user (student)'}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#0B192C]/15 bg-[#FAF8F5] text-[#0D6E6E] font-mono-tabular"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="prof-name" className="block text-xs font-semibold text-[#0B192C] mb-1">
                      Full Name *
                    </label>
                    <input
                      id="prof-name"
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                    />
                  </div>
                  <div>
                    <label htmlFor="prof-phone" className="block text-xs font-semibold text-[#0B192C] mb-1">
                      Mobile Number
                    </label>
                    <input
                      id="prof-phone"
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="prof-photo" className="block text-xs font-semibold text-[#0B192C] mb-1">
                    Profile Avatar Image URL (Optional)
                  </label>
                  <input
                    id="prof-photo"
                    type="url"
                    value={profilePhoto}
                    onChange={(e) => setProfilePhoto(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                  />
                </div>

                <div>
                  <label htmlFor="prof-bio" className="block text-xs font-semibold text-[#0B192C] mb-1">
                    Learning Goals & Bio
                  </label>
                  <textarea
                    id="prof-bio"
                    rows={3}
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    placeholder="Focusing on Python, Django 5, and Agentic AI..."
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="prof-newpass"
                    className="block text-xs font-semibold text-[#0B192C] mb-1"
                  >
                    Update Password (leave blank to keep current password)
                  </label>
                  <div className="relative">
                    <input
                      id="prof-newpass"
                      type={showNewPassword ? 'text' : 'password'}
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password (min 6 characters)"
                      className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#0B192C]/60 hover:text-[#0B192C]"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0B192C] text-white text-xs sm:text-sm font-semibold hover:bg-[#0D6E6E] transition-colors disabled:opacity-50"
                >
                  {savingProfile ? 'Saving Changes...' : 'Save Profile Settings'}
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
