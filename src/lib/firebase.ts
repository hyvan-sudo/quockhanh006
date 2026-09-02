import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

const apiKey = (import.meta.env.VITE_FIREBASE_API_KEY || '').trim();
const authDomain = (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim();
const databaseURL = (import.meta.env.VITE_FIREBASE_DATABASE_URL || '').trim();
const projectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim();
const storageBucket = (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '').trim();
const messagingSenderId = (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim();
const appId = (import.meta.env.VITE_FIREBASE_APP_ID || '').trim();

const firebaseConfig = {
  apiKey,
  authDomain,
  databaseURL,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

export const isFirebaseConfigured = Boolean(
  databaseURL &&
  apiKey &&
  projectId
);

let app: FirebaseApp | null = null;
let db: Database | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log('Firebase Realtime Database initialized successfully with URL:', firebaseConfig.databaseURL);
  } catch (error) {
    console.warn('Failed to initialize Firebase Realtime Database:', error);
  }
} else {
  console.info(
    'Firebase environment variables are not yet configured. The game will run with real-time local channel fallback until Firebase credentials are provided in .env.'
  );
}

export { app, db, firebaseConfig };
