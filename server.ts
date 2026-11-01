import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initializeApp as initializeAdminApp, applicationDefault, cert } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore, type Firestore, type DocumentReference, type CollectionReference } from 'firebase-admin/firestore';
import firebaseConfig from './firebase-applet-config.json';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_BOOKS, INITIAL_COURSES } from './src/data/catalogData.ts';
import type {
  BookItem,
  CourseItem,
  OrderRecord,
  EnrollmentRecord,
  LessonProgress,
  UserProfile,
  CustomerSummary,
  CartItemType,
} from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Capture raw body for Cashfree webhook signature verification
app.use(
  express.json({
    limit: '5mb',
    verify: (req: Request & { rawBody?: string }, _res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  })
);

const PORT = Number(process.env.PORT) || 3000;

// Private server environment variables — no hardcoded default admin password or token secret in code
const PRIMARY_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
const ADMIN_INITIAL_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD || '';
const AUTH_TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || '';

// Only trusted server credentials may read/write private server_* collections.
// NEVER commit FIREBASE_SERVICE_ACCOUNT_JSON or expose it as a VITE_* variable.
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
const serverCredentialsConfigured = Boolean(
  serviceAccountJson || process.env.GOOGLE_APPLICATION_CREDENTIALS
);
const firebaseAdminApp = initializeAdminApp({
  projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  credential: serviceAccountJson
    ? cert(JSON.parse(serviceAccountJson))
    : applicationDefault(),
}, 'satyas-backend-firestore');
const firebaseAdminAuth = getAdminAuth(firebaseAdminApp);
const firestoreDb = getAdminFirestore(
  firebaseAdminApp,
  process.env.FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || '(default)'
);

// Keep existing persistence calls while using privileged Admin SDK references.
const doc = (db: Firestore, name: string, id: string): DocumentReference => db.collection(name).doc(id);
const collection = (db: Firestore, name: string): CollectionReference => db.collection(name);
const getDoc = (ref: DocumentReference) => ref.get();
const getDocs = (ref: CollectionReference) => ref.get();
const setDoc = (ref: DocumentReference, value: object) => ref.set(value);
const deleteDoc = (ref: DocumentReference) => ref.delete();

interface StoredUser extends UserProfile {
  passwordHash: string;
  passwordSalt: string;
}

interface HostedDatabaseCache {
  users: StoredUser[];
  books: BookItem[];
  courses: CourseItem[];
  orders: OrderRecord[];
  enrollments: EnrollmentRecord[];
  progress: LessonProgress[];
  processedWebhooks: string[];
}

const dbState: HostedDatabaseCache = {
  users: [],
  books: INITIAL_BOOKS.map((b) => ({ ...b, published: !b.archived })),
  courses: INITIAL_COURSES.map((c) => ({ ...c, published: !c.archived })),
  orders: [],
  enrollments: [],
  progress: [],
  processedWebhooks: [],
};

function sanitizeFirestoreId(rawId: string): string {
  return rawId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120) || `doc_${Date.now()}`;
}

async function persistToFirestore<T>(
  collectionName: string,
  rawDocId: string,
  record: T
): Promise<void> {
  const docId = sanitizeFirestoreId(rawDocId);
  try {
    await setDoc(doc(firestoreDb, collectionName, docId), {
      id: docId,
      payloadJson: JSON.stringify(record),
      updatedAtMs: Date.now(),
    });
  } catch (err) {
    console.error(`Firestore persist error [${collectionName}/${docId}]:`, err);
    throw err; // Never claim that a payment/order was saved when persistence failed.
  }
}

async function removeFromFirestore(collectionName: string, rawDocId: string): Promise<void> {
  const docId = sanitizeFirestoreId(rawDocId);
  try {
    await deleteDoc(doc(firestoreDb, collectionName, docId));
  } catch (err) {
    console.error(`Firestore delete error [${collectionName}/${docId}]:`, err);
    throw err;
  }
}

async function loadCollectionFromFirestore<T>(collectionName: string): Promise<T[]> {
  try {
    const snap = await getDocs(collection(firestoreDb, collectionName));
    const items: T[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && typeof data.payloadJson === 'string') {
        try {
          items.push(JSON.parse(data.payloadJson) as T);
        } catch {
          // Ignore malformed document payload
        }
      }
    });
    return items;
  } catch (err) {
    console.warn(`Firestore load notice [${collectionName}]:`, err);
    return [];
  }
}

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, usedSalt, 64).toString('hex');
  return { hash, salt: usedSalt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  if (!hash || !salt) return false;
  const computed = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(hash, 'hex'));
}

function getRequiredAuthSecret(): string {
  // Public Firebase config cannot be used to derive a signing secret.
  return AUTH_TOKEN_SECRET.trim();
}

function createSignedToken(user: UserProfile): string {
  const secret = getRequiredAuthSecret();
  if (!secret) throw new Error('AUTH_TOKEN_SECRET must be configured on the backend');
  const payload = {
    uid: user.uid,
    email: user.email.toLowerCase(),
    role: user.role,
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(base64Payload)
    .digest('base64url');
  return `${base64Payload}.${signature}`;
}

function verifySignedToken(
  token: string
): { uid: string; email: string; role: 'user' | 'student' | 'admin' } | null {
  try {
    const secret = getRequiredAuthSecret();
    if (!secret) return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [base64Payload, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(base64Payload)
      .digest('base64url');
    const sigBuf = Buffer.from(signature, 'utf8');
    const expBuf = Buffer.from(expectedSig, 'utf8');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    const decoded = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf8'));
    if (!decoded.uid || !decoded.exp || Date.now() > decoded.exp) return null;
    return {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role === 'admin' ? 'admin' : 'user',
    };
  } catch {
    return null;
  }
}

let dbInitPromise: Promise<void> | null = null;

// Initialize & synchronize hosted Cloud Firestore database on server boot or serverless cold start
async function initializeHostedDatabase(): Promise<void> {
  // Abort if the trusted Firestore connection is unavailable.
  await firestoreDb.collection('server_books').limit(1).get();
  const [
    loadedUsers,
    loadedBooks,
    loadedCourses,
    loadedOrders,
    loadedEnrollments,
    loadedProgress,
    loadedWebhooks,
  ] = await Promise.all([
    loadCollectionFromFirestore<StoredUser>('server_users'),
    loadCollectionFromFirestore<BookItem>('server_books'),
    loadCollectionFromFirestore<CourseItem>('server_courses'),
    loadCollectionFromFirestore<OrderRecord>('server_orders'),
    loadCollectionFromFirestore<EnrollmentRecord>('server_enrollments'),
    loadCollectionFromFirestore<LessonProgress>('server_progress'),
    loadCollectionFromFirestore<{ key: string }>('server_webhooks'),
  ]);

  dbState.users = loadedUsers;
  dbState.orders = loadedOrders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  dbState.enrollments = loadedEnrollments;
  dbState.progress = loadedProgress;
  dbState.processedWebhooks = loadedWebhooks.map((w) => w.key).filter(Boolean);

  if (loadedBooks.length > 0) {
    dbState.books = loadedBooks.map((b) => ({ ...b, published: b.published ?? !b.archived }));
  }
  if (loadedCourses.length > 0) {
    dbState.courses = loadedCourses.map((c) => ({ ...c, published: c.published ?? !c.archived }));
  }

  // Provision initial admin account ONLY when ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD env vars are provided
  if (PRIMARY_ADMIN_EMAIL && ADMIN_INITIAL_PASSWORD) {
    const adminCreds = hashPassword(ADMIN_INITIAL_PASSWORD);
    const existingAdminIdx = dbState.users.findIndex(
      (u) => u.email.toLowerCase() === PRIMARY_ADMIN_EMAIL
    );
    if (existingAdminIdx === -1) {
      const bootstrappedAdmin: StoredUser = {
        uid: 'admin_primary_satya',
        email: PRIMARY_ADMIN_EMAIL,
        displayName: 'Satya Narayana (Administrator)',
        photoURL: '',
        phone: '+91 98450 11223',
        bio: 'Founder & Principal Educator at Satya’s Education',
        role: 'admin',
        passwordHash: adminCreds.hash,
        passwordSalt: adminCreds.salt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dbState.users.unshift(bootstrappedAdmin);
      await persistToFirestore('server_users', bootstrappedAdmin.uid, bootstrappedAdmin);
    } else {
      const existingAdmin = dbState.users[existingAdminIdx];
      existingAdmin.role = 'admin';
      existingAdmin.passwordHash = adminCreds.hash;
      existingAdmin.passwordSalt = adminCreds.salt;
      existingAdmin.updatedAt = new Date().toISOString();
      await persistToFirestore('server_users', existingAdmin.uid, existingAdmin);
    }
  }
}

function ensureDatabaseReady(): Promise<void> {
  if (!dbInitPromise) {
    dbInitPromise = initializeHostedDatabase().catch((err) => {
      dbInitPromise = null;
      console.error('Backend database initialization failed:', err);
      throw err;
    });
  }
  return dbInitPromise;
}

app.use('/api', async (_req, res, next) => {
  if (!serverCredentialsConfigured) {
    res.status(503).json({
      error: 'Backend Firebase service account is not configured in Vercel.',
    });
    return;
  }
  try {
    await ensureDatabaseReady();
    next();
  } catch {
    res.status(503).json({ error: 'Backend database is temporarily unavailable.' });
  }
});

function isServerRecognizedAdminEmail(email: string): boolean {
  const clean = email.toLowerCase().trim();
  if (!clean) return false;
  return Boolean(PRIMARY_ADMIN_EMAIL && clean === PRIMARY_ADMIN_EMAIL);
}

function sanitizeUserProfile(u: StoredUser): UserProfile {
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL || '',
    phone: u.phone || '',
    bio: u.bio || '',
    role: u.role === 'admin' ? 'admin' : 'user',
    emailVerified: u.emailVerified,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt || u.updatedAt,
    updatedAt: u.updatedAt,
  };
}

interface AuthenticatedRequest extends Request {
  authUser?: StoredUser;
  rawBody?: string;
}

// ============================================================================
// SERVER-SIDE GOOGLE / FIREBASE TOKEN VERIFICATION
// Never trusts raw email/uid sent by the browser; verifies tokens with Google
// ============================================================================

interface VerifiedGoogleIdentity {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  photoURL: string;
  isAdmin: boolean;
}

// Verify only Firebase ID tokens belonging to this project.
async function verifySignedJwtWithGoogleCerts(idToken: string): Promise<VerifiedGoogleIdentity | null> {
  try {
    const user = await firebaseAdminAuth.verifyIdToken(idToken, true);
    if (!user.uid || !user.email) return null;
    return {
      uid: user.uid,
      email: user.email.toLowerCase().trim(),
      emailVerified: user.email_verified === true,
      displayName: typeof user.name === 'string' ? user.name : user.email.split('@')[0],
      photoURL: typeof user.picture === 'string' ? user.picture : '',
      isAdmin: user.admin === true,
    };
  } catch {
    return null;
  }
}

async function resolveUserFromRequest(req: AuthenticatedRequest): Promise<StoredUser | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  // 1. Check 2-part HMAC token when AUTH_TOKEN_SECRET is configured
  const hmacVerified = verifySignedToken(token);
  if (hmacVerified) {
    const dbUser = dbState.users.find(
      (u) => u.uid === hmacVerified.uid || u.email.toLowerCase() === hmacVerified.email.toLowerCase()
    );
    if (dbUser) return dbUser;
  }

  // 2. Check 3-part RS256 Firebase / Google ID Token verified with Google public x509 certificates
  const firebaseVerified = await verifySignedJwtWithGoogleCerts(token);
  if (!firebaseVerified) return null;

  const cleanEmail = firebaseVerified.email.toLowerCase().trim();
  let user = dbState.users.find(
    (u) => u.uid === firebaseVerified.uid || u.email.toLowerCase() === cleanEmail
  );

  // Check Firestore users/{uid} document if we need to confirm admin role or display name
  let firestoreRole: 'user' | 'admin' =
    firebaseVerified.isAdmin || (firebaseVerified.emailVerified && isServerRecognizedAdminEmail(cleanEmail))
      ? 'admin' : 'user';
  let firestoreDisplayName = firebaseVerified.displayName;
  let firestorePhone = '';
  let firestoreBio = '';
  try {
    const registry = await getDoc(doc(firestoreDb, 'admins', firebaseVerified.uid));
    if (registry.exists) firestoreRole = 'admin';
    const fsUserSnap = await getDoc(doc(firestoreDb, 'users', firebaseVerified.uid));
    if (fsUserSnap.exists) {
      const fsData = fsUserSnap.data() as {
        role?: string;
        displayName?: string;
        phone?: string;
        bio?: string;
      };
      // An editable users/{uid} role is never sufficient to grant admin access.
      if (fsData.displayName) firestoreDisplayName = fsData.displayName;
      if (fsData.phone) firestorePhone = fsData.phone;
      if (fsData.bio) firestoreBio = fsData.bio;
    }
  } catch {
    // Fallback to in-memory cache + server admin email check
  }

  if (!user) {
    const randomPass = hashPassword(crypto.randomBytes(24).toString('hex'));
    const nowIso = new Date().toISOString();
    user = {
      uid: firebaseVerified.uid,
      email: cleanEmail,
      displayName: (firestoreDisplayName || cleanEmail.split('@')[0] || 'Student').slice(0, 120),
      photoURL: (firebaseVerified.photoURL || '').slice(0, 1024),
      phone: firestorePhone,
      bio: firestoreBio,
      role: firestoreRole,
      emailVerified: firebaseVerified.emailVerified,
      passwordHash: randomPass.hash,
      passwordSalt: randomPass.salt,
      createdAt: nowIso,
      lastLoginAt: nowIso,
      updatedAt: nowIso,
    };
    dbState.users.push(user);
    await persistToFirestore('server_users', user.uid, user);
  } else {
    let changed = false;
    if (user.role !== firestoreRole) {
      user.role = firestoreRole;
      changed = true;
    }
    if (firebaseVerified.photoURL && !user.photoURL) {
      user.photoURL = firebaseVerified.photoURL.slice(0, 1024);
      changed = true;
    }
    user.emailVerified = firebaseVerified.emailVerified;
    if (changed) {
      user.updatedAt = new Date().toISOString();
      await persistToFirestore('server_users', user.uid, user);
    }
  }

  return user;
}

async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const user = await resolveUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required. Please log in to continue.' });
    return;
  }
  req.authUser = user;
  next();
}

async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const user = await resolveUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Administrator authentication required.' });
    return;
  }
  if (user.role !== 'admin') {
    res.status(403).json({
      error:
        'Forbidden: Administrator privileges required. Standard users cannot perform this action.',
    });
    return;
  }
  req.authUser = user;
  next();
}

async function verifyGoogleOrFirebaseToken(params: {
  idToken?: string;
  googleAccessToken?: string;
}): Promise<VerifiedGoogleIdentity | null> {
  // OAuth access tokens alone do not prove membership in our Firebase project.
  return params.idToken ? verifySignedJwtWithGoogleCerts(params.idToken) : null;
}

// Helper to idempotently unlock enrollments & deduct physical stock ONLY when an order transitions to 'paid'
async function fulfillPaidOrderIdempotently(order: OrderRecord): Promise<void> {
  const existingForOrder = dbState.enrollments.filter((e) => e.orderId === order.id);
  if (existingForOrder.length > 0) {
    return;
  }

  const orderItems = order.items || [];
  for (const item of orderItems) {
    const enrId = `${order.userId}_${item.itemId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    const alreadyOwned = dbState.enrollments.some(
      (e) => e.userId === order.userId && e.itemId === item.itemId && e.itemType === item.itemType
    );
    if (!alreadyOwned) {
      const newEnrollment: EnrollmentRecord = {
        id: `${enrId}_${Date.now().toString(36)}`,
        userId: order.userId,
        itemId: item.itemId,
        itemType: item.itemType,
        orderId: order.id,
        createdAt: new Date().toISOString(),
      };
      dbState.enrollments.push(newEnrollment);
      await persistToFirestore('server_enrollments', newEnrollment.id, newEnrollment);
      // Deterministic entitlement ID is used by Firebase Storage rules.
      await setDoc(doc(firestoreDb, 'enrollments', enrId), { ...newEnrollment, id: enrId });
    }

    if (item.itemType === 'physical_book') {
      const book = dbState.books.find((b) => b.id === item.itemId);
      if (book) {
        book.stock = Math.max(0, book.stock - (Number(item.quantity) || 1));
        await persistToFirestore('server_books', book.id, book);
      }
    }
  }
}

// ============================================================================
// 1. AUTHENTICATION & USER PROFILE ENDPOINTS
// ============================================================================

// User Sign Up — ALWAYS assigns 'student' role (never allows user to choose admin)
app.post('/api/auth/signup', async (req, res) => {
  try {
    if (!getRequiredAuthSecret()) {
      res.status(503).json({
        error:
          'Server authentication secret (AUTH_TOKEN_SECRET) is not configured in environment variables.',
      });
      return;
    }

    const { email, password, displayName, phone } = req.body as {
      email?: string;
      password?: string;
      displayName?: string;
      phone?: string;
      role?: string; // Explicitly ignored to prevent privilege escalation
    };

    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }
    if (!displayName || displayName.trim().length < 2) {
      res.status(400).json({ error: 'Please enter your full name.' });
      return;
    }

    const existing = dbState.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
      return;
    }

    const { hash, salt } = hashPassword(password);
    const newUser: StoredUser = {
      uid: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      email: cleanEmail,
      displayName: displayName.trim().slice(0, 120),
      photoURL: '',
      phone: (phone || '').trim().slice(0, 20),
      bio: 'Learner at Satya’s Education',
      role: 'student', // STRICT SECURITY RULE: New accounts always receive the student (user) role
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbState.users.push(newUser);
    await persistToFirestore('server_users', newUser.uid, newUser);

    const profile = sanitizeUserProfile(newUser);
    const token = createSignedToken(profile);
    res.status(201).json({ user: profile, token });
  } catch (err: unknown) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Unable to complete signup.' });
  }
});

// Standard User Log In
app.post('/api/auth/login', (req, res) => {
  if (!getRequiredAuthSecret()) {
    res.status(503).json({
      error:
        'Server authentication secret (AUTH_TOKEN_SECRET) is not configured in environment variables.',
    });
    return;
  }

  const { email, password } = req.body as { email?: string; password?: string };
  const cleanEmail = (email || '').toLowerCase().trim();

  if (!cleanEmail || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const user = dbState.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user || !verifyPassword(password, user.passwordHash, user.passwordSalt)) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const profile = sanitizeUserProfile(user);
  const token = createSignedToken(profile);
  res.json({ user: profile, token });
});

// Separate Admin Login Endpoint (/admin/login) — Rejects non-admin accounts on backend
app.post('/api/auth/admin-login', async (req, res) => {
  const { email, password, idToken } = req.body as {
    email?: string;
    password?: string;
    idToken?: string;
  };

  // Support Firebase ID token verification for Admin Login
  if (idToken && typeof idToken === 'string' && idToken.trim().length > 20) {
    const verified = await verifySignedJwtWithGoogleCerts(idToken.trim());
    if (!verified) {
      res.status(401).json({ error: 'Invalid Firebase authentication token.' });
      return;
    }

    const fakeReq = {
      headers: { authorization: `Bearer ${idToken.trim()}` },
    } as AuthenticatedRequest;
    const resolvedUser = await resolveUserFromRequest(fakeReq);
    if (!resolvedUser || resolvedUser.role !== 'admin') {
      res.status(403).json({
        error: 'Access Denied: This account does not have administrator privileges.',
      });
      return;
    }

    const profile = sanitizeUserProfile(resolvedUser);
    const token = getRequiredAuthSecret() ? createSignedToken(profile) : idToken.trim();
    res.json({ user: profile, token });
    return;
  }

  const cleanEmail = (email || '').toLowerCase().trim();

  if (!cleanEmail || !password) {
    res.status(400).json({ error: 'Administrator email and password are required.' });
    return;
  }

  const user = dbState.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    if (!PRIMARY_ADMIN_EMAIL || !ADMIN_INITIAL_PASSWORD) {
      res.status(401).json({
        error:
          'No password-based admin account found for this email. Use "Sign in with Google (Admin)" with tarunpediredla9966@gmail.com or configure ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD in environment variables.',
      });
      return;
    }
    res.status(401).json({ error: 'Invalid administrator credentials.' });
    return;
  }

  if (!verifyPassword(password, user.passwordHash, user.passwordSalt)) {
    res.status(401).json({ error: 'Invalid administrator credentials.' });
    return;
  }

  if (isServerRecognizedAdminEmail(cleanEmail) && user.role !== 'admin') {
    user.role = 'admin';
    user.updatedAt = new Date().toISOString();
    await persistToFirestore('server_users', user.uid, user);
  }

  if (user.role !== 'admin') {
    res.status(403).json({
      error: 'Access Denied: This account does not have administrator privileges.',
    });
    return;
  }

  const profile = sanitizeUserProfile(user);
  const token = createSignedToken(profile);
  res.json({ user: profile, token });
});

// Google & Firebase Session Exchange — Verifies Google/Firebase token on the server (never trusts browser email)
app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken, googleAccessToken, displayNameOverride, phoneOverride } = req.body as {
      idToken?: string;
      googleAccessToken?: string;
      displayNameOverride?: string;
      phoneOverride?: string;
    };

    if (!idToken && !googleAccessToken) {
      res.status(400).json({
        error:
          'A valid Google or Firebase authentication token (idToken or googleAccessToken) is required.',
      });
      return;
    }

    const verifiedIdentity = await verifyGoogleOrFirebaseToken({ idToken, googleAccessToken });
    if (!verifiedIdentity || !verifiedIdentity.email) {
      res.status(401).json({
        error: 'Server verification of Google/Firebase login token failed.',
      });
      return;
    }

    const cleanEmail = verifiedIdentity.email.toLowerCase().trim();
    let isServerAdmin = verifiedIdentity.isAdmin ||
      (verifiedIdentity.emailVerified && isServerRecognizedAdminEmail(cleanEmail));

    try {
      const registry = await getDoc(doc(firestoreDb, 'admins', verifiedIdentity.uid));
      if (registry.exists) isServerAdmin = true;
    } catch {
      // No trusted registry confirmation, so privileges are not elevated.
    }

    let user = dbState.users.find(
      (u) => u.uid === verifiedIdentity.uid || u.email.toLowerCase() === cleanEmail
    );

    const nowIso = new Date().toISOString();
    if (!user) {
      const randomPass = hashPassword(crypto.randomBytes(24).toString('hex'));
      user = {
        uid: verifiedIdentity.uid || `usr_google_${Date.now()}`,
        email: cleanEmail,
        displayName: (
          displayNameOverride?.trim() ||
          verifiedIdentity.displayName ||
          cleanEmail.split('@')[0] ||
          'Student'
        ).slice(0, 120),
        photoURL: (verifiedIdentity.photoURL || '').slice(0, 1024),
        phone: (phoneOverride || '').trim().slice(0, 24),
        bio: '',
        role: isServerAdmin ? 'admin' : 'user', // Default role is always 'user' unless server-verified admin
        emailVerified: verifiedIdentity.emailVerified,
        passwordHash: randomPass.hash,
        passwordSalt: randomPass.salt,
        createdAt: nowIso,
        lastLoginAt: nowIso,
        updatedAt: nowIso,
      };
      dbState.users.push(user);
      await persistToFirestore('server_users', user.uid, user);
    } else {
      user.role = isServerAdmin ? 'admin' : 'user';
      if (displayNameOverride && displayNameOverride.trim().length >= 2) {
        user.displayName = displayNameOverride.trim().slice(0, 120);
      }
      if (phoneOverride && phoneOverride.trim()) {
        user.phone = phoneOverride.trim().slice(0, 24);
      }
      if (verifiedIdentity.photoURL && !user.photoURL) {
        user.photoURL = verifiedIdentity.photoURL.slice(0, 1024);
      }
      user.emailVerified = verifiedIdentity.emailVerified;
      user.lastLoginAt = nowIso;
      user.updatedAt = nowIso;
      await persistToFirestore('server_users', user.uid, user);
    }

    const profile = sanitizeUserProfile(user);
    const token = getRequiredAuthSecret()
      ? createSignedToken(profile)
      : (idToken || '').trim();

    if (!token) {
      res.status(503).json({
        error:
          'A Firebase ID token or server AUTH_TOKEN_SECRET is required to issue a session token.',
      });
      return;
    }

    res.json({ user: profile, token });
  } catch (err: unknown) {
    console.error('Google token verification error:', err);
    res.status(500).json({ error: 'Unable to verify Google login token on server.' });
  }
});

// Authenticated User Session & Strict Own-Data Fetch
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.authUser!;
  const myOrders = dbState.orders
    .filter((o) => o.userId === user.uid)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const myEnrollments = dbState.enrollments.filter((e) => e.userId === user.uid);
  const myProgress = dbState.progress.filter((p) => p.userId === user.uid);

  res.json({
    user: sanitizeUserProfile(user),
    orders: myOrders,
    enrollments: myEnrollments,
    progress: myProgress,
  });
});

// Update User Profile Settings — Role cannot be changed by user
app.put('/api/user/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.authUser!;
  const { displayName, phone, bio, photoURL, newPassword } = req.body as {
    displayName?: string;
    phone?: string;
    bio?: string;
    photoURL?: string;
    newPassword?: string;
    role?: string; // Ignored
  };

  if (typeof displayName === 'string' && displayName.trim().length >= 2) {
    user.displayName = displayName.trim().slice(0, 120);
  }
  if (typeof phone === 'string') {
    user.phone = phone.trim().slice(0, 24);
  }
  if (typeof bio === 'string') {
    user.bio = bio.trim().slice(0, 500);
  }
  if (typeof photoURL === 'string') {
    user.photoURL = photoURL.trim().slice(0, 1024);
  }
  if (typeof newPassword === 'string' && newPassword.length >= 6) {
    const { hash, salt } = hashPassword(newPassword);
    user.passwordHash = hash;
    user.passwordSalt = salt;
  }

  user.updatedAt = new Date().toISOString();
  await persistToFirestore('server_users', user.uid, user);

  res.json({ user: sanitizeUserProfile(user) });
});

// Save Lesson Playback Progress & Notes (Strict Own-Data)
app.post('/api/user/progress', requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.authUser!;
  const { courseId, lessonId, playbackSeconds, completed, notes } = req.body as {
    courseId?: string;
    lessonId?: string;
    playbackSeconds?: number;
    completed?: boolean;
    notes?: string;
  };

  if (!courseId || !lessonId) {
    res.status(400).json({ error: 'courseId and lessonId are required.' });
    return;
  }

  const safeSeconds = Math.max(0, Math.min(86400, Math.round(Number(playbackSeconds) || 0)));
  const safeNotes = (notes || '').slice(0, 4000);
  const progId = `${user.uid}_${lessonId}`.replace(/[^a-zA-Z0-9_-]/g, '_');

  const existingIdx = dbState.progress.findIndex(
    (p) => p.userId === user.uid && p.lessonId === lessonId
  );

  const entry: LessonProgress = {
    id: progId,
    userId: user.uid,
    courseId,
    lessonId,
    playbackSeconds: safeSeconds,
    completed: Boolean(completed),
    notes: safeNotes,
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    dbState.progress[existingIdx] = entry;
  } else {
    dbState.progress.push(entry);
  }

  await persistToFirestore('server_progress', entry.id, entry);
  res.json({ progress: entry });
});

// ============================================================================
// 2. PUBLIC CATALOG ENDPOINT
// ============================================================================

app.get('/api/catalog', async (req: AuthenticatedRequest, res) => {
  const caller = await resolveUserFromRequest(req);
  const isAdmin = caller?.role === 'admin';

  // Non-admin users only receive published, non-archived items
  const visibleBooks = isAdmin
    ? dbState.books
    : dbState.books.filter((b) => b.published !== false && !b.archived);

  const visibleCourses = isAdmin
    ? dbState.courses
    : dbState.courses.filter((c) => c.published !== false && !c.archived);

  const cfSecret = process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_WEBHOOK_SECRET || '';
  res.json({
    books: visibleBooks,
    courses: visibleCourses,
    cashfreeEnv: process.env.CASHFREE_ENV || 'SANDBOX',
    cashfreeConfigured: Boolean(
      process.env.CASHFREE_APP_ID &&
        cfSecret &&
        !process.env.CASHFREE_APP_ID.includes('PLACEHOLDER') &&
        !cfSecret.includes('placeholder')
    ),
  });
});

// ============================================================================
// 3. CASHFREE PAYMENTS (SANDBOX MODE FIRST) — BACKEND ORDER, VERIFY & WEBHOOK
// ============================================================================

// Helper: Verify Cashfree PG Webhook Signature following Cashfree's official documentation
// Signature = Base64(HMAC-SHA256(x-webhook-timestamp + rawRequestBody, CASHFREE_WEBHOOK_SECRET))
function verifyCashfreeWebhookSignature(
  timestamp: string | undefined,
  rawBody: string | undefined,
  signature: string | undefined,
  secretKey: string | undefined
): { valid: boolean; reason?: string } {
  if (!secretKey || !secretKey.trim()) {
    return {
      valid: false,
      reason: 'Server CASHFREE_WEBHOOK_SECRET (Cashfree PG Secret Key) is not configured.',
    };
  }
  if (!timestamp || typeof timestamp !== 'string') {
    return { valid: false, reason: 'Missing x-webhook-timestamp header.' };
  }
  if (!signature || typeof signature !== 'string') {
    return { valid: false, reason: 'Missing x-webhook-signature header.' };
  }
  if (typeof rawBody !== 'string' || rawBody.length === 0) {
    return { valid: false, reason: 'Missing raw request body for signature verification.' };
  }

  const signedPayload = `${timestamp}${rawBody}`;
  const expectedSignature = crypto
    .createHmac('sha256', secretKey.trim())
    .update(signedPayload, 'utf8')
    .digest('base64');

  const sigBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return { valid: false, reason: 'Invalid Cashfree webhook cryptographic signature.' };
  }

  return { valid: true };
}

app.post('/api/cashfree/create-order', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.authUser!;
    const { items, couponCode, shippingAddressSummary, customerPhone, existingOrderId } =
      req.body as {
        items?: { itemId: string; itemType: CartItemType; quantity: number }[];
        couponCode?: string;
        shippingAddressSummary?: string;
        customerPhone?: string;
        existingOrderId?: string;
      };

    // Support retrying a pending/failed order from User Panel
    if (existingOrderId) {
      const existingOrder = dbState.orders.find(
        (o) => o.id === existingOrderId && o.userId === user.uid
      );
      if (existingOrder) {
        if (existingOrder.status === 'paid') {
          res.status(400).json({ error: 'This order has already been paid and verified.' });
          return;
        }
        res.json({
          orderId: existingOrder.id,
          cashfreeOrderId: existingOrder.cashfreeOrderId || existingOrder.razorpayOrderId,
          paymentSessionId:
            existingOrder.paymentSessionId || `session_sandbox_${existingOrder.id}`,
          subtotalInr: existingOrder.subtotalInr || existingOrder.totalInr,
          discountInr: existingOrder.discountInr || 0,
          shippingInr: existingOrder.shippingInr || 0,
          totalInr: existingOrder.totalInr,
          mode: existingOrder.paymentMode,
          status: existingOrder.status,
        });
        return;
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Cart items are required to create a payment order.' });
      return;
    }

    // Calculate prices strictly from persistent hosted database
    let subtotalInr = 0;
    let hasPhysical = false;
    const normalizedItems: NonNullable<OrderRecord['items']> = [];

    for (const rawItem of items) {
      const qty = Math.max(1, Math.min(20, Number(rawItem.quantity) || 1));
      if (rawItem.itemType === 'course') {
        const course = dbState.courses.find(
          (c) => c.id === rawItem.itemId && c.published !== false && !c.archived
        );
        if (!course) {
          res.status(400).json({ error: `Course ${rawItem.itemId} is unavailable.` });
          return;
        }
        subtotalInr += course.priceInr;
        normalizedItems.push({
          itemId: course.id,
          itemType: 'course',
          title: course.title,
          unitPriceInr: course.priceInr,
          quantity: 1,
        });
      } else if (rawItem.itemType === 'ebook') {
        const book = dbState.books.find(
          (b) => b.id === rawItem.itemId && b.published !== false && !b.archived
        );
        if (!book) {
          res.status(400).json({ error: `E-Book ${rawItem.itemId} is unavailable.` });
          return;
        }
        subtotalInr += book.ebookPriceInr;
        normalizedItems.push({
          itemId: book.id,
          itemType: 'ebook',
          title: `${book.title} (E-Book)`,
          unitPriceInr: book.ebookPriceInr,
          quantity: 1,
        });
      } else {
        hasPhysical = true;
        const book = dbState.books.find(
          (b) => b.id === rawItem.itemId && b.published !== false && !b.archived
        );
        if (!book) {
          res.status(400).json({ error: `Book ${rawItem.itemId} is unavailable.` });
          return;
        }
        if (book.stock < qty) {
          res.status(400).json({
            error: `Insufficient stock for "${book.title}". Only ${book.stock} copies available.`,
          });
          return;
        }
        subtotalInr += book.priceInr * qty;
        normalizedItems.push({
          itemId: book.id,
          itemType: 'physical_book',
          title: `${book.title} (Hardcover)`,
          unitPriceInr: book.priceInr,
          quantity: qty,
        });
      }
    }

    const cleanCoupon = (couponCode || '').trim().toUpperCase();
    const discountInr =
      cleanCoupon === 'LEARN20'
        ? Math.round(subtotalInr * 0.2)
        : cleanCoupon === 'SATYA10'
        ? Math.round(subtotalInr * 0.1)
        : 0;

    const discountedSubtotal = Math.max(0, subtotalInr - discountInr);
    const shippingInr = hasPhysical ? (discountedSubtotal >= 999 ? 0 : 79) : 0;
    const totalInr = discountedSubtotal + shippingInr;

    const orderId = `cf_ord_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const cfAppId = process.env.CASHFREE_APP_ID || '';
    const cfSecretKey =
      process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_WEBHOOK_SECRET || '';
    const cfEnv = (process.env.CASHFREE_ENV || 'SANDBOX').toUpperCase();
    const hasRealCashfreeKeys =
      Boolean(cfAppId && cfSecretKey) &&
      !cfAppId.includes('PLACEHOLDER') &&
      !cfSecretKey.includes('placeholder');

    if (!hasRealCashfreeKeys) {
      res.status(503).json({
        error: 'Cashfree payments are not configured; no orders can be paid until valid keys are supplied.',
      });
      return;
    }

    let cashfreeOrderId = `cf_sandbox_${orderId}`;
    let paymentSessionId = `session_sandbox_${crypto.randomBytes(12).toString('hex')}`;
    let paymentMode: OrderRecord['paymentMode'] = 'cashfree_sandbox';

    if (hasRealCashfreeKeys) {
      const cfEndpoint =
        cfEnv === 'PRODUCTION'
          ? 'https://api.cashfree.com/pg/orders'
          : 'https://sandbox.cashfree.com/pg/orders';

      const cfRes = await fetch(cfEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': cfAppId,
          'x-client-secret': cfSecretKey,
          'x-api-version': '2023-08-01',
        },
        body: JSON.stringify({
          order_id: orderId,
          order_amount: totalInr,
          order_currency: 'INR',
          customer_details: {
            customer_id: user.uid,
            customer_name: user.displayName,
            customer_email: user.email,
            customer_phone:
              (customerPhone || user.phone || '9876543210').replace(/[^0-9]/g, '').slice(-10) ||
              '9876543210',
          },
          order_meta: {
            return_url: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard?order_id={order_id}`,
          },
        }),
      });

      if (!cfRes.ok) {
        res.status(502).json({ error: 'Cashfree could not create the payment order.' });
        return;
      }
      if (cfRes.ok) {
        const cfJson = (await cfRes.json()) as {
          cf_order_id?: string | number;
          order_id?: string;
          payment_session_id?: string;
        };
        cashfreeOrderId = String(cfJson.cf_order_id || cfJson.order_id || orderId);
        if (!cfJson.payment_session_id) throw new Error('Cashfree payment session ID is missing');
        paymentSessionId = cfJson.payment_session_id;
        paymentMode = cfEnv === 'PRODUCTION' ? 'cashfree_live' : 'cashfree_sandbox';
      }
    }

    // Create order in 'pending' status first — purchases are NOT unlocked until verified 'paid'
    const newOrder: OrderRecord = {
      id: orderId,
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName,
      subtotalInr,
      discountInr,
      shippingInr,
      totalInr,
      paymentId: 'pending_verification',
      cashfreeOrderId,
      paymentSessionId,
      razorpayOrderId: cashfreeOrderId,
      paymentMode,
      status: 'pending',
      shippingStatus: hasPhysical ? 'processing' : 'not_applicable',
      shippingAddressSummary:
        shippingAddressSummary ||
        (hasPhysical ? 'Pending address confirmation' : 'Digital Instant Delivery'),
      itemsSummary: normalizedItems
        .map((i) => `${i.title} (x${i.quantity})`)
        .join('; ')
        .slice(0, 1950),
      itemIds: normalizedItems.map((i) => i.itemId).join(','),
      items: normalizedItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbState.orders.unshift(newOrder);
    await persistToFirestore('server_orders', newOrder.id, newOrder);

    res.json({
      orderId: newOrder.id,
      cashfreeOrderId,
      paymentSessionId,
      subtotalInr,
      discountInr,
      shippingInr,
      totalInr,
      mode: paymentMode,
      cashfreeLiveKeysActive: hasRealCashfreeKeys,
      status: 'pending',
    });
  } catch (err: unknown) {
    console.error('Cashfree create-order error:', err);
    res.status(500).json({ error: 'Unable to create Cashfree payment order on server.' });
  }
});

// Verify Cashfree Order Status & Unlock Purchases ONLY on Verified PAID Status
app.post('/api/cashfree/verify', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.authUser!;
    const { orderId } = req.body as { orderId?: string };

    if (!orderId) {
      res.status(400).json({ error: 'Order ID is required for verification.' });
      return;
    }

    const order = dbState.orders.find(
      (o) => o.id === orderId && (o.userId === user.uid || user.role === 'admin')
    );
    if (!order) {
      res.status(404).json({ error: 'Order not found for this account.' });
      return;
    }

    // Idempotent handling: if already paid, return verified immediately without duplicate side effects
    if (order.status === 'paid') {
      res.json({
        verified: true,
        idempotentDuplicate: true,
        status: 'paid',
        order,
        enrollments: dbState.enrollments.filter((e) => e.userId === order.userId),
      });
      return;
    }

    const cfAppId = process.env.CASHFREE_APP_ID || '';
    const cfSecretKey =
      process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_WEBHOOK_SECRET || '';
    const cfEnv = (process.env.CASHFREE_ENV || 'SANDBOX').toUpperCase();
    const hasRealCashfreeKeys =
      Boolean(cfAppId && cfSecretKey) &&
      !cfAppId.includes('PLACEHOLDER') &&
      !cfSecretKey.includes('placeholder');

    let resolvedStatus: 'paid' | 'pending' | 'failed' = 'pending';
    let cfPaymentId = order.paymentId;

    if (hasRealCashfreeKeys) {
      const cfEndpoint =
        cfEnv === 'PRODUCTION'
          ? `https://api.cashfree.com/pg/orders/${order.id}`
          : `https://sandbox.cashfree.com/pg/orders/${order.id}`;

      const cfRes = await fetch(cfEndpoint, {
        method: 'GET',
        headers: {
          'x-client-id': cfAppId,
          'x-client-secret': cfSecretKey,
          'x-api-version': '2023-08-01',
        },
      });

      if (cfRes.ok) {
        const cfData = (await cfRes.json()) as { order_status?: string; cf_order_id?: string };
        if (cfData.order_status === 'PAID') {
          resolvedStatus = 'paid';
          cfPaymentId = `cf_pay_${cfData.cf_order_id || Date.now()}`;
        } else if (cfData.order_status === 'EXPIRED' || cfData.order_status === 'TERMINATED') {
          resolvedStatus = 'failed';
        } else {
          resolvedStatus = 'pending';
        }
      }
    } else {
      res.status(503).json({ error: 'Cashfree verification requires valid server credentials.' });
      return;
    }

    order.status = resolvedStatus;
    order.paymentId = cfPaymentId;
    order.updatedAt = new Date().toISOString();

    if (resolvedStatus === 'paid') {
      await fulfillPaidOrderIdempotently(order);
    }

    await persistToFirestore('server_orders', order.id, order);

    res.json({
      verified: resolvedStatus === 'paid',
      idempotentDuplicate: false,
      status: resolvedStatus,
      order,
      enrollments: dbState.enrollments.filter((e) => e.userId === order.userId),
    });
  } catch (err: unknown) {
    console.error('Cashfree verify error:', err);
    res.status(500).json({ error: 'Unable to verify payment status.' });
  }
});

// Cashfree Webhook Endpoint — Official Signature Verification using CASHFREE_WEBHOOK_SECRET (Cashfree PG Secret Key)
// Verifies Base64(HMAC-SHA256(x-webhook-timestamp + rawBody, process.env.CASHFREE_WEBHOOK_SECRET))
app.post('/api/cashfree/webhook', async (req: AuthenticatedRequest, res) => {
  try {
    const cashfreePgSecretKey = process.env.CASHFREE_WEBHOOK_SECRET;
    const signature = req.headers['x-webhook-signature'] as string | undefined;
    const timestamp = req.headers['x-webhook-timestamp'] as string | undefined;

    const verification = verifyCashfreeWebhookSignature(
      timestamp,
      req.rawBody,
      signature,
      cashfreePgSecretKey
    );

    if (!verification.valid) {
      res
        .status(401)
        .json({ error: verification.reason || 'Webhook signature verification failed.' });
      return;
    }

    const payload = JSON.parse(req.rawBody!) as {
      type?: string;
      data?: {
        order?: { order_id?: string };
        payment?: { cf_payment_id?: string | number; payment_status?: string };
      };
    };

    const orderId = payload?.data?.order?.order_id;
    const cfPaymentId = String(payload?.data?.payment?.cf_payment_id || `wh_${Date.now()}`);
    const paymentStatus = payload?.data?.payment?.payment_status;
    const webhookEventKey = `${orderId}_${cfPaymentId}_${paymentStatus}`;

    // Idempotent duplicate webhook check
    if (dbState.processedWebhooks.includes(webhookEventKey)) {
      res.json({ status: 'ok', idempotentDuplicate: true });
      return;
    }

    dbState.processedWebhooks.push(webhookEventKey);
    await persistToFirestore('server_webhooks', webhookEventKey, { key: webhookEventKey });

    if (orderId) {
      const order = dbState.orders.find((o) => o.id === orderId);
      if (order) {
        if (paymentStatus === 'SUCCESS' || payload.type === 'PAYMENT_SUCCESS_WEBHOOK') {
          order.status = 'paid';
          order.paymentId = cfPaymentId;
          order.updatedAt = new Date().toISOString();
          await fulfillPaidOrderIdempotently(order);
        } else if (paymentStatus === 'FAILED' || payload.type === 'PAYMENT_FAILED_WEBHOOK') {
          if (order.status !== 'paid') {
            order.status = 'failed';
            order.paymentId = cfPaymentId;
            order.updatedAt = new Date().toISOString();
          }
        }
        await persistToFirestore('server_orders', order.id, order);
      }
    }

    res.json({ status: 'ok', processed: true, idempotentDuplicate: false });
  } catch (err: unknown) {
    console.error('Cashfree webhook error:', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

// ============================================================================
// 4. PROTECTED MEDIA & RECORDINGS ACCESS GATE
// Checks preview permission strictly using server data only (never browser flags)
// ============================================================================

app.post('/api/access/media', async (req: AuthenticatedRequest, res) => {
  const caller = await resolveUserFromRequest(req);
  const { itemId, lessonId, itemType } = req.body as {
    itemId?: string;
    lessonId?: string;
    itemType?: 'course' | 'ebook';
  };

  if (itemType === 'course') {
    const course = dbState.courses.find(
      (c) => c.id === itemId && c.published !== false && !c.archived
    );
    const lesson = course?.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);

    // Check preview permission strictly using server data only — never trust client input
    if (lesson && lesson.isFreePreview === true) {
      const signingKey = getRequiredAuthSecret() || firebaseConfig.appId;
      const token = crypto
        .createHmac('sha256', signingKey)
        .update(`preview:${itemId}:${lessonId}:${Date.now()}`)
        .digest('hex')
        .slice(0, 24);
      res.json({
        authorized: true,
        signedToken: `preview_${token}`,
        recordingUrl: lesson.recordingUrl || '',
        expiresInSeconds: 300,
      });
      return;
    }
  }

  // Paid lesson or E-Book requires authenticated user with verified paid enrollment or admin role
  if (!caller) {
    res.status(401).json({
      authorized: false,
      error: 'Authentication required. Please log in to access purchased courses and recordings.',
    });
    return;
  }

  const isAdmin = caller.role === 'admin';
  const hasVerifiedEnrollment =
    isAdmin ||
    dbState.enrollments.some(
      (e) =>
        e.userId === caller.uid &&
        e.itemId === itemId &&
        (itemType === 'course'
          ? e.itemType === 'course'
          : e.itemType === 'ebook' || e.itemType === 'physical_book')
    );

  if (!hasVerifiedEnrollment) {
    res.status(403).json({
      authorized: false,
      error: 'Access denied. This paid recording or e-book is locked until payment is verified.',
    });
    return;
  }

  const course = dbState.courses.find((c) => c.id === itemId);
  const lesson = course?.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
  const signingKey = getRequiredAuthSecret() || firebaseConfig.appId;

  const signedToken = crypto
    .createHmac('sha256', signingKey)
    .update(`protected:${caller.uid}:${itemId}:${lessonId || 'ebook'}:${Date.now()}`)
    .digest('hex')
    .slice(0, 28);

  res.json({
    authorized: true,
    signedToken: `sig_${signedToken}`,
    recordingUrl: lesson?.recordingUrl || '',
    expiresInSeconds: 300,
  });
});

// ============================================================================
// 5. ADMIN PANEL BACKEND ENDPOINTS (STRICTLY PROTECTED BY requireAdmin)
// ============================================================================

app.get('/api/admin/overview', requireAdmin, (_req: AuthenticatedRequest, res) => {
  const verifiedRevenueInr = dbState.orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.totalInr, 0);

  const customers: CustomerSummary[] = dbState.users.map((u) => {
    const userOrders = dbState.orders.filter((o) => o.userId === u.uid);
    const paidSpendInr = userOrders
      .filter((o) => o.status === 'paid')
      .reduce((sum, o) => sum + o.totalInr, 0);
    const userEnrollments = dbState.enrollments.filter((e) => e.userId === u.uid);
    return {
      uid: u.uid,
      email: u.email,
      displayName: u.displayName,
      photoURL: u.photoURL || '',
      phone: u.phone || '',
      role: u.role,
      ordersCount: userOrders.length,
      paidSpendInr,
      enrollmentsCount: userEnrollments.length,
      createdAt: u.createdAt || new Date().toISOString(),
    };
  });

  res.json({
    verifiedRevenueInr,
    customers,
    orders: dbState.orders,
    enrollments: dbState.enrollments,
    books: dbState.books,
    courses: dbState.courses,
  });
});

// Admin Add or Update Book (prices, description, image, stock, publish/unpublish)
app.post('/api/admin/books', requireAdmin, async (req: AuthenticatedRequest, res) => {
  const book = req.body as BookItem;
  if (!book || !book.title || !book.title.trim()) {
    res.status(400).json({ error: 'Book title is required.' });
    return;
  }

  const cleanId = (book.id || `book-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  const isPublished = book.published !== undefined ? Boolean(book.published) : !book.archived;

  const updatedBook: BookItem = {
    ...book,
    id: cleanId,
    title: book.title.trim().slice(0, 200),
    subtitle: (book.subtitle || 'Satya Press Edition').slice(0, 200),
    author: (book.author || 'Satya Narayana').slice(0, 120),
    category: book.category === 'Stories & Literature' ? 'Stories & Literature' : 'Technology',
    subcategory: (book.subcategory || 'General').slice(0, 80),
    priceInr: Math.max(0, Number(book.priceInr) || 0),
    ebookPriceInr: Math.max(0, Number(book.ebookPriceInr) || 0),
    stock: Math.max(0, Math.round(Number(book.stock) || 0)),
    description: (book.description || '').slice(0, 4000),
    previewExcerpt: (book.previewExcerpt || book.description || '').slice(0, 2000),
    imageUrl: (book.imageUrl || '').trim().slice(0, 1024),
    published: isPublished,
    archived: !isPublished,
  };

  const idx = dbState.books.findIndex((b) => b.id === cleanId);
  if (idx >= 0) {
    dbState.books[idx] = { ...dbState.books[idx], ...updatedBook };
  } else {
    dbState.books.unshift(updatedBook);
  }

  await persistToFirestore('server_books', updatedBook.id, updatedBook);
  res.json({ book: updatedBook, books: dbState.books });
});

// Admin Add or Update Course & Organise Modules / Lessons / Recordings
app.post('/api/admin/courses', requireAdmin, async (req: AuthenticatedRequest, res) => {
  const course = req.body as CourseItem;
  if (!course || !course.title || !course.title.trim()) {
    res.status(400).json({ error: 'Course title is required.' });
    return;
  }

  const cleanId = (course.id || `course-${Date.now()}`)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 120);
  const isPublished = course.published !== undefined ? Boolean(course.published) : !course.archived;

  const modules =
    Array.isArray(course.modules) && course.modules.length > 0
      ? course.modules
      : INITIAL_COURSES[0].modules;
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

  const updatedCourse: CourseItem = {
    ...course,
    id: cleanId,
    title: course.title.trim().slice(0, 200),
    subtitle: (course.subtitle || 'Comprehensive Recorded Program').slice(0, 240),
    instructor: (course.instructor || 'Satya Narayana').slice(0, 120),
    instructorRole: (course.instructorRole || 'Principal Educator').slice(0, 120),
    priceInr: Math.max(0, Number(course.priceInr) || 0),
    description: (course.description || '').slice(0, 4000),
    imageUrl: (course.imageUrl || '').trim().slice(0, 1024),
    published: isPublished,
    archived: !isPublished,
    modules,
    totalLessons,
  };

  const idx = dbState.courses.findIndex((c) => c.id === cleanId);
  if (idx >= 0) {
    dbState.courses[idx] = { ...dbState.courses[idx], ...updatedCourse };
  } else {
    dbState.courses.unshift(updatedCourse);
  }

  await persistToFirestore('server_courses', updatedCourse.id, updatedCourse);
  res.json({ course: updatedCourse, courses: dbState.courses });
});

// Admin Delete / Remove Book
app.delete('/api/admin/books/:bookId', requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { bookId } = req.params;
  const existing = dbState.books.find((b) => b.id === bookId);
  if (!existing) {
    res.status(404).json({ error: 'Book not found.' });
    return;
  }
  dbState.books = dbState.books.filter((b) => b.id !== bookId);
  await removeFromFirestore('server_books', bookId);
  res.json({ deletedId: bookId, books: dbState.books });
});

// Admin Delete / Remove Course
app.delete('/api/admin/courses/:courseId', requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { courseId } = req.params;
  const existing = dbState.courses.find((c) => c.id === courseId);
  if (!existing) {
    res.status(404).json({ error: 'Course not found.' });
    return;
  }
  dbState.courses = dbState.courses.filter((c) => c.id !== courseId);
  await removeFromFirestore('server_courses', courseId);
  res.json({ deletedId: courseId, courses: dbState.courses });
});

// Admin Update Order Status & Shipping Status
app.put('/api/admin/orders/:orderId', requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { orderId } = req.params;
  const { status, shippingStatus } = req.body as {
    status?: OrderRecord['status'];
    shippingStatus?: OrderRecord['shippingStatus'];
  };

  const order = dbState.orders.find((o) => o.id === orderId);
  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  if (status && ['paid', 'pending', 'failed', 'refunded'].includes(status)) {
    order.status = status;
    if (status === 'paid') {
      await fulfillPaidOrderIdempotently(order);
    } else if (status === 'failed' || status === 'refunded') {
      const removedEnrollments = dbState.enrollments.filter((e) => e.orderId === order.id);
      dbState.enrollments = dbState.enrollments.filter((e) => e.orderId !== order.id);
      for (const rem of removedEnrollments) {
        await removeFromFirestore('server_enrollments', rem.id);
      }
    }
  }

  if (
    shippingStatus &&
    ['not_applicable', 'processing', 'shipped', 'delivered'].includes(shippingStatus)
  ) {
    order.shippingStatus = shippingStatus;
  }

  order.updatedAt = new Date().toISOString();
  await persistToFirestore('server_orders', order.id, order);

  res.json({
    order,
    orders: dbState.orders,
    enrollments: dbState.enrollments,
  });
});

// ============================================================================
// 6. SERVER-SIDE GEMINI AI ACADEMIC ADVISOR CHATBOT
// ============================================================================

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body as {
      message?: string;
      history?: { role: string; content: string }[];
    };

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const activeCourses = dbState.courses.filter((c) => c.published !== false && !c.archived);
    const activeBooks = dbState.books.filter((b) => b.published !== false && !b.archived);

    const catalogSummary = [
      'COURSES:',
      ...activeCourses.map(
        (c) => `- ${c.title} (${c.subject}, ${c.level}, ₹${c.priceInr}, ID: /courses/${c.id})`
      ),
      'SAMPLE BOOKS:',
      ...activeBooks
        .slice(0, 16)
        .map(
          (b) =>
            `- ${b.title} by ${b.author} (${b.category} / ${b.subcategory}, E-Book ₹${b.ebookPriceInr}, Print ₹${b.priceInr}, Path: /books/${b.id})`
        ),
    ].join('\n');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.json({
        reply:
          'I can help you explore Satya’s Education! For Python and Django, start with "Python Engineering from Foundations to Async Systems" (₹2,499) and the book "Django 5 for High-Scale Web Systems" (E-Book ₹549). For inspiring stories, explore "The Banyan Tree of Ujjain" (₹249).',
        suggestedLinks: [
          { label: 'Explore Courses', path: '/courses' },
          { label: 'Browse Books', path: '/books' },
        ],
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const conversationContext = history
      .slice(-6)
      .map((h) => `${h.role === 'user' ? 'Student' : 'Advisor'}: ${h.content}`)
      .join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Recent Conversation:\n${conversationContext}\n\nStudent Question: ${message}`,
      config: {
        systemInstruction: `You are Satya's Academic Advisor for "Satya's Education", an education e-commerce platform selling books, online courses, and recorded classes in INR (₹).
Be warm, concise, and helpful. Recommend specific books or courses with their INR prices and explain technical concepts clearly.
Catalog Context:\n${catalogSummary}`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: 'Helpful response to the student question in plain text.',
            },
            suggestedLinks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  path: { type: Type.STRING },
                },
                required: ['label', 'path'],
              },
            },
          },
          required: ['reply', 'suggestedLinks'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      reply: parsed.reply || 'Explore our courses and books using the links below.',
      suggestedLinks: Array.isArray(parsed.suggestedLinks) ? parsed.suggestedLinks.slice(0, 3) : [],
    });
  } catch (err: unknown) {
    console.error('Gemini chat error:', err);
    res.json({
      reply:
        'For Python and Django mastery, we recommend our "Full-Stack Production Engineering with Django 5 & React 19" course (₹3,499) alongside "Fluent Python Architecture" (E-Book ₹499).',
      suggestedLinks: [
        { label: 'Django & React Course', path: '/courses/course-django-react-fullstack' },
        { label: 'Browse All Books', path: '/books' },
      ],
    });
  }
});

async function startServer() {
  await ensureDatabaseReady();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Satya's Education server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;

