import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, User as UserIcon, LogOut, Shield, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const { user, authLoading, signInWithGoogle, signOut, cart, setIsCartOpen } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
    navigate(`/books?q=${q}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#0B192C]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Logo & Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 font-serif-display text-xl font-bold tracking-tight text-[#0B192C] whitespace-nowrap shrink-0"
        >
          <img
            src="/assets/aistudio/image_42ebc6e4.png"
            alt="Satya's Education Logo"
            className="h-10 w-10 rounded-lg object-contain bg-white p-0.5 border border-[#0B192C]/10 shadow-2xs"
          />
          <span>Satya’s Education</span>
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-6 text-sm font-medium">
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
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Toggle search bar"
            className="p-2 rounded-lg text-[#0B192C]/75 hover:text-[#0B192C] hover:bg-[#0B192C]/5 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Shopping cart with ${totalItems} items`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#0B192C] hover:bg-[#0B192C]/5 transition-colors whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="w-4 h-4 text-[#0D6E6E]" />
            <span className="font-mono-tabular">Cart ({totalItems})</span>
          </button>

          {authLoading ? (
            <div className="h-9 w-28 rounded-lg bg-[#0B192C]/10 animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-expanded={userMenuOpen}
                aria-label="Open account menu"
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-[#0B192C]/15 hover:bg-[#0B192C]/5 transition-colors text-sm font-medium whitespace-nowrap shrink-0"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#0D6E6E] text-white flex items-center justify-center text-xs font-bold">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline max-w-[110px] truncate">{user.displayName}</span>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-[#0B192C]/10 py-2 z-50"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-[#0B192C]/10">
                    <p className="text-xs font-semibold text-[#0B192C] truncate">{user.displayName}</p>
                    <p className="text-xs text-[#0B192C]/60 truncate">{user.email}</p>
                    <p className="text-[11px] font-mono-tabular text-[#0D6E6E] mt-0.5 uppercase">
                      Role: {user.role}
                    </p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0B192C] hover:bg-[#FAF8F5]"
                  >
                    <BookOpen className="w-4 h-4 text-[#0D6E6E]" />
                    <span>Student Dashboard</span>
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0B192C] hover:bg-[#FAF8F5]"
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
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-700 hover:bg-red-50 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/dashboard"
                className="hidden sm:inline-flex px-3.5 py-2 rounded-lg border border-[#0B192C]/20 text-[#0B192C] text-xs sm:text-sm font-medium hover:bg-[#0B192C]/5 transition-colors whitespace-nowrap"
              >
                Log In / Sign Up
              </Link>
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="px-4 py-2 rounded-lg bg-[#0B192C] text-[#FAF8F5] text-xs sm:text-sm font-medium hover:bg-[#0D6E6E] transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4" />
                <span>Continue with Google</span>
              </button>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 rounded-lg text-[#0B192C] hover:bg-[#0B192C]/5"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {searchOpen && (
        <div className="border-t border-[#0B192C]/10 bg-white px-4 py-3">
          <form onSubmit={handleGlobalSearch} className="max-w-3xl mx-auto flex items-center gap-3">
            <label htmlFor="global-search-input" className="sr-only">
              Search books, courses, or recorded lessons
            </label>
            <input
              id="global-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 40+ books (Python, Django, Stories, AI) or courses..."
              className="flex-1 px-4 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5] text-[#0B192C]"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#0D6E6E] text-white text-sm font-medium hover:bg-[#0B192C] transition-colors whitespace-nowrap shrink-0"
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
          className="lg:hidden border-t border-[#0B192C]/10 bg-[#FAF8F5] px-4 py-4 space-y-2"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#0B192C] hover:bg-[#0B192C]/5"
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#0D6E6E] hover:bg-[#0B192C]/5"
              >
                Student Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#B48327] hover:bg-[#0B192C]/5"
                >
                  Admin Console
                </Link>
              )}
            </>
          )}
        </nav>
      )}
    </header>
  );
};
