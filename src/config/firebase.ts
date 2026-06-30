import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration — reads from Vercel/production env vars first,
// falls back to dev defaults so local development needs no extra .env setup.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyD6ZyjXkVqlZJDvgo1vp8TwC18nt8fsIL4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "kairo-89f94.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "kairo-89f94",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "kairo-89f94.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "882994955861",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:882994955861:web:8d7574d9811423ff48b6dc",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

