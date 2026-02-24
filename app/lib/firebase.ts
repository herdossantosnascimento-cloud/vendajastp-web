import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "vendajastp.firebaseapp.com",
  projectId: "vendajastp",
  storageBucket: "vendajastp.firebasestorage.app",
  messagingSenderId: "296889516319",
  appId: "1:296889516319:web:fc3dd3b3ed98ca565a302a",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);