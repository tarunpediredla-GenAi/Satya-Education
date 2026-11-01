import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  Lock,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ShippingAddress, OrderRecord } from '../types';

export const CheckoutPage: React.FC = () => {
  const {
    user,
    signInWithGoogle,
    loginWithEmail,
    signUpWithEmail,
    cart,
    clearCart,
    createCashfreeOrder,
    verifyCashfreeOrder,
    showToast,
  } = useApp();
  const navigate = useNavigate();

  const hasPhysical = cart.some((item) => item.itemType === 'physical_book');

  // Inline auth state if user reaches checkout while logged out
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [inlineAuthError, setInlineAuthError] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [shipping, setShipping] = useState<ShippingAddress>({
    fullName: user?.displayName || '',
    phone: user?.phone || '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Cashfree Payment state machine: review -> awaiting_cashfree -> processing -> paid | pending | failed
  const [checkoutStep, setCheckoutStep] = useState<
    'review' | 'awaiting_cashfree' | 'processing' | 'paid' | 'pending' | 'failed'
  >('review');

  const [cashfreeSession, setCashfreeSession] = useState<{
    orderId: string;
    cashfreeOrderId: string;
    paymentSessionId: string;
    subtotalInr: number;
    discountInr: number;
    shippingInr: number;
    totalInr: number;
    mode: OrderRecord['paymentMode'];
    cashfreeLiveKeysActive?: boolean;
    status: OrderRecord['status'];
  } | null>(null);

  const [verifiedOrder, setVerifiedOrder] = useState<OrderRecord | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleInlineAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineAuthError(null);
    setAuthBusy(true);
    try {
      if (authMode === 'signup') {
        await signUpWithEmail({
          email: authEmail,
          password: authPassword,
          displayName: authName,
        });
      } else {
        await loginWithEmail(authEmail, authPassword);
      }
    } catch (err: unknown) {
      setInlineAuthError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setAuthBusy(false);
    }
  };

  if (cart.length === 0 && checkoutStep !== 'paid' && checkoutStep !== 'pending') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-serif-display text-2xl font-bold text-[#0B192C]">Your Cart is Empty</h1>
        <p className="text-sm text-[#0B192C]/70">
          Add technology books, literary story books, or online courses before proceeding to Cashfree checkout.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link
            to="/books"
            className="px-5 py-2.5 rounded-xl bg-[#0B192C] text-white text-xs font-semibold hover:bg-[#0D6E6E]"
          >
            Browse Books
          </Link>
          <Link
            to="/courses"
            className="px-5 py-2.5 rounded-xl border border-[#0B192C]/20 text-xs font-semibold text-[#0B192C]"
          >
            Explore Courses
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="p-7 rounded-2xl bg-white border border-[#0B192C]/15 space-y-5 shadow-xs">
          <div className="text-center space-y-2">
            <Lock className="w-8 h-8 text-[#0D6E6E] mx-auto" />
            <h1 className="font-serif-display text-2xl font-bold text-[#0B192C]">
              Sign In to Complete Checkout
            </h1>
            <p className="text-xs text-[#0B192C]/70">
              Your purchased courses, recorded lessons, and e-books are unlocked exclusively for your authenticated student account.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF8F5] rounded-xl border border-[#0B192C]/10">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`py-2 rounded-lg text-xs font-semibold ${
                authMode === 'login' ? 'bg-[#0B192C] text-white' : 'text-[#0B192C]/70'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`py-2 rounded-lg text-xs font-semibold ${
                authMode === 'signup' ? 'bg-[#0B192C] text-white' : 'text-[#0B192C]/70'
              }`}
            >
              Create Account
            </button>
          </div>

          {inlineAuthError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {inlineAuthError}
            </div>
          )}

          <form onSubmit={handleInlineAuth} className="space-y-3">
            {authMode === 'signup' && (
              <div>
                <label htmlFor="chk-name" className="block text-xs font-semibold text-[#0B192C] mb-1">
                  Full Name *
                </label>
                <input
                  id="chk-name"
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                />
              </div>
            )}
            <div>
              <label htmlFor="chk-email" className="block text-xs font-semibold text-[#0B192C] mb-1">
                Email Address *
              </label>
              <input
                id="chk-email"
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label htmlFor="chk-pass" className="block text-xs font-semibold text-[#0B192C] mb-1">
                Password *
              </label>
              <input
                id="chk-pass"
                type="password"
                required
                minLength={6}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
              />
            </div>
            <button
              type="submit"
              disabled={authBusy}
              className="w-full py-2.5 rounded-xl bg-[#0B192C] text-white text-xs font-semibold hover:bg-[#0D6E6E] transition-colors"
            >
              {authBusy
                ? 'Authenticating...'
                : authMode === 'signup'
                ? 'Create Student Account & Continue'
                : 'Log In & Continue to Checkout'}
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-[#0B192C]/10" />
            <span className="shrink mx-3 text-[11px] text-[#0B192C]/50 uppercase">or</span>
            <div className="grow border-t border-[#0B192C]/10" />
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full py-2.5 rounded-xl border border-[#0B192C]/20 text-xs font-semibold text-[#0B192C] hover:bg-[#FAF8F5] transition-colors"
          >
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  // Client-side preview calculation (canonical calculation is enforced on backend from DB prices)
  const rawSubtotal = cart.reduce((sum, item) => sum + item.unitPriceInr * item.quantity, 0);
  const previewDiscount =
    appliedCoupon === 'LEARN20'
      ? Math.round(rawSubtotal * 0.2)
      : appliedCoupon === 'SATYA10'
      ? Math.round(rawSubtotal * 0.1)
      : 0;
  const discountedSubtotal = Math.max(0, rawSubtotal - previewDiscount);
  const previewShipping = hasPhysical ? (discountedSubtotal >= 999 ? 0 : 79) : 0;
  const previewTotal = discountedSubtotal + previewShipping;

  const validateShipping = (): boolean => {
    if (!hasPhysical) return true;
    const errs: Record<string, string> = {};
    if (!shipping.fullName.trim()) errs.fullName = 'Full name is required for delivery';
    if (!/^[0-9+\-\s]{10,15}$/.test(shipping.phone.trim()))
      errs.phone = 'Enter a valid 10-digit Indian phone number';
    if (shipping.streetAddress.trim().length < 5)
      errs.streetAddress = 'Street address is required';
    if (!shipping.city.trim()) errs.city = 'City is required';
    if (!shipping.state.trim()) errs.state = 'State is required';
    if (!/^[0-9]{6}$/.test(shipping.postalCode.trim()))
      errs.postalCode = 'Enter a valid 6-digit PIN code';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'SATYA10' || code === 'LEARN20') {
      setAppliedCoupon(code);
      showToast(`Applied coupon ${code}`);
    } else {
      showToast('Try coupon code SATYA10 (10% off) or LEARN20 (20% off)');
    }
  };

  const handleInitiateCashfreeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    if (!validateShipping()) return;

    setCheckoutStep('processing');
    try {
      const shippingSummary = hasPhysical
        ? `${shipping.fullName}, ${shipping.streetAddress}, ${shipping.city}, ${shipping.state} - ${shipping.postalCode} (Ph: ${shipping.phone})`
        : 'Digital Instant Delivery (No physical shipping required)';

      const session = await createCashfreeOrder({
        items: cart.map((c) => ({
          itemId: c.itemId,
          itemType: c.itemType,
          quantity: c.quantity,
        })),
        couponCode: appliedCoupon,
        shippingAddressSummary: shippingSummary,
        customerPhone: shipping.phone || user.phone || '9876543210',
      });

      setCashfreeSession(session);
      setCheckoutStep('awaiting_cashfree');
    } catch (err: unknown) {
      setPaymentError(err instanceof Error ? err.message : 'Could not create Cashfree order');
      setCheckoutStep('failed');
    }
  };

  const handleVerifyCashfreePayment = async (outcome: 'PAID' | 'PENDING' | 'FAILED') => {
    if (!cashfreeSession) return;
    setCheckoutStep('processing');
    setPaymentError(null);

    try {
      const result = await verifyCashfreeOrder(cashfreeSession.orderId, outcome);
      setVerifiedOrder(result.order);

      if (result.status === 'paid') {
        clearCart();
        setCheckoutStep('paid');
      } else if (result.status === 'pending') {
        setCheckoutStep('pending');
        setPaymentError(
          'Your Cashfree payment is currently PENDING confirmation. Purchases will unlock automatically once payment is verified as PAID.'
        );
      } else {
        setCheckoutStep('failed');
        setPaymentError(
          'Payment FAILED or was declined by the payment gateway. Purchases remain locked and your cart has been preserved.'
        );
      }
    } catch (err: unknown) {
      setPaymentError(err instanceof Error ? err.message : 'Payment verification error');
      setCheckoutStep('failed');
    }
  };

  // STATE 1: VERIFIED SUCCESSFUL PAYMENT ('paid')
  if (checkoutStep === 'paid' && verifiedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="p-8 rounded-2xl bg-white border border-[#0B192C]/15 text-center space-y-6 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#0D6E6E]/15 text-[#0D6E6E] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-mono-tabular uppercase text-[#0D6E6E]">
              Cashfree Sandbox · Payment Verified (PAID)
            </p>
            <h1 className="font-serif-display text-3xl font-bold text-[#0B192C]">
              Payment Successful & Purchases Unlocked!
            </h1>
            <p className="text-sm text-[#0B192C]/75">
              Order ID: <span className="font-mono-tabular font-semibold">{verifiedOrder.id}</span> ·
              Payment Ref: <span className="font-mono-tabular">{verifiedOrder.paymentId}</span>
            </p>
          </div>
          <p className="text-sm text-[#0B192C]/80 leading-relaxed">
            Your payment of <strong>₹{verifiedOrder.totalInr.toLocaleString('en-IN')}</strong> was verified on the backend. Your purchased courses, recorded lessons, and e-books are now unlocked in your User Panel.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-xl bg-[#0B192C] text-white text-sm font-semibold hover:bg-[#0D6E6E] transition-colors"
            >
              Open User Panel (/dashboard)
            </button>
            <Link
              to="/recorded-classes"
              className="px-6 py-3 rounded-xl border border-[#0B192C]/20 text-sm font-semibold text-[#0B192C] hover:bg-[#FAF8F5]"
            >
              Watch Recorded Classes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // STATE 2: PENDING PAYMENT ('pending') — Purchases NOT unlocked yet
  if (checkoutStep === 'pending' && verifiedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="p-8 rounded-2xl bg-white border border-amber-300 text-center space-y-6 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-mono-tabular uppercase text-amber-800">
              Cashfree Payment Status: PENDING
            </p>
            <h1 className="font-serif-display text-3xl font-bold text-[#0B192C]">
              Awaiting Payment Confirmation
            </h1>
            <p className="text-sm text-[#0B192C]/75">
              Order ID: <span className="font-mono-tabular font-semibold">{verifiedOrder.id}</span> ·
              Amount: <span className="font-mono-tabular font-semibold">₹{verifiedOrder.totalInr.toLocaleString('en-IN')}</span>
            </p>
          </div>
          <p className="text-sm text-[#0B192C]/80 leading-relaxed">
            Your order has been recorded with <strong>pending</strong> status. For security, courses and downloadable e-books remain locked until Cashfree confirms a successful payment via backend verification or webhook.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleVerifyCashfreePayment('PAID')}
              className="px-5 py-2.5 rounded-xl bg-[#0D6E6E] text-white text-xs sm:text-sm font-semibold hover:bg-[#0B192C] transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Complete & Verify Sandbox Payment Now</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl border border-[#0B192C]/20 text-xs sm:text-sm font-semibold text-[#0B192C] hover:bg-[#FAF8F5]"
            >
              View Order in User Panel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        to="/books"
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#0B192C]/70 hover:text-[#0B192C]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Continue Shopping</span>
      </Link>

      <div className="border-b border-[#0B192C]/10 pb-4">
        <p className="text-xs font-mono-tabular uppercase text-[#0D6E6E]">
          Cashfree Payments Gateway (Sandbox Mode) · Server-Verified Pricing
        </p>
        <h1 className="font-serif-display text-3xl font-bold text-[#0B192C] mt-1">
          Checkout & Enrollment
        </h1>
      </div>

      {/* STATE 3: FAILED PAYMENT BANNER */}
      {paymentError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                {checkoutStep === 'failed' ? 'Payment Failed — Purchases Locked' : 'Payment Notice'}
              </p>
              <p className="text-xs mt-0.5">{paymentError}</p>
            </div>
          </div>
          {cashfreeSession && checkoutStep === 'failed' && (
            <button
              type="button"
              onClick={() => setCheckoutStep('awaiting_cashfree')}
              className="px-3.5 py-2 rounded-lg bg-red-700 text-white text-xs font-semibold hover:bg-red-800 shrink-0"
            >
              Retry Payment
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleInitiateCashfreeOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left 7 Cols: Account & Conditional Shipping Address */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[#0B192C]/10 space-y-3">
            <h2 className="font-serif-display text-lg font-semibold text-[#0B192C]">
              1. Student Account
            </h2>
            <p className="text-sm text-[#0B192C]/80">
              Signed in as <strong>{user.displayName}</strong> ({user.email})
            </p>
            <p className="text-xs text-[#0B192C]/60">
              Courses, recorded lessons, and downloadable e-books will be unlocked for this account only after Cashfree payment verification succeeds.
            </p>
          </div>

          {hasPhysical ? (
            <div className="p-6 rounded-2xl bg-white border border-[#0B192C]/10 space-y-5">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#0D6E6E]" />
                <h2 className="font-serif-display text-lg font-semibold text-[#0B192C]">
                  2. Shipping Address (For Physical Hardcover Books)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ship-name" className="block text-xs font-semibold text-[#0B192C] mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    id="ship-name"
                    type="text"
                    value={shipping.fullName}
                    onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                  />
                  {formErrors.fullName && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="ship-phone" className="block text-xs font-semibold text-[#0B192C] mb-1">
                    Mobile Number (10 digits) *
                  </label>
                  <input
                    id="ship-phone"
                    type="tel"
                    placeholder="9876543210"
                    value={shipping.phone}
                    onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                  />
                  {formErrors.phone && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="ship-street" className="block text-xs font-semibold text-[#0B192C] mb-1">
                    House / Flat No., Building & Street Address *
                  </label>
                  <input
                    id="ship-street"
                    type="text"
                    value={shipping.streetAddress}
                    onChange={(e) => setShipping({ ...shipping, streetAddress: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                  />
                  {formErrors.streetAddress && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.streetAddress}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="ship-city" className="block text-xs font-semibold text-[#0B192C] mb-1">
                    City / Town *
                  </label>
                  <input
                    id="ship-city"
                    type="text"
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                  />
                  {formErrors.city && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="ship-state" className="block text-xs font-semibold text-[#0B192C] mb-1">
                    State *
                  </label>
                  <input
                    id="ship-state"
                    type="text"
                    value={shipping.state}
                    onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                  />
                  {formErrors.state && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.state}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="ship-pin" className="block text-xs font-semibold text-[#0B192C] mb-1">
                    PIN Code (6 digits) *
                  </label>
                  <input
                    id="ship-pin"
                    type="text"
                    maxLength={6}
                    placeholder="560001"
                    value={shipping.postalCode}
                    onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
                  />
                  {formErrors.postalCode && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.postalCode}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-[#F3EDE0] border border-[#0B192C]/10 text-xs sm:text-sm text-[#0B192C]/80 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#0D6E6E] shrink-0" />
              <span>
                Your bag contains only digital items (Courses / E-Books). No physical shipping address is needed.
              </span>
            </div>
          )}
        </div>

        {/* Right 5 Cols: Order Summary & Cashfree Payment Trigger */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[#0B192C]/15 space-y-5 shadow-xs">
            <h2 className="font-serif-display text-lg font-semibold text-[#0B192C]">
              Order Summary (Database Prices)
            </h2>

            <div className="divide-y divide-[#0B192C]/10 max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.cartItemId} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-[#0B192C]">{item.title}</p>
                    <p className="text-[#0B192C]/60">
                      Qty: {item.quantity} · {item.itemType}
                    </p>
                  </div>
                  <span className="font-mono-tabular font-semibold text-[#0B192C]">
                    ₹{(item.unitPriceInr * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code */}
            <div className="pt-2 border-t border-[#0B192C]/10">
              <label htmlFor="coupon-input" className="block text-xs font-semibold text-[#0B192C] mb-1.5">
                Scholarship / Coupon Code (Try SATYA10 or LEARN20)
              </label>
              <div className="flex gap-2">
                <input
                  id="coupon-input"
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="SATYA10"
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5] uppercase font-mono-tabular"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 rounded-lg border border-[#0B192C]/20 text-xs font-semibold text-[#0B192C] hover:bg-[#FAF8F5]"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 pt-3 border-t border-[#0B192C]/10 text-sm">
              <div className="flex justify-between text-[#0B192C]/70">
                <span>Subtotal</span>
                <span className="font-mono-tabular">₹{rawSubtotal.toLocaleString('en-IN')}</span>
              </div>
              {previewDiscount > 0 && (
                <div className="flex justify-between text-[#0D6E6E] font-medium">
                  <span>Discount ({appliedCoupon})</span>
                  <span className="font-mono-tabular">-₹{previewDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {hasPhysical && (
                <div className="flex justify-between text-[#0B192C]/70">
                  <span>Insured Shipping</span>
                  <span className="font-mono-tabular">
                    {previewShipping === 0 ? 'FREE' : `₹${previewShipping}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-[#0B192C] pt-2 border-t border-[#0B192C]/10">
                <span>Total Payable</span>
                <span className="font-mono-tabular">₹{previewTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={checkoutStep === 'processing'}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0B192C] text-white text-sm font-semibold hover:bg-[#0D6E6E] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {checkoutStep === 'processing'
                  ? 'Creating Cashfree Order...'
                  : `Pay ₹${previewTotal.toLocaleString('en-IN')} with Cashfree (Sandbox)`}
              </span>
            </button>
          </div>
        </div>
      </form>

      {/* Cashfree Sandbox Payment Modal */}
      {checkoutStep === 'awaiting_cashfree' && cashfreeSession && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cashfree-modal-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#0B192C]/15 shadow-2xl overflow-hidden">
            <div className="p-5 bg-[#0B192C] text-[#FAF8F5] flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono-tabular uppercase text-[#C59B27]">
                  Cashfree Payments · Sandbox Environment
                </p>
                <h3 id="cashfree-modal-title" className="font-serif-display text-lg font-semibold">
                  Satya’s Education — INR Checkout
                </h3>
              </div>
              <span className="text-lg font-bold font-mono-tabular text-[#C59B27]">
                ₹{cashfreeSession.totalInr.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#0B192C]/10 text-xs space-y-1 font-mono-tabular">
                <div>Order ID: {cashfreeSession.orderId}</div>
                <div>Cashfree Order ID: {cashfreeSession.cashfreeOrderId}</div>
                <div className="truncate">Session: {cashfreeSession.paymentSessionId}</div>
                <div>Initial DB Status: PENDING (Locked)</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F3EDE0] border border-[#0B192C]/10 text-xs text-[#0B192C]/85 leading-relaxed">
                <strong>Cashfree Sandbox Verification:</strong> Select a payment outcome below to verify how the backend handles <strong>Successful (PAID)</strong>, <strong>Pending</strong>, and <strong>Failed</strong> states. Courses and e-books unlock <em>only</em> after verified PAID status.
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleVerifyCashfreePayment('PAID')}
                  className="w-full py-3 px-4 rounded-xl bg-[#0D6E6E] text-white text-sm font-semibold hover:bg-[#0B192C] transition-colors"
                >
                  Authorize & Verify PAID (₹{cashfreeSession.totalInr.toLocaleString('en-IN')})
                </button>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleVerifyCashfreePayment('PENDING')}
                    className="py-2.5 px-3 rounded-xl border border-amber-400 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100"
                  >
                    Test Pending State
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyCashfreePayment('FAILED')}
                    className="py-2.5 px-3 rounded-xl border border-red-300 bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100"
                  >
                    Test Failed Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
