// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Fix: Prevent "Firebase app already initialized" error
const firebaseConfig = {
  apiKey: "AIzaSyAArN-80v0fx8q4cLM_u3bbU7YK5y4wz6Q",
  authDomain: "strata-91ddf.firebaseapp.com",
  projectId: "strata-91ddf",
  storageBucket: "strata-91ddf.appspot.com",
  messagingSenderId: "726215155701",
  appId: "1:726215155701:web:4ca6122737fc47a4c8cabc",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
