// lib/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Firestore import

const firebaseConfig = {
  apiKey: "AIzaSyAArN-80v0fx8q4cLM_u3bbU7YK5y4wz6Q",
  authDomain: "strata-91ddf.firebaseapp.com",
  projectId: "strata-91ddf",
  storageBucket: "strata-91ddf.appspot.com",
  messagingSenderId: "726215155701",
  appId: "1:726215155701:web:4ca6122737fc47a4c8cabc",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app); // ✅ this is what was missing

export { auth, db };
