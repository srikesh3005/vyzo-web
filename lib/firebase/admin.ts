import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    // If the FIREBASE_SERVICE_ACCOUNT_KEY env var is present, use it.
    // Otherwise use default application credentials (e.g. for deployed environments like Vercel/Netlify)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      initializeApp();
    }
    console.log('Firebase Admin initialized.');
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

export const db = getApps().length > 0 ? getFirestore() : ({} as any);
export const auth = getApps().length > 0 ? getAuth() : ({} as any);
