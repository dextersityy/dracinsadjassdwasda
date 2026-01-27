import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (prevent re-initialization in development)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Anonymous Auth helper
let authReady: Promise<User | null> | null = null;

export function getAuthUser(): Promise<User | null> {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  if (!authReady) {
    authReady = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        if (user) {
          resolve(user);
        } else {
          // Sign in anonymously if no user
          try {
            const result = await signInAnonymously(auth);
            resolve(result.user);
          } catch (error) {
            console.error('Anonymous auth failed:', error);
            resolve(null);
          }
        }
      });
    });
  }

  return authReady;
}

// Get current user UID (returns null on server or if not authenticated)
export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return auth.currentUser?.uid || null;
}

export default app;
