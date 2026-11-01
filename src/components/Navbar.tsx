import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  LogOut,
  Shield,
  BookOpen,
  Loader2,
  User as UserIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const { user, authLoading, signInWithGoogle, signOut, cart, setIsCartOpen } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [googleSigningIn, setGoogleSigningIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Books', path: '/books' },
    { label: 'Courses', path: '/courses' },
    { label: 'Recorded Classes', path: '/recorded-classes' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = encodeURIComponent(searchQuery.trim());
    setSearchOpen(false);
    setMobileMenuOpen(false);
    navigate(`/books?q=${q}`);
  };

  const handleGoogleSignIn = async () => {
    if (googleSigningIn) return;
    setGoogleSigningIn(true);
    try {
      const profile = await signInWithGoogle();
      setMobileMenuOpen(false);
      if (profile) {
        if (profile.role === 'admin' && location.pathname.startsWith('/admin')) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } finally {
      setGoogleSigningIn(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#0B192C]/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand Logo & Wordmark */}
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2 sm:gap-2.5 font-serif-display text-base sm:text-xl font-bold tracking-tight text-[#0B192C] whitespace-nowrap shrink-0 min-w-0"
        >
          <img
            src="/assets/aistudio/image_42ebc6e4.png"
            alt="Satya's Education Logo"
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg object-contain bg-white p-0.5 border border-[#0B192C]/10 shadow-2xs shrink-0"
          />
          <span className="truncate">Satya’s Education</span>
        </Link>

        {/* Zone 2: Desktop Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium"
        >
          {navLinks.map((link) => {
            const isActive =
              link.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
                  isActive
                    ? 'border-[#0D6E6E] text-[#0B192C] font-semibold'
                    : 'border-transparent text-[#0B192C]/70 hover:text-[#0B192C]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Search, Cart, and Google Auth / User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Toggle search bar"
            className="p-2.5 rounded-lg text-[#0B192C]/75 hover:text-[#0B192C] hover:bg-[#0B192C]/5 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Shopping cart with ${totalItems} items`}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-[#0B192C] hover:bg-[#0B192C]/5 transition-colors whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="w-4 h-4 text-[#0D6E6E] shrink-0" />
            <span className="hidden sm:inline font-mono-tabular">Cart ({totalItems})</span>
            <span className="sm:hidden font-mono-tabular font-semibold">({totalItems})</span>
          </button>

          {authLoading ? (
            <div className="hidden sm:block h-9 w-28 rounded-lg bg-[#0B192C]/10 animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-expanded={userMenuOpen}
                aria-label="Open account menu"
                className="flex items-center gap-2 pl-1.5 pr-2 sm:pr-3 py-1.5 rounded-lg border border-[#0B192C]/15 hover:bg-[#0B192C]/5 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap shrink-0"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#0D6E6E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline max-w-[110px] truncate">{user.displayName}</span>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 rounded-xl bg-white shadow-lg border border-[#0B192C]/10 py-2 z-50"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-[#0B192C]/10">
                    <p className="text-xs font-semibold text-[#0B192C] truncate">
                      {user.displayName}
                    </p>
                    <p className="text-xs text-[#0B192C]/60 truncate">{user.email}</p>
                    <p className="text-[11px] font-mono-tabular text-[#0D6E6E] mt-0.5 uppercase">
                      Role: {user.role === 'admin' ? 'admin' : 'user'}
                    </p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0B192C] hover:bg-[#FAF8F5]"
                  >
                    <BookOpen className="w-4 h-4 text-[#0D6E6E]" />
                    <span>User Dashboard</span>
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0B192C] hover:bg-[#FAF8F5]"
                    >
                      <Shield className="w-4 h-4 text-[#B48327]" />
                      <span>Admin Console</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded-lg border border-[#0B192C]/20 text-[#0B192C] text-xs sm:text-sm font-medium hover:bg-[#0B192C]/5 transition-colors whitespace-nowrap"
              >
                Log In / Sign Up
              </Link>
              <button
                type="button"
                disabled={googleSigningIn}
                onClick={handleGoogleSignIn}
                className="px-3.5 py-2 rounded-lg bg-[#0B192C] text-[#FAF8F5] text-xs sm:text-sm font-medium hover:bg-[#0D6E6E] transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 disabled:opacity-60"
              >
                {googleSigningIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
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
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="Open navigation menu"
            className="lg:hidden p-2.5 rounded-lg text-[#0B192C] hover:bg-[#0B192C]/5 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {searchOpen && (
        <div className="border-t border-[#0B192C]/10 bg-white px-4 py-3">
          <form
            onSubmit={handleGlobalSearch}
            className="max-w-3xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
          >
            <label htmlFor="global-search-input" className="sr-only">
              Search books, courses, or recorded lessons
            </label>
            <input
              id="global-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 40+ books (Python, Django, Stories, AI) or courses..."
              className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5] text-[#0B192C]"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg bg-[#0D6E6E] text-white text-sm font-medium hover:bg-[#0B192C] transition-colors whitespace-nowrap shrink-0"
            >
              Search Catalog
            </button>
          </form>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="lg:hidden border-t border-[#0B192C]/10 bg-[#FAF8F5] px-4 py-4 space-y-3 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto"
        >
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#0B192C] text-[#FAF8F5] font-semibold'
                      : 'text-[#0B192C] hover:bg-[#0B192C]/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#0B192C]/10 space-y-2.5">
            {user ? (
              <>
                <div className="px-3.5 py-2.5 rounded-xl bg-white border border-[#0B192C]/10 flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#0D6E6E] text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#0B192C] truncate">
                      {user.displayName}
                    </p>
                    <p className="text-[11px] text-[#0B192C]/65 truncate">{user.email}</p>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D6E6E] text-white text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open User Dashboard</span>
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#B48327]/20 text-[#0B192C] text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-[#B48327]" />
                    <span>Open Admin Console</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-red-200 text-red-700 bg-white text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={googleSigningIn}
                  onClick={handleGoogleSignIn}
                  className="w-full py-3 px-4 rounded-xl bg-[#0B192C] text-[#FAF8F5] text-sm font-semibold hover:bg-[#0D6E6E] transition-colors flex items-center justify-center gap-2.5 disabled:opacity-60"
                >
                  {googleSigningIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in with Google...</span>
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
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#0B192C]/20 bg-white text-[#0B192C] text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-[#0D6E6E]" />
                  <span>Log In / Sign Up with Email</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};
