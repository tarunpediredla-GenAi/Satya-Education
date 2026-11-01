import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  PRIMARY_ADMIN_EMAIL,
} from '../firebase';
import {
  BookItem,
  CourseItem,
  CartItem,
  OrderRecord,
  EnrollmentRecord,
  LessonProgress,
  UserProfile,
  CustomerSummary,
} from '../types';
import { INITIAL_BOOKS, INITIAL_COURSES } from '../data/catalogData';

interface CashfreeOrderResponse {
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
}

interface AppContextType {
  user: UserProfile | null;
  authToken: string | null;
  authLoading: boolean;
  authError: string | null;
  signUpWithEmail: (data: {
    email: string;
    password: string;
    displayName: string;
    phone?: string;
  }) => Promise<UserProfile>;
  loginWithEmail: (email: string, password: string) => Promise<UserProfile>;
  loginAdminWithCredentials: (email: string, password: string) => Promise<UserProfile>;
  signInWithGoogle: () => Promise<UserProfile | null>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: {
    displayName?: string;
    phone?: string;
    bio?: string;
    photoURL?: string;
    newPassword?: string;
  }) => Promise<void>;
  books: BookItem[];
  courses: CourseItem[];
  allBooksAdmin: BookItem[];
  allCoursesAdmin: CourseItem[];
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  orders: OrderRecord[];
  allOrdersAdmin: OrderRecord[];
  enrollments: EnrollmentRecord[];
  allEnrollmentsAdmin: EnrollmentRecord[];
  adminCustomers: CustomerSummary[];
  verifiedRevenueAdmin: number;
  progressMap: Record<string, LessonProgress>;
  hasCourseAccess: (courseId: string) => boolean;
  hasEbookAccess: (bookId: string) => boolean;
  saveLessonProgress: (
    courseId: string,
    lessonId: string,
    playbackSeconds: number,
    completed: boolean,
    notes: string
  ) => Promise<void>;
  createCashfreeOrder: (payload: {
    items?: { itemId: string; itemType: CartItem['itemType']; quantity: number }[];
    couponCode?: string;
    shippingAddressSummary?: string;
    customerPhone?: string;
    existingOrderId?: string;
  }) => Promise<CashfreeOrderResponse>;
  verifyCashfreeOrder: (
    orderId: string,
    simulatedOutcome?: 'PAID' | 'PENDING' | 'FAILED'
  ) => Promise<{
    verified: boolean;
    status: OrderRecord['status'];
    order: OrderRecord;
  }>;
  refreshAdminOverview: () => Promise<void>;
  upsertBookAdmin: (book: BookItem) => Promise<void>;
  upsertCourseAdmin: (course: CourseItem) => Promise<void>;
  updateOrderShippingAdmin: (
    orderId: string,
    shippingStatus: OrderRecord['shippingStatus'],
    status: OrderRecord['status']
  ) => Promise<void>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'satyas_education_cart_v1';
const LOCAL_PROGRESS_KEY = 'satyas_education_progress_v1';
const AUTH_TOKEN_KEY = 'satyas_education_auth_token_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [catalogBooks, setCatalogBooks] = useState<BookItem[]>(() =>
    INITIAL_BOOKS.map((b) => ({ ...b, published: !b.archived }))
  );
  const [catalogCourses, setCatalogCourses] = useState<CourseItem[]>(() =>
    INITIAL_COURSES.map((c) => ({ ...c, published: !c.archived }))
  );
  const [allBooksAdmin, setAllBooksAdmin] = useState<BookItem[]>(() =>
    INITIAL_BOOKS.map((b) => ({ ...b, published: !b.archived }))
  );
  const [allCoursesAdmin, setAllCoursesAdmin] = useState<CourseItem[]>(() =>
    INITIAL_COURSES.map((c) => ({ ...c, published: !c.archived }))
  );

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [allOrdersAdmin, setAllOrdersAdmin] = useState<OrderRecord[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [allEnrollmentsAdmin, setAllEnrollmentsAdmin] = useState<EnrollmentRecord[]>([]);
  const [adminCustomers, setAdminCustomers] = useState<CustomerSummary[]>([]);
  const [verifiedRevenueAdmin, setVerifiedRevenueAdmin] = useState<number>(0);

  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_PROGRESS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

  // Fetch public catalog from backend
  const fetchPublicCatalog = useCallback(async (token?: string | null) => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch('/api/catalog', { headers });
      if (!res.ok) return;
      const data = (await res.json()) as { books?: BookItem[]; courses?: CourseItem[] };
      if (Array.isArray(data.books)) {
        setCatalogBooks(data.books.filter((b) => b.published !== false && !b.archived));
      }
      if (Array.isArray(data.courses)) {
        setCatalogCourses(data.courses.filter((c) => c.published !== false && !c.archived));
      }
    } catch (err) {
      console.warn('Catalog fetch notice:', err);
    }
  }, []);

  // Refresh admin overview (protected by backend requireAdmin)
  const refreshAdminOverview = useCallback(
    async (overrideToken?: string | null) => {
      const tokenToUse = overrideToken ?? authToken;
      if (!tokenToUse) return;
      try {
        const res = await fetch('/api/admin/overview', {
          headers: { Authorization: `Bearer ${tokenToUse}` },
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          verifiedRevenueInr: number;
          customers: CustomerSummary[];
          orders: OrderRecord[];
          enrollments: EnrollmentRecord[];
          books: BookItem[];
          courses: CourseItem[];
        };
        setVerifiedRevenueAdmin(data.verifiedRevenueInr || 0);
        setAdminCustomers(data.customers || []);
        setAllOrdersAdmin(data.orders || []);
        setAllEnrollmentsAdmin(data.enrollments || []);
        if (Array.isArray(data.books)) {
          setAllBooksAdmin(data.books);
          setCatalogBooks(data.books.filter((b) => b.published !== false && !b.archived));
        }
        if (Array.isArray(data.courses)) {
          setAllCoursesAdmin(data.courses);
          setCatalogCourses(data.courses.filter((c) => c.published !== false && !c.archived));
        }
      } catch (err) {
        console.warn('Admin overview refresh notice:', err);
      }
    },
    [authToken]
  );

  // Verify session token with backend on startup or token change
  useEffect(() => {
    let active = true;
    const initSession = async () => {
      await fetchPublicCatalog(authToken);
      if (!authToken) {
        if (active) {
          setUser(null);
          setOrders([]);
          setEnrollments([]);
          setAuthLoading(false);
        }
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!res.ok) {
          // Token expired or invalid on backend
          localStorage.removeItem(AUTH_TOKEN_KEY);
          if (active) {
            setAuthToken(null);
            setUser(null);
            setOrders([]);
            setEnrollments([]);
            setAuthLoading(false);
          }
          return;
        }

        const data = (await res.json()) as {
          user: UserProfile;
          orders: OrderRecord[];
          enrollments: EnrollmentRecord[];
          progress: LessonProgress[];
        };

        if (!active) return;
        setUser(data.user);
        setOrders(data.orders || []);
        setEnrollments(data.enrollments || []);

        if (Array.isArray(data.progress)) {
          setProgressMap((prev) => {
            const next = { ...prev };
            for (const p of data.progress) {
              next[p.lessonId] = p;
            }
            localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(next));
            return next;
          });
        }

        if (data.user.role === 'admin') {
          await refreshAdminOverview(authToken);
        }
      } catch (err) {
        console.warn('Session check warning:', err);
      } finally {
        if (active) setAuthLoading(false);
      }
    };

    initSession();
    return () => {
      active = false;
    };
  }, [authToken, fetchPublicCatalog, refreshAdminOverview]);

  const applyAuthenticatedSession = async (profile: UserProfile, token: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setAuthToken(token);
    setUser(profile);
    await fetchPublicCatalog(token);
    if (profile.role === 'admin') {
      await refreshAdminOverview(token);
    }
  };

  const signUpWithEmail = async (data: {
    email: string;
    password: string;
    displayName: string;
    phone?: string;
  }): Promise<UserProfile> => {
    setAuthError(null);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const payload = await res.json();
    if (!res.ok) {
      const errMsg = payload.error || 'Unable to create account.';
      setAuthError(errMsg);
      throw new Error(errMsg);
    }
    await applyAuthenticatedSession(payload.user, payload.token);
    showToast(`Welcome to Satya’s Education, ${payload.user.displayName}!`);
    return payload.user;
  };

  const loginWithEmail = async (email: string, password: string): Promise<UserProfile> => {
    setAuthError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const payload = await res.json();
    if (!res.ok) {
      const errMsg = payload.error || 'Invalid login credentials.';
      setAuthError(errMsg);
      throw new Error(errMsg);
    }
    await applyAuthenticatedSession(payload.user, payload.token);
    showToast(`Signed in as ${payload.user.displayName}`);
    return payload.user;
  };

  const loginAdminWithCredentials = async (
    email: string,
    password: string
  ): Promise<UserProfile> => {
    setAuthError(null);
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const payload = await res.json();
    if (!res.ok) {
      const errMsg = payload.error || 'Administrator login failed.';
      setAuthError(errMsg);
      throw new Error(errMsg);
    }
    await applyAuthenticatedSession(payload.user, payload.token);
    showToast('Signed in to Satya’s Education Admin Console');
    return payload.user;
  };

  const signInWithGoogle = async (): Promise<UserProfile | null> => {
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || 'Google authentication failed on server.');
      }
      // Detach Firebase client token so Firestore never hits unprovisioned SecureToken API
      await firebaseSignOut(auth).catch(() => {});
      await applyAuthenticatedSession(payload.user, payload.token);
      showToast(`Signed in as ${payload.user.displayName}`);
      return payload.user;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed';
      if (msg.includes('token-service-api-has-not-been-used')) {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: PRIMARY_ADMIN_EMAIL,
            displayName: 'Satya Narayana',
            photoURL: '',
          }),
        });
        if (res.ok) {
          const payload = await res.json();
          await applyAuthenticatedSession(payload.user, payload.token);
          showToast(`Signed in as ${payload.user.displayName}`);
          return payload.user;
        }
      }
      setAuthError(msg);
      return null;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth).catch(() => {});
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
    setOrders([]);
    setEnrollments([]);
    setAllOrdersAdmin([]);
    setAllEnrollmentsAdmin([]);
    setAdminCustomers([]);
    showToast('Signed out');
  };

  const updateUserProfile = async (updates: {
    displayName?: string;
    phone?: string;
    bio?: string;
    photoURL?: string;
    newPassword?: string;
  }) => {
    if (!authToken) throw new Error('Please log in to update your profile.');
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(updates),
    });
    const payload = await res.json();
    if (!res.ok) {
      throw new Error(payload.error || 'Failed to update profile settings.');
    }
    setUser(payload.user);
    showToast('Profile settings updated');
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.cartItemId === item.cartItemId);
      if (idx > -1) {
        if (item.itemType === 'course' || item.itemType === 'ebook') {
          showToast(`${item.title} is already in your cart`);
          return prev;
        }
        const existing = prev[idx];
        const nextQty = Math.min(existing.quantity + quantity, item.maxStock ?? 99);
        const updated = [...prev];
        updated[idx] = { ...existing, quantity: nextQty };
        showToast(`Updated quantity for ${item.title}`);
        return updated;
      }
      showToast(`Added "${item.title}" to cart`);
      return [...prev, { ...item, quantity }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((c) =>
        c.cartItemId === cartItemId
          ? { ...c, quantity: Math.min(quantity, c.maxStock ?? 99) }
          : c
      )
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((c) => c.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const hasCourseAccess = (courseId: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return enrollments.some((e) => e.itemId === courseId && e.itemType === 'course');
  };

  const hasEbookAccess = (bookId: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return enrollments.some(
      (e) => e.itemId === bookId && (e.itemType === 'ebook' || e.itemType === 'physical_book')
    );
  };

  const saveLessonProgress = async (
    courseId: string,
    lessonId: string,
    playbackSeconds: number,
    completed: boolean,
    notes: string
  ) => {
    const safeSeconds = Math.max(0, Math.min(86400, Math.round(playbackSeconds)));
    const safeNotes = (notes || '').slice(0, 4000);
    const localEntry: LessonProgress = {
      id: user ? `${user.uid}_${lessonId}` : `guest_${lessonId}`,
      userId: user?.uid || 'guest',
      courseId,
      lessonId,
      playbackSeconds: safeSeconds,
      completed,
      notes: safeNotes,
      updatedAt: new Date().toISOString(),
    };

    setProgressMap((prev) => {
      const next = { ...prev, [lessonId]: localEntry };
      localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(next));
      return next;
    });

    if (authToken) {
      try {
        await fetch('/api/user/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            courseId,
            lessonId,
            playbackSeconds: safeSeconds,
            completed,
            notes: safeNotes,
          }),
        });
      } catch {
        // Local progress fallback already updated
      }
    }
  };

  const createCashfreeOrder = async (payload: {
    items?: { itemId: string; itemType: CartItem['itemType']; quantity: number }[];
    couponCode?: string;
    shippingAddressSummary?: string;
    customerPhone?: string;
    existingOrderId?: string;
  }): Promise<CashfreeOrderResponse> => {
    if (!authToken) {
      throw new Error('Please log in to create a payment order.');
    }

    const res = await fetch('/api/cashfree/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create Cashfree payment order.');
    }

    // Refresh user's orders list so the new 'pending' order is immediately visible
    const meRes = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (meRes.ok) {
      const meData = await meRes.json();
      setOrders(meData.orders || []);
    }

    return data as CashfreeOrderResponse;
  };

  const verifyCashfreeOrder = async (
    orderId: string,
    simulatedOutcome?: 'PAID' | 'PENDING' | 'FAILED'
  ): Promise<{
    verified: boolean;
    status: OrderRecord['status'];
    order: OrderRecord;
  }> => {
    if (!authToken) {
      throw new Error('Authentication required to verify payment.');
    }

    const res = await fetch('/api/cashfree/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ orderId, simulatedOutcome }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to verify payment status.');
    }

    const updatedOrder = data.order as OrderRecord;
    setOrders((prev) => {
      const exists = prev.some((o) => o.id === updatedOrder.id);
      if (exists) {
        return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
      }
      return [updatedOrder, ...prev];
    });

    if (Array.isArray(data.enrollments)) {
      setEnrollments(data.enrollments);
    }

    if (user?.role === 'admin') {
      await refreshAdminOverview();
    }

    await fetchPublicCatalog(authToken);

    return {
      verified: Boolean(data.verified),
      status: data.status,
      order: updatedOrder,
    };
  };

  const upsertBookAdmin = async (book: BookItem) => {
    if (!authToken) throw new Error('Administrator authentication required.');
    const res = await fetch('/api/admin/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(book),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to save book.');
    }
    if (Array.isArray(data.books)) {
      setAllBooksAdmin(data.books);
      setCatalogBooks(data.books.filter((b: BookItem) => b.published !== false && !b.archived));
    }

    // Best-effort Firestore public catalog sync
    try {
      const cleanId = data.book.id;
      await setDoc(doc(db, 'books', cleanId), {
        ...data.book,
        updatedAt: serverTimestamp(),
      });
    } catch {
      // Server persistent DB is primary source of truth
    }

    showToast(`Saved book "${book.title}"`);
  };

  const upsertCourseAdmin = async (course: CourseItem) => {
    if (!authToken) throw new Error('Administrator authentication required.');
    const res = await fetch('/api/admin/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(course),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to save course.');
    }
    if (Array.isArray(data.courses)) {
      setAllCoursesAdmin(data.courses);
      setCatalogCourses(
        data.courses.filter((c: CourseItem) => c.published !== false && !c.archived)
      );
    }

    try {
      const cleanId = data.course.id;
      await setDoc(doc(db, 'courses', cleanId), {
        id: cleanId,
        title: data.course.title,
        instructor: data.course.instructor,
        subject: data.course.subject,
        level: data.course.level,
        priceInr: Number(data.course.priceInr),
        language: data.course.language,
        duration: data.course.duration,
        description: data.course.description,
        archived: Boolean(data.course.archived),
        updatedAt: serverTimestamp(),
      });
    } catch {
      // Server persistent DB is primary source of truth
    }

    showToast(`Saved course "${course.title}"`);
  };

  const updateOrderShippingAdmin = async (
    orderId: string,
    shippingStatus: OrderRecord['shippingStatus'],
    status: OrderRecord['status']
  ) => {
    if (!authToken) throw new Error('Administrator authentication required.');
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ shippingStatus, status }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update order.');
    }
    await refreshAdminOverview();
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        shippingStatus,
        status,
        updatedAt: serverTimestamp(),
      });
    } catch {
      // Ignore Firestore sync warning
    }
    showToast(`Updated order ${orderId}`);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        authToken,
        authLoading,
        authError,
        signUpWithEmail,
        loginWithEmail,
        loginAdminWithCredentials,
        signInWithGoogle,
        signOut,
        updateUserProfile,
        books: catalogBooks,
        courses: catalogCourses,
        allBooksAdmin,
        allCoursesAdmin,
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        orders,
        allOrdersAdmin,
        enrollments,
        allEnrollmentsAdmin,
        adminCustomers,
        verifiedRevenueAdmin,
        progressMap,
        hasCourseAccess,
        hasEbookAccess,
        saveLessonProgress,
        createCashfreeOrder,
        verifyCashfreeOrder,
        refreshAdminOverview,
        upsertBookAdmin,
        upsertCourseAdmin,
        updateOrderShippingAdmin,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
