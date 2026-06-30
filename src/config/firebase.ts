import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6ZyjXkVqlZJDvgo1vp8TwC18nt8fsIL4",
  authDomain: "kairo-89f94.firebaseapp.com",
  projectId: "kairo-89f94",
  storageBucket: "kairo-89f94.firebasestorage.app",
  messagingSenderId: "882994955861",
  appId: "1:882994955861:web:8d7574d9811423ff48b6dc"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

