import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const ADMIN_EMAILS = ['a0915812114@gmail.com'];
export const DEFAULT_ADMIN_EMAIL =
  import.meta.env.VITE_ADMIN_EMAIL || ADMIN_EMAILS[0];

export function isAdminUser(u) {
  const email = u?.email?.toLowerCase?.();
  return Boolean(email && ADMIN_EMAILS.includes(email));
}

function readGlobal(name) {
  try {
    return globalThis[name];
  } catch {
    return undefined;
  }
}

function resolveFirebaseConfig() {
  const injected = readGlobal('__firebase_config');
  if (typeof injected === 'string' && injected.trim()) {
    return JSON.parse(injected);
  }
  if (injected && typeof injected === 'object') {
    return injected;
  }
  const fromEnv = import.meta.env.VITE_FIREBASE_CONFIG;
  if (fromEnv) {
    return JSON.parse(fromEnv);
  }
  return null;
}

const firebaseConfig = resolveFirebaseConfig();
export const appId =
  readGlobal('__app_id') ||
  import.meta.env.VITE_APP_ID ||
  'life-code-pro';

let app = null;
let auth = null;
let db = null;
export const firebaseReady = Boolean(firebaseConfig?.apiKey);

if (firebaseReady) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };

export const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
