import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, updateCartQuantity, removeFromCart } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const subtotalInr = cart.reduce((sum, item) => sum + item.unitPriceInr * item.quantity, 0);
  const hasPhysical = cart.some((item) => item.itemType === 'physical_book');
  const shippingInr = hasPhysical ? (subtotalInr >= 999 ? 0 : 79) : 0;
  const grandTotalInr = subtotalInr + shippingInr;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      <div className="w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl flex flex-col justify-between border-l border-[#0B192C]/10">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#0B192C]/10 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#0D6E6E]" />
            <h2 id="cart-drawer-title" className="font-serif-display text-lg font-semibold text-[#0B192C]">
              Your Learning Bag
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close shopping bag"
            className="p-2 rounded-lg text-[#0B192C]/60 hover:text-[#0B192C] hover:bg-[#0B192C]/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <p className="text-[#0B192C]/70 text-sm">Your bag is currently empty.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/books');
                  }}
                  className="px-4 py-2 rounded-lg bg-[#0B192C] text-white text-xs font-medium hover:bg-[#0D6E6E] transition-colors"
                >
                  Browse 40 Books
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/courses');
                  }}
                  className="px-4 py-2 rounded-lg border border-[#0B192C]/20 text-[#0B192C] text-xs font-medium hover:bg-white transition-colors"
                >
                  Explore Courses
                </button>
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.cartItemId}
                className="p-4 rounded-xl bg-white border border-[#0B192C]/10 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#0D6E6E] font-medium">
                      {item.itemType === 'course'
                        ? 'Online Course + Recorded Classes'
                        : item.itemType === 'ebook'
                        ? 'Downloadable E-Book'
                        : 'Hardcover Print Edition'}
                    </p>
                    <h3 className="text-sm font-semibold text-[#0B192C] mt-0.5">{item.title}</h3>
                    <p className="text-xs text-[#0B192C]/60">{item.subtitleOrAuthor}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.cartItemId)}
                    aria-label={`Remove ${item.title} from bag`}
                    className="p-1.5 text-[#0B192C]/40 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#0B192C]/5">
                  {item.itemType === 'physical_book' ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="p-1 rounded border border-[#0B192C]/20 hover:bg-[#FAF8F5]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-mono-tabular w-6 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="p-1 rounded border border-[#0B192C]/20 hover:bg-[#FAF8F5]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-[#0B192C]/60">Instant Digital Access</span>
                  )}

                  <span className="text-sm font-semibold font-mono-tabular text-[#0B192C]">
                    ₹{(item.unitPriceInr * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Totals */}
        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-[#0B192C]/10 space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#0B192C]/70">
                <span>Subtotal</span>
                <span className="font-mono-tabular">₹{subtotalInr.toLocaleString('en-IN')}</span>
              </div>
              {hasPhysical && (
                <div className="flex justify-between text-[#0B192C]/70">
                  <span>Shipping (Free over ₹999)</span>
                  <span className="font-mono-tabular">
                    {shippingInr === 0 ? 'FREE' : `₹${shippingInr}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#0B192C] pt-2 border-t border-[#0B192C]/10">
                <span>Total (INR)</span>
                <span className="font-mono-tabular">₹{grandTotalInr.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsCartOpen(false);
                navigate('/checkout');
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#0B192C] text-white text-sm font-semibold hover:bg-[#0D6E6E] transition-colors flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
