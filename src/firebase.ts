import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  browserPopupRedirectResolver,
  GoogleAuthProvider,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setLogLevel,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import appletFirebaseConfig from '../firebase-applet-config.json';

// Silence noisy internal SDK console warnings during transient token states
setLogLevel('silent');

// Support VITE_FIREBASE_* environment variables on Vercel (satyaeducation.in)
// while automatically falling back to firebase-applet-config.json
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};

export const resolvedFirebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || appletFirebaseConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || appletFirebaseConfig.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || appletFirebaseConfig.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || appletFirebaseConfig.storageBucket,
  messagingSenderId:
    env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletFirebaseConfig.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || appletFirebaseConfig.appId,
  firestoreDatabaseId:
    env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || appletFirebaseConfig.firestoreDatabaseId,
};

const app = initializeApp(resolvedFirebaseConfig);

export const db = resolvedFirebaseConfig.firestoreDatabaseId
  ? getFirestore(app, resolvedFirebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Maintain authenticated session across page refreshes using Firebase Auth persistence
export const auth = initializeAuth(app, {
  persistence: [browserLocalPersistence, browserSessionPersistence, inMemoryPersistence],
  popupRedirectResolver: browserPopupRedirectResolver,
});

export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const PRIMARY_ADMIN_EMAIL = (
  env.VITE_ADMIN_EMAIL || 'tarunpediredla9966@gmail.com'
)
  .toLowerCase()
  .trim();

export function formatFirebaseAuthError(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message : String(error || '');
  const codeMatch = rawMessage.match(/\((auth\/[^)]+)\)/);
  const code = codeMatch ? codeMatch[1] : rawMessage;

  const currentHost =
    typeof window !== 'undefined' && window.location?.hostname
      ? window.location.hostname
      : 'satyaeducation.in';

  if (code.includes('auth/unauthorized-domain')) {
    return `Domain "${currentHost}" is not yet authorized in Firebase. Add "${currentHost}", "satyaeducation.in", and "www.satyaeducation.in" in Firebase Console → Authentication → Settings → Authorized domains.`;
  }
  if (code.includes('auth/operation-not-allowed')) {
    return 'This sign-in method is not enabled yet in Firebase Console → Authentication → Sign-in method. Please enable Google and Email/Password providers.';
  }
  if (code.includes('auth/popup-blocked')) {
    return 'Your browser blocked the sign-in popup window. Redirecting to Google Sign-In...';
  }
  if (code.includes('auth/popup-closed-by-user') || code.includes('auth/cancelled-popup-request')) {
    return 'The Google sign-in window was closed before completing login. Please try again.';
  }
  if (code.includes('auth/email-already-in-use')) {
    return 'An account with this email address already exists. Please switch to Log In or reset your password.';
  }
  if (
    code.includes('auth/invalid-credential') ||
    code.includes('auth/wrong-password') ||
    code.includes('auth/user-not-found')
  ) {
    return 'Invalid email or password. Please check your credentials or click "Forgot Password?".';
  }
  if (code.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (code.includes('auth/weak-password')) {
    return 'Password is too weak. Please enter at least 6 characters.';
  }
  if (code.includes('auth/too-many-requests')) {
    return 'Too many unsuccessful attempts. Please wait a moment or reset your password.';
  }
  if (code.includes('auth/network-request-failed')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  if (
    code.includes('token-service-api-has-not-been-used') ||
    rawMessage.includes('securetoken.googleapis.com')
  ) {
    return 'Token Service API needs to be enabled in Google Cloud Console for project ' +
      resolvedFirebaseConfig.projectId +
      ', or wait 2 minutes if recently enabled.';
  }

  return rawMessage.replace(/^Firebase:\s*/i, '') || 'Authentication failed. Please try again.';
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Diagnostic: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Please check your Firebase configuration.');
    }
  }
}

testConnection();
