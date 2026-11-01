import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as updateFirebaseAuthProfile,
  updatePassword as updateFirebaseAuthPassword,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  formatFirebaseAuthError,
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
  clearAuthError: () => void;
  signUpWithEmail: (data: {
    email: string;
    password: string;
    displayName: string;
    phone?: string;
  }) => Promise<UserProfile>;
  loginWithEmail: (email: string, password: string) => Promise<UserProfile>;
  loginAdminWithCredentials: (email: string, password: string) => Promise<UserProfile>;
  signInWithGoogle: () => Promise<UserProfile | null>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
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
  deleteBookAdmin: (bookId: string) => Promise<void>;
  upsertCourseAdmin: (course: CourseItem) => Promise<void>;
  deleteCourseAdmin: (courseId: string) => Promise<void>;
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
const PRIMARY_OWNER_ADMIN_EMAIL = 'tarunpediredla9966@gmail.com';

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

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

  // Synchronize user document in Cloud Firestore `users/{uid}` (TASK 4)
  // Stores uid, displayName, email, photoURL, createdAt, lastLoginAt, role = 'user' (unless admin)
  const syncUserDocumentInFirestore = useCallback(
    async (
      fbUser: FirebaseUser,
      extras?: { displayName?: string; phone?: string; bio?: string }
    ): Promise<UserProfile> => {
      const cleanEmail = (fbUser.email || '').toLowerCase().trim();
      const nowIso = new Date().toISOString();
      const isOwnerEmail = cleanEmail === PRIMARY_OWNER_ADMIN_EMAIL;

      let resolvedRole: 'user' | 'admin' = isOwnerEmail ? 'admin' : 'user';
      let resolvedDisplayName =
        extras?.displayName?.trim() ||
        fbUser.displayName?.trim() ||
        cleanEmail.split('@')[0] ||
        'Learner';
      let resolvedPhotoUrl = fbUser.photoURL || '';
      let resolvedPhone = extras?.phone?.trim() || '';
      let resolvedBio = extras?.bio?.trim() || '';
      let resolvedCreatedAt = nowIso;

      try {
        const userRef = doc(db, 'users', fbUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const existing = snap.data() as Partial<UserProfile> & { createdAt?: unknown };
          if (existing.role === 'admin' || isOwnerEmail) {
            resolvedRole = 'admin';
          } else {
            resolvedRole = 'user';
          }
          if (!extras?.displayName && existing.displayName) {
            resolvedDisplayName = existing.displayName;
          }
          if (!resolvedPhotoUrl && existing.photoURL) {
            resolvedPhotoUrl = existing.photoURL;
          }
          if (!extras?.phone && existing.phone) {
            resolvedPhone = existing.phone;
          }
          if (!extras?.bio && existing.bio) {
            resolvedBio = existing.bio;
          }
          if (typeof existing.createdAt === 'string') {
            resolvedCreatedAt = existing.createdAt;
          }

          await setDoc(
            userRef,
            {
              uid: fbUser.uid,
              email: cleanEmail,
              displayName: resolvedDisplayName.slice(0, 120),
              photoURL: resolvedPhotoUrl.slice(0, 1024),
              phone: resolvedPhone.slice(0, 24),
              bio: resolvedBio.slice(0, 500),
              role: resolvedRole,
              lastLoginAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } else {
          await setDoc(userRef, {
            uid: fbUser.uid,
            email: cleanEmail,
            displayName: resolvedDisplayName.slice(0, 120),
            photoURL: resolvedPhotoUrl.slice(0, 1024),
            phone: resolvedPhone.slice(0, 24),
            bio: resolvedBio.slice(0, 500),
            role: resolvedRole,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        console.warn('Firestore user profile sync notice:', err);
      }

      return {
        uid: fbUser.uid,
        email: cleanEmail,
        displayName: resolvedDisplayName,
        photoURL: resolvedPhotoUrl,
        phone: resolvedPhone,
        bio: resolvedBio,
        role: resolvedRole,
        emailVerified: fbUser.emailVerified,
        createdAt: resolvedCreatedAt,
        lastLoginAt: nowIso,
        updatedAt: nowIso,
      };
    },
    []
  );

  // Fetch public catalog from backend (with Firestore fallback if static deployment)
  const fetchPublicCatalog = useCallback(async (token?: string | null) => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch('/api/catalog', { headers });
      if (res.ok) {
        const data = (await res.json()) as { books?: BookItem[]; courses?: CourseItem[] };
        if (Array.isArray(data.books) && data.books.length > 0) {
          setCatalogBooks(data.books.filter((b) => b.published !== false && !b.archived));
        }
        if (Array.isArray(data.courses) && data.courses.length > 0) {
          setCatalogCourses(data.courses.filter((c) => c.published !== false && !c.archived));
        }
        return;
      }
    } catch {
      // Fallback to Firestore public catalog if Express backend is unreachable
    }

    try {
      const [booksSnap, coursesSnap] = await Promise.all([
        getDocs(collection(db, 'books')),
        getDocs(collection(db, 'courses')),
      ]);
      if (!booksSnap.empty) {
        const fsBooks: BookItem[] = [];
        booksSnap.forEach((d) => fsBooks.push(d.data() as BookItem));
        setAllBooksAdmin(fsBooks);
        setCatalogBooks(fsBooks.filter((b) => b.published !== false && !b.archived));
      }
      if (!coursesSnap.empty) {
        const fsCourses: CourseItem[] = [];
        coursesSnap.forEach((d) => {
          const cData = d.data() as CourseItem;
          const fallbackCourse = INITIAL_COURSES.find((ic) => ic.id === cData.id);
          fsCourses.push({
            ...(fallbackCourse || INITIAL_COURSES[0]),
            ...cData,
            modules:
              Array.isArray(cData.modules) && cData.modules.length > 0
                ? cData.modules
                : fallbackCourse?.modules || INITIAL_COURSES[0].modules,
          });
        });
        setAllCoursesAdmin(fsCourses);
        setCatalogCourses(fsCourses.filter((c) => c.published !== false && !c.archived));
      }
    } catch {
      // Initial catalog remains loaded
    }
  }, []);

  // Refresh admin overview (protected by backend requireAdmin + Firestore fallback)
  const refreshAdminOverview = useCallback(
    async (overrideToken?: string | null) => {
      const tokenToUse = overrideToken ?? authToken;
      if (!tokenToUse) return;
      try {
        const res = await fetch('/api/admin/overview', {
          headers: { Authorization: `Bearer ${tokenToUse}` },
        });
        if (res.ok) {
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
          return;
        }
      } catch {
        // Fallback to Firestore admin queries if running on static host
      }

      try {
        const [usersSnap, ordersSnap, enrollmentsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'enrollments')),
        ]);
        const fsOrders: OrderRecord[] = [];
        ordersSnap.forEach((d) => fsOrders.push(d.data() as OrderRecord));
        const fsEnrollments: EnrollmentRecord[] = [];
        enrollmentsSnap.forEach((d) => fsEnrollments.push(d.data() as EnrollmentRecord));
        const fsCustomers: CustomerSummary[] = [];
        usersSnap.forEach((d) => {
          const u = d.data() as UserProfile;
          const uOrders = fsOrders.filter((o) => o.userId === u.uid);
          const uSpend = uOrders
            .filter((o) => o.status === 'paid')
            .reduce((acc, o) => acc + (Number(o.totalInr) || 0), 0);
          const uEnr = fsEnrollments.filter((e) => e.userId === u.uid);
          fsCustomers.push({
            uid: u.uid,
            email: u.email || '',
            displayName: u.displayName || 'Learner',
            photoURL: u.photoURL || '',
            phone: u.phone || '',
            role: u.role === 'admin' ? 'admin' : 'user',
            ordersCount: uOrders.length,
            paidSpendInr: uSpend,
            enrollmentsCount: uEnr.length,
            createdAt: typeof u.createdAt === 'string' ? u.createdAt : new Date().toISOString(),
          });
        });
        const totalRev = fsOrders
          .filter((o) => o.status === 'paid')
          .reduce((acc, o) => acc + (Number(o.totalInr) || 0), 0);
        setVerifiedRevenueAdmin(totalRev);
        setAdminCustomers(fsCustomers);
        setAllOrdersAdmin(fsOrders);
        setAllEnrollmentsAdmin(fsEnrollments);
      } catch (err) {
        console.warn('Admin overview refresh notice:', err);
      }
    },
    [authToken]
  );

  // Sync Firebase user with backend `/api/auth/google` and load own orders/enrollments
  const syncFirebaseUserSession = useCallback(
    async (
      fbUser: FirebaseUser,
      extras?: { displayName?: string; phone?: string }
    ): Promise<UserProfile> => {
      const firestoreProfile = await syncUserDocumentInFirestore(fbUser, extras);
      const idToken = await fbUser.getIdToken();

      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken,
            displayNameOverride: extras?.displayName,
            phoneOverride: extras?.phone,
          }),
        });

        if (res.ok) {
          const payload = (await res.json()) as { user: UserProfile; token: string };
          const resolvedUser: UserProfile = {
            ...firestoreProfile,
            ...payload.user,
            emailVerified: fbUser.emailVerified,
            role:
              payload.user.role === 'admin' || firestoreProfile.role === 'admin'
                ? 'admin'
                : 'user',
          };
          const sessionToken = payload.token || idToken;
          localStorage.setItem(AUTH_TOKEN_KEY, sessionToken);
          setAuthToken(sessionToken);
          setUser(resolvedUser);

          // Load user's own orders, enrollments, and progress from backend
          const meRes = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${sessionToken}` },
          });
          if (meRes.ok) {
            const meData = (await meRes.json()) as {
              orders?: OrderRecord[];
              enrollments?: EnrollmentRecord[];
              progress?: LessonProgress[];
            };
            setOrders(meData.orders || []);
            setEnrollments(meData.enrollments || []);
            if (Array.isArray(meData.progress)) {
              setProgressMap((prev) => {
                const next = { ...prev };
                for (const p of meData.progress!) {
                  next[p.lessonId] = p;
                }
                localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(next));
                return next;
              });
            }
          }

          await fetchPublicCatalog(sessionToken);
          if (resolvedUser.role === 'admin') {
            await refreshAdminOverview(sessionToken);
          }
          return resolvedUser;
        }
      } catch {
        // Fallback when running as a static SPA on Vercel without Express API routes
      }

      // Pure Firebase Auth + Cloud Firestore session fallback
      localStorage.setItem(AUTH_TOKEN_KEY, idToken);
      setAuthToken(idToken);
      setUser(firestoreProfile);

      try {
        const [ordersSnap, enrollmentsSnap, progressSnap] = await Promise.all([
          getDocs(query(collection(db, 'orders'), where('userId', '==', fbUser.uid))),
          getDocs(query(collection(db, 'enrollments'), where('userId', '==', fbUser.uid))),
          getDocs(query(collection(db, 'lessonProgress'), where('userId', '==', fbUser.uid))),
        ]);
        const userOrders: OrderRecord[] = [];
        ordersSnap.forEach((d) => userOrders.push(d.data() as OrderRecord));
        setOrders(userOrders.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));

        const userEnrollments: EnrollmentRecord[] = [];
        enrollmentsSnap.forEach((d) => userEnrollments.push(d.data() as EnrollmentRecord));
        setEnrollments(userEnrollments);

        if (!progressSnap.empty) {
          setProgressMap((prev) => {
            const next = { ...prev };
            progressSnap.forEach((d) => {
              const p = d.data() as LessonProgress;
              if (p.lessonId) next[p.lessonId] = p;
            });
            localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(next));
            return next;
          });
        }
      } catch {
        // Ignore Firestore query warning
      }

      await fetchPublicCatalog(idToken);
      if (firestoreProfile.role === 'admin') {
        await refreshAdminOverview(idToken);
      }
      return firestoreProfile;
    },
    [syncUserDocumentInFirestore, fetchPublicCatalog, refreshAdminOverview]
  );

  // Listen to Firebase Auth state changes & handle redirect results so session persists across refreshes
  useEffect(() => {
    let active = true;

    // 1. Check if returning from a mobile Google Sign-In redirect
    getRedirectResult(auth)
      .then(async (redirectCred) => {
        if (redirectCred?.user && active) {
          const profile = await syncFirebaseUserSession(redirectCred.user);
          if (active) {
            showToast(`Signed in as ${profile.displayName}`);
          }
        }
      })
      .catch((err) => {
        if (err && active) {
          setAuthError(formatFirebaseAuthError(err));
        }
      });

    // 2. Subscribe to real-time Firebase Auth state (maintains login across page refreshes)
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!active) return;

      if (fbUser) {
        try {
          await syncFirebaseUserSession(fbUser);
        } catch (err) {
          console.warn('Firebase auth state sync warning:', err);
        } finally {
          if (active) setAuthLoading(false);
        }
        return;
      }

      // If no Firebase Auth user, check if a server session token exists in localStorage
      const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      await fetchPublicCatalog(savedToken);

      if (!savedToken) {
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
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        if (!res.ok) {
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
          await refreshAdminOverview(savedToken);
        }
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        if (active) {
          setAuthToken(null);
          setUser(null);
        }
      } finally {
        if (active) setAuthLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [fetchPublicCatalog, refreshAdminOverview, showToast, syncFirebaseUserSession]);

  const applyAuthenticatedSession = async (profile: UserProfile, token: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setAuthToken(token);
    setUser(profile);
    await fetchPublicCatalog(token);
    if (profile.role === 'admin') {
      await refreshAdminOverview(token);
    }
  };

  // TASK 3: Email & Password Signup using Firebase Authentication + Firestore `users/{uid}`
  const signUpWithEmail = async (data: {
    email: string;
    password: string;
    displayName: string;
    phone?: string;
  }): Promise<UserProfile> => {
    setAuthError(null);
    const cleanEmail = data.email.toLowerCase().trim();
    const cleanName = data.displayName.trim();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      const msg = 'Please enter a valid email address.';
      setAuthError(msg);
      throw new Error(msg);
    }
    if (!data.password || data.password.length < 6) {
      const msg = 'Password must be at least 6 characters long.';
      setAuthError(msg);
      throw new Error(msg);
    }
    if (!cleanName || cleanName.length < 2) {
      const msg = 'Please enter your full name.';
      setAuthError(msg);
      throw new Error(msg);
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
      await updateFirebaseAuthProfile(cred.user, { displayName: cleanName }).catch(() => {});

      // Send email verification to newly registered user
      await sendEmailVerification(cred.user).catch(() => {});

      const profile = await syncFirebaseUserSession(cred.user, {
        displayName: cleanName,
        phone: data.phone,
      });

      showToast(
        `Welcome to Satya’s Education, ${profile.displayName}! A verification email has been sent.`
      );
      return profile;
    } catch (fbErr: unknown) {
      const errCode = (fbErr as { code?: string })?.code || '';
      // Automatically fall back to server Cloud Firestore signup when Email/Password provider is not manually toggled in Firebase Console
      if (
        errCode === 'auth/operation-not-allowed' ||
        errCode === 'auth/configuration-not-found' ||
        errCode === 'auth/admin-restricted-operation'
      ) {
        try {
          const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          const payload = (await res.json().catch(() => ({}))) as {
            user?: UserProfile;
            token?: string;
            error?: string;
          };
          if (res.ok && payload.user && payload.token) {
            await applyAuthenticatedSession(payload.user, payload.token);
            showToast(`Welcome to Satya’s Education, ${payload.user.displayName}!`);
            return payload.user;
          }
          if (payload.error) {
            setAuthError(payload.error);
            throw new Error(payload.error);
          }
        } catch (fallbackErr: unknown) {
          if (fallbackErr instanceof Error && fallbackErr.message) {
            setAuthError(fallbackErr.message);
            throw fallbackErr;
          }
        }
      }
      const friendlyMsg = formatFirebaseAuthError(fbErr);
      setAuthError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  // TASK 3: Email & Password Login using Firebase Authentication
  const loginWithEmail = async (email: string, password: string): Promise<UserProfile> => {
    setAuthError(null);
    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail || !password) {
      const msg = 'Please enter both your email address and password.';
      setAuthError(msg);
      throw new Error(msg);
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const profile = await syncFirebaseUserSession(cred.user);
      showToast(`Signed in as ${profile.displayName}`);
      return profile;
    } catch (fbErr: unknown) {
      // Fallback to backend `/api/auth/login` for server-bootstrapped accounts
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password }),
        });
        if (res.ok) {
          const payload = (await res.json()) as { user: UserProfile; token: string };
          await applyAuthenticatedSession(payload.user, payload.token);
          showToast(`Signed in as ${payload.user.displayName}`);
          return payload.user;
        }
      } catch {
        // Ignore backend fallback error and surface Firebase Auth error
      }

      const friendlyMsg = formatFirebaseAuthError(fbErr);
      setAuthError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  // TASK 6: Administrator Login (/admin/login) — Enforces role === 'admin'
  const loginAdminWithCredentials = async (
    email: string,
    password: string
  ): Promise<UserProfile> => {
    setAuthError(null);
    const cleanEmail = email.toLowerCase().trim();

    // 1. Try Firebase Email/Password Authentication first and verify admin role
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const profile = await syncFirebaseUserSession(cred.user);
      if (profile.role !== 'admin') {
        await firebaseSignOut(auth).catch(() => {});
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setAuthToken(null);
        setUser(null);
        const deniedMsg =
          'Access Denied: This account does not have administrator privileges.';
        setAuthError(deniedMsg);
        throw new Error(deniedMsg);
      }
      showToast('Signed in to Satya’s Education Admin Console');
      return profile;
    } catch (fbErr: unknown) {
      if (
        fbErr instanceof Error &&
        fbErr.message.includes('does not have administrator privileges')
      ) {
        throw fbErr;
      }
      // 2. Fallback to server `/api/auth/admin-login`
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg = payload.error || formatFirebaseAuthError(fbErr);
        setAuthError(errMsg);
        throw new Error(errMsg);
      }
      await applyAuthenticatedSession(payload.user, payload.token);
      showToast('Signed in to Satya’s Education Admin Console');
      return payload.user;
    }
  };

  // TASK 2: "Continue with Google" Login using Firebase Authentication
  const signInWithGoogle = async (): Promise<UserProfile | null> => {
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const oauthCredential = GoogleAuthProvider.credentialFromResult(cred);
      const firebaseIdToken = await cred.user.getIdToken();
      const idToken = firebaseIdToken || oauthCredential?.idToken || '';
      const googleAccessToken = oauthCredential?.accessToken || '';

      // 1. Create or update the user document in Cloud Firestore `users/{uid}`
      const firestoreProfile = await syncUserDocumentInFirestore(cred.user);

      // 2. Exchange / verify with backend `/api/auth/google` if available
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken,
            googleAccessToken,
          }),
        });
        if (res.ok) {
          const payload = (await res.json()) as { user: UserProfile; token: string };
          const mergedProfile: UserProfile = {
            ...firestoreProfile,
            ...payload.user,
            emailVerified: cred.user.emailVerified,
            role:
              payload.user.role === 'admin' || firestoreProfile.role === 'admin'
                ? 'admin'
                : 'user',
          };
          await applyAuthenticatedSession(mergedProfile, payload.token || idToken);
          showToast(`Signed in as ${mergedProfile.displayName}`);
          return mergedProfile;
        }
      } catch {
        // Static deployment fallback uses verified Firebase Auth session + Firestore profile
      }

      await applyAuthenticatedSession(firestoreProfile, idToken);
      showToast(`Signed in as ${firestoreProfile.displayName}`);
      return firestoreProfile;
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      // Automatic fallback to signInWithRedirect if popup is blocked on mobile browsers
      if (code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return null;
        } catch (redirErr) {
          const msg = formatFirebaseAuthError(redirErr);
          setAuthError(msg);
          showToast(msg);
          return null;
        }
      }
      const msg = formatFirebaseAuthError(err);
      setAuthError(msg);
      showToast(msg);
      return null;
    }
  };

  // TASK 3: Forgot Password / Password Reset via Firebase Authentication
  const resetPassword = async (email: string): Promise<void> => {
    setAuthError(null);
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      const msg = 'Please enter a valid email address to receive a password reset link.';
      setAuthError(msg);
      throw new Error(msg);
    }
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      showToast(`Password reset link sent to ${cleanEmail}. Please check your inbox.`);
    } catch (err: unknown) {
      const msg = formatFirebaseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // TASK 3: Resend Email Verification Link
  const resendVerificationEmail = async (): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error('Please sign in with your email and password to verify your email.');
    }
    try {
      await sendEmailVerification(auth.currentUser);
      showToast(`Verification email sent to ${auth.currentUser.email}.`);
    } catch (err: unknown) {
      const msg = formatFirebaseAuthError(err);
      showToast(msg);
      throw new Error(msg);
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
    showToast('Signed out successfully');
  };

  const updateUserProfile = async (updates: {
    displayName?: string;
    phone?: string;
    bio?: string;
    photoURL?: string;
    newPassword?: string;
  }) => {
    if (!user) throw new Error('Please log in to update your profile.');

    // Update Firebase Auth profile & Firestore `users/{uid}` if signed in with Firebase
    if (auth.currentUser) {
      if (updates.displayName || updates.photoURL) {
        await updateFirebaseAuthProfile(auth.currentUser, {
          displayName: updates.displayName ?? auth.currentUser.displayName,
          photoURL: updates.photoURL ?? auth.currentUser.photoURL,
        }).catch(() => {});
      }
      if (updates.newPassword && updates.newPassword.length >= 6) {
        await updateFirebaseAuthPassword(auth.currentUser, updates.newPassword).catch(() => {});
      }
      try {
        await setDoc(
          doc(db, 'users', auth.currentUser.uid),
          {
            uid: auth.currentUser.uid,
            email: user.email,
            displayName: (updates.displayName ?? user.displayName).trim().slice(0, 120),
            photoURL: (updates.photoURL ?? user.photoURL ?? '').trim().slice(0, 1024),
            phone: (updates.phone ?? user.phone ?? '').trim().slice(0, 24),
            bio: (updates.bio ?? user.bio ?? '').trim().slice(0, 500),
            role: user.role === 'admin' ? 'admin' : 'user',
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch {
        // Ignore Firestore merge warning
      }
    }

    if (authToken) {
      try {
        const res = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(updates),
        });
        if (res.ok) {
          const payload = await res.json();
          setUser(payload.user);
          showToast('Profile settings updated');
          return;
        }
      } catch {
        // Fallback to local state + Firestore update
      }
    }

    setUser((prev) =>
      prev
        ? {
            ...prev,
            displayName: updates.displayName?.trim() || prev.displayName,
            phone: updates.phone?.trim() ?? prev.phone,
            bio: updates.bio?.trim() ?? prev.bio,
            photoURL: updates.photoURL?.trim() ?? prev.photoURL,
            updatedAt: new Date().toISOString(),
          }
        : null
    );
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

    if (user) {
      try {
        await setDoc(doc(db, 'lessonProgress', `${user.uid}_${lessonId}`), {
          id: `${user.uid}_${lessonId}`,
          userId: user.uid,
          courseId,
          lessonId,
          playbackSeconds: safeSeconds,
          completed,
          notes: safeNotes,
          updatedAt: serverTimestamp(),
        });
      } catch {
        // Ignore Firestore progress sync notice
      }
    }

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
        // Local & Firestore progress fallback already updated
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
    if (!authToken || user?.role !== 'admin') {
      throw new Error('Administrator authentication required.');
    }
    const cleanId = (book.id || `book-${Date.now()}`)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 120);

    try {
      const res = await fetch('/api/admin/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ ...book, id: cleanId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.books)) {
          setAllBooksAdmin(data.books);
          setCatalogBooks(
            data.books.filter((b: BookItem) => b.published !== false && !b.archived)
          );
        }
      }
    } catch {
      // Fallback to Firestore below
    }

    try {
      await setDoc(doc(db, 'books', cleanId), {
        ...book,
        id: cleanId,
        updatedAt: serverTimestamp(),
      });
      setAllBooksAdmin((prev) => {
        const exists = prev.some((b) => b.id === cleanId);
        const next = exists
          ? prev.map((b) => (b.id === cleanId ? { ...book, id: cleanId } : b))
          : [{ ...book, id: cleanId }, ...prev];
        setCatalogBooks(next.filter((b) => b.published !== false && !b.archived));
        return next;
      });
    } catch {
      // Server persistent DB already updated
    }

    showToast(`Saved book "${book.title}"`);
  };

  const deleteBookAdmin = async (bookId: string) => {
    if (!authToken || user?.role !== 'admin') {
      throw new Error('Administrator authentication required.');
    }
    try {
      const res = await fetch(`/api/admin/books/${encodeURIComponent(bookId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.books)) {
          setAllBooksAdmin(data.books);
          setCatalogBooks(
            data.books.filter((b: BookItem) => b.published !== false && !b.archived)
          );
        }
      }
    } catch {
      // Fallback to Firestore below
    }

    try {
      await deleteDoc(doc(db, 'books', bookId));
    } catch {
      // Ignore Firestore delete warning
    }

    setAllBooksAdmin((prev) => {
      const next = prev.filter((b) => b.id !== bookId);
      setCatalogBooks(next.filter((b) => b.published !== false && !b.archived));
      return next;
    });
    showToast('Book removed from catalog');
  };

  const upsertCourseAdmin = async (course: CourseItem) => {
    if (!authToken || user?.role !== 'admin') {
      throw new Error('Administrator authentication required.');
    }
    const cleanId = (course.id || `course-${Date.now()}`)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 120);

    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ ...course, id: cleanId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.courses)) {
          setAllCoursesAdmin(data.courses);
          setCatalogCourses(
            data.courses.filter((c: CourseItem) => c.published !== false && !c.archived)
          );
        }
      }
    } catch {
      // Fallback to Firestore below
    }

    try {
      await setDoc(doc(db, 'courses', cleanId), {
        id: cleanId,
        title: course.title,
        instructor: course.instructor,
        subject: course.subject,
        level: course.level,
        priceInr: Number(course.priceInr),
        language: course.language,
        duration: course.duration,
        description: course.description,
        archived: Boolean(course.archived),
        updatedAt: serverTimestamp(),
      });
      setAllCoursesAdmin((prev) => {
        const exists = prev.some((c) => c.id === cleanId);
        const next = exists
          ? prev.map((c) => (c.id === cleanId ? { ...course, id: cleanId } : c))
          : [{ ...course, id: cleanId }, ...prev];
        setCatalogCourses(next.filter((c) => c.published !== false && !c.archived));
        return next;
      });
    } catch {
      // Server persistent DB is primary source of truth
    }

    showToast(`Saved course "${course.title}"`);
  };

  const deleteCourseAdmin = async (courseId: string) => {
    if (!authToken || user?.role !== 'admin') {
      throw new Error('Administrator authentication required.');
    }
    try {
      const res = await fetch(`/api/admin/courses/${encodeURIComponent(courseId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.courses)) {
          setAllCoursesAdmin(data.courses);
          setCatalogCourses(
            data.courses.filter((c: CourseItem) => c.published !== false && !c.archived)
          );
        }
      }
    } catch {
      // Fallback to Firestore below
    }

    try {
      await deleteDoc(doc(db, 'courses', courseId));
    } catch {
      // Ignore Firestore delete warning
    }

    setAllCoursesAdmin((prev) => {
      const next = prev.filter((c) => c.id !== courseId);
      setCatalogCourses(next.filter((c) => c.published !== false && !c.archived));
      return next;
    });
    showToast('Course removed from catalog');
  };

  const updateOrderShippingAdmin = async (
    orderId: string,
    shippingStatus: OrderRecord['shippingStatus'],
    status: OrderRecord['status']
  ) => {
    if (!authToken || user?.role !== 'admin') {
      throw new Error('Administrator authentication required.');
    }
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
        clearAuthError,
        signUpWithEmail,
        loginWithEmail,
        loginAdminWithCredentials,
        signInWithGoogle,
        resetPassword,
        resendVerificationEmail,
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
        deleteBookAdmin,
        upsertCourseAdmin,
        deleteCourseAdmin,
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
