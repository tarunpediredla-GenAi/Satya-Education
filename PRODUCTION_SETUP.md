# Satya's Education: Production checklist

Your public Firebase Web project is **satyaeducation-dc4ab**. Your site is served on Vercel.

## 1. Fix Google sign-in
In Firebase Console → Authentication → Sign-in method, enable Google (and Email/Password if used). In Authentication → Settings → Authorized domains, **add separately**:
- `satya-education.vercel.app`
- `satyaeducation.in`
- `www.satyaeducation.in` (if used)

For the AI Studio preview, also add the exact hostname ending in `.run.app` shown in the error banner. This is different from `aistudio.google.com`. Click **Add domain** separately for each hostname; do not paste a comma-separated list, `https://`, or a page path. Make these changes in project **satyaeducation-dc4ab**, unless your deployed VITE variables intentionally select a different project. Refresh and retry Google login after saving. Committing code or redeploying Vercel cannot change Firebase's authorized-domain list.

Firebase configuration in this repository now points to the SatyaEducation project, not an unrelated AI Studio project.

## 2. Secure database and storage
In Firebase Console → Firestore Database, create the default database `(default)` if not already created. **Publish the contents of `firestore.rules`** in the Firestore Rules tab, and **publish `storage.rules`** in Storage Rules if using Storage. Git commits alone do not publish these rules.

**URGENT:** Prior rules permitted public reads/writes of `server_users`, `server_orders`, and other private server collections. These may contain password hashes and payment details. Apply the new rules immediately; if real data was stored, investigate possible exposure and rotate affected secrets.

First admin account: sign in to Firebase Authentication, copy that user's UID, and add a document `admins/<UID>` in Firestore via Firebase Console, or assign the trusted Firebase custom claim `admin: true`. Never rely on a hardcoded email or a browser-editable role.

## 3. Set Vercel variables
In Vercel → Project → Settings → Environment Variables → Production:

Frontend public values (see Firebase Project settings → Your apps → Config):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN=satyaeducation-dc4ab.firebaseapp.com`
- `VITE_FIREBASE_PROJECT_ID=satyaeducation-dc4ab`
- `VITE_FIREBASE_STORAGE_BUCKET=satyaeducation-dc4ab.firebasestorage.app`
- `VITE_FIREBASE_MESSAGING_SENDER_ID=228279887325`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_FIRESTORE_DATABASE_ID=(default)`

A public config fallback for this same Firebase project is committed, but actual Vercel VITE_* values always override it. Avoid mixing settings from two Firebase projects.

**SERVER-ONLY SECRETS (never put in GitHub or a VITE_* variable):**
- `FIREBASE_SERVICE_ACCOUNT_JSON`: whole JSON from Firebase → Project settings → Service accounts → Generate new private key; copy into Vercel secret value only. Keep the key private.
- `FIREBASE_PROJECT_ID=satyaeducation-dc4ab`
- `FIREBASE_FIRESTORE_DATABASE_ID=(default)`
- `AUTH_TOKEN_SECRET`: long cryptographically random value, created and stored only in Vercel.
- `ADMIN_EMAIL` / `ADMIN_INITIAL_PASSWORD`: optional password-based admin bootstrap.
- `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, `CASHFREE_WEBHOOK_SECRET`, `CASHFREE_ENV`: from your Cashfree account; use SANDBOX credentials to test, PRODUCTION credentials only when ready.
- `APP_URL=https://satyaeducation.in`

The backend intentionally returns HTTP 503 without a trusted service account and real Cashfree payments are intentionally disabled without valid credentials. Fake paid outcomes are not allowed.

## 4. Deploy and test
1. Vercel → Settings → Git: confirm repository `tarunpediredla-GenAi/Satya-Education`, Production branch `main`.
2. Build & Deployment: Root `./`; Node 22; Install `npm install`; Build `npm run build`; Output `dist`.
3. Save the Production variables, then create a fresh Production deployment of the latest main commit.
4. Visit `satya-education.vercel.app` and `satyaeducation.in`. Test Google login on phone and desktop, refresh, sign out, and check Firebase Authentication → Users.
5. Test actual Cashfree sandbox order initiation, payment status verification, webhook, and course entitlement. Never take live payments before these tests pass.

If Google popup works but mobile redirect fails, third-party browser storage is a separate Firebase OAuth issue: https://firebase.google.com/docs/auth/web/redirect-best-practices
If Vercel isn't rebuilding commits, verify GitHub integration permissions and check Deployments logs.
