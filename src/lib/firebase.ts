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
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mindly-ai-7af1f",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:141101160781:web:dcce15580597ab7dbf7f04",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBHDp4XADRS9w2LHJHsTHqnqj6HiGAgkwM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mindly-ai-7af1f.firebaseapp.com",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mindly-ai-7af1f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "141101160781"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-mindlyai-48afac4e-73f6-4c7b-8522-922f9f291fbc");
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
