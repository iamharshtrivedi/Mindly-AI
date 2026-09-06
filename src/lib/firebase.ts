/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
};

// Guard against missing secrets
const missingKeys = Object.entries(firebaseConfig)
  .filter(([_, v]) => !v)
  .map(([k]) => k);

if (missingKeys.length > 0 && import.meta.env.PROD) {
  console.warn(`Missing Firebase environment variables: ${missingKeys.join(', ')}`);
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, import.meta.env.VITE_FIREBASE_DATABASE_ID);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGooglePopup = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.error("Popup Sign-in Error:", error.code, error.message);
    throw error;
  }
};

export const signInWithGoogleRedirect = async () => {
  try {
    return await signInWithRedirect(auth, googleProvider);
  } catch (error: any) {
    console.error("Redirect Sign-in Error:", error.code, error.message);
    throw error;
  }
};

export const handleRedirectResult = async () => {
  try {
    return await getRedirectResult(auth);
  } catch (error: any) {
    console.error("Redirect Result Error:", error);
    return null;
  }
};

export const logout = () => signOut(auth);
